const config = require('../config')
const { runtime } = require('../lib/functions');
const {cmd , commands} = require('../command')
cmd({
    pattern: "bot",
    alias: "xero",
    react: "🤖",
    desc: "get owner dec",
    category: "misc",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    const uptime = runtime(process.uptime());
    const startTime = new Date(Date.now() - process.uptime() * 1000);
let about = `╭─ 「 *\`BOT ONLINE\`* 」
│꙳ *ʙᴏᴛ ɴᴀᴍᴇ* ↔ XERO-MD
│꙳ *sᴛᴀᴛᴜs* ↔ ᴏɴʟɪɴᴇ
│꙳ *ᴀᴜᴛᴏ ʀᴇsᴛᴀʀᴛ* ↔ ᴏɴʟɪɴᴇ
│꙳ *ʙᴏᴛ ʀᴜɴ* ↔ ${uptime}
│꙳ *ᴅᴇᴠɪᴄᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ*
╰────────────────❍
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ NYONI XMD*`
await conn.sendMessage(from, {
    image: { url: 'https://files.catbox.moe/mry39g.jpg' },
    caption: about,
    contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363418161689316@newsletter', // ou ton JID actuel
            newsletterName: 'XERO-MD',
            serverMessageId: 143
        }
    }
}, { quoted: mek })

}catch(e){
console.log(e)
reply(`${e}`)
}
})
