const { cmd } = require("../command");
const moment = require("moment-timezone");
const config = require('../config');

let botStartTime = Date.now();
const ALIVE_IMG = "https://files.catbox.moe/gyaka2.png"; // XERO-MD image

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

        const formattedInfo = `╭─ 「 *\`XERO-MD\`* 」
│✨ *ʙᴏᴛ ɪs ᴀᴄᴛɪᴠᴇ & ᴏɴʟɪɴᴇ!*
│🧠 *ᴏᴡɴᴇʀ:* nyoni-xmd
│📞 *ɴᴜᴍʙᴇʀ 1:* +255763111390
│📞 *ɴᴜᴍʙᴇʀ 2:* +255610209120
│⚡ *ᴠᴇʀsɪᴏɴ:* 3.0.0
│🕒 *ᴛɪᴍᴇ* : ${currentTime}
│📳 *ᴍᴏᴅᴇ:* [${config.MODE}]
│📅 *ᴅᴀᴛᴇ* : ${currentDate}
│⏳ *ᴜᴘᴛɪᴍᴇ* : ${runtimeHours}h ${runtimeMinutes}m ${runtimeSeconds}s
╰────────────────❍

> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`.trim();

        if (!ALIVE_IMG || !ALIVE_IMG.startsWith("http")) {
            throw new Error("Invalid ALIVE_IMG URL.");
        }

        await conn.sendMessage(from, {
            image: { url: ALIVE_IMG },
            caption: formattedInfo,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363399470975987@newsletter',
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
