// ======================== XERO-MD INDEX (UPDATED SESSION) ========================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, Browsers, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const express = require('express');
const path = require('path');
const axios = require('axios');
const os = require('os');
const zlib = require('zlib');

const PREFIX = config.PREFIX || ".";
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

// ========== SESSION AUTH (NEW BASE64 SYSTEM) ==========
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
}

if (!fs.existsSync(path.join(sessionsDir, 'creds.json'))) {
    if (!config.SESSION_ID || config.SESSION_ID.trim() === '') {
        console.log('❌ Please add your session to SESSION_ID in config.env or config.js');
        process.exit(1);
    }

    const sessdata = config.SESSION_ID.replace("SILA-MD~", '').replace("NEXUS___", '').trim();
    if (!sessdata) {
        console.log('❌ SESSION_ID is empty after processing');
        process.exit(1);
    }

    console.log('📥 Extracting session from base64 string...');

    try {
        const compressedBuffer = Buffer.from(sessdata, 'base64');
        const sessionBuffer = zlib.gunzipSync(compressedBuffer);
        fs.writeFileSync(path.join(sessionsDir, 'creds.json'), sessionBuffer);
        console.log("✅ Session extracted and saved successfully");
        console.log(`📊 Session size: ${sessionBuffer.length} bytes`);
    } catch (err) {
        console.log('❌ Failed to extract session:', err.message);
        console.log('⚠️ Make sure you copied the FULL session string');
        process.exit(1);
    }
}

// ========== SETTINGS (FROM CONFIG) ==========
let antiDeleteEnabled = config.ANTI_DELETE === "true";
let antiDeletePath = config.ANTI_DEL_PATH || "same";
let groupChatbotEnabled = true;
let dmChatbotEnabled = true;
let autoStatusSeen = config.AUTO_STATUS_SEEN === "true";
let autoStatusReact = config.AUTO_STATUS_REACT === "true";
let autoStatusReply = config.AUTO_STATUS_REPLY === "true";
let autoStatusMsg = config.AUTO_STATUS_MSG || "👀 Status viewed!";
const statusReactEmojis = ['❤️', '🔥', '💯', '✨', '⭐', '👑', '💎', '🏆', '🎉', '🥳', '💖', '🥰', '😍', '💗', '🌹'];
let welcomeEnabled = config.WELCOME === "true";
let goodbyeEnabled = config.GOODBYE === "true";
let adminEventsEnabled = config.ADMIN_ACTION === "true";
let autoReactEnabled = config.AUTO_REACT === "true";
const autoReactEmojis = ['😊', '👍', '🔥', '💯', '✨', '⭐', '❤️', '💙', '💚', '💛', '🎉', '👏', '😎', '🤗', '💪'];
let autoTypingEnabled = config.AUTO_TYPING === "true";
let autoRecordingEnabled = config.AUTO_RECORDING === "true";
let processedStatusIds = new Set();

