// ======================== XERO-MD INDEX (UHAKIKA) ========================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, Browsers, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const { File } = require('megajs');
const express = require('express');
const path = require('path');
const axios = require('axios');
const os = require('os');

// ========== SETUP ==========
const PREFIX = config.PREFIX || ".";
const OWNER_NUMBERS = ['255763111390', '255610209120'];
const app = express();
const PORT = process.env.PORT || 9090;

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

// ========== SESSION HANDLING ==========
if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');

if (!fs.existsSync('./sessions/creds.json') && config.SESSION_ID) {
    let key = config.SESSION_ID.replace(/^(POPKID;;;|XERO-MD>>>|jamali~|QUEEN-LORA~)/, '').trim();
    console.log("📥 Downloading session from MEGA...");
    File.fromURL(`https://mega.nz/file/${key}`).download((err, data) => {
        if (!err) {
            fs.writeFileSync('./sessions/creds.json', data);
            console.log("✅ Session downloaded successfully!");
        } else {
            console.error("❌ Session download failed:", err.message);
        }
    });
}

// ========== TEMP CLEANER ==========
const tempDir = path.join(os.tmpdir(), 'xero_temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
setInterval(() => {
    fs.readdir(tempDir, (err, files) => {
        if (err) return;
        files.forEach(f => fs.unlink(path.join(tempDir, f), () => {}));
    });
}, 5 * 60 * 1000);

// ========== HELPER FUNCTIONS ==========
async function getBuffer(url) {
    try {
        const res = await axios({ url, responseType: 'arraybuffer', timeout: 15000 });
        return res.data;
    } catch (e) {
        return null;
    }
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

async function saveMessage(m) { return true; }

async function AntiDelete(conn, updates) { console.log("🛡️ Anti-delete triggered"); }

// ========== LOAD PLUGINS ==========
function loadPlugins() {
    const pluginsDir = './plugins';
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);
    
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    console.log(`📦 Found ${files.length} plugins`);
    
    for (const file of files) {
        try {
            require(path.join(pluginsDir, file));
            console.log(`✅ Loaded: ${file}`);
        } catch (e) {
            console.log(`❌ Failed: ${file} - ${e.message}`);
        }
    }
    console.log(`✅ Total commands: ${global.commandsList.length}`);
}

// ========== MAIN BOT CONNECTION ==========
let reconnectTimer = null;

async function startBot() {
    console.log("🔌 Connecting to WhatsApp...");
    
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();
    
    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Firefox'),
        auth: state,
        version
    });

    // Connection events
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const statusCode = lastDisconnect.error?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                console.log('❌ Session expired. Please update SESSION_ID.');
                return;
            }
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(() => {
                console.log('🔄 Reconnecting...');
                startBot();
            }, 5000);
        } 
        else if (connection === 'open') {
            console.log('✅ XERO-MD CONNECTED SUCCESSFULLY!');
            loadPlugins();
            
            // Send startup notification to owner
            try {
                await conn.sendMessage(conn.user.id, {
                    text: `╭━━━━━━━━━━━━━━━━━━╮
│   *XERO-MD ONLINE*   
│   Prefix: ${PREFIX}
│   Commands: ${global.commandsList.length}
╰━━━━━━━━━━━━━━━━━━╯

> POWERED BY nyoni-xmd`
                });
            } catch(e) {}
        }
    });

    // Save credentials when updated
    conn.ev.on('creds.update', saveCreds);

    // Anti-delete
    conn.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
            if (update.update.message === null) {
                await AntiDelete(conn, updates);
            }
        }
    });

    // ========== MAIN MESSAGE HANDLER ==========
    conn.ev.on('messages.upsert', async (msg) => {
        let m = msg.messages[0];
        if (!m?.message) return;

        // Handle ephemeral messages
        if (getContentType(m.message) === 'ephemeralMessage') {
            m.message = m.message.ephemeralMessage.message;
        }
        
        // Handle view once messages
        if (m.message.viewOnceMessageV2) {
            m.message = m.message.viewOnceMessageV2.message;
        }

        // Auto read (if enabled)
        if (config.READ_MESSAGE === 'true') {
            await conn.readMessages([m.key]);
        }

        // Auto status actions
        if (m.key?.remoteJid === 'status@broadcast') {
            if (config.AUTO_STATUS_SEEN === 'true') await conn.readMessages([m.key]);
            if (config.AUTO_STATUS_REACT === 'true') {
                const emojis = ['❤️', '🔥', '💯', '✨', '⭐', '👑', '💎', '🏆'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await conn.sendMessage(m.key.remoteJid, {
                    react: { text: randomEmoji, key: m.key }
                }).catch(() => {});
            }
            if (config.AUTO_STATUS_REPLY === 'true') {
                const user = m.key.participant;
                const replyText = config.AUTO_STATUS_MSG || "Seen your status!";
                await conn.sendMessage(user, { text: replyText }, { quoted: m }).catch(() => {});
            }
        }

        await saveMessage(m);

        // Extract message details
        const type = getContentType(m.message);
        const from = m.key.remoteJid;
        const sender = m.key.fromMe ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : (m.key.participant || m.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];

        // Get message body
        let body = '';
        if (type === 'conversation') body = m.message.conversation;
        else if (type === 'extendedTextMessage') body = m.message.extendedTextMessage.text;
        else if (type === 'imageMessage' && m.message.imageMessage.caption) body = m.message.imageMessage.caption;
        else if (type === 'videoMessage' && m.message.videoMessage.caption) body = m.message.videoMessage.caption;
        else if (type === 'listResponseMessage') body = m.message.listResponseMessage?.singleSelectReply?.selectedRowId || '';

        const isCmd = body.startsWith(PREFIX);
        const command = isCmd ? body.slice(PREFIX.length).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const isGroup = from.endsWith('@g.us');
        const isOwner = OWNER_NUMBERS.includes(senderNumber) || botNumber === senderNumber;

        // Get group metadata if in group
        let groupName = '', participants = [], groupAdmins = [], isBotAdmins = false, isAdmins = false;
        if (isGroup) {
            const metadata = await conn.groupMetadata(from).catch(() => null);
            if (metadata) {
                groupName = metadata.subject || '';
                participants = metadata.participants || [];
                groupAdmins = getGroupAdmins(participants);
                const botJid = await jidNormalizedUser(conn.user.id);
                isBotAdmins = groupAdmins.includes(botJid);
                isAdmins = groupAdmins.includes(sender);
            }
        }

        // Reply function
        const reply = (text) => conn.sendMessage(from, { text }, { quoted: m });

        // Log command
        if (isCmd) {
            console.log(`📩 Command: ${command} from ${senderNumber} (${isGroup ? 'group' : 'dm'})`);
        }

        // Execute command if exists
        if (isCmd) {
            const cmd = getCommand(command);
            if (cmd) {
                try {
                    await cmd.function(conn, m, { message: m }, {
                        from, reply, body, isCmd, command, args, q, text: q,
                        isGroup, sender, senderNumber, botNumber, isOwner,
                        groupName, participants, groupAdmins, isBotAdmins, isAdmins, prefix: PREFIX
                    });
                } catch (err) {
                    console.error("Command error:", err);
                    reply(`❌ Error: ${err.message}`);
                }
            }
        }
    });

    // ========== UTILITY FUNCTIONS FOR PLUGINS ==========
    conn.decodeJid = (jid) => {
        let d = jidDecode(jid);
        return d?.user && d?.server ? `${d.user}@${d.server}` : jid;
    };
    
    conn.downloadMediaMessage = downloadMediaMessage;
    
    conn.sendImage = async (jid, url, caption, quoted) => {
        let buf = Buffer.isBuffer(url) ? url : /^https?:\/\//.test(url) ? await getBuffer(url) : fs.existsSync(url) ? fs.readFileSync(url) : null;
        if (buf) return conn.sendMessage(jid, { image: buf, caption }, { quoted });
        return null;
    };
    
    conn.sendText = (jid, text, quoted) => conn.sendMessage(jid, { text }, { quoted });
}

// ========== WEB SERVER (for health checks) ==========
app.get('/', (req, res) => res.send('XERO-MD is running!'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// ========== START BOT ==========
setTimeout(startBot, 3000);

// ========== ERROR HANDLING ==========
process.on('uncaughtException', (err) => console.error('💥 Uncaught Exception:', err.message));
process.on('unhandledRejection', (err) => console.error('💥 Unhandled Rejection:', err));

console.log('🚀 XERO-MD booting up...');
