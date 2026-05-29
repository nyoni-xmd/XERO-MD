

const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "igdl2",
  alias: ["instagram2", "ig", "insta"],
  react: '📥',
  desc: "Download videos from Instagram (API v5)",
  category: "download",
  use: ".igdl5 <Instagram video URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const igUrl = args[0];
    if (!igUrl || !igUrl.includes("instagram.com")) {
      return reply(
        '❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ɪɴsᴛᴀɢʀᴀᴍ ᴠɪᴅᴇᴏ ᴜʀʟ.\n\nExample:\n.igdl5 https://instagram.com/reel/...');
    }

    // Réaction d’attente
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    // Appel API
    const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(igUrl)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Vérifications
    if (!data.status || !data.result || !Array.isArray(data.result) || data.result.length === 0) {
      return reply('❌ ᴜɴᴀʙʟᴇ ᴛᴏ ғᴇᴛᴄʜ ᴛʜᴇ ᴠɪᴅᴇᴏ. ᴘʟᴇᴀsᴇ ᴄʜᴇᴄᴋ ᴛʜᴇ ᴜʀʟ ᴀɴᴅ ᴛʀʏ ᴀɢᴀɪɴ.');
    }

    const videoUrl = data.result[0];
    if (!videoUrl) return reply("❌ No video found in the response.");

    const metadata = data.metadata || {};
    const author = metadata.author || "Unknown";
    const caption = metadata.caption ? (metadata.caption.length > 300 ? metadata.caption.slice(0, 300) + "..." : metadata.caption) : "No caption provided.";
    const likes = metadata.like || 0;
    const comments = metadata.comment || 0;

    await reply('Downloading ɪɴsᴛᴀɢʀᴀᴍ ᴠɪᴅᴇᴏ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ. 📥');

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: `📥 *ɪɴsᴛᴀɢʀᴀᴍ ʀᴇᴇʟ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n👤 *ᴀᴜᴛʜᴏʀ:* ${author}\n💬 *ᴄᴀᴘᴛɪᴏɴ:* ${caption}\n❤️ *ʟɪᴋᴇs:* ${likes} | 💭 *ᴄᴏᴍᴍᴇɴᴛs:* ${comments}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘʀɪɴᴄᴇ xᴛʀᴇᴍᴇ*`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
  } catch (error) {
    console.error('IGDL5 Error:', error);
    reply('❌ Failed to download the Instagram video. Please try again later.');
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
  }
});
