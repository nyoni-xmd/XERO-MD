// ======================== XERO-MD INDEX (CLEAN - NO MIDOFINGA) ========================
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

// ========== ANTI-DELETE FUNCTIONS ==========
let antiDeleteEnabled = config.ANTI_DELETE === "true";
let antiDeletePath = config.ANTI_DEL_PATH || "same";

// ========== CHATBOT SETTINGS ==========
let groupChatbotEnabled = true;
let dmChatbotEnabled = true;

// ========== STATUS SETTINGS (AUTO LIKE) ==========
let autoStatusSeen = config.AUTO_STATUS_SEEN === "true";
let autoStatusReact = config.AUTO_STATUS_REACT === "true";
let autoStatusReply = config.AUTO_STATUS_REPLY === "true";
let autoStatusMsg = config.AUTO_STATUS_MSG || "👀 Status viewed!";
const statusReactEmojis = ['❤️', '🔥', '💯', '✨', '⭐', '👑', '💎', '🏆', '🎉', '🥳', '💖', '🥰', '😍', '💗', '🌹'];

// ========== GROUP EVENTS SETTINGS ==========
let welcomeEnabled = config.WELCOME === "true";
let goodbyeEnabled = config.GOODBYE === "true";
let adminEventsEnabled = config.ADMIN_ACTION === "true";

// ========== AUTO REACT SETTINGS ==========
let autoReactEnabled = config.AUTO_REACT === "true";
const autoReactEmojis = ['😊', '👍', '🔥', '💯', '✨', '⭐', '❤️', '💙', '💚', '💛', '🎉', '👏', '😎', '🤗', '💪'];

// ========== AUTO TYPING SETTINGS ==========
let autoTypingEnabled = config.AUTO_TYPING === "true";

// ========== AUTO RECORDING SETTINGS ==========
let autoRecordingEnabled = config.AUTO_RECORDING === "true";

// ========== STATUS STORAGE ==========
let processedStatusIds = new Set();

// ========== AI RESPONSE FUNCTION (YUPRA API) ==========
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
            return "📋 *Msaada / Help*\n\n*Commands zangu:*\n• .menu - Orodha ya commands zote\n• .ping - Kuangalia kama niko online\n• .owner - Mawasiliano ya owner\n• .alive - Kuangalia status yangu\n• .groupai on/off - Kuwasha/kuzima AI kwenye group\n• .dmai on/off - Kuwasha/kuzima AI kwenye DM\n\nUliza chochote, nitajaribu kukusaidia!";
        }
        else if (text.includes("time") || text.includes("saa") || text.includes("muda")) {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return `⏰ *Sasa ni:* ${time}\n📅 *Tarehe:* ${now.toLocaleDateString()}\n\nTanzania Timezone (UTC+3)`;
        }
        
        // Yupra API
        const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encodeURIComponent(message)}`;
        const response = await axios.get(apiUrl, { timeout: 15000 });
        
        if (response.data && (response.data.status === 200 || response.data.success) && response.data.result) {
            return response.data.result || response.data.message || response.data.data;
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

// ========== ANTI-DELETE MESSAGE STORAGE ==========
const messageStore = new Map();

function storeMessage(key, message) {
    messageStore.set(key, {
        message: message,
        timestamp: Date.now()
    });
    setTimeout(() => messageStore.delete(key), 60000);
}

function getStoredMessage(key) {
    return messageStore.get(key);
}

// ========== AUTO RECORDING FUNCTION ==========
async function sendRecording(conn, from) {
    try {
        await conn.sendMessage(from, { 
            audio: { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, 
            mimetype: 'audio/mp4', 
            ptt: true 
        }).catch(() => {});
    } catch (e) {}
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

// ========== GROUP EVENTS HANDLER ==========
async function handleGroupEvents(conn, update) {
    try {
        const { id, action, participants, author } = update;
        if (!id.endsWith('@g.us')) return;
        
        const metadata = await conn.groupMetadata(id);
        const groupName = metadata.subject || "Group";
        const groupMembersCount = metadata.participants.length;
        
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(id, 'image');
        } catch {
            ppUrl = 'https://files.catbox.moe/gyaka2.png';
        }
        
        const timestamp = new Date().toLocaleString();
        
        for (const num of participants) {
            const userName = num.split('@')[0];
            
            if (action === "add" && welcomeEnabled) {
                const WelcomeText = `╭┈┈❍ *XERO-MD* ❍