// ========== AI RESPONSE (YUPRA API) ==========
async function getAIResponse(message) {
    try {
        const text = message.toLowerCase();
        if (text.includes("wewe ni nani") || text.includes("jina lako")) {
            return "Mimi naitwa *XERO-MD*, bot yako msaidizi! 🤖";
        }
        if (text.includes("owner number") || text.includes("namba ya boss")) {
            return "📞 *Owner:* +255763111390 / +255610209120";
        }
        if (text.includes("hello") || text.includes("hujambo")) {
            return "Hujambo! Habari yako? 👋";
        }
        const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encodeURIComponent(message)}`;
        const response = await axios.get(apiUrl, { timeout: 15000 });
        if (response.data && response.data.result) return response.data.result;
        return "Samahani, nina tatizo la kiufundi. Jaribu tena baadaye. 🛠️";
    } catch (error) {
        return "📡 Nina shida ya kufikia server. Jaribu tena baadaye.";
    }
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
    try { const res = await axios({ url, responseType: 'arraybuffer', timeout: 15000 }); return res.data; } catch { return null; }
}

const messageStore = new Map();
function storeMessage(key, message) {
    messageStore.set(key, { message, timestamp: Date.now() });
    setTimeout(() => messageStore.delete(key), 60000);
}
function getStoredMessage(key) { return messageStore.get(key); }

async function sendRecording(conn, from) {
    try { await conn.sendMessage(from, { audio: { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, mimetype: 'audio/mp4', ptt: true }).catch(() => {}); } catch (e) {}
}

// ========== LOAD PLUGINS ==========
function loadPlugins() {
    const pluginsDir = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    console.log(`📦 Found ${files.length} plugin files`);
    for (const file of files) {
        try { require(path.join(pluginsDir, file)); console.log(`✅ Loaded: ${file}`); }
        catch (e) { console.log(`❌ Failed to load ${file}: ${e.message}`); }
    }
    console.log(`✅ Total commands: ${global.commandsList.length}`);
}

// ========== GROUP EVENTS ==========
async function handleGroupEvents(conn, update) {
    try {
        const { id, action, participants, author } = update;
        if (!id.endsWith('@g.us')) return;
        const metadata = await conn.groupMetadata(id);
        const groupName = metadata.subject || "Group";
        const groupMembersCount = metadata.participants.length;
        let ppUrl;
        try { ppUrl = await conn.profilePictureUrl(id, 'image'); } catch { ppUrl = 'https://files.catbox.moe/gyaka2.png'; }
        const timestamp = new Date().toLocaleString();
        for (const num of participants) {
            const userName = num.split('@')[0];
            if (action === "add" && welcomeEnabled) {
                const WelcomeText = `╭┈┈❍ *XERO-MD* ❍\n┊• ✨ *WELCOME NEW MEMBER!*\n┊• 🎉 *User* : @${userName}\n┊• 👑 *Owner* : nyoni-xmd\n┊• 📞 *Number 1* : +255763111390\n┊• 📞 *Number 2* : +255610209120\n┊• 👥 *Members* : #${groupMembersCount}\n┊• ⏰ *Time* : ${timestamp}\n┊• 📛 *Group* : ${groupName}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n⚡ POWER - SPEED - CONTROL\n🚀 BEYOND LIMITS\n> POWERED BY nyoni-xmd`;
                await conn.sendMessage(id, { image: { url: ppUrl }, caption: WelcomeText, mentions: [num], contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363399470975987@newsletter', newsletterName: 'XERO-MD', serverMessageId: 143 } } });
            } else if (action === "remove" && goodbyeEnabled) {
                const GoodbyeText = `╭┈┈❍ *XERO-MD* ❍\n┊• 🌟 *MEMBER LEFT*\n┊• 👋 *User* : @${userName}\n┊• 👑 *Owner* : nyoni-xmd\n┊• 📞 *Number 1* : +255763111390\n┊• 📞 *Number 2* : +255610209120\n┊• 👥 *Remaining* : #${groupMembersCount}\n┊• ⏰ *Time* : ${timestamp}\n┊• 📛 *Group* : ${groupName}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n⚡ POWER - SPEED - CONTROL\n🚀 BEYOND LIMITS\n> POWERED BY nyoni-xmd`;
                await conn.sendMessage(id, { image: { url: ppUrl }, caption: GoodbyeText, mentions: [num], contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363399470975987@newsletter', newsletterName: 'XERO-MD', serverMessageId: 143 } } });
            } else if (action === "demote" && adminEventsEnabled) {
                const demoter = author?.split('@')[0] || "Admin";
                await conn.sendMessage(id, { text: `╭┈┈❍ *XERO-MD* ❍\n┊• ⚡ *DEMOTION NOTICE*\n┊• 📛 *Demoted* : @${userName}\n┊• 👑 *By* : @${demoter}\n┊• 👥 *Group* : ${groupName}\n┊• ⏰ *Time* : ${timestamp}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n> POWERED BY nyoni-xmd`, mentions: [author, num] });
            } else if (action === "promote" && adminEventsEnabled) {
                const promoter = author?.split('@')[0] || "Admin";
                await conn.sendMessage(id, { text: `╭┈┈❍ *XERO-MD* ❍\n┊• 🎉 *PROMOTION NOTICE*\n┊• 👑 *Promoted* : @${userName}\n┊• 👑 *By* : @${promoter}\n┊• 👥 *Group* : ${groupName}\n┊• ⏰ *Time* : ${timestamp}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n> POWERED BY nyoni-xmd`, mentions: [author, num] });
            }
        }
    } catch (err) { console.error('Group event error:', err); }
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
                reconnectTimer = setTimeout(() => { console.log('🔄 Reconnecting...'); startBot(); }, 5000);
            } else { console.log('❌ Session expired. Update SESSION_ID.'); }
        } else if (connection === 'open') {
            console.log('✅ XERO-MD CONNECTED!');
            loadPlugins();
            try {
                await sock.sendMessage(sock.user.id, { text: `✅ XERO-MD ONLINE\nPrefix: ${PREFIX}\nCommands: ${global.commandsList.length}\nAuto Status React: ${autoStatusReact ? "ON" : "OFF"}` });
            } catch(e) {}
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // ========== ANTI-DELETE ==========
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
                    let content = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "Media message";
                    const targetJid = antiDeletePath === "inbox" ? sock.user.id : update.key.remoteJid;
                    await sock.sendMessage(targetJid, {
                        text: `╭┈┈❍ *XERO-MD* ❍\n┊• 🛡️ *ANTI-DELETE ALERT*\n┊• 👤 *Sender* : @${sender}\n┊• 🧎 *Deleted by* : @${deleter}\n┊• ⏰ *Time* : ${deleteTime}\n┊• 📝 *Content* : ${content}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n> POWERED BY nyoni-xmd`,
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
        if (m.key?.id) storeMessage(m.key.id, m);
        if (getContentType(m.message) === 'ephemeralMessage') m.message = m.message.ephemeralMessage.message;
        if (m.message.viewOnceMessageV2) m.message = m.message.viewOnceMessageV2.message;

        const from = m.key.remoteJid;
        const sender = m.key.fromMe ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : (m.key.participant || m.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const isGroup = from.endsWith('@g.us');
        const isOwner = OWNER_NUMBERS.includes(senderNumber);

        // ========== AUTO TYPING & RECORDING ==========
        if (autoTypingEnabled && !m.key.fromMe && !isGroup) {
            await sock.sendPresenceUpdate('composing', from).catch(() => {});
            setTimeout(async () => { await sock.sendPresenceUpdate('paused', from).catch(() => {}); }, 3000);
        }
        if (autoRecordingEnabled && !m.key.fromMe && !isGroup) {
            setTimeout(async () => { await sendRecording(sock, from); }, 2000);
        }

        // ========== AUTO STATUS SEEN/REACT/REPLY ==========
        if (from === 'status@broadcast' && !m.key.fromMe) {
            if (autoStatusSeen) {
                try { await sock.readMessages([m.key]); console.log(`✅ Status viewed: ${m.key.id}`); } catch (e) {}
            }
            if (autoStatusReact) {
                try {
                    const randomEmoji = statusReactEmojis[Math.floor(Math.random() * statusReactEmojis.length)];
                    await sock.sendMessage(from, { react: { text: randomEmoji, key: m.key } } );
                    console.log(`✅ Status liked: ${randomEmoji}`);
                } catch (e) {}
            }
            if (autoStatusReply) {
                try {
                    const statusOwner = m.key.participant || m.key.remoteJid;
                    if (statusOwner && statusOwner !== sock.user.id) {
                        await sock.sendMessage(statusOwner, { text: `╭┈┈❍ *XERO-MD* ❍\n┊• 👀 ${autoStatusMsg}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n> POWERED BY nyoni-xmd`, contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363399470975987@newsletter', newsletterName: 'XERO-MD', serverMessageId: 143 } } });
                    }
                } catch (e) {}
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

        // ========== CHATBOT ==========
        if (!isCmd && !m.key.fromMe && body && body.length > 0 && body.length < 500) {
            let shouldReply = (isGroup && groupChatbotEnabled) || (!isGroup && dmChatbotEnabled);
            if (shouldReply) {
                try {
                    await sock.sendPresenceUpdate('composing', from);
                    const aiReply = await getAIResponse(body);
                    await sock.sendMessage(from, {
                        text: `╭┈┈❍ *XERO-MD AI* ❍\n┊• 🤖 ${aiReply}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n> POWERED BY nyoni-xmd`,
                        contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363399470975987@newsletter', newsletterName: 'XERO-MD', serverMessageId: 143 } }
                    }, { quoted: m });
                } catch (aiError) { console.error("AI Error:", aiError.message); }
            }
        }

        // ========== COMMANDS ==========
        if (isCmd) {
            console.log(`📩 Command: "${cmdName}" from ${senderNumber}`);
            const cmd = getCommand(cmdName);
            if (cmd) {
                try {
                    await cmd.function(sock, m, { from, reply, args, q, text: q, isGroup, sender, senderNumber, isOwner, prefix: PREFIX });
                } catch (e) { console.error(`❌ Error in ${cmdName}:`, e.message); reply(`❌ Error: ${e.message}`); }
            }
        }
    });

    sock.ev.on("group-participants.update", (update) => handleGroupEvents(sock, update));

    sock.downloadMedia = async (msg) => {
        const stream = await downloadContentFromMessage(msg, msg.mimetype?.split('/')[0] || 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
    };
    sock.getBuffer = getBuffer;
    sock.getPP = async (jid) => { try { return await sock.profilePictureUrl(jid, 'image'); } catch { return null; } };
    sock.decodeJid = (jid) => { let d = jidDecode(jid); return d?.user && d?.server ? `${d.user}@${d.server}` : jid; };
}

// ========== SETTINGS COMMANDS (BUILT-IN) ==========
global.registerCommand({
    command: "antidel",
    alias: ["antidelete"],
    desc: "Enable/disable anti-delete",
    category: "owner",
    function: async (conn, m, { reply, args, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");
        if (args[0] === 'on') { antiDeleteEnabled = true; reply("✅ Anti-Delete ENABLED!"); }
        else if (args[0] === 'off') { antiDeleteEnabled = false; reply("❌ Anti-Delete DISABLED!"); }
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
        if (path === 'inbox' || path === 'same') { antiDeletePath = path; reply(`✅ Anti-Delete path set to: ${path}`); }
        else reply(`📍 Current path: ${antiDeletePath}`);
    }
});
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
        if (!q) return reply("Example: .setstatusmsg Thanks!");
        autoStatusMsg = q;
        reply(`✅ Status reply message set to: ${q}`);
    }
});
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
        reply(`╭┈┈❍ *XERO-MD* ❍\n┊• *Pong!* : ${end - start}ms\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n> POWERED BY nyoni-xmd`);
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
┊• 🔧 *Commands* :
┊•   ${prefix}ping
┊•   ${prefix}menu
┊•   ${prefix}alive
┊•   ${prefix}owner
┊•   ${prefix}runtime
┊•   ${prefix}groupai on/off
┊•   ${prefix}dmai on/off
┊•   ${prefix}antidel on/off
┊•   ${prefix}antidelpath inbox/same
┊•   ${prefix}autoseen on/off
┊•   ${prefix}autoreactstatus on/off
┊•   ${prefix}autoreplystatus on/off
┊•   ${prefix}setstatusmsg <text>
┊•   ${prefix}autoreact on/off
┊•   ${prefix}autotyping on/off
┊•   ${prefix}autorecording on/off
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
        reply(`╭┈┈❍ *XERO-MD* ❍\n┊• ✨ *Bot is alive!*\n┊• ⏱️ *Uptime* : ${hours}h ${minutes}m ${seconds}s\n┊• ❤️ *Auto Status React* : ${autoStatusReact ? "ON" : "OFF"}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n> POWERED BY nyoni-xmd`);
    }
});
global.registerCommand({
    command: "owner",
    alias: ["creator", "dev"],
    desc: "Owner info",
    category: "info",
    function: async (conn, m, { reply }) => {
        reply(`╭┈┈❍ *XERO-MD* ❍\n┊• 👑 *OWNER*\n┊• 👨‍💻 *Name* : nyoni-xmd\n┊• 📞 *Number 1* : +255763111390\n┊• 📞 *Number 2* : +255610209120\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n⚡ POWER - SPEED - CONTROL\n🚀 BEYOND LIMITS\n> POWERED BY nyoni-xmd`);
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
        reply(`╭┈┈❍ *XERO-MD* ❍\n┊• ⏰ *Uptime* : ${hours}h ${minutes}m ${seconds}s\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n> POWERED BY nyoni-xmd`);
    }
});

// ========== WEB SERVER ==========
app.get('/', (req, res) => res.send('XERO-MD Running'));
app.listen(PORT, () => console.log(`🌐 Server on port ${PORT}`));
setTimeout(startBot, 3000);
process.on('uncaughtException', (e) => console.error('💥 Uncaught:', e.message));
process.on('unhandledRejection', (e) => console.error('💥 Rejection:', e));
console.log('🚀 XERO-MD starting...');
