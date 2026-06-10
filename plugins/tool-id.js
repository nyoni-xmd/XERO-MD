const { cmd } = require("../command");  // Badala ya DianaTech

cmd({
  pattern: "channelid",
  alias: ["newsletter", "id", "cid", "cinfo"],
  react: "⏳",
  desc: "Get WhatsApp Channel/Newsletter info from link",
  category: "whatsapp",
  filename: __filename
}, async (conn, mek, m, {
  from,
  args,
  q,
  reply
}) => {
  try {
    if (!q) return reply("❎ Please provide a WhatsApp Channel link.\n\n*Example:* .cinfo https://whatsapp.com/channel/123456789");

    const match = q.match(/whatsapp\.com\/channel\/([\w-]+)/);
    if (!match) return reply("⚠️ *Invalid channel link format.*\n\nMake sure it looks like:\nhttps://whatsapp.com/channel/xxxxxxxxx");

    const inviteId = match[1];

    let metadata;
    try {
      metadata = await conn.newsletterMetadata("invite", inviteId);
    } catch (e) {
      return reply("❌ Failed to fetch channel metadata. Make sure the link is correct.");
    }

    if (!metadata || !metadata.id) return reply("❌ Channel not found or inaccessible.");

    const infoText = `╭━━〔 📡 *CHANNEL INFO* 〕━━⬣
┃ 🆔 *ID:* ${metadata.id}
┃ 📛 *Name:* ${metadata.name}
┃ 👥 *Followers:* ${metadata.subscribers?.toLocaleString() || "N/A"}
┃ 📅 *Created:* ${metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString() : "Unknown"}
╰━━━━━━━━━━━━━━━━⬣

> *XERO-MD*`;

    if (metadata.preview) {
      await conn.sendMessage(from, {
        image: { url: `https://pps.whatsapp.net${metadata.preview}` },
        caption: infoText
      }, { quoted: m });
    } else {
      await reply(infoText);
    }

  } catch (error) {
    console.error("❌ Error in channelid plugin:", error);
    reply("⚠️ An unexpected error occurred.");
  }
});
