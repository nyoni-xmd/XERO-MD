// ======================== XERO-MD INDEX (FIXED PLUGIN LOADER) ========================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, Browsers, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const { File } = require('megajs');
const express = require('express');
const path = require('path');
const axios = require('axios');
const os = require('os');

// ========== FIXED PREFIX ==========
const PREFIX = ".";
const OWNER_NUMBERS = ['255763111390', '255610209120'];
const app = express();
const PORT = process.env.PORT || 9090;

console.log(`✅ Bot prefix: "${PREFIX}"`);

// ========== COMMAND REGISTRY ==========
global.commands = new Map();
global.aliases = new Map();

function registerCommand(cmd) {
    if (!cmd.command) return;
    global.commands.set(cmd.command, cmd);
    if (cmd.alias && Array.isArray(cmd.alias)) {
        cmd.alias.forEach(a => global.aliases.set(a, cmd.command));
    }
    console.log(`📝 Registered command: ${cmd.command}`);
}

function getCommand(name) {
    return global.commands.get(name) || global.commands.get(global.aliases.get(name));
}

global.registerCommand = registerCommand;
global.getCommand = getCommand;

// ========== SESSION ==========
if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');

if (!fs.existsSync('./sessions/creds.json') && config.SESSION_ID) {
    let key = config.SESSION_ID.replace(/^(POPKID;;;|XERO-MD>>>|jamali~|QUEEN-LORA~)/, '').trim();
    console.log("📥 Downloading session...");
    File.fromURL(`https://mega.nz/file/${key}`).download((err, data) => {
        if (!err) {
            fs.writeFileSync('./sessions/creds.json', data);
            console.log("✅ Session ready!");
        } else {
            console.error("❌ Session error:", err.message);
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
    } catch { return null; }
}

// ========== LOAD PLUGINS (SOMA FOLDER PLUGINS) ==========
function loadPlugins() {
    const pluginsDir = path.join(__dirname, 'plugins');
    console.log(`📂 Looking for plugins in: ${pluginsDir}`);
    
    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir);
        console.log("📁 Created plugins folder");
    }
    
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    console.log(`📦 Found ${files.length} plugin files`);
    
    for (const file of files) {
        try {
            const pluginPath = path.join(pluginsDir, file);
            console.log(`📥 Loading: ${file}`);
            require(pluginPath);
            console.log(`✅ Loaded: ${file}`);
        } catch (e) {
            console.log(`❌ Failed to load ${file}: ${e.message}`);
            console.log(e.stack);
        }
    }
    
    console.log(`✅ Total commands registered: ${global.commands.size}`);
}

// ========== MAIN BOT ==========
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
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                if (reconnectTimer) clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(() => {
                    console.log('🔄 Reconnecting...');
                    startBot();
                }, 5000);
            } else {
                console.log('❌ Session expired. Update SESSION_ID.');
            }
        } else if (connection === 'open') {
            console.log('✅ XERO-MD CONNECTED!');
            loadPlugins();
            
            // Send status to owner
            try {
                await sock.sendMessage(sock.user.id, {
                    text: `╭━━━━━━━━━━━━━━━━━━╮
│   *XERO-MD ONLINE*   
│   Prefix: ${PREFIX}
│   Commands: ${global.commands.size}
╰━━━━━━━━━━━━━━━━━━╯

> POWERED BY nyoni-xmd`
                });
            } catch(e) {}
        }
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('messages.upsert', async (msg) => {
        let m = msg.messages[0];
        if (!m?.message) return;

        if (getContentType(m.message) === 'ephemeralMessage') {
            m.message = m.message.ephemeralMessage.message;
        }
        if (m.message.viewOnceMessageV2) {
            m.message = m.message.viewOnceMessageV2.message;
        }

        const from = m.key.remoteJid;
        const sender = m.key.fromMe ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : (m.key.participant || m.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const isGroup = from.endsWith('@g.us');
        const isOwner = OWNER_NUMBERS.includes(senderNumber);

        let body = '';
        const type = getContentType(m.message);
        if (type === 'conversation') body = m.message.conversation;
        else if (type === 'extendedTextMessage') body = m.message.extendedTextMessage.text;
        else if (type === 'imageMessage' && m.message.imageMessage.caption) body = m.message.imageMessage.caption;
        else if (type === 'videoMessage' && m.message.videoMessage.caption) body = m.message.videoMessage.caption;

        const isCmd = body.startsWith(PREFIX);
        const cmdName = isCmd ? body.slice(PREFIX.length).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');

        const reply = (text) => sock.sendMessage(from, { text }, { quoted: m });

        if (isCmd) {
            console.log(`📩 Command received: "${cmdName}" from ${senderNumber}`);
            const cmd = getCommand(cmdName);
            if (cmd) {
                try {
                    console.log(`▶️ Executing: ${cmdName}`);
                    await cmd.function(sock, m, {
                        from, reply, args, q, text: q, isGroup, sender, senderNumber, isOwner, prefix: PREFIX
                    });
                } catch (e) {
                    console.error(`❌ Error in ${cmdName}:`, e);
                    reply(`❌ Error: ${e.message}`);
                }
            } else {
                console.log(`⚠️ Unknown command: ${cmdName}`);
            }
        }
    });

    // Helper functions
    sock.downloadMedia = async (msg) => {
        const stream = await downloadContentFromMessage(msg, msg.mimetype?.split('/')[0] || 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
    };
    
    sock.getBuffer = getBuffer;
    
    sock.getPP = async (jid) => {
        try {
            return await sock.profilePictureUrl(jid, 'image');
        } catch { return null; }
    };
    
    sock.decodeJid = (jid) => {
        let d = jidDecode(jid);
        return d?.user && d?.server ? `${d.user}@${d.server}` : jid;
    };
}

// ========== WEB SERVER ==========
app.get('/', (req, res) => res.send('XERO-MD Running'));
app.listen(PORT, () => console.log(`🌐 Server on port ${PORT}`));

setTimeout(startBot, 3000);
process.on('uncaughtException', (e) => console.error('💥 Uncaught:', e.message));
process.on('unhandledRejection', (e) => console.error('💥 Rejection:', e));
console.log('🚀 XERO-MD starting with plugin system...');
