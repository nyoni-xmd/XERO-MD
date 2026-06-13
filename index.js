// ======================== XERO-MD COMPLETE INDEX ========================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, generateForwardMessageContent, generateWAMessageFromContent, jidDecode, fetchLatestBaileysVersion, Browsers, downloadContentFromMessage, proto } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const { File } = require('megajs');
const express = require('express');
const path = require('path');
const axios = require('axios');
const FileType = require('file-type');
const os = require('os');

// ========== CONFIG ==========
const prefix = config.PREFIX || ".";
const ownerNumber = ['255763111390', '255610209120'];
const app = express();
const port = process.env.PORT || 9090;

// ========== GLOBAL COMMAND SYSTEM ==========
const commands = new Map();
const aliases = new Map();
global.commandsArray = [];

function registerCommand(cmd) {
    if (cmd.command) {
        commands.set(cmd.command, cmd);
        if (cmd.alias && Array.isArray(cmd.alias)) cmd.alias.forEach(a => aliases.set(a, cmd.command));
        global.commandsArray.push(cmd);
    }
}
function getCommand(name) { return commands.get(name) || commands.get(aliases.get(name)); }
global.registerCommand = registerCommand;
global.getCommand = getCommand;

// ========== SESSION HANDLING ==========
if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');
if (!fs.existsSync('./sessions/creds.json') && config.SESSION_ID) {
    let sessdata = config.SESSION_ID.replace("POPKID;;;", '').trim();
    File.fromURL(`https://mega.nz/file/${sessdata}`).download((err, data) => {
        if (!err) fs.writeFileSync('./sessions/creds.json', data);
        else console.error('Session download error:', err.message);
    });
}

