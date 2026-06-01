const { cmd } = require("../command");
const moment = require("moment-timezone");
const config = require('../config');

let botStartTime = Date.now();

cmd({
    pattern: "alive",
    desc: "Check if the bot is active.",
    category: "info",
    react: "👋",
    filename: __filename
}, async (conn, mek, m, { reply, from }) => {
    try {
        const pushname = m.pushName || "User";
        const currentTime = moment().tz("Africa/Dar_es_Salaam").format("HH:mm:ss");
        const currentDate = moment().tz("Africa/Dar_es_Salaam").format("dddd, MMMM Do YYYY");

        const runtimeMilliseconds = Date.now() - botStartTime;
        const runtimeSeconds = Math.floor((runtimeMilliseconds / 1000) % 60);
        const runtimeMinutes = Math.floor((runtimeMilliseconds / (1000 * 60)) % 60);
        const runtimeHours = Math.floor(runtimeMilliseconds / (1000 * 60 * 60));

        const formattedInfo = `╭━━❍ *XERO-MD* ❍
┃ ❍ *ᴜsᴇʀ* : ${pushname}
┃ ❍ *ᴛɪᴍᴇ* : ${currentTime}
┃ ❍ *ᴅᴀᴛᴇ* : ${currentDate}
┃ ❍ *ᴜᴘᴛɪᴍᴇ* : ${runtimeHours}h ${runtimeMinutes}m ${runtimeSeconds}s
┃ ❍ *ʀᴜɴᴛɪᴍᴇ* : ${runtimeHours}h ${runtimeMinutes}m ${runtimeSeconds}s
┃ ❍ *ᴍᴏᴅᴇ* : ${config.MODE}
┃ ❍ *ᴘʀᴇғɪx* : ${config.PREFIX}
┃ ❍ *ᴏᴡɴᴇʀ* : nyoni-xmd
┃ ❍ *ɴᴜᴍʙᴇʀ 1* : +255763111390
┃ ❍ *ɴᴜᴍʙᴇʀ 2* : +255610209120
┃ ❍ *ᴠᴇʀsɪᴏɴ* : 3.0.0
╰━━━━━━━━━━━━━━━━━━━❍

> *ʙᴏᴛ ɪs ᴀᴄᴛɪᴠᴇ & ᴏɴʟɪɴᴇ!*
⚡ *ᴘᴏᴡᴇʀ - sᴘᴇᴇᴅ - ᴄᴏɴᴛʀᴏʟ*
🚀 *ʙᴇʏᴏɴᴅ ʟɪᴍɪᴛs*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ-xᴍᴅ`.trim();

        // Send image with caption
        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/gyaka2.png' },
            caption: formattedInfo,
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
        }, { quoted: mek });

    } catch (error) {
        console.error("Error in alive command: ", error);
        
        const errorMessage = `
❌ An error occurred while processing the alive command.
🛠 *Error Details*:
${error.message}

Please report this issue or try again later.
        `.trim();
        return reply(errorMessage);
    }
});
