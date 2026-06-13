
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
const ownerNumber = ['255763111390', '255610209120']  // Namba zako
const app = express()
const port = process.env.PORT || 9090

// ============ COMMAND SYSTEM ============
const commands = new Map()
const aliases = new Map()
global.commandsArray = []

function registerCommand(cmd) {
    if (cmd.command) {
        commands.set(cmd.command, cmd)
        if (cmd.alias && Array.isArray(cmd.alias)) {
            cmd.alias.forEach(alias => aliases.set(alias, cmd.command))
        }
        global.commandsArray.push(cmd)
    }
}

function getCommand(cmdName) {
    let command = commands.get(cmdName)
    if (!command && aliases.has(cmdName)) {
        command = commands.get(aliases.get(cmdName))
    }
    return command
}

global.registerCommand = registerCommand
global.getCommand = getCommand
global.commands = commands

console.log(`✅ Command system ready - waiting for plugins...`)

// ============ SESSION FOLDER ============
if (!fs.existsSync(__dirname + '/sessions')) {
    fs.mkdirSync(__dirname + '/sessions')
}

// ============ SESSION DOWNLOAD (Supports POPKID;;;, XERO-MD>>>, jamali~) ============
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if (!config.SESSION_ID || config.SESSION_ID === '') {
        console.log('========================================')
        console.log('⚠️ HAKUNA SESSION_ID ILIYOWEKWA!')
        console.log('⚠️ Weka SESSION_ID kwenye Heroku Config Vars')
        console.log('========================================')
    } else {
        console.log('📥 Inapakua session...')
        // Remove any known prefixes
        let sessdata = config.SESSION_ID
            .replace("POPKID;;;", '')
            .replace("XERO-MD>>>", '')
            .replace("jamali~", '')
            .trim()
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

// ============ HELPERS ============
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
        if (i.admin) admins.push(i.id)
    }
    return admins
}

// ============ LOAD PLUGINS ============
function loadPlugins() {
    console.log('🧬 Loading plugins...')
    const pluginsDir = path.join(__dirname, 'plugins')
    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir)
        console.log('📁 Created plugins folder')
    }
    const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))
    console.log(`📦 Found ${pluginFiles.length} plugins`)
    for (const plugin of pluginFiles) {
        try {
            require(path.join(pluginsDir, plugin))
            console.log(`✅ Loaded: ${plugin}`)
        } catch(e) {
            console.log(`❌ Failed: ${plugin} - ${e.message}`)
        }
    }
    console.log(`✅ Total commands registered: ${global.commandsArray.length}`)
}

// ============ MAIN CONNECTION ============
let reconnectAttempt = 0
let maxReconnect = 5
let reconnectTimeout = null

