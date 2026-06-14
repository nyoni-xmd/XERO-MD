// XERO-MD INDEX.JS - ALL COMMANDS INSIDE
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, Browsers, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const { File } = require('megajs');
const express = require('express');
const path = require('path');
const axios = require('axios');
const os = require('os');
const { sms, AntiDelete } = require('./lib/functions');
const GroupEvents = require('./lib/groupevents');
const { saveMessage } = require('./data/database');

const PREFIX = config.PREFIX || ".";
const OWNER_NUMBERS = ['255763111390', '255610209120'];
const app = express();
const PORT = process.env.PORT || 9090;

// ========== SMALL CAPS FOR MENU ==========
const smallCaps = {
    "A": "ᴀ", "B": "ʙ", "C": "ᴄ", "D": "ᴅ", "E": "ᴇ", "F": "ꜰ", "G": "ɢ", "H": "ʜ",
    "I": "ɪ", "J": "ᴊ", "K": "ᴋ", "L": "ʟ", "M": "ᴍ", "N": "ɴ", "O": "ᴏ", "P": "ᴘ",
    "Q": "ǫ", "R": "ʀ", "S": "s", "T": "ᴛ", "U": "ᴜ", "V": "ᴠ", "W": "ᴡ", "X": "x",
    "Y": "ʏ", "Z": "ᴢ"
};
const toSmallCaps = (text) => text.split('').map(ch => smallCaps[ch.toUpperCase()] || ch).join('');

// ========== COMMAND REGISTRY ==========
const commands = new Map();
const aliases = new Map();

function registerCommand(cmd) {
    if (!cmd.command) return;
    commands.set(cmd.command, cmd);
    if (cmd.alias && Array.isArray(cmd.alias)) {
        cmd.alias.forEach(a => aliases.set(a, cmd.command));
    }
}

function getCommand(name) {
    return commands.get(name) || commands.get(aliases.get(name));
}

// ========== SESSION HANDLING ==========
if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');

