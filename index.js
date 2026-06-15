// ======================== XERO-MD SIMPLIFIED INDEX ========================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, Browsers, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const { File } = require('megajs');
const express = require('express');
const path = require('path');
const axios = require('axios');
const os = require('os');

const PREFIX = config.PREFIX || ".";
const OWNER_NUMBERS = ['255763111390', '255610209120'];
const app = express();
const PORT = process.env.PORT || 9090;

// ========== SIMPLE COMMAND SYSTEM ==========
const commands = {};

// Helper functions
async function getBuffer(url) {
    try {
        const res = await axios({ url, responseType: 'arraybuffer', timeout: 15000 });
        return res.data;
    } catch { return null; }
}

function getGroupAdmins(participants) {
    return participants.filter(p => p.admin).map(p => p.id);
}

async function downloadMedia(msg) {
    const stream = await downloadContentFromMessage(msg, msg.mimetype?.split('/')[0] || 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}

// ========== REGISTER COMMANDS ==========
commands['ping'] = async (conn, m, reply) => {
    await reply("🏓 Pong! Bot is alive.");
};

commands['menu'] = async (conn, m, reply, prefix) => {
    const uptime = () => {
        let sec = process.uptime();
        let h = Math.floor(sec / 3600);
        let m = Math.floor((sec % 3600) / 60);
        let s = Math.floor(sec % 60);
        return `${h}h ${m}m ${s}s`;
    };
    const menu = `╭━━━━━━━━━━━━━━━━━━╮
│   *XERO-MD MENU*
╰━━━━━━━━━━━━━━━━━━╯

╭─〔 COMMANDS 〕─╮
│ • ${prefix}menu - Show menu
│ • ${prefix}ping - Check bot
│ • ${prefix}alive - Bot status
│ • ${prefix}owner - Owner info
╰───────────────╯

╭─〔 INFO 〕─╮
│ Bot: XERO-MD
│ Dev: nyoni-xmd
│ Prefix: ${prefix}
│ Mode: ${config.MODE}
│ Runtime: ${uptime()}
╰─────────────╯

> POWERED BY nyoni-xmd`;
    await reply(menu);
};

commands['alive'] = async (conn, m, reply) => {
    await reply("✨ XERO-MD is alive and online!\n⚡ Power - Speed - Control");
};

commands['owner'] = async (conn, m, reply) => {
    await reply(`👑 OWNER\nName: nyoni-xmd\nNumber: +255763111390\nNumber 2: +255610209120`);
};

commands['runtime'] = async (conn, m, reply) => {
    const u = process.uptime();
    await reply(`⏰ Uptime: ${Math.floor(u/3600)}h ${Math.floor((u%3600)/60)}m ${Math.floor(u%60)}s`);
};

commands['getpp'] = async (conn, m, reply, from, args, quoted, isGroup, sender) => {
    let target = m.mentionedJid?.[0] || (quoted?.sender) || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net') || (isGroup ? sender : null);
    if (!target) return reply("❌ Tag a user or provide a number.");
    try {
        let ppUrl = await conn.profilePictureUrl(target, 'image');
        await conn.sendMessage(from, { image: { url: ppUrl }, caption: `Profile of @${target.split('@')[0]}`, mentions: [target] }, { quoted: m });
    } catch { reply("❌ No profile picture."); }
};

commands['vv'] = async (conn, m, reply, from, quoted) => {
    if (!quoted) return reply("❌ Reply to a view once message.");
    let msg = quoted.message;
    if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;
    if (msg.imageMessage) {
        let buffer = await downloadMedia(msg.imageMessage);
        await conn.sendMessage(from, { image: buffer, caption: "Opened!" }, { quoted: m });
    } else if (msg.videoMessage) {
        let buffer = await downloadMedia(msg.videoMessage);
        await conn.sendMessage(from, { video: buffer, caption: "Opened!" }, { quoted: m });
    } else { reply("Not a view once media."); }
};

// ========== SESSION ==========
if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');
if (!fs.existsSync('./sessions/creds.json') && config.SESSION_ID) {
    let key = config.SESSION_ID.replace(/^(POPKID;;;|XERO-MD>>>|jamali~|QUEEN-LORA~)/, '').trim();
    console.log("📥 Downloading session...");
    File.fromURL(`https://mega.nz/file/${key}`).download((err, data) => {
        if (!err) { fs.writeFileSync('./sessions/creds.json', data); console.log("✅ Session ready!"); }
        else console.error("Session error:", err.message);
    });
}

// ========== MAIN ==========
let reconnectTimer;
async function startBot() {
    console.log("🔌 Connecting...");
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({ logger: P({ level: 'silent' }), printQRInTerminal: false, browser: Browsers.macOS('Firefox'), auth: state, version });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                if (reconnectTimer) clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(() => { console.log('🔄 Reconnecting...'); startBot(); }, 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ XERO-MD ONLINE!');
            console.log(`📝 Commands: ${Object.keys(commands).length}`);
            try { await sock.sendMessage(sock.user.id, { text: '✅ XERO-MD is ready!' }); } catch(e) {}
        }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async (msg) => {
        let m = msg.messages[0];
        if (!m?.message) return;
        if (getContentType(m.message) === 'ephemeralMessage') m.message = m.message.ephemeralMessage.message;
        if (m.message.viewOnceMessageV2) m.message = m.message.viewOnceMessageV2.message;

        const from = m.key.remoteJid;
        const sender = m.key.fromMe ? sock.user.id.split(':')[0]+'@s.whatsapp.net' : (m.key.participant || m.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        let body = '';
        const type = getContentType(m.message);
        if (type === 'conversation') body = m.message.conversation;
        else if (type === 'extendedTextMessage') body = m.message.extendedTextMessage.text;
        else if (type === 'imageMessage' && m.message.imageMessage.caption) body = m.message.imageMessage.caption;
        
        const isCmd = body.startsWith(PREFIX);
        const cmdName = isCmd ? body.slice(PREFIX.length).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const isGroup = from.endsWith('@g.us');
        const isOwner = OWNER_NUMBERS.includes(senderNumber);
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: m });
        
        if (isCmd && commands[cmdName]) {
            console.log(`📩 ${cmdName} from ${senderNumber}`);
            try {
                await commands[cmdName](sock, m, reply, from, args, m.quoted, isGroup, sender);
            } catch (e) { reply(`❌ ${e.message}`); }
        }
    });

    sock.decodeJid = (jid) => { let d = jidDecode(jid); return d?.user && d?.server ? `${d.user}@${d.server}` : jid; };
}

app.get('/', (req, res) => res.send('XERO-MD Running'));
app.listen(PORT, () => console.log(`🌐 Server on ${PORT}`));
setTimeout(startBot, 3000);
process.on('uncaughtException', (e) => console.error('Error:', e.message));
console.log('🚀 Starting...');
