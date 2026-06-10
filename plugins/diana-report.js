const { cmd } = require("../DianaTech");
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
            displayName: "☘️ QUEEN DIANA TECH ☘️",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:QUEEN LORA BOT
ORG:DIANA TECH VERIFIED;
TITLE:Official WhatsApp Bot
TEL;type=CELL;waid=18492823944:+18492823944
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
        const devNumber = "18492823944";

        if (!args.length) {
            return reply(
`╭━━〔 📩 REPORT SYSTEM 〕━━⬣
┃
┃ Example:
┃ ${config.PREFIX}report Play command is not working
┃
┃ ${config.PREFIX}bug Menu not showing image
┃
┃ ${config.PREFIX}request Add TikTok downloader
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

> Powered By DianaTech
`;

        await conn.sendMessage(
            `${devNumber}@s.whatsapp.net`,
            {
                image: {
                    url: config.MENU_IMAGE_URL
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

> DianaTech Reporting System`
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