if (!fs.existsSync('./sessions/creds.json') && config.SESSION_ID) {
    let key = config.SESSION_ID.replace(/^(POPKID;;;|XERO-MD>>>|jamali~|QUEEN-LORA~)/, '').trim();
    console.log("📥 Downloading session...");
    File.fromURL(`https://mega.nz/file/${key}`).download((err, data) => {
        if (!err) {
            fs.writeFileSync('./sessions/creds.json', data);
            console.log("✅ Session downloaded!");
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

// ========== REGISTER COMMANDS (ALL INSIDE) ==========

// MENU COMMAND
registerCommand({
    command: "menu",
    alias: ["help", "cmd"],
    desc: "Show all bot commands",
    category: "menu",
    function: async (conn, m, store, { from, reply, prefix }) => {
        const uptime = () => {
            let sec = process.uptime();
            let h = Math.floor(sec / 3600);
            let m = Math.floor((sec % 3600) / 60);
            let s = Math.floor(sec % 60);
            return `${h}h ${m}m ${s}s`;
        };
        let menuText = `*╭━━*『 XERO-MD 』
*┃* ❃ *ᴜsᴇʀ* : @${m.sender.split("@")[0]}
*┃* ❃ *ʀᴜɴᴛɪᴍᴇ* : ${uptime()}
*┃* ❃ *ᴍᴏᴅᴇ* : ${config.MODE}
*┃* ❃ *ᴘʀᴇғɪx* : [${prefix}]
*┃* ❃ *ᴩʟᴜɢɪɴ* : ${commands.size}
*┃* ❃ *ᴅᴇᴠ* : *nyoni-xmd*
*┃* ❃ *ɴᴜᴍʙᴇʀ 1* : +255763111390
*┃* ❃ *ɴᴜᴍʙᴇʀ 2* : +255610209120
*┃* ❃ *ᴠᴇʀsɪᴏɴ* : 3.0.0
*╰────────────────❍*

*╭─ 「 MAIN MENU 」*
*│⤷ ${prefix}menu - Show menu*
*│⤷ ${prefix}ping - Check bot*
*│⤷ ${prefix}alive - Bot status*
*│⤷ ${prefix}owner - Owner info*
*│⤷ ${prefix}runtime - Bot uptime*
*│⤷ ${prefix}getpp - Get profile pic*
*│⤷ ${prefix}vv - Open view once*
*╰──────────────⭑━➤*

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ-xᴍᴅ*
⚡ *ᴘᴏᴡᴇʀ - sᴘᴇᴇᴅ - ᴄᴏɴᴛʀᴏʟ*
🚀 *ʙᴇʏᴏɴᴅ ʟɪᴍɪᴛs*`;
        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/gyaka2.png" },
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363399470975987@newsletter",
                    newsletterName: "XERO-MD",
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
    }
});

// PING COMMAND
registerCommand({
    command: "ping",
    alias: ["p"],
    desc: "Check bot response",
    category: "info",
    function: async (conn, m, store, { reply }) => {
        reply("🏓 Pong! Bot is alive and responding.");
    }
});

// ALIVE COMMAND
registerCommand({
    command: "alive",
    desc: "Check if bot is running",
    category: "info",
    function: async (conn, m, store, { reply }) => {
        reply("✨ XERO-MD is alive and online!\n⚡ Power - Speed - Control");
    }
});

// OWNER COMMAND
registerCommand({
    command: "owner",
    alias: ["creator", "dev"],
    desc: "Owner information",
    category: "info",
    function: async (conn, m, store, { reply }) => {
        reply(`👑 *OWNER*
Name: nyoni-xmd
Number: +255763111390
Number 2: +255610209120
Bot: XERO-MD`);
    }
});

// RUNTIME COMMAND
registerCommand({
    command: "runtime",
    alias: ["uptime"],
    desc: "Bot uptime",
    category: "info",
    function: async (conn, m, store, { reply }) => {
        const u = process.uptime();
        const hours = Math.floor(u / 3600);
        const minutes = Math.floor((u % 3600) / 60);
        const seconds = Math.floor(u % 60);
        reply(`⏰ Uptime: ${hours}h ${minutes}m ${seconds}s`);
    }
});

// GET PROFILE PICTURE
registerCommand({
    command: "getpp",
    alias: ["pp"],
    desc: "Get user profile picture",
    category: "tools",
    function: async (conn, m, store, { from, reply, args, quoted, isGroup, sender }) => {
        let target = m.mentionedJid?.[0] || (quoted?.sender) || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net') || (isGroup ? sender : null);
        if (!target) return reply("❌ Tag a user or provide a number.");
        let ppUrl;
        try { ppUrl = await conn.profilePictureUrl(target, 'image'); } catch { return reply("❌ No profile picture."); }
        await conn.sendMessage(from, { image: { url: ppUrl }, caption: `Profile of @${target.split('@')[0]}`, mentions: [target] }, { quoted: m });
    }
});

// VIEW ONCE COMMAND
registerCommand({
    command: "vv",
    alias: ["viewonce"],
    desc: "Open view once message",
    category: "tools",
    function: async (conn, m, store, { from, reply, quoted }) => {
        if (!quoted) return reply("❌ Reply to a view once message.");
        let msg = quoted.message;
        if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;
        if (msg.imageMessage) {
            let buffer = await downloadMediaMessage(msg.imageMessage);
            await conn.sendMessage(from, { image: buffer, caption: "Opened!" }, { quoted: m });
        } else if (msg.videoMessage) {
            let buffer = await downloadMediaMessage(msg.videoMessage);
            await conn.sendMessage(from, { video: buffer, caption: "Opened!" }, { quoted: m });
        } else { reply("Not a view once media."); }
    }
});

// ========== MAIN BOT CONNECTION ==========
let reconnectTimer = null;
async function startBot() {
    console.log("🔌 Connecting to WhatsApp...");
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();
    const conn = makeWASocket({ logger: P({ level: 'silent' }), printQRInTerminal: false, browser: Browsers.macOS('Firefox'), auth: state, version });

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                if (reconnectTimer) clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(() => { console.log('🔄 Reconnecting...'); startBot(); }, 5000);
            } else { console.log('❌ Session expired.'); }
        } else if (connection === 'open') {
            console.log('✅ XERO-MD CONNECTED!');
            console.log(`📝 Commands: ${commands.size}`);
            try { await conn.sendMessage(conn.user.id, { text: `✅ XERO-MD ONLINE\nPrefix: ${PREFIX}\nCommands: ${commands.size}` }); } catch(e) {}
        }
    });

    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('messages.update', async (updates) => { for (const u of updates) if (u.update.message === null) await AntiDelete(conn, updates); });
    conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));

    conn.ev.on('messages.upsert', async (msg) => {
        let m = msg.messages[0];
        if (!m?.message) return;
        if (getContentType(m.message) === 'ephemeralMessage') m.message = m.message.ephemeralMessage.message;
        if (m.message.viewOnceMessageV2) m.message = m.message.viewOnceMessageV2.message;
        if (config.READ_MESSAGE === 'true') await conn.readMessages([m.key]);
        if (m.key?.remoteJid === 'status@broadcast') {
            if (config.AUTO_STATUS_SEEN === 'true') await conn.readMessages([m.key]);
            if (config.AUTO_STATUS_REACT === 'true') {
                const emojis = ['❤️','🔥','💯','✨','⭐'];
                await conn.sendMessage(m.key.remoteJid, { react: { text: emojis[Math.floor(Math.random()*emojis.length)], key: m.key } }).catch(()=>{});
            }
            if (config.AUTO_STATUS_REPLY === 'true') {
                await conn.sendMessage(m.key.participant, { text: config.AUTO_STATUS_MSG || 'Seen!' }, { quoted: m }).catch(()=>{});
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
        const isCmd = body.startsWith(PREFIX);
        const command = isCmd ? body.slice(PREFIX.length).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const isGroup = from.endsWith('@g.us');
        const isOwner = OWNER_NUMBERS.includes(senderNumber) || botNumber === senderNumber;
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
        const reply = (text) => conn.sendMessage(from, { text }, { quoted: m });
        if (isCmd) {
            console.log(`📩 Command: ${command} from ${senderNumber}`);
            const cmd = getCommand(command);
            if (cmd) {
                try { await cmd.function(conn, m, { message: m }, { from, reply, args, q, text: q, isGroup, sender, senderNumber, botNumber, isOwner, groupName, participants, groupAdmins, isBotAdmins, isAdmins, prefix: PREFIX }); }
                catch (err) { reply(`❌ Error: ${err.message}`); }
            }
        }
    });

    conn.decodeJid = (jid) => { let d = jidDecode(jid); return d?.user && d?.server ? `${d.user}@${d.server}` : jid; };
    conn.downloadMediaMessage = downloadMediaMessage;
    conn.sendImage = async (jid, url, caption, quoted) => { let buf = /^https?:\/\//.test(url) ? await getBuffer(url) : fs.existsSync(url) ? fs.readFileSync(url) : null; if (buf) return conn.sendMessage(jid, { image: buf, caption }, { quoted }); return null; };
    conn.sendText = (jid, text, quoted) => conn.sendMessage(jid, { text }, { quoted });
}

// ========== SERVER ==========
app.get('/', (req, res) => res.send('XERO-MD is running!'));
app.listen(PORT, () => console.log(`🌐 Web server on port ${PORT}`));
setTimeout(startBot, 3000);
process.on('uncaughtException', (err) => console.error('💥', err.message));
process.on('unhandledRejection', (err) => console.error('💥', err));
console.log('🚀 XERO-MD booting...');
