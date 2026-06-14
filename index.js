// index.js (XERO-MD) – Nakili hii kwenye mradi wako
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, Browsers, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const { File } = require('megajs');
const express = require('express');
const path = require('path');
const axios = require('axios');
const os = require('os');

const prefix = config.PREFIX || ".";
const ownerNumber = ['255763111390', '255610209120'];
const app = express();
const port = process.env.PORT || 9090;

// ========== COMMAND REGISTRY ==========
global.commands = new Map();
global.aliases = new Map();
global.commandsList = [];

function registerCommand(cmd) {
    if (!cmd.command) return;
    global.commands.set(cmd.command, cmd);
    if (cmd.alias && Array.isArray(cmd.alias)) {
        cmd.alias.forEach(a => global.aliases.set(a, cmd.command));
    }
    global.commandsList.push(cmd);
}
function getCommand(name) {
    return global.commands.get(name) || global.commands.get(global.aliases.get(name));
}
global.registerCommand = registerCommand;
global.getCommand = getCommand;

// ========== SESSION & TEMP ==========
if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');
if (!fs.existsSync('./sessions/creds.json') && config.SESSION_ID) {
    let key = config.SESSION_ID.replace(/^(POPKID;;;|XERO-MD>>>|jamali~|QUEEN-LORA~)/, '').trim();
    File.fromURL(`https://mega.nz/file/${key}`).download((err, data) => {
        if (!err) fs.writeFileSync('./sessions/creds.json', data);
        else console.error('Session download error:', err.message);
    });
}

const temp = path.join(os.tmpdir(), 'xero_temp');
if (!fs.existsSync(temp)) fs.mkdirSync(temp);
setInterval(() => {
    fs.readdir(temp, (_, f) => f.forEach(f => fs.unlink(path.join(temp, f), () => {})));
}, 5 * 60 * 1000);

// ========== HELPERS ==========
async function getBuffer(url) {
    try {
        const res = await axios({ url, responseType: 'arraybuffer', timeout: 15000 });
        return res.data;
    } catch { return null; }
}
function getAdmins(participants) {
    return participants.filter(p => p.admin).map(p => p.id);
}
async function downloadMedia(msg) {
    const stream = await downloadContentFromMessage(msg, msg.mimetype.split('/')[0]);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}
async function saveMessage(m) { return true; }

// ========== LOAD PLUGINS (SCAN FOLDER) ==========
function loadPlugins() {
    const pluginsDir = './plugins';
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    console.log(`📦 Found ${files.length} plugins`);
    for (const f of files) {
        try {
            require(path.join(pluginsDir, f));
            console.log(`✅ Loaded: ${f}`);
        } catch (e) {
            console.log(`❌ Failed: ${f} - ${e.message}`);
        }
    }
    console.log(`✅ Total commands: ${global.commandsList.length}`);
}

// ========== MAIN CONNECTION ==========
let reconnectTimer;
async function startBot() {
    console.log("🔌 Connecting to WhatsApp...");
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Firefox'),
        auth: state,
        version
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const code = lastDisconnect.error?.output?.statusCode;
            if (code === DisconnectReason.loggedOut) {
                console.log('❌ Session expired. Update SESSION_ID.');
                return;
            }
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(() => {
                console.log('🔄 Reconnecting...');
                startBot();
            }, 5000);
        } else if (connection === 'open') {
            console.log('✅ XERO-MD CONNECTED!');
            loadPlugins();
            try {
                await sock.sendMessage(sock.user.id, { text: '✅ Bot is online. Commands are ready.' });
            } catch(e) {}
        }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async (msg) => {
        let m = msg.messages[0];
        if (!m?.message) return;
        if (getContentType(m.message) === 'ephemeralMessage') m.message = m.message.ephemeralMessage.message;
        if (m.message.viewOnceMessageV2) m.message = m.message.viewOnceMessageV2.message;
        if (config.READ_MESSAGE === 'true') await sock.readMessages([m.key]);

        if (m.key?.remoteJid === 'status@broadcast') {
            if (config.AUTO_STATUS_SEEN === 'true') await sock.readMessages([m.key]);
            if (config.AUTO_STATUS_REACT === 'true') {
                const emojis = ['❤️','🔥','💯','✨','⭐'];
                await sock.sendMessage(m.key.remoteJid, { react: { text: emojis[Math.floor(Math.random()*emojis.length)], key: m.key } }).catch(()=>{});
            }
            if (config.AUTO_STATUS_REPLY === 'true') {
                await sock.sendMessage(m.key.participant, { text: config.AUTO_STATUS_MSG || 'Seen your status!' }, { quoted: m }).catch(()=>{});
            }
        }

        await saveMessage(m);

        const type = getContentType(m.message);
        const from = m.key.remoteJid;
        const sender = m.key.fromMe ? sock.user.id.split(':')[0]+'@s.whatsapp.net' : (m.key.participant || m.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const botNumber = sock.user.id.split(':')[0];

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
            const meta = await sock.groupMetadata(from).catch(()=>null);
            if (meta) {
                groupName = meta.subject || '';
                participants = meta.participants || [];
                groupAdmins = getAdmins(participants);
                const botJid = await jidNormalizedUser(sock.user.id);
                isBotAdmins = groupAdmins.includes(botJid);
                isAdmins = groupAdmins.includes(sender);
            }
        }

        const reply = (text) => sock.sendMessage(from, { text }, { quoted: m });

        if (isCmd) {
            console.log(`📩 Command: ${command} from ${senderNumber}`);
            const cmd = getCommand(command);
            if (cmd) {
                try {
                    await cmd.function(sock, m, { message: m }, {
                        from, reply, body, isCmd, command, args, q, text: q,
                        isGroup, sender, senderNumber, botNumber, isOwner,
                        groupName, participants, groupAdmins, isBotAdmins, isAdmins, prefix
                    });
                } catch (err) {
                    console.error(err);
                    reply(`❌ Error: ${err.message}`);
                }
            }
        }
    });

    sock.decodeJid = (jid) => { let d = jidDecode(jid); return d?.user && d?.server ? `${d.user}@${d.server}` : jid; };
    sock.downloadMediaMessage = downloadMedia;
    sock.sendImage = async (jid, url, caption, quoted) => {
        let buf = Buffer.isBuffer(url) ? url : /^https?:\/\//.test(url) ? await getBuffer(url) : fs.existsSync(url) ? fs.readFileSync(url) : null;
        if (buf) return sock.sendMessage(jid, { image: buf, caption }, { quoted });
        return null;
    };
    sock.sendText = (jid, text, quoted) => sock.sendMessage(jid, { text }, { quoted });
}

// ========== WEB SERVER ==========
app.get('/', (_, res) => res.send('XERO-MD is running'));
app.listen(port, () => console.log(`🌐 Web server on port ${port}`));

setTimeout(startBot, 3000);
process.on('uncaughtException', (e) => console.error('💥 Exception:', e.message));
process.on('unhandledRejection', (e) => console.error('💥 Rejection:', e));
console.log('🚀 XERO-MD booting...');
