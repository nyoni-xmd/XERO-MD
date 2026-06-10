const { cmd } = require("../command");
const config = require("../config");

// XERO-MD Owner profile image
const OWNER_IMG = "https://files.catbox.moe/gyaka2.png";

cmd({
    pattern: "owner",
    alias: ["creator", "dev", "ownerinfo"],
    desc: "Show bot owner information",
    category: "general",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply, pushname }) => {
    try {
        const ownerNumber = config.OWNER_NUMBER || "255763111390";
        const ownerName = config.OWNER_NAME || "NYONI XMD";
        const botName = config.BOT_NAME || "XERO-MD";
        
        const ownerInfo = `╭━━〔 👑 *OWNER INFO* 〕━━⬣
┃
┃ 🤖 *Bot Name:* ${botName}
┃ 👨‍💻 *Owner Name:* ${ownerName}
┃ 📱 *WhatsApp:* wa.me/${ownerNumber.split(',')[0]}
┃ 🐙 *GitHub:* github.com/nyoni-xmd
┃ 🌐 *Repo:* XERO-MD
┃
┃ 💬 *Powered by ${ownerName}*
┃ ⚡ *XERO-MD - Next Gen Bot*
┃
╰━━━━━━━━━━━━━━━━━━⬣
> 🔥 *Type .menu for all commands*`;

        await conn.sendMessage(from, {
            image: { url: OWNER_IMG },
            caption: ownerInfo,
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
        }, { quoted: mek });
        
    } catch (error) {
        console.error("Owner command error:", error);
        reply("❌ Failed to fetch owner info. Please try again.");
    }
});
