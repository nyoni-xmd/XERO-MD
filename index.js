// ======================== XERO-MD INDEX (FULL WITH CHATBOT) ========================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, Browsers, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const { File } = require('megajs');
const express = require('express');
const path = require('path');
const axios = require('axios');
const os = require('os');

const PREFIX = ".";
const OWNER_NUMBERS = ['255763111390', '255610209120'];
const app = express();
const PORT = process.env.PORT || 9090;

console.log(`✅ Bot prefix: "${PREFIX}"`);

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
    console.log(`📝 Registered: ${cmd.command}`);
}

function getCommand(name) {
    return global.commands.get(name) || global.commands.get(global.aliases.get(name));
}

global.registerCommand = registerCommand;
global.getCommand = getCommand;

// ========== CHATBOT SETTINGS ==========
let groupChatbotEnabled = true;   // AI in groups
let dmChatbotEnabled = true;      // AI in private messages

// ========== AI RESPONSE FUNCTION ==========
async function getAIResponse(message) {
    try {
        const text = message.toLowerCase();
        
        // Custom quick responses
        if (text.includes("wewe ni nani") || text.includes("jina lako") || text.includes("who are you")) {
            return "Mimi naitwa *XERO-MD*, bot yako msaidizi! 🤖\nNiko hapa kukusaidia na maswali yako.";
        }
        else if (text.includes("namba ya mwenye boti") || text.includes("owner number") || text.includes("namba ya boss")) {
            return "📞 *Namba za Owner:*\n• +255763111390\n• +255610209120";
        }
        else if (text.includes("developer") || text.includes("dev") || text.includes("creator")) {
            return "👨‍💻 *Developer:* nyoni-xmd\nBot yangu inaitwa XERO-MD.";
        }
        else if (text.includes("thanks") || text.includes("asante") || text.includes("thank you")) {
            return "Karibu sana! 😊 Niko hapa kukusaidia wakati wote.";
        }
        else if (text.includes("hello") || text.includes("hujambo") || text.includes("hi") || text.includes("sasa")) {
            return "Hujambo! Habari yako? 👋\nNinakusaidiaje leo?";
        }
        else if (text.includes("help") || text.includes("msaada") || text.includes("saidia")) {
            return "📋 *Msaada / Help*\n\nNinajibu maswali yako kwa lugha yoyote.\n\n*Commands zangu:*\n• .menu - Orodha ya commands zote\n• .ping - Kuangalia kama niko online\n• .owner - Mawasiliano ya owner\n• .alive - Kuangalia status yangu\n• .groupai on/off - Kuwasha/kuzima AI kwenye group\n• .dmai on/off - Kuwasha/kuzima AI kwenye DM\n\nUliza chochote, nitajaribu kukusaidia!";
        }
        else if (text.includes("time") || text.includes("saa") || text.includes("muda")) {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return `⏰ *Sasa ni:* ${time}\n📅 *Tarehe:* ${now.toLocaleDateString()}\n\nTanzania Timezone (UTC+3)`;
        }
        
        // API call for other messages
        const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(message)}`;
        const response = await axios.get(apiUrl, { timeout: 10000 });
        
        if (response.data && (response.data.status === 200 || response.data.success || response.data.result)) {
            return response.data.result || response.data.message || response.data.response;
        }
        
        return "Samahani, nina tatizo la kiufundi. Jaribu tena baadaye. 🛠️";
    } catch (error) {
        console.error("AI Error:", error.message);
        return "📡 Nina shida ya kufikia server. Jaribu tena baada ya dakika chache.";
    }
}

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

// ========== LOAD PLUGINS ==========
function loadPlugins() {
    const pluginsDir = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    console.log(`📦 Found ${files.length} plugin files`);
    for (const file of files) {
        try {
            require(path.join(pluginsDir, file));
            console.log(`✅ Loaded: ${file}`);
        } catch (e) {
            console.log(`❌ Failed to load ${file}: ${e.message}`);
        }
    }
    console.log(`✅ Total commands registered: ${global.commandsList.length}`);
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
│   Commands: ${global.commandsList.length}
│   Group AI: ${groupChatbotEnabled ? "ON" : "OFF"}
│   DM AI: ${dmChatbotEnabled ? "ON" : "OFF"}
╰━━━━━━━━━━━━━━━━━━╯

> POWERED BY nyoni-xmd`
                });
            } catch(e) {}
        }
    });

    sock.ev.on('creds.update', saveCreds);
    
    // ========== MESSAGE HANDLER (WITH CHATBOT) ==========
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

        // ========== CHATBOT RESPONSE (for non-command messages) ==========
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
    alias: ["gai", "aigroup"],
    desc: "Enable or disable AI chatbot in groups",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        const action = args[0]?.toLowerCase();
        if (action === 'on') {
            groupChatbotEnabled = true;
            reply(`✅ *Group AI Activated!*\nNow I will reply to messages in groups.`);
        } else if (action === 'off') {
            groupChatbotEnabled = false;
            reply(`❌ *Group AI Deactivated!*\nI will no longer reply in groups.`);
        } else {
            reply(`🤖 *Group AI Status:* ${groupChatbotEnabled ? "ON" : "OFF"}\n\n.groupai on - Enable\n.groupai off - Disable`);
        }
    }
});

