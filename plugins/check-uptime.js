const { cmd } = require("../command");
const config = require("../config");
const { runtime } = require("../lib/functions");

// Fake quoted message for professional look
const uptimeQuoted = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        conversation: "⏱️ XERO-MD UPTIME"
    }
};

cmd({
    pattern: "uptime",
    alias: ["runtime", "run", "active"],
    desc: "Show bot uptime with elegant style",
    category: "general",
    react: "⏱️",
    filename: __filename
},
async (conn, mek, m, { from, reply, pushname }) => {
    try {
        const uptimeString = runtime(process.uptime());
        const seconds = Math.floor(process.uptime());
        const startTime = new Date(Date.now() - seconds * 1000);
        const botName = config.BOT_NAME || "XERO-MD";
        const prefix = config.PREFIX || ".";
        const aliveImage = config.ALIVE_IMG || "https://files.catbox.moe/gyaka2.png";

        // Stylish template (multiple styles – randomly selected)
        const styles = [
            `╭━━〔 ⏱️ *UPTIME STATUS* 〕━━⬣
┃
┃ 🤖 *Bot* : ${botName}
┃ 👤 *User* : ${pushname || "User"}
┃ ⏳ *Running* : ${uptimeString}
┃ 🕐 *Seconds* : ${seconds}s
┃ 🚀 *Started* : ${startTime.toLocaleString()}
┃
┃ ✅ *Bot is active & stable*
┃ 📟 *Type ${prefix}menu for commands*
┃
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ *XERO-MD • Always Ready*`,

            `╭───「 *UPTIME* 」───❍
│ ⏱️ *Duration* : ${uptimeString}
│ 🧭 *Total sec* : ${seconds}
│ 📅 *Since* : ${startTime.toLocaleDateString()}
│ 🕒 *Time* : ${startTime.toLocaleTimeString()}
│
│ 🟢 *Bot is running smoothly*
╰──────────────⭑━➤
> 🔥 *${botName} Uptime*`,

            `╭━━〔 ⌛ *BOT RUNTIME* 〕━━⬣
┃
┃ 🕒 ${uptimeString}
┃ ⏱️ ${seconds} seconds
┃ 📆 ${startTime.toLocaleString()}
┃
┃ 💪 *Performance: 100%*
┃ 🛡️ *Stability: Excellent*
┃
╰━━━━━━━━━━━━━━━━━━⬣
> ✨ *Powered by XERO-MD*`
        ];

        // Pick a random style for fun (or use first one)
        const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

        await conn.sendMessage(from, {
            image: { url: aliveImage },
            caption: selectedStyle,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363418161689316@newsletter",
                    newsletterName: botName,
                    serverMessageId: 143
                }
            }
        }, { quoted: uptimeQuoted });

    } catch (error) {
        console.error("Uptime error:", error);
        reply("❌ Failed to fetch uptime.");
    }
});
