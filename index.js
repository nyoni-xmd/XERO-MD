const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers,
  downloadContentFromMessage,
  proto
} = require('@whiskeysockets/baileys')

const fs = require('fs')
const P = require('pino')
const config = require('./config')
const { File } = require('megajs')
const express = require("express")
const path = require('path')
const axios = require('axios')
const util = require('util')
const FileType = require('file-type')
const os = require('os')
const { sms, AntiDelete } = require('./lib')
const GroupEvents = require('./lib/groupevents')
const { saveMessage } = require('./data')

// ============ SETTINGS ============
const prefix = config.PREFIX || "."
const ownerNumber = ['255763111390', '255610209120']
const app = express()
const port = process.env.PORT || 9090

// ============ COMMAND SYSTEM ============
const commands = new Map()
const aliases = new Map()

function registerCommand(cmd) {
    if (cmd.command) {
        commands.set(cmd.command, cmd)
        if (cmd.alias && Array.isArray(cmd.alias)) {
            cmd.alias.forEach(alias => aliases.set(alias, cmd.command))
        }
    }
}

function getCommand(cmdName) {
    let command = commands.get(cmdName)
    if (!command && aliases.has(cmdName)) {
        command = commands.get(aliases.get(cmdName))
    }
    return command
}

// ============ DEFAULT COMMANDS ============
registerCommand({
    command: 'menu',
    alias: ['help', 'cmd'],
    description: 'Show bot menu',
    function: async (conn, mek, m, { from, reply, prefix }) => {
        const menu = `╭━━━━━━━━━━━━━━━━━━╮
│   *XERO-MD MENU*
╰━━━━━━━━━━━━━━━━━━╯

╭─〔 COMMANDS 〕─╮
│ • ${prefix}menu - Show menu
│ • ${prefix}ping - Check bot
│ • ${prefix}owner - Contact owner
│ • ${prefix}alive - Check status
│ • ${prefix}runtime - Bot uptime
╰───────────────╯

╭─〔 INFO 〕─╮
│ Bot: XERO-MD
│ Dev: nyoni-xmd
│ Prefix: ${prefix}
│ Mode: PUBLIC ✅
╰─────────────╯

> POWERED BY nyoni-xmd`
        reply(menu)
    }
})

registerCommand({
    command: 'ping',
    description: 'Check bot response',
    function: async (conn, mek, m, { reply }) => {
        reply('🏓 Pong! Bot is alive ✅')
    }
})

registerCommand({
    command: 'alive',
    description: 'Check bot status',
    function: async (conn, mek, m, { reply }) => {
        reply('✨ XERO-MD is alive and running! ✨\n\n⚡ Power - Speed - Control\n🚀 Beyond Limits\n\n✅ Mode: PUBLIC - Everyone can use')
    }
})

registerCommand({
    command: 'owner',
    alias: ['creator', 'dev'],
    description: 'Owner info',
    function: async (conn, mek, m, { reply }) => {
        reply(`👑 *OWNER INFORMATION*
╭━━━━━━━━━━━━━━━╮
│ Name: nyoni-xmd
│ Number: +255763111390
│ Number 2: +255610209120
│ Bot: XERO-MD
╰━━━━━━━━━━━━━━━╯

💬 *Bot is PUBLIC* - Anyone can use!`)
    }
})

registerCommand({
    command: 'runtime',
    description: 'Bot uptime',
    function: async (conn, mek, m, { reply }) => {
        const runtime = process.uptime()
        const hours = Math.floor(runtime / 3600)
        const minutes = Math.floor((runtime % 3600) / 60)
        const seconds = Math.floor(runtime % 60)
        reply(`⏰ *BOT UPTIME*\n┈────────────┈\n🕐 ${hours}h ${minutes}m ${seconds}s`)
    }
})

console.log(`✅ Registered ${commands.size} commands - PUBLIC MODE ENABLED`)

// ============ SESSION FOLDER ============
if (!fs.existsSync(__dirname + '/sessions')) {
    fs.mkdirSync(__dirname + '/sessions')
}

// ============ SESSION DOWNLOAD ============
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if (!config.SESSION_ID || config.SESSION_ID === '') {
        console.log('========================================')
        console.log('⚠️ HAKUNA SESSION_ID ILIYOWEKWA!')
        console.log('⚠️ Weka SESSION_ID kwenye Heroku Config Vars')
        console.log('========================================')
    } else {
        console.log('📥 Inapakua session...')
        const sessdata = config.SESSION_ID.replace("XERO-MD>>>", '').replace("jamali~", '')
        const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
        filer.download((err, data) => {
            if (err) {
                console.log('❌ Session download failed:', err.message)
            } else {
                fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
                    console.log("✅ Session downloaded successfully")
                })
            }
        })
    }
}

