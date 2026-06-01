const config = require('../config')
const { runtime } = require('../lib/functions');
const { cmd, commands } = require('../command')

cmd({
    pattern: "bot",
    alias: ["xero", "info", "status"],
    react: "🤖",
    desc: "Get bot information and status",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const uptime = runtime(process.uptime());
        const startTime = new Date(Date.now() - process.uptime() * 1000);
        
        let about = `╭─ 「 *\`XERO-MD STATUS\`* 」
│꙳ *ʙᴏᴛ ɴᴀᴍᴇ* : XERO-MD
│꙳ *ᴅᴇᴠᴇʟᴏᴘᴇʀ* : nyoni-xmd
│꙳ *sᴛᴀᴛᴜs* : ᴏɴʟɪɴᴇ ✅
│꙳ *ᴀᴜᴛᴏ ʀᴇsᴛᴀʀᴛ* : ᴀᴄᴛɪᴠᴇ
│꙳ *ʙᴏᴛ ʀᴜɴᴛɪᴍᴇ* : ${uptime}
│꙳ *ᴍᴏᴅᴇ* : ${config.MODE || 'public'}
│꙳ *ᴘʀᴇғɪx* : ${config.PREFIX || '.'}
│꙳ *ɴᴜᴍʙᴇʀ 1* : +255763111390
│꙳ *ɴᴜᴍʙᴇʀ 2* : +255610209120
│꙳ *ᴅᴇᴠɪᴄᴇ* : ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ
╰────────────────❍
> ⚡ *POWER - SPEED - CONTROL*
> 🚀 *BEYOND LIMITS*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ xᴍᴅ`

        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/gyaka2.png' },
            caption: about,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363418161689316@newsletter',
                    newsletterName: 'XERO-MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply(`❌ Error: ${e.message}`)
    }
})
