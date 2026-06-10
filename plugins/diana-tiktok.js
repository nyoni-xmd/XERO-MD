const { cmd } = require('../DianaTech');
const axios = require('axios');
const config = require('../config');

// VERIFIED MESSAGE
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
FN:${config.BOT_NAME}
ORG:DIANA TECH VERIFIED;
TITLE:Official WhatsApp Bot
TEL;type=CELL;waid=${config.OWNER_NUMBER}:${config.OWNER_NUMBER}
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
`╭━━━〔 *${config.BOT_NAME}* 〕━━━⬣
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
> ☘️ *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅɪᴀɴᴀ ᴛᴇᴄʜ*`;

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