// ============ TEMP FOLDER ============
const tempDir = path.join(os.tmpdir(), 'cache-temp')
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)

setInterval(() => {
    fs.readdir(tempDir, (err, files) => {
        if (err) return
        for (const file of files) {
            fs.unlink(path.join(tempDir, file), () => {})
        }
    })
}, 5 * 60 * 1000)

// ============ FUNCTIONS ============
const getBuffer = async (url, options) => {
    try {
        const res = await axios({
            method: "get",
            url,
            headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (e) {
        console.log(e)
        return null
    }
}

const getGroupAdmins = (participants) => {
    let admins = []
    for (let i of participants) {
        i.admin !== null ? admins.push(i.id) : ''
    }
    return admins
}

// ============ MAIN CONNECTION ============
async function connectToWA() {
    console.log("Connecting to WhatsApp ⏳️...")
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
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconnecting...')
                connectToWA()
            }
        } else if (connection === 'open') {
            console.log('✅ XERO-MD CONNECTED SUCCESSFULLY!')
            
            const up = `╭┈───────────────╮
│ ◦ *XERO-MD CONNECTED*
│ ◦ *DEV* : *nyoni-xmd*
│ ◦ *STATUS* : *ONLINE*
│ ◦ *NUMBER 1* : +255763111390
│ ◦ *NUMBER 2* : +255610209120
│ ◦ *PREFIX* : ${prefix}
│ ◦ *MODE* : PUBLIC ✅
│ ◦ *TYPE* : ${prefix}menu
╰┈───────────────╯
> POWERED BY nyoni-xmd`
            
            conn.sendMessage(conn.user.id, { 
                image: { url: 'https://files.catbox.moe/gyaka2.png' }, 
                caption: up 
            }).catch(() => {})
        }
    })

    conn.ev.on('creds.update', saveCreds)

    // ============ ANTI DELETE ============
    conn.ev.on('messages.update', async updates => {
        for (const update of updates) {
            if (update.update.message === null) {
                console.log("Delete Detected")
                await AntiDelete(conn, updates)
            }
        }
    })

    // ============ GROUP EVENTS ============
    conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update))

    // ============ MESSAGES - PUBLIC MODE 100% ============
    conn.ev.on('messages.upsert', async (mek) => {
        try {
            mek = mek.messages[0]
            if (!mek.message) return
            
            // Handle ephemeral messages
            if (getContentType(mek.message) === 'ephemeralMessage') {
                mek.message = mek.message.ephemeralMessage.message
            }
            
            if (mek.message.viewOnceMessageV2) {
                mek.message = mek.message.viewOnceMessageV2.message
            }
            
            // Read messages
            if (config.READ_MESSAGE === 'true') {
                await conn.readMessages([mek.key])
            }
            
            // Auto status seen/react/reply
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                if (config.AUTO_STATUS_SEEN === "true") {
                    await conn.readMessages([mek.key])
                }
                if (config.AUTO_STATUS_REACT === "true") {
                    const emojis = ['❤️', '🔥', '💯', '✨', '⭐', '👑', '💎', '🏆']
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
                    await conn.sendMessage(mek.key.remoteJid, {
                        react: { text: randomEmoji, key: mek.key }
                    }).catch(() => {})
                }
                if (config.AUTO_STATUS_REPLY === "true") {
                    const user = mek.key.participant
                    const text = config.AUTO_STATUS_MSG || "Seen your status!"
                    await conn.sendMessage(user, { text: text }, { quoted: mek }).catch(() => {})
                }
            }
            
            await saveMessage(mek)
            
            // Get message content
            const type = getContentType(mek.message)
            const from = mek.key.remoteJid
            const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net') : (mek.key.participant || mek.key.remoteJid)
            const senderNumber = sender.split('@')[0]
            const botNumber = conn.user.id.split(':')[0]
            
            // Get message body
            let body = ''
            if (type === 'conversation') {
                body = mek.message.conversation || ''
            } else if (type === 'extendedTextMessage') {
                body = mek.message.extendedTextMessage.text || ''
            } else if (type === 'imageMessage' && mek.message.imageMessage.caption) {
                body = mek.message.imageMessage.caption
            } else if (type === 'videoMessage' && mek.message.videoMessage.caption) {
                body = mek.message.videoMessage.caption
            } else if (type === 'listResponseMessage') {
                body = mek.message.listResponseMessage?.singleSelectReply?.selectedRowId || ''
            }
            
            const isCmd = body.startsWith(prefix)
            const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : ''
            const args = body.trim().split(/ +/).slice(1)
            const q = args.join(' ')
            const text = args.join(' ')
            const isGroup = from.endsWith('@g.us')
            const isOwner = ownerNumber.includes(senderNumber) || (botNumber === senderNumber)
            const isCreator = isOwner
            
            // Get group metadata if needed
            let groupMetadata = null
            let groupName = ''
            let participants = []
            let groupAdmins = []
            let isBotAdmins = false
            let isAdmins = false
            
            if (isGroup) {
                groupMetadata = await conn.groupMetadata(from).catch(() => null)
                groupName = groupMetadata?.subject || ''
                participants = groupMetadata?.participants || []
                groupAdmins = getGroupAdmins(participants)
                const botNumber2 = await jidNormalizedUser(conn.user.id)
                isBotAdmins = groupAdmins.includes(botNumber2)
                isAdmins = groupAdmins.includes(sender)
            }
            
            const reply = (teks) => {
                conn.sendMessage(from, { text: teks }, { quoted: mek })
            }
            
            // Auto react to owner messages
            if (senderNumber.includes("255763111390")) {
                const reactions = ["👑", "💀", "❤️", "🔥", "⭐", "✨", "💎", "🏆"]
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
                conn.sendMessage(from, { react: { text: randomReaction, key: mek.key } }).catch(() => {})
            }
            
            // ============ PUBLIC MODE - NO RESTRICTIONS ============
            // KILA MTU ANAWEZA KUTUMIA BOT - HAKUNA KIZUIZI CHA MODE
            // MODE CHECKING IMEFUTWA KABISA - BOT INAJIBU KILA MTU 100%
            
            // Execute command for EVERYONE (no mode checking)
            if (isCmd) {
                const cmd = getCommand(command)
                if (cmd) {
                    try {
                        console.log(`📝 [PUBLIC] ${command} from ${senderNumber} (${isGroup ? 'GROUP' : 'DM'})`)
                        await cmd.function(conn, mek, { message: mek }, {
                            from, reply, body, isCmd, command, args, q, text,
                            isGroup, sender, senderNumber, botNumber,
                            isOwner, isCreator, groupMetadata, groupName, participants,
                            groupAdmins, isBotAdmins, isAdmins, prefix
                        })
                    } catch (e) {
                        console.error("[COMMAND ERROR]", e)
                        reply(`❌ Error: ${e.message}`)
                    }
                } else {
                    // Optional: Reply for unknown commands
                    // reply(`❌ Unknown command. Type ${prefix}menu for help`)
                }
            }
        } catch (err) {
            console.error("[MESSAGE ERROR]", err)
        }
    })

    // ============ UTILITY FUNCTIONS ============
    conn.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return (decode.user && decode.server && decode.user + '@' + decode.server) || jid
        }
        return jid
    }
    
    conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
        let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? { ...content[ctype], ...options } : {})
        await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
        return waMessage
    }
    
    conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }
    
    conn.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }
    
    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = ''
        let res = await axios.head(url)
        mime = res.headers['content-type']
        if (mime.split("/")[1] === "gif") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
        }
        if (mime === "application/pdf") {
            return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "image") {
            return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "video") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "audio") {
            return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
        }
    }
    
    conn.sendImage = async (jid, path, caption = '', quoted = null) => {
        let buffer = Buffer.isBuffer(path) ? path : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : null
        if (buffer) {
            return await conn.sendMessage(jid, { image: buffer, caption: caption }, { quoted })
        }
        return null
    }
    
    conn.sendText = (jid, text, quoted = null) => {
        return conn.sendMessage(jid, { text: text }, { quoted })
    }
}

// ============ START SERVER ============
app.get("/", (req, res) => {
    res.send("XERO-MD IS RUNNING! ✅ - PUBLIC MODE - Everyone can use")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

setTimeout(() => {
    connectToWA()
}, 4000)

// ============ ERROR HANDLING ============
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message)
})

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
})

console.log('✅ XERO-MD STARTED - PUBLIC MODE 100% - EVERYONE CAN USE!')
