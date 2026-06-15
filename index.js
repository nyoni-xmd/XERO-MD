// ======================== XERO-MD INDEX (COMPLETE) ========================
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

// ========== STATUS SETTINGS ==========
let autoStatusSeen = config.AUTO_STATUS_SEEN === "true";
let autoStatusReact = config.AUTO_STATUS_REACT === "true";
let autoStatusReply = config.AUTO_STATUS_REPLY === "true";
let autoStatusMsg = config.AUTO_STATUS_MSG || "👀 Status viewed!";

// ========== GROUP EVENTS SETTINGS ==========
let welcomeEnabled = config.WELCOME === "true";
let goodbyeEnabled = config.GOODBYE === "true";
let adminEventsEnabled = config.ADMIN_ACTION === "true";

// ========== AUTO REACT SETTINGS ==========
let autoReactEnabled = config.AUTO_REACT === "true";
const autoReactEmojis = ['😊', '👍', '🔥', '💯', '✨', '⭐', '❤️', '💙', '💚', '💛'];

// ========== STATUS STORAGE ==========
let processedStatusIds = new Set();

// ========== AI RESPONSE FUNCTION ==========
async function getAIResponse(message) {
    try {
        const text = message.toLowerCase();
        
        if (text.includes("wewe ni nani") || text.includes("jina lako")) {
            return "Mimi naitwa *XERO-MD*, bot yako msaidizi! 🤖";
        }
        else if (text.includes("owner number") || text.includes("namba ya boss")) {
            return "📞 *Owner:* +255763111390 / +255610209120";
        }
        else if (text.includes("hello") || text.includes("hujambo") || text.includes("hi")) {
            return "Hujambo! Habari yako? 👋";
        }
        else if (text.includes("thanks") || text.includes("asante")) {
            return "Karibu sana! 😊";
        }
        else if (text.includes("time") || text.includes("saa")) {
            const now = new Date();
            return `⏰ Time: ${now.toLocaleTimeString()}`;
        }
        
        const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(message)}`;
        const response = await axios.get(apiUrl, { timeout: 10000 });
        
        if (response.data && (response.data.status === 200 || response.data.result)) {
            return response.data.result || response.data.message;
        }
        
        return "Samahani, nina tatizo la kiufundi. Jaribu tena baadaye. 🛠️";
    } catch (error) {
        return "📡 Nina shida ya kufikia server. Jaribu tena baadaye.";
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

        // Store message for anti-delete
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
        
        // ========== AUTO STATUS SEEN/REACT/REPLY ==========
        if (from === 'status@broadcast' && !m.key.fromMe) {
            if (autoStatusSeen && !processedStatusIds.has(m.key.id)) {
                processedStatusIds.add(m.key.id);
                await sock.readMessages([m.key]).catch(() => {});
                
                if (autoStatusReact) {
                    const statusEmojis = ['❤️', '🔥', '💯', '✨', '⭐', '👑', '💎', '🏆', '🎉', '🥳'];
                    const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                    await sock.sendMessage(from, { react: { text: randomEmoji, key: m.key } }).catch(() => {});
                }
                
                if (autoStatusReply) {
                    const statusOwner = m.key.participant || m.key.remoteJid;
                    await sock.sendMessage(statusOwner, { text: autoStatusMsg }, { quoted: m }).catch(() => {});
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

        // ========== CHATBOT RESPONSE ==========
        if (!isCmd && !m.key.fromMe && body && body.length > 0 && body.length < 500) {
            let shouldReply = (isGroup && groupChatbotEnabled) || (!isGroup && dmChatbotEnabled);
            
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

// Anti-Delete Commands
global.registerCommand({
    command: "antidel",
    alias: ["antidelete"],
    desc: "Enable/disable anti-delete",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        const action = args[0]?.toLowerCase();
        if (action === 'on') {
            antiDeleteEnabled = true;
            reply(`✅ Anti-Delete ENABLED!`);
        } else if (action === 'off') {
            antiDeleteEnabled = false;
            reply(`❌ Anti-Delete DISABLED!`);
        } else {
            reply(`🛡️ Anti-Delete: ${antiDeleteEnabled ? "ON" : "OFF"}\n.antidel on/off`);
        }
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
            reply(`📍 Current path: ${antiDeletePath}\n.antidelpath inbox/same`);
        }
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
        const action = args[0]?.toLowerCase();
        if (action === 'on') { autoStatusSeen = true; reply("✅ Auto Status Seen ENABLED!"); }
        else if (action === 'off') { autoStatusSeen = false; reply("❌ Auto Status Seen DISABLED!"); }
        else reply(`👁️ Auto Status Seen: ${autoStatusSeen ? "ON" : "OFF"}`);
    }
});

global.registerCommand({
    command: "autoreactstatus",
    alias: ["statusreact"],
    desc: "Enable/disable auto status react",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        const action = args[0]?.toLowerCase();
        if (action === 'on') { autoStatusReact = true; reply("✅ Auto Status React ENABLED!"); }
        else if (action === 'off') { autoStatusReact = false; reply("❌ Auto Status React DISABLED!"); }
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
        const action = args[0]?.toLowerCase();
        if (action === 'on') { autoStatusReply = true; reply("✅ Auto Status Reply ENABLED!"); }
        else if (action === 'off') { autoStatusReply = false; reply("❌ Auto Status Reply DISABLED!"); }
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

// Auto React Command
global.registerCommand({
    command: "autoreact",
    alias: ["autoreactmsg"],
    desc: "Enable/disable auto react on messages",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        const action = args[0]?.toLowerCase();
        if (action === 'on') { autoReactEnabled = true; reply("✅ Auto React ENABLED!"); }
        else if (action === 'off') { autoReactEnabled = false; reply("❌ Auto React DISABLED!"); }
        else reply(`😊 Auto React: ${autoReactEnabled ? "ON" : "OFF"}`);
    }
});

// Group Events Commands
global.registerCommand({
    command: "welcome",
    alias: ["setwelcome"],
    desc: "Enable/disable welcome messages",
    category: "group",
    function: async (conn, m, { reply, args, isGroup, isAdmins }) => {
        if (!isGroup) return reply("❌ Groups only.");
        if (!isAdmins) return reply("❌ Admins only.");
        const action = args[0]?.toLowerCase();
        if (action === 'on') { welcomeEnabled = true; reply("✅ Welcome ENABLED!"); }
        else if (action === 'off') { welcomeEnabled = false; reply("❌ Welcome DISABLED!"); }
        else reply(`🎉 Welcome: ${welcomeEnabled ? "ON" : "OFF"}\n.welcome on/off`);
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
        const action = args[0]?.toLowerCase();
        if (action === 'on') { goodbyeEnabled = true; reply("✅ Goodbye ENABLED!"); }
        else if (action === 'off') { goodbyeEnabled = false; reply("❌ Goodbye DISABLED!"); }
        else reply(`👋 Goodbye: ${goodbyeEnabled ? "ON" : "OFF"}\n.goodbye on/off`);
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
        const action = args[0]?.toLowerCase();
        if (action === 'on') { adminEventsEnabled = true; reply("✅ Admin Events ENABLED!"); }
        else if (action === 'off') { adminEventsEnabled = false; reply("❌ Admin Events DISABLED!"); }
        else reply(`👑 Admin Events: ${adminEventsEnabled ? "ON" : "OFF"}\n.adminevents on/off`);
    }
});

// Chatbot Commands
global.registerCommand({
    command: "groupai",
    alias: ["gai"],
    desc: "Enable/disable AI in groups",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        const action = args[0]?.toLowerCase();
        if (action === 'on') { groupChatbotEnabled = true; reply("✅ Group AI ENABLED!"); }
        else if (action === 'off') { groupChatbotEnabled = false; reply("❌ Group AI DISABLED!"); }
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
        const action = args[0]?.toLowerCase();
        if (action === 'on') { dmChatbotEnabled = true; reply("✅ DM AI ENABLED!"); }
        else if (action === 'off') { dmChatbotEnabled = false; reply("❌ DM AI DISABLED!"); }
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
┊• 🔧 *Commands* :
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
