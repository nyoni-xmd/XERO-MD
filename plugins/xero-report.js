const { cmd } = require("../command"); // ← imebadilishwa kutoka DianaTech → command
const config = require("../config");

const reportedMessages = new Set();

const fakeVerified = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "⚡ KALI-MD ⚡",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:KALI-MD BOT
ORG:KALI-MD VERIFIED;
TITLE:Official WhatsApp Bot
TEL;type=CELL;waid=255763111390:+255763111390
END:VCARD`
        }
    }
};

cmd({
    pattern: "report",
    alias: ["ask", "bug", "request"],
    desc: "Send a bug report or feature request.",
    category: "utility",
    react: "📩",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        const devNumber = "255763111390"; // Owner number KALI-MD

        if (!args.length) {
            return reply(
`╭━━〔 📩 REPORT SYSTEM 〕━━⬣
┃
┃ Example:
┃ ${config.PREFIX || '.'}report Play command is not working
┃
┃ ${config.PREFIX || '.'}bug Menu not showing image
┃
┃ ${config.PREFIX || '.'}request Add TikTok downloader
┃
╰━━━━━━━━━━━━━━⬣`
            );
        }

        const messageId = m.key.id;

        if (reportedMessages.has(messageId)) {
            return reply(
                "⚠️ This report has already been forwarded.\nPlease wait for a response."
            );
        }

        reportedMessages.add(messageId);

        const reportText = `
╭━━〔 🛠️ BUG / REQUEST REPORT 〕━━⬣
┃
┃ 👤 User : @${m.sender.split("@")[0]}
┃ 📛 Name : ${m.pushName || "Unknown"}
┃
┃ 📝 Report :
┃ ${args.join(" ")}
┃
╰━━━━━━━━━━━━━━⬣

> 🔥 Powered By KALI-MD
`;

        await conn.sendMessage(
            `${devNumber}@s.whatsapp.net`,
            {
                image: {
                    url: config.ALIVE_IMG || "https://files.catbox.moe/gyaka2.png"
                },
                caption: reportText,
                mentions: [m.sender]
            },
            {
                quoted: fakeVerified
            }
        );

        await conn.sendMessage(
            m.chat,
            {
                text:
`╭━━〔 ✅ REPORT SENT 〕━━⬣
┃
┃ Hello *${m.pushName || "User"}* 👋
┃
┃ Your report/request has been
┃ successfully forwarded to
┃ the bot owner.
┃
┃ ⏳ Please wait patiently
┃ for a response.
┃
╰━━━━━━━━━━━━━━⬣

> ⚡ KALI-MD Reporting System`
            },
            {
                quoted: fakeVerified
            }
        );

    } catch (error) {
        console.error(error);

        reply(
`╭━━〔 ❌ ERROR 〕━━⬣
┃
┃ Failed to send report.
┃ Please try again later.
┃
╰━━━━━━━━━━━━━━⬣`
        );
    }
});
