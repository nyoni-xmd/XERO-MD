const { cmd } = require("../command");
const config = require("../config");
const { runtime } = require("../lib/functions");

// Fake quoted message (kwa ujumbe wenye kwota)
const aliveQuoted = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        conversation: "⚡ XERO-MD STATUS"
    }
};

cmd({
    pattern: "alive",
    alias: ["ping", "status", "online"],
    desc: "Check if bot is alive and running",
    category: "general",
    react: "💚",
    filename: __filename
},
async (conn, mek, m, { from, reply, pushname }) => {
    try {
        const uptime = runtime(process.uptime());
        const botName = config.BOT_NAME || "XERO-MD";
        const prefix = config.PREFIX || ".";
        const mode = config.MODE || "public";
        const ownerNumber = config.OWNER_NUMBER?.split(",")[0] || "255763111390";
        const ownerName = config.OWNER_NAME || "NYONI XMD";
        const aliveImage = config.ALIVE_IMG || "https://files.catbox.moe/gyaka2.png";

        const aliveText = `╭━━〔 💚 *ALIVE STATUS* 〕━━⬣
┃
┃ 🤖 *Bot Name* : ${botName}
┃ 👤 *User* : ${pushname || "User"}
┃ ⏱️ *Uptime* : ${uptime}
┃ 📟 *Prefix* : ${prefix}
┃ 🌍 *Mode* : ${mode}
┃ 👑 *Owner* : ${ownerName}
┃ 📱 *Contact* : wa.me/${ownerNumber}
┃
┃ ✅ *Bot is online & ready!*
┃ 🚀 *Type ${prefix}menu for commands*
┃
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ *XERO-MD • Always Alive*`;

        await conn.sendMessage(from, {
            image: { url: aliveImage },
            caption: aliveText,
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
        }, { quoted: aliveQuoted });

    } catch (error) {
        console.error("Alive command error:", error);
        reply("❌ Failed to fetch alive status.");
    }
});
