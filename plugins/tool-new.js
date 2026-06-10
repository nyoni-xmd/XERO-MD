const config = require('../config');
const { sleep } = require('../lib/functions');
const { cmd } = require('../command');  // Badala ya DianaTech

// ✅ Fake Verified Contact (XERO-MD)
const fakeVerified = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "⚡ XERO-MD CALCULATOR ⚡",
      vcard: `BEGIN:VCARD
VERSION:3.0
FN:XERO-MD BOT
ORG:XERO-MD VERIFIED
TITLE:Official WhatsApp Bot
TEL;type=CELL;waid=255763111390:+255763111390
TEL;type=CELL;waid=255610209120:+255610209120
END:VCARD`
    }
  }
};

cmd({
    pattern: "calculate",
    alias: ["calc"],
    desc: "Evaluate a mathematical expression.",
    category: "utilities",
    react: "🧮",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) {
            return reply(
`╭━━〔 🧮 XERO-MD CALCULATOR 〕━━⬣
┃ ✳️ Example:
┃ ➤ .calc 5 + 3 * 2
╰━━━━━━━━━━━━━━━⬣`
            );
        }

        const expression = args.join(" ").trim();

        // ✅ Security check
        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
            return reply(
`╭━━〔 ❌ ERROR 〕━━⬣
┃ Invalid expression
╰━━━━━━━━━━━━━━━⬣`
            );
        }

        let result;
        try {
            result = Function(`"use strict"; return (${expression})`)();
        } catch {
            return reply(
`╭━━〔 ❌ ERROR 〕━━⬣
┃ Calculation error
╰━━━━━━━━━━━━━━━⬣`
            );
        }

        const message = 
`╭━━〔 🧮 XERO-MD CALC 〕━━⬣
┃ 📥 Expression:
┃ ➤ *${expression}=* ⤵️
┃
┃ 📤 Result:
┃ ➤ ${result}
┃
┃ ─────────────────
┃ ⚡ ${config.DESCRIPTION || '*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ-xᴍᴅ*'}
╰━━━━━━━━━━━━━━━⬣`;

        await sleep(300);

        await conn.sendMessage(
            m.chat,
            {
                image: { url: "https://files.catbox.moe/gyaka2.png" }, // Badala ya cloudinary URL
                caption: message
            },
            { quoted: fakeVerified }
        );

    } catch (e) {
        console.error(e);
        reply("❌ System error");
    }
});
      

cmd({
    pattern: "date",
    desc: "Check full date and time.",
    category: "utility",
    react: "📅",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const now = new Date();

        // 📆 Full Date
        const weekday = now.toLocaleDateString("en-US", {
            weekday: "long"
        });

        const day = now.getDate();

        const month = now.toLocaleDateString("en-US", {
            month: "long"
        });

        const year = now.getFullYear();

        const formattedDate = `${weekday}, ${day} ${month} ${year}`;

        // ⏰ Current Time
        const currentTime = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

        const message = `
╭━━〔 📅 XERO-MD DATE & TIME 〕━━⬣
┃ 📆 Full Date:
┃ ➤ ${formattedDate}
┃
┃ ⏰ Current Time:
┃ ➤ ${currentTime}
┃
┃ ─────────────────
┃ ⚡ ${config.DESCRIPTION || '*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ-xᴍᴅ*'}
╰━━━━━━━━━━━━━━━⬣`;

        await conn.sendMessage(
            m.chat,
            {
                image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/gyaka2.png" },
                caption: message
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply("❌ Error getting date and time.");
    }
});
