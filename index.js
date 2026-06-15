// ======================== XERO-MD INDEX (FIXED - NO node-fetch) ========================
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

// ========== CHATBOT SETTINGS ==========
let groupChatbotEnabled = true;
let dmChatbotEnabled = false;

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

// ========== CHATBOT FUNCTION (Using Axios) ==========
async function getAIResponse(message) {
    try {
        const text = message.toLowerCase();
        
        if (text.includes("wewe ni nani") || text.includes("jina lako") || text.includes("who are you")) {
            return "Mimi naitwa *XERO-MD*, bot yako msaidizi hapa! 🤖\nNiko hapa kukusaidia na maswali yako.";
        }
        else if (text.includes("namba ya mwenye boti") || text.includes("owner number")) {
            return "📞 *Namba za Owner:*\n• +255763111390\n• +255610209120";
        }
        else if (text.includes("developer") || text.includes("dev") || text.includes("creator")) {
            return "👨‍💻 *Developer:* nyoni-xmd\nBot yangu inaitwa XERO-MD.";
        }
        else if (text.includes("thanks") || text.includes("asante") || text.includes("thank you")) {
            return "Karibu sana! 😊 Niko hapa kukusaidia wakati wote.";
        }
        else if (text.includes("hello") || text.includes("hujambo") || text.includes("hi")) {
            return "Hujambo! Habari yako? 👋\nNinakusaidiaje leo?";
        }
        
        // API call using axios
        const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(message)}`;
        const response = await axios.get(apiUrl, { timeout: 10000 });
        
        if (response.data && (response.data.status === 200 || response.data.success || response.data.result)) {
            return response.data.result || response.data.message || response.data.response;
        }
        
        return "Samahani, nina tatizo la kiufundi. Jaribu tena baadaye. 🛠️";
    } catch (error) {
        console.error("AI Response Error:", error.message);
        return "📡 Nina shida ya kufikia server. Jaribu tena baada ya dakika chache.";
    }
}

// ========== LOAD PLUGINS ==========
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
            
            try {
                await sock.sendMessage(sock.user.id, {
                    text: `╭━━━━━━━━━━━━━━━━━━╮
│   *XERO-MD ONLINE*   
│   Prefix: ${PREFIX}
│   Commands: ${global.commands.size}
│   AI Chatbot: ${groupChatbotEnabled ? "ON" : "OFF"}
╰━━━━━━━━━━━━━━━━━━╯

> POWERED BY nyoni-xmd`
                });
            } catch(e) {}
        }
    });

    sock.ev.on('creds.update', saveCreds);
    
    // ========== MESSAGE HANDLER ==========
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

        // ========== CHATBOT RESPONSE ==========
        if (!isCmd && !m.key.fromMe && body && body.length > 0 && body.length < 500) {
            let shouldReply = false;
            if (isGroup && groupChatbotEnabled) shouldReply = true;
            if (!isGroup && dmChatbotEnabled) shouldReply = true;
            
            if (shouldReply) {
                try {
                    await sock.sendPresenceUpdate('composing', from);
                    const aiReply = await getAIResponse(body);
                    
                    await sock.sendMessage(from, {
                        text: `╭┈┈❍ *XERO-MD AI* ❍
┊• 🤖 ${aiReply}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363399470975987@newsletter',
                                newsletterName: 'XERO-MD',
                                serverMessageId: 143
                            }
                        }
                    }, { quoted: m });
                } catch (aiError) {
                    console.error("AI Error:", aiError.message);
                }
            }
        }

        // ========== COMMAND EXECUTION ==========
        if (isCmd) {
            console.log(`📩 Command: "${cmdName}" from ${senderNumber}`);
            const cmd = getCommand(cmdName);
            if (cmd) {
                try {
                    await cmd.function(sock, m, {
                        from, reply, args, q, text: q, isGroup, sender, senderNumber, isOwner, prefix: PREFIX
                    });
                } catch (e) {
                    console.error(`❌ Error in ${cmdName}:`, e.message);
                    reply(`❌ Error: ${e.message}`);
                }
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

// ========== CHATBOT TOGGLE COMMANDS ==========
global.registerCommand({
    command: "groupai",
    alias: ["gai"],
    desc: "Enable/disable AI in groups",
    category: "owner",
    function: async (conn, m, { from, reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        const action = args[0]?.toLowerCase();
        if (action === 'on') {
            groupChatbotEnabled = true;
            reply(`✅ *Group AI Activated!*`);
        } else if (action === 'off') {
            groupChatbotEnabled = false;
            reply(`❌ *Group AI Deactivated!*`);
        } else {
            reply(`🤖 Group AI: ${groupChatbotEnabled ? "ON" : "OFF"}\n.gai on/off`);
        }
    }
});

global.registerCommand({
    command: "dmai",
    alias: ["dmaibot"],
    desc: "Enable/disable AI in private chat",
    category: "owner",
    function: async (conn, m, { from, reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        const action = args[0]?.toLowerCase();
        if (action === 'on') {
            dmChatbotEnabled = true;
            reply(`✅ *DM AI Activated!*`);
        } else if (action === 'off') {
            dmChatbotEnabled = false;
            reply(`❌ *DM AI Deactivated!*`);
        } else {
            reply(`🤖 DM AI: ${dmChatbotEnabled ? "ON" : "OFF"}\n.dmai on/off`);
        }
    }
});

// ========== WEB SERVER ==========
app.get('/', (req, res) => res.send('XERO-MD Running'));
app.listen(PORT, () => console.log(`🌐 Server on port ${PORT}`));

setTimeout(startBot, 3000);
process.on('uncaughtException', (e) => console.error('💥 Uncaught:', e.message));
process.on('unhandledRejection', (e) => console.error('💥 Rejection:', e));
console.log('🚀 XERO-MD starting with plugin system & AI Chatbot...');
