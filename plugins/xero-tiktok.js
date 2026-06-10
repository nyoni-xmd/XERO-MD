const { cmd } = require('../command');  // ← Imebadilishwa kutoka DianaTech → command
const axios = require('axios');
const config = require('../config');

// VERIFIED MESSAGE (XERO-MD)
const fakeVerified = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "⚡ XERO-MD ⚡",
      vcard: `BEGIN:VCARD
VERSION:3.0
FN:${config.BOT_NAME || "XERO-MD"}
ORG:XERO-MD VERIFIED;
TITLE:Official WhatsApp Bot
TEL;type=CELL;waid=${config.OWNER_NUMBER || "255763111390"}:${config.OWNER_NUMBER || "255763111390"}
END:VCARD`
    }
  }
};

cmd({
    pattern: "tiktok",
    desc: "Download TikTok video without watermark",
    category: "download",
    react: "🔥",
    filename: __filename
}, async (conn, m, mek, { from, args, reply }) => {
    try {

        if (!args[0]) {
            return reply(
`⚠️ *LINK MISSING...*

📌 Example:
.tiktok https://vt.tiktok.com/xxxxx/

Don't make me ask twice 😏`
            );
        }

        const url = args[0];
        const start = Date.now();

        await conn.sendMessage(from, { react: { text: "⚡", key: mek.key } });

        const api = `https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api);

        if (!data.status || !data.result) {
            return reply(`❌ *Download failed... try another link.*`);
        }

        const speed = Date.now() - start;
        const meta = data.metadata || {};

        let caption = 
`╭━━━〔 *${config.BOT_NAME || "XERO-MD"}* 〕━━━⬣
┃
┃ 🎬 *TIKTOK DOWNLOADED SUCCESSFULLY*
┃
┃ 📌 *Title:* ${meta.title || "Unknown"}
┃ 👤 *Author:* ${meta.author || "Unknown"}
┃ ⚡ *Speed:* ${speed}ms
┃
╰━━━━━━━━━━━━━━━━⬣

🔗 *Source:* ${url}

✨ *Enjoy your video... stay smooth.*  
> ⚡ *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ NYONI XMD*`;

        await conn.sendMessage(from, {
            video: { url: data.result },
            mimetype: "video/mp4",
            caption: caption
        }, { quoted: fakeVerified });

    } catch (e) {
        console.error(e);

        reply(
`💀 *SYSTEM ERROR...*

Something went wrong.
Please try again later.`
        );
    }
});