global.registerCommand({
    command: "dmai",
    alias: ["dmaibot", "privacyai"],
    desc: "Enable or disable AI chatbot in private messages",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        const action = args[0]?.toLowerCase();
        if (action === 'on') {
            dmChatbotEnabled = true;
            reply(`✅ *DM AI Activated!*\nNow I will reply to your private messages.`);
        } else if (action === 'off') {
            dmChatbotEnabled = false;
            reply(`❌ *DM AI Deactivated!*\nI will no longer reply in private chat.`);
        } else {
            reply(`🤖 *DM AI Status:* ${dmChatbotEnabled ? "ON" : "OFF"}\n\n.dmai on - Enable\n.dmai off - Disable`);
        }
    }
});

// ========== BASIC COMMANDS ==========
global.registerCommand({
    command: "ping",
    alias: ["p"],
    desc: "Check bot response",
    category: "info",
    function: async (conn, m, { reply }) => {
        reply("🏓 Pong! Bot is alive.");
    }
});

global.registerCommand({
    command: "menu",
    alias: ["help", "cmd"],
    desc: "Show bot menu",
    category: "menu",
    function: async (conn, m, { reply, prefix }) => {
        const menu = `╭━━━━━━━━━━━━━━━━━━╮
│   *XERO-MD MENU*
╰━━━━━━━━━━━━━━━━━━╯

╭─〔 COMMANDS 〕─╮
│ • ${prefix}ping - Check bot
│ • ${prefix}menu - Show menu
│ • ${prefix}alive - Bot status
│ • ${prefix}owner - Owner info
│ • ${prefix}groupai on/off - Group AI
│ • ${prefix}dmai on/off - DM AI
╰───────────────╯

╭─〔 INFO 〕─╮
│ Bot: XERO-MD
│ Dev: nyoni-xmd
│ Prefix: ${prefix}
│ Group AI: ${groupChatbotEnabled ? "ON" : "OFF"}
│ DM AI: ${dmChatbotEnabled ? "ON" : "OFF"}
╰─────────────╯

> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`;
        reply(menu);
    }
});

global.registerCommand({
    command: "alive",
    desc: "Check bot status",
    category: "info",
    function: async (conn, m, { reply }) => {
        reply(`✨ XERO-MD is alive and online!
⚡ Power - Speed - Control
🚀 Beyond Limits

Group AI: ${groupChatbotEnabled ? "ON" : "OFF"}
DM AI: ${dmChatbotEnabled ? "ON" : "OFF"}`);
    }
});

global.registerCommand({
    command: "owner",
    alias: ["creator", "dev"],
    desc: "Owner info",
    category: "info",
    function: async (conn, m, { reply }) => {
        reply(`👑 *OWNER*
Name: nyoni-xmd
Number: +255763111390
Number 2: +255610209120
Bot: XERO-MD`);
    }
});

global.registerCommand({
    command: "runtime",
    alias: ["uptime"],
    desc: "Bot uptime",
    category: "info",
    function: async (conn, m, { reply }) => {
        const u = process.uptime();
        const hours = Math.floor(u / 3600);
        const minutes = Math.floor((u % 3600) / 60);
        const seconds = Math.floor(u % 60);
        reply(`⏰ Uptime: ${hours}h ${minutes}m ${seconds}s`);
    }
});

// ========== WEB SERVER ==========
app.get('/', (req, res) => res.send('XERO-MD Running'));
app.listen(PORT, () => console.log(`🌐 Server on port ${PORT}`));

setTimeout(startBot, 3000);
process.on('uncaughtException', (e) => console.error('💥 Uncaught:', e.message));
process.on('unhandledRejection', (e) => console.error('💥 Rejection:', e));
console.log('🚀 XERO-MD starting with plugin system & AI Chatbot...');
