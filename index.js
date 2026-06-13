// XERO-MD Main Index File
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, generateForwardMessageContent, generateWAMessageFromContent, jidDecode, fetchLatestBaileysVersion, Browsers, downloadContentFromMessage, proto } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const { File } = require('megajs');
const express = require('express');
const path = require('path');
const axios = require('axios');
const FileType = require('file-type');
const os = require('os');
const { sms, AntiDelete } = require('./lib/functions');
const GroupEvents = require('./lib/groupevents');
const { saveMessage } = require('./data/database');

const prefix = config.PREFIX || ".";
const ownerNumber = ['255763111390', '255610209120'];
const app = express();
const port = process.env.PORT || 9090;

// Command system
const commands = new Map();
const aliases = new Map();
global.commandsArray = [];

function registerCommand(cmd) {
    if (cmd.command) {
        commands.set(cmd.command, cmd);
        if (cmd.alias && Array.isArray(cmd.alias)) cmd.alias.forEach(a => aliases.set(a, cmd.command));
        global.commandsArray.push(cmd);
    }
}
function getCommand(name) { return commands.get(name) || commands.get(aliases.get(name)); }
global.registerCommand = registerCommand;
global.getCommand = getCommand;

// Session folder
if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');
if (!fs.existsSync('./sessions/creds.json') && config.SESSION_ID) {
    let sessdata = config.SESSION_ID.replace("POPKID;;;", '').trim();
    File.fromURL(`https://mega.nz/file/${sessdata}`).download((err, data) => {
        if (!err) fs.writeFileSync('./sessions/creds.json', data);
        else console.log('Session download error:', err.message);
    });
}

// Temp cleaner
const tempDir = path.join(os.tmpdir(), 'xero_temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
setInterval(() => fs.readdir(tempDir, (_, f) => f.forEach(f => fs.unlink(path.join(tempDir, f), () => {}))), 300000);

// Helpers
const getBuffer = async (url) => (await axios({ url, responseType: 'arraybuffer' })).data;
const getGroupAdmins = (p) => p.filter(m => m.admin).map(m => m.id);

// Load plugins
function loadPlugins() {
    const pluginsDir = './plugins';
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    files.forEach(f => { try { require(`./plugins/${f}`); console.log(`✅ ${f}`); } catch(e) { console.log(`❌ ${f}: ${e.message}`); } });
    console.log(`✅ Total commands: ${global.commandsArray.length}`);
}

// Connection
let reconnectTimer;
async function connectToWA() {
    console.log('Connecting to WhatsApp...');
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();
    const conn = makeWASocket({ logger: P({ level: 'silent' }), printQRInTerminal: false, browser: Browsers.macOS('Firefox'), auth: state, version });

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                if (reconnectTimer) clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(() => { console.log('Reconnecting...'); connectToWA(); }, 5000);
            } else console.log('Session expired. Update SESSION_ID.');
        } else if (connection === 'open') {
            console.log('✅ XERO-MD Connected!');
            loadPlugins();
            conn.sendMessage(conn.user.id, { image: { url: 'https://files.catbox.moe/gyaka2.png' }, caption: `XERO-MD ONLINE\nPrefix: ${prefix}\nMode: ${config.MODE}` }).catch(()=>{});
        }
    });
    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('messages.update', async (up) => { for (let u of up) if (u.update.message === null) await AntiDelete(conn, up); });
    conn.ev.on('group-participants.update', (u) => GroupEvents(conn, u));

    conn.ev.on('messages.upsert', async (msg) => {
        let m = msg.messages[0];
        if (!m?.message) return;
        if (getContentType(m.message) === 'ephemeralMessage') m.message = m.message.ephemeralMessage.message;
        if (m.message.viewOnceMessageV2) m.message = m.message.viewOnceMessageV2.message;
        if (config.READ_MESSAGE === 'true') await conn.readMessages([m.key]);
        if (m.key?.remoteJid === 'status@broadcast') {
            if (config.AUTO_STATUS_SEEN === 'true') await conn.readMessages([m.key]);
            if (config.AUTO_STATUS_REACT === 'true') await conn.sendMessage(m.key.remoteJid, { react: { text: ['❤️','🔥','💯','✨'][Math.floor(Math.random()*4)], key: m.key } }).catch(()=>{});
            if (config.AUTO_STATUS_REPLY === 'true') await conn.sendMessage(m.key.participant, { text: config.AUTO_STATUS_MSG || 'Seen your status!' }, { quoted: m }).catch(()=>{});
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

        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const isGroup = from.endsWith('@g.us');
        const isOwner = ownerNumber.includes(senderNumber) || botNumber === senderNumber;

        let gMeta, gName, parts=[], admins=[], botAdm=false, isAdm=false;
        if (isGroup) {
            gMeta = await conn.groupMetadata(from).catch(()=>null);
            gName = gMeta?.subject || '';
            parts = gMeta?.participants || [];
            admins = getGroupAdmins(parts);
            const botJid = await jidNormalizedUser(conn.user.id);
            botAdm = admins.includes(botJid);
            isAdm = admins.includes(sender);
        }
        const reply = (txt) => conn.sendMessage(from, { text: txt }, { quoted: m });
        if (isCmd) {
            const cmd = getCommand(command);
            if (cmd) try { await cmd.function(conn, m, { message: m }, { from, reply, args, q, text: q, isGroup, sender, senderNumber, botNumber, isOwner, groupName: gName, participants: parts, groupAdmins: admins, isBotAdmins: botAdm, isAdmins: isAdm, prefix }); } catch(e) { reply(`Error: ${e.message}`); }
        }
    });

    conn.decodeJid = (jid) => { let d = jidDecode(jid); return d?.user && d?.server ? `${d.user}@${d.server}` : jid; };
    conn.downloadMediaMessage = async (msg) => { let s = await downloadContentFromMessage(msg, msg.mimetype?.split('/')[0] || 'image'); let b = Buffer.from([]); for await (const c of s) b = Buffer.concat([b, c]); return b; };
}

app.get('/', (_, res) => res.send('XERO-MD Running'));
app.listen(port, () => console.log(`Server on port ${port}`));
setTimeout(connectToWA, 4000);
process.on('uncaughtException', (e) => console.error(e.message));
process.on('unhandledRejection', (e) => console.error(e));
console.log('✅ XERO-MD STARTED');