┊• ✨ *WELCOME NEW MEMBER!*
┊•
┊• 🎉 *User* : @${userName}
┊• 👑 *Owner* : nyoni-xmd
┊• 📞 *Number 1* : +255763111390
┊• 📞 *Number 2* : +255610209120
┊• 👥 *Members* : #${groupMembersCount}
┊• ⏰ *Time* : ${timestamp}
┊• 📛 *Group* : ${groupName}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

                await conn.sendMessage(id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                });
            }
            
            else if (action === "remove" && goodbyeEnabled) {
                const GoodbyeText = `╭┈┈❍ *XERO-MD* ❍
┊• 🌟 *MEMBER LEFT*
┊•
┊• 👋 *User* : @${userName}
┊• 👑 *Owner* : nyoni-xmd
┊• 📞 *Number 1* : +255763111390
┊• 📞 *Number 2* : +255610209120
┊• 👥 *Remaining* : #${groupMembersCount}
┊• ⏰ *Time* : ${timestamp}
┊• 📛 *Group* : ${groupName}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

                await conn.sendMessage(id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                });
            }
            
            else if (action === "demote" && adminEventsEnabled) {
                const demoter = author?.split('@')[0] || "Admin";
                await conn.sendMessage(id, {
                    text: `╭┈┈❍ *XERO-MD* ❍
┊• ⚡ *DEMOTION NOTICE*
┊•
┊• 📛 *Demoted* : @${userName}
┊• 👑 *By* : @${demoter}
┊• 👥 *Group* : ${groupName}
┊• ⏰ *Time* : ${timestamp}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                    mentions: [author, num]
                });
            }
            
            else if (action === "promote" && adminEventsEnabled) {
                const promoter = author?.split('@')[0] || "Admin";
                await conn.sendMessage(id, {
                    text: `╭┈┈❍ *XERO-MD* ❍
┊• 🎉 *PROMOTION NOTICE*
┊•
┊• 👑 *Promoted* : @${userName}
┊• 👑 *By* : @${promoter}
┊• 👥 *Group* : ${groupName}
┊• ⏰ *Time* : ${timestamp}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                    mentions: [author, num]
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
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
│   Anti-Delete: ${antiDeleteEnabled ? "ON" : "OFF"}
│   Auto Typing: ${autoTypingEnabled ? "ON" : "OFF"}
│   Auto Recording: ${autoRecordingEnabled ? "ON" : "OFF"}
│   Auto Status React: ${autoStatusReact ? "ON" : "OFF"}
╰━━━━━━━━━━━━━━━━━━╯

> POWERED BY nyoni-xmd`
                });
            } catch(e) {}
        }
    });

    sock.ev.on('creds.update', saveCreds);
    
    // ========== ANTI-DELETE HANDLER ==========
    sock.ev.on('messages.update', async (updates) => {
        if (!antiDeleteEnabled) return;
        
        for (const update of updates) {
            if (update.update.message === null) {
                const deletedMsg = getStoredMessage(update.key.id);
                if (deletedMsg && deletedMsg.message) {
                    const msg = deletedMsg.message;
                    const deleteTime = new Date().toLocaleString();
                    const sender = msg.key?.participant?.split('@')[0] || "Unknown";
                    const deleter = update.key?.participant?.split('@')[0] || "Unknown";
                    
                    let content = "";
                    if (msg.message?.conversation) content = msg.message.conversation;
                    else if (msg.message?.extendedTextMessage?.text) content = msg.message.extendedTextMessage.text;
                    else content = "Media message";
                    
                    const targetJid = antiDeletePath === "inbox" ? sock.user.id : update.key.remoteJid;
                    
                    await sock.sendMessage(targetJid, {
                        text: `╭┈┈❍ *XERO-MD* ❍
┊• 🛡️ *ANTI-DELETE ALERT*
┊•
┊• 👤 *Sender* : @${sender}
┊• 🧎 *Deleted by* : @${deleter}
┊• ⏰ *Time* : ${deleteTime}
┊• 📝 *Content* : ${content}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                        mentions: [msg.key?.participant, update.key?.participant]
                    });
                }
            }
        }
    });
    
    // ========== MESSAGE HANDLER ==========
    sock.ev.on('messages.upsert', async (msg) => {
        let m = msg.messages[0];
        if (!m?.message) return;

        if (m.key?.id) {
            storeMessage(m.key.id, m);
        }

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
        
        // ========== AUTO TYPING ==========
        if (autoTypingEnabled && !m.key.fromMe && !isGroup) {
            await sock.sendPresenceUpdate('composing', from).catch(() => {});
            setTimeout(async () => {
                await sock.sendPresenceUpdate('paused', from).catch(() => {});
            }, 3000);
        }
        
        // ========== AUTO RECORDING ==========
        if (autoRecordingEnabled && !m.key.fromMe && !isGroup) {
            setTimeout(async () => {
                await sendRecording(sock, from);
            }, 2000);
        }
        
        // ========== AUTO STATUS SEEN/REACT/REPLY ==========
        if (from === 'status@broadcast' && !m.key.fromMe) {
            // Auto status seen
            if (autoStatusSeen) {
                try {
                    await sock.readMessages([m.key]);
                    console.log(`✅ Status viewed: ${m.key.id}`);
                } catch (e) {
                    console.log("Status seen error:", e.message);
                }
            }
            
            // Auto status react (AUTO LIKE)
            if (autoStatusReact) {
                try {
                    const randomEmoji = statusReactEmojis[Math.floor(Math.random() * statusReactEmojis.length)];
                    await sock.sendMessage(from, { 
                        react: { 
                            text: randomEmoji, 
                            key: m.key 
                        } 
                    });
                    console.log(`✅ Status liked: ${randomEmoji}`);
                } catch (e) {
                    console.log("Status react error:", e.message);
                }
            }
            
            // Auto status reply
            if (autoStatusReply) {
                try {
                    const statusOwner = m.key.participant || m.key.remoteJid;
                    if (statusOwner && statusOwner !== sock.user.id) {
                        await sock.sendMessage(statusOwner, { 
                            text: `╭┈┈❍ *XERO-MD* ❍
┊• 👀 ${autoStatusMsg}
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
                        });
                        console.log(`✅ Status reply sent to: ${statusOwner}`);
                    }
                } catch (e) {
                    console.log("Status reply error:", e.message);
                }
            }
            return;
        }

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
        
        // ========== AUTO REACT ==========
        if (autoReactEnabled && !isCmd && !m.key.fromMe && body) {
            const randomEmoji = autoReactEmojis[Math.floor(Math.random() * autoReactEmojis.length)];
            await sock.sendMessage(from, { react: { text: randomEmoji, key: m.key } }).catch(() => {});
        }

        // ========== CHATBOT RESPONSE (GROUP AI) ==========
        if (!isCmd && !m.key.fromMe && body && body.length > 0 && body.length < 500 && isGroup && groupChatbotEnabled) {
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
        
        // ========== CHATBOT RESPONSE (DM AI) ==========
        if (!isCmd && !m.key.fromMe && body && body.length > 0 && body.length < 500 && !isGroup && dmChatbotEnabled) {
            try {
                await sock.sendPresenceUpdate('composing', from);
                const aiReply = await getAIResponse(body);
                
                await sock.sendMessage(from, {
                    text: `╭┈┈❍ *XERO-MD DM AI* ❍
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

    // ========== GROUP EVENTS ==========
    sock.ev.on("group-participants.update", (update) => handleGroupEvents(sock, update));

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

// ========== SETTINGS COMMANDS ==========

// Anti-Delete
global.registerCommand({
    command: "antidel",
    alias: ["antidelete"],
    desc: "Enable/disable anti-delete",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        const action = args[0]?.toLowerCase();
        if (action === 'on') { antiDeleteEnabled = true; reply("✅ Anti-Delete ENABLED!"); }
        else if (action === 'off') { antiDeleteEnabled = false; reply("❌ Anti-Delete DISABLED!"); }
        else reply(`🛡️ Anti-Delete: ${antiDeleteEnabled ? "ON" : "OFF"}`);
    }
});

global.registerCommand({
    command: "antidelpath",
    alias: ["adpath"],
    desc: "Set anti-delete path (inbox/same)",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        const path = args[0]?.toLowerCase();
        if (path === 'inbox' || path === 'same') {
            antiDeletePath = path;
            reply(`✅ Anti-Delete path set to: ${path}`);
        } else {
            reply(`📍 Current path: ${antiDeletePath}`);
        }
    }
});

// Auto Typing
global.registerCommand({
    command: "autotyping",
    alias: ["typing"],
    desc: "Enable/disable auto typing",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        if (args[0] === 'on') { autoTypingEnabled = true; reply("✅ Auto Typing ENABLED!"); }
        else if (args[0] === 'off') { autoTypingEnabled = false; reply("❌ Auto Typing DISABLED!"); }
        else reply(`⌨️ Auto Typing: ${autoTypingEnabled ? "ON" : "OFF"}`);
    }
});

// Auto Recording
global.registerCommand({
    command: "autorecording",
    alias: ["recording", "autorecord"],
    desc: "Enable/disable auto recording",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        if (args[0] === 'on') { autoRecordingEnabled = true; reply("✅ Auto Recording ENABLED!"); }
        else if (args[0] === 'off') { autoRecordingEnabled = false; reply("❌ Auto Recording DISABLED!"); }
        else reply(`🎙️ Auto Recording: ${autoRecordingEnabled ? "ON" : "OFF"}`);
    }
});

// Status Commands
global.registerCommand({
    command: "autoseen",
    alias: ["statusseen"],
    desc: "Enable/disable auto status seen",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        if (args[0] === 'on') { autoStatusSeen = true; reply("✅ Auto Status Seen ENABLED!"); }
        else if (args[0] === 'off') { autoStatusSeen = false; reply("❌ Auto Status Seen DISABLED!"); }
        else reply(`👁️ Auto Status Seen: ${autoStatusSeen ? "ON" : "OFF"}`);
    }
});

global.registerCommand({
    command: "autoreactstatus",
    alias: ["statusreact", "statuslike"],
    desc: "Enable/disable auto status react/like",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        if (args[0] === 'on') { autoStatusReact = true; reply("✅ Auto Status React ENABLED!"); }
        else if (args[0] === 'off') { autoStatusReact = false; reply("❌ Auto Status React DISABLED!"); }
        else reply(`❤️ Auto Status React: ${autoStatusReact ? "ON" : "OFF"}`);
    }
});

global.registerCommand({
    command: "autoreplystatus",
    alias: ["statusreply"],
    desc: "Enable/disable auto status reply",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        if (args[0] === 'on') { autoStatusReply = true; reply("✅ Auto Status Reply ENABLED!"); }
        else if (args[0] === 'off') { autoStatusReply = false; reply("❌ Auto Status Reply DISABLED!"); }
        else reply(`💬 Auto Status Reply: ${autoStatusReply ? "ON" : "OFF"}`);
    }
});

global.registerCommand({
    command: "setstatusmsg",
    alias: ["statusmsg"],
    desc: "Set auto status reply message",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner, q }) => {
        if (!isOwner) return reply("❌ Owner only.");
        if (!q) return reply("Example: .setstatusmsg Thanks for the status!");
        autoStatusMsg = q;
        reply(`✅ Status reply message set to: ${q}`);
    }
});

// Auto React on messages
global.registerCommand({
    command: "autoreact",
    alias: ["autoreactmsg"],
    desc: "Enable/disable auto react on messages",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        if (args[0] === 'on') { autoReactEnabled = true; reply("✅ Auto React ENABLED!"); }
        else if (args[0] === 'off') { autoReactEnabled = false; reply("❌ Auto React DISABLED!"); }
        else reply(`😊 Auto React: ${autoReactEnabled ? "ON" : "OFF"}`);
    }
});

// Group Events
global.registerCommand({
    command: "welcome",
    alias: ["setwelcome"],
    desc: "Enable/disable welcome messages",
    category: "group",
    function: async (conn, m, { reply, args, isGroup, isAdmins }) => {
        if (!isGroup) return reply("❌ Groups only.");
        if (!isAdmins) return reply("❌ Admins only.");
        if (args[0] === 'on') { welcomeEnabled = true; reply("✅ Welcome ENABLED!"); }
        else if (args[0] === 'off') { welcomeEnabled = false; reply("❌ Welcome DISABLED!"); }
        else reply(`🎉 Welcome: ${welcomeEnabled ? "ON" : "OFF"}`);
    }
});

global.registerCommand({
    command: "goodbye",
    alias: ["setgoodbye"],
    desc: "Enable/disable goodbye messages",
    category: "group",
    function: async (conn, m, { reply, args, isGroup, isAdmins }) => {
        if (!isGroup) return reply("❌ Groups only.");
        if (!isAdmins) return reply("❌ Admins only.");
        if (args[0] === 'on') { goodbyeEnabled = true; reply("✅ Goodbye ENABLED!"); }
        else if (args[0] === 'off') { goodbyeEnabled = false; reply("❌ Goodbye DISABLED!"); }
        else reply(`👋 Goodbye: ${goodbyeEnabled ? "ON" : "OFF"}`);
    }
});

global.registerCommand({
    command: "adminevents",
    alias: ["adminevent"],
    desc: "Enable/disable promote/demote notifications",
    category: "group",
    function: async (conn, m, { reply, args, isGroup, isAdmins }) => {
        if (!isGroup) return reply("❌ Groups only.");
        if (!isAdmins) return reply("❌ Admins only.");
        if (args[0] === 'on') { adminEventsEnabled = true; reply("✅ Admin Events ENABLED!"); }
        else if (args[0] === 'off') { adminEventsEnabled = false; reply("❌ Admin Events DISABLED!"); }
        else reply(`👑 Admin Events: ${adminEventsEnabled ? "ON" : "OFF"}`);
    }
});

// Chatbot
global.registerCommand({
    command: "groupai",
    alias: ["gai"],
    desc: "Enable/disable AI in groups",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        if (args[0] === 'on') { groupChatbotEnabled = true; reply("✅ Group AI ENABLED!"); }
        else if (args[0] === 'off') { groupChatbotEnabled = false; reply("❌ Group AI DISABLED!"); }
        else reply(`🤖 Group AI: ${groupChatbotEnabled ? "ON" : "OFF"}`);
    }
});

global.registerCommand({
    command: "dmai",
    alias: ["dmaibot"],
    desc: "Enable/disable AI in private chat",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        if (args[0] === 'on') { dmChatbotEnabled = true; reply("✅ DM AI ENABLED!"); }
        else if (args[0] === 'off') { dmChatbotEnabled = false; reply("❌ DM AI DISABLED!"); }
        else reply(`🤖 DM AI: ${dmChatbotEnabled ? "ON" : "OFF"}`);
    }
});

// ========== BASIC COMMANDS ==========
global.registerCommand({
    command: "ping",
    alias: ["p"],
    desc: "Check bot response",
    category: "info",
    function: async (conn, m, { reply }) => {
        const start = Date.now();
        await reply("🏓");
        const end = Date.now();
        reply(`╭┈┈❍ *XERO-MD* ❍
┊• *Pong!* : ${end - start}ms
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
    }
});

global.registerCommand({
    command: "menu",
    alias: ["help", "cmd"],
    desc: "Show bot menu",
    category: "menu",
    function: async (conn, m, { reply, prefix }) => {
        const menu = `╭┈┈❍ *XERO-MD* ❍
┊• 📋 *MAIN MENU*
┊•
┊• 🔧 *Basic Commands* :
┊•   ${prefix}ping - Check bot
┊•   ${prefix}menu - This menu
┊•   ${prefix}alive - Bot status
┊•   ${prefix}owner - Owner info
┊•   ${prefix}runtime - Bot uptime
┊•
┊• 🤖 *AI Settings* :
┊•   ${prefix}groupai on/off
┊•   ${prefix}dmai on/off
┊•
┊• 🛡️ *Anti-Delete* :
┊•   ${prefix}antidel on/off
┊•   ${prefix}antidelpath inbox/same
┊•
┊• 👁️ *Status Settings* :
┊•   ${prefix}autoseen on/off
┊•   ${prefix}autoreactstatus on/off
┊•   ${prefix}autoreplystatus on/off
┊•   ${prefix}setstatusmsg <text>
┊•
┊• 😊 *Auto React* :
┊•   ${prefix}autoreact on/off
┊•
┊• ⌨️ *Auto Typing* :
┊•   ${prefix}autotyping on/off
┊•
┊• 🎙️ *Auto Recording* :
┊•   ${prefix}autorecording on/off
┊•
┊• 👥 *Group Settings* :
┊•   ${prefix}welcome on/off
┊•   ${prefix}goodbye on/off
┊•   ${prefix}adminevents on/off
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;
        reply(menu);
    }
});

global.registerCommand({
    command: "alive",
    desc: "Check bot status",
    category: "info",
    function: async (conn, m, { reply }) => {
        const u = process.uptime();
        const hours = Math.floor(u / 3600);
        const minutes = Math.floor((u % 3600) / 60);
        const seconds = Math.floor(u % 60);
        reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✨ *Bot is alive!*
┊• ⏱️ *Uptime* : ${hours}h ${minutes}m ${seconds}s
┊• 🤖 *Group AI* : ${groupChatbotEnabled ? "ON" : "OFF"}
┊• 🛡️ *Anti-Delete* : ${antiDeleteEnabled ? "ON" : "OFF"}
┊• ⌨️ *Auto Typing* : ${autoTypingEnabled ? "ON" : "OFF"}
┊• 🎙️ *Auto Recording* : ${autoRecordingEnabled ? "ON" : "OFF"}
┊• ❤️ *Auto Status React* : ${autoStatusReact ? "ON" : "OFF"}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
    }
});

global.registerCommand({
    command: "owner",
    alias: ["creator", "dev"],
    desc: "Owner info",
    category: "info",
    function: async (conn, m, { reply }) => {
        reply(`╭┈┈❍ *XERO-MD* ❍
┊• 👑 *OWNER*
┊•
┊• 👨‍💻 *Name* : nyoni-xmd
┊• 📞 *Number 1* : +255763111390
┊• 📞 *Number 2* : +255610209120
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`);
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
        reply(`╭┈┈❍ *XERO-MD* ❍
┊• ⏰ *Uptime* : ${hours}h ${minutes}m ${seconds}s
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
    }
});

// ========== WEB SERVER ==========
app.get('/', (req, res) => res.send('XERO-MD Running'));
app.listen(PORT, () => console.log(`🌐 Server on port ${PORT}`));

setTimeout(startBot, 3000);
process.on('uncaughtException', (e) => console.error('💥 Uncaught:', e.message));
process.on('unhandledRejection', (e) => console.error('💥 Rejection:', e));
console.log('🚀 XERO-MD starting with plugin system & AI Chatbot...');