// ========== TEMP CLEANER ==========
const tempDir = path.join(os.tmpdir(), 'xero_temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
setInterval(() => {
    fs.readdir(tempDir, (_, files) => {
        files.forEach(f => fs.unlink(path.join(tempDir, f), () => {}));
    });
}, 5 * 60 * 1000);

// ========== HELPERS ==========
async function getBuffer(url) {
    try {
        const res = await axios({ url, responseType: 'arraybuffer', timeout: 15000 });
        return res.data;
    } catch { return null; }
}
function getGroupAdmins(participants) {
    return participants.filter(p => p.admin).map(p => p.id);
}
async function downloadMediaMessage(msg) {
    const stream = await downloadContentFromMessage(msg, msg.mimetype?.split('/')[0] || 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}
async function AntiDelete(conn, updates) { /* dummy – can be expanded */ console.log('AntiDelete triggered'); }
async function saveMessage(m) { /* dummy database */ return true; }

// ========== PLUGIN LOADER ==========
function loadPlugins() {
    const pluginsDir = './plugins';
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    for (const f of files) {
        try {
            require(path.join(pluginsDir, f));
            console.log(`✅ Loaded plugin: ${f}`);
        } catch (e) {
            console.log(`❌ Failed to load ${f}: ${e.message}`);
        }
    }
    console.log(`✅ Total commands: ${global.commandsArray.length}`);
}

// ========== MAIN CONNECTION ==========
let reconnectTimer;
async function connectToWA() {
    console.log("Connecting to WhatsApp...");
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();
    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Firefox'),
        auth: state,
        version
    });

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const code = lastDisconnect.error?.output?.statusCode;
            if (code === DisconnectReason.loggedOut) {
                console.log('Session expired. Update SESSION_ID.');
                return;
            }
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(() => {
                console.log('Reconnecting...');
                connectToWA();
            }, 5000);
        } else if (connection === 'open') {
            console.log('✅ XERO-MD CONNECTED!');
            loadPlugins();
            // Send startup message to owner
            try {
                await conn.sendMessage(conn.user.id, {
                    image: { url: 'https://files.catbox.moe/gyaka2.png' },
                    caption: `╭┈───────────────╮\n│ ◦ XERO-MD ONLINE\n│ ◦ DEV: nyoni-xmd\n│ ◦ PREFIX: ${prefix}\n│ ◦ MODE: ${config.MODE}\n│ ◦ COMMANDS: ${global.commandsArray.length}\n╰┈───────────────╯`
                });
            } catch(e) {}
        }
    });
    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('messages.update', async (updates) => {
        for (const u of updates) if (u.update.message === null) await AntiDelete(conn, updates);
    });
    conn.ev.on('group-participants.update', (update) => {
        // GroupEvents can be implemented here or in a separate plugin
        console.log('Group update:', update);
    });

    conn.ev.on('messages.upsert', async (msg) => {
        let m = msg.messages[0];
        if (!m?.message) return;
        // Decrypt ephemeral & viewOnce
        if (getContentType(m.message) === 'ephemeralMessage') m.message = m.message.ephemeralMessage.message;
        if (m.message.viewOnceMessageV2) m.message = m.message.viewOnceMessageV2.message;
        if (config.READ_MESSAGE === 'true') await conn.readMessages([m.key]);
        // Auto status actions
        if (m.key?.remoteJid === 'status@broadcast') {
            if (config.AUTO_STATUS_SEEN === 'true') await conn.readMessages([m.key]);
            if (config.AUTO_STATUS_REACT === 'true') {
                const emojis = ['❤️','🔥','💯','✨','⭐','👑','💎','🏆'];
                const react = emojis[Math.floor(Math.random() * emojis.length)];
                await conn.sendMessage(m.key.remoteJid, { react: { text: react, key: m.key } }).catch(()=>{});
            }
            if (config.AUTO_STATUS_REPLY === 'true') {
                const user = m.key.participant;
                const replyText = config.AUTO_STATUS_MSG || 'Seen your status!';
                await conn.sendMessage(user, { text: replyText }, { quoted: m }).catch(()=>{});
            }
        }
        await saveMessage(m);

        const type = getContentType(m.message);
        const from = m.key.remoteJid;
        const sender = m.key.fromMe ? conn.user.id.split(':')[0]+'@s.whatsapp.net' : (m.key.participant || m.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        let body = '';
        if (type === 'conversation') body = m.message.conversation;
        else if (type === 'extendedTextMessage') body = m.message.extendedTextMessage.text;
        else if (type === 'imageMessage' && m.message.imageMessage.caption) body = m.message.imageMessage.caption;
        else if (type === 'videoMessage' && m.message.videoMessage.caption) body = m.message.videoMessage.caption;

        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const isGroup = from.endsWith('@g.us');
        const isOwner = ownerNumber.includes(senderNumber) || botNumber === senderNumber;

        let groupName = '', participants = [], groupAdmins = [], isBotAdmins = false, isAdmins = false;
        if (isGroup) {
            const meta = await conn.groupMetadata(from).catch(()=>null);
            if (meta) {
                groupName = meta.subject || '';
                participants = meta.participants || [];
                groupAdmins = getGroupAdmins(participants);
                const botJid = await jidNormalizedUser(conn.user.id);
                isBotAdmins = groupAdmins.includes(botJid);
                isAdmins = groupAdmins.includes(sender);
            }
        }

        const reply = (txt) => conn.sendMessage(from, { text: txt }, { quoted: m });

        if (isCmd) {
            const cmd = getCommand(command);
            if (cmd) {
                try {
                    await cmd.function(conn, m, { message: m }, {
                        from, reply, body, isCmd, command, args, q, text: q,
                        isGroup, sender, senderNumber, botNumber, isOwner,
                        groupName, participants, groupAdmins, isBotAdmins, isAdmins, prefix
                    });
                } catch (e) {
                    console.error(e);
                    reply(`❌ Error: ${e.message}`);
                }
            }
        }
    });

    // Utility functions for plugins
    conn.decodeJid = (jid) => { let d = jidDecode(jid); return d?.user && d?.server ? `${d.user}@${d.server}` : jid; };
    conn.downloadMediaMessage = downloadMediaMessage;
    conn.sendImage = async (jid, path, caption, quoted) => {
        let buf = Buffer.isBuffer(path) ? path : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : null;
        if (buf) return conn.sendMessage(jid, { image: buf, caption }, { quoted });
        return null;
    };
    conn.sendText = (jid, text, quoted) => conn.sendMessage(jid, { text }, { quoted });
}

// ========== WEB SERVER ==========
app.get('/', (_, res) => res.send('XERO-MD is running!'));
app.listen(port, () => console.log(`Server running on port ${port}`));

setTimeout(connectToWA, 3000);
process.on('uncaughtException', (e) => console.error('Uncaught Exception:', e.message));
process.on('unhandledRejection', (e) => console.error('Unhandled Rejection:', e));

console.log('✅ XERO-MD starting...');