async function connectToWA() {
    console.log("Connecting to WhatsApp ⏳️...")
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/')
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    })

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const statusCode = lastDisconnect.error?.output?.statusCode
            if (statusCode === DisconnectReason.loggedOut) {
                console.log('❌ Session logged out. Please update SESSION_ID.')
                return
            }
            // Reconnect with delay
            if (reconnectTimeout) clearTimeout(reconnectTimeout)
            reconnectTimeout = setTimeout(() => {
                console.log('🔄 Reconnecting...')
                reconnectTimeout = null
                connectToWA()
            }, 5000)
        } else if (connection === 'open') {
            console.log('✅ XERO-MD CONNECTED SUCCESSFULLY!')
            loadPlugins()
            
            const up = `╭┈───────────────╮
│ ◦ *XERO-MD CONNECTED*
│ ◦ *DEV* : *nyoni-xmd*
│ ◦ *STATUS* : *ONLINE*
│ ◦ *NUMBER 1* : +255763111390
│ ◦ *NUMBER 2* : +255610209120
│ ◦ *PREFIX* : ${prefix}
│ ◦ *MODE* : ${config.MODE || 'public'}
│ ◦ *COMMANDS* : ${global.commandsArray.length}
╰┈───────────────╯
> POWERED BY nyoni-xmd`
            conn.sendMessage(conn.user.id, { 
                image: { url: 'https://files.catbox.moe/gyaka2.png' }, 
                caption: up 
            }).catch(() => {})
        }
    })

    conn.ev.on('creds.update', saveCreds)

    // Anti-delete
    conn.ev.on('messages.update', async updates => {
        for (const update of updates) {
            if (update.update.message === null) {
                console.log("Delete Detected")
                await AntiDelete(conn, updates)
            }
        }
    })

    // Group events
    conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update))

    // Message handler
    conn.ev.on('messages.upsert', async (mek) => {
        try {
            mek = mek.messages[0]
            if (!mek.message) return
            
            // Decrypt ephemeral
            if (getContentType(mek.message) === 'ephemeralMessage') {
                mek.message = mek.message.ephemeralMessage.message
            }
            if (mek.message.viewOnceMessageV2) {
                mek.message = mek.message.viewOnceMessageV2.message
            }
            
            // Auto-read if enabled
            if (config.READ_MESSAGE === 'true') {
                await conn.readMessages([mek.key])
            }
            
            // Auto-status actions
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                if (config.AUTO_STATUS_SEEN === "true") await conn.readMessages([mek.key])
                if (config.AUTO_STATUS_REACT === "true") {
                    const emojis = ['❤️','🔥','💯','✨','⭐','👑','💎','🏆']
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
            
            const type = getContentType(mek.message)
            const from = mek.key.remoteJid
            const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net') : (mek.key.participant || mek.key.remoteJid)
            const senderNumber = sender.split('@')[0]
            const botNumber = conn.user.id.split(':')[0]
            
            let body = ''
            if (type === 'conversation') body = mek.message.conversation || ''
            else if (type === 'extendedTextMessage') body = mek.message.extendedTextMessage.text || ''
            else if (type === 'imageMessage' && mek.message.imageMessage.caption) body = mek.message.imageMessage.caption
            else if (type === 'videoMessage' && mek.message.videoMessage.caption) body = mek.message.videoMessage.caption
            else if (type === 'listResponseMessage') body = mek.message.listResponseMessage?.singleSelectReply?.selectedRowId || ''
            
            const isCmd = body.startsWith(prefix)
            const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : ''
            const args = body.trim().split(/ +/).slice(1)
            const q = args.join(' ')
            const text = args.join(' ')
            const isGroup = from.endsWith('@g.us')
            const isOwner = ownerNumber.includes(senderNumber) || (botNumber === senderNumber)
            const isCreator = isOwner
            
            // Group metadata
            let groupMetadata = null, groupName = '', participants = [], groupAdmins = [], isBotAdmins = false, isAdmins = false
            if (isGroup) {
                groupMetadata = await conn.groupMetadata(from).catch(() => null)
                groupName = groupMetadata?.subject || ''
                participants = groupMetadata?.participants || []
                groupAdmins = getGroupAdmins(participants)
                const botNumber2 = await jidNormalizedUser(conn.user.id)
                isBotAdmins = groupAdmins.includes(botNumber2)
                isAdmins = groupAdmins.includes(sender)
            }
            
            const reply = (teks) => { conn.sendMessage(from, { text: teks }, { quoted: mek }) }
            
            // Auto-react to owner
            if (senderNumber.includes("255763111390") && !mek.message.reactionMessage) {
                const reactions = ["👑","💀","❤️","🔥","⭐","✨","💎","🏆"]
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
                conn.sendMessage(from, { react: { text: randomReaction, key: mek.key } }).catch(() => {})
            }
            
            // ========== EXECUTE COMMAND ==========
            if (isCmd) {
                const cmd = getCommand(command)
                if (cmd) {
                    try {
                        console.log(`📝 [PLUGIN] ${command} from ${senderNumber} (${isGroup ? 'GROUP' : 'DM'})`)
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
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
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
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
        return buffer
    }
    
    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = ''
        let res = await axios.head(url)
        mime = res.headers['content-type']
        if (mime.split("/")[1] === "gif") return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted })
        if (mime === "application/pdf") return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted })
        if (mime.split("/")[0] === "image") return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted })
        if (mime.split("/")[0] === "video") return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted })
        if (mime.split("/")[0] === "audio") return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted })
    }
    
    conn.sendImage = async (jid, path, caption = '', quoted = null) => {
        let buffer = Buffer.isBuffer(path) ? path : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : null
        if (buffer) return await conn.sendMessage(jid, { image: buffer, caption: caption }, { quoted })
        return null
    }
    
    conn.sendText = (jid, text, quoted = null) => conn.sendMessage(jid, { text: text }, { quoted })
}

// ============ START SERVER ============
app.get("/", (req, res) => { res.send("XERO-MD IS RUNNING! ✅") })
app.listen(port, () => console.log(`Server running on port ${port}`))

setTimeout(() => connectToWA(), 4000)

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err.message))
process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err))

console.log('✅ XERO-MD STARTED - WAITING FOR SESSION...')
