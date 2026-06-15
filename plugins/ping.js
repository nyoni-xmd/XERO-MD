const config = require('../config')
let fs = require('fs')
const os = require("os")
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

// ==================== PING 2 ====================
cmd({
    pattern: "ping2",
    react: "📟",
    alias: ["speed"],
    desc: "Check bot's ping",
    category: "main",
    use: '.ping2',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
var inital = new Date().getTime();
let ping = await conn.sendMessage(from , { text: '*XERO-MD...*'  }, { quoted: mek } )
var final = new Date().getTime();
await conn.sendMessage(from, { delete: ping.key })
return await conn.sendMessage(from , { text: '*📍 Pong*\n*' + (final - inital) + ' ms 📟*'  }, { quoted: mek } )
} catch (e) {
reply('*Error !!*')
l(e)
}
})

// ==================== PING 3 ====================
cmd({
    pattern: "ping3",
    react: "♻️",
    alias: ["speed"],
    desc: "Check bot's ping",
    category: "main",
    use: '.ping3',
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
const startTime = Date.now()
const message = await conn.sendMessage(from, { text: '*_Pinging..._*' })
const endTime = Date.now()
const ping = endTime - startTime
await conn.sendMessage(from, { text: `*⚡ XERO-MD Speed : ${ping} ms*`}, { quoted: message })
} catch (e) {
console.log(e)
reply(`${e}`)
}
})

// ==================== PING (MAIN) ====================
cmd({
    pattern: "ping",
    alias: ["speed","pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "📟",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '🔮', '💫', '🍹', '🍁', '❇️', '🎋', '🎐', '🪸'];
        const textEmojis = ['🪀', '🪂', '⚡️', '🚀', '🏎️', '🚁', '🌀', '📟', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;
        let ping = await conn.sendMessage(from , { text: '*Here is your ping...*'  }, { quoted: mek } )

        const text = `*${reactionEmoji} Pong ${responseTime.toFixed(2)} MS*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: false,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363399470975987@newsletter',
                    newsletterName: "XERO-MD",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
