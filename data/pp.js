const { cmd } = require('../lib/functions');
const fs = require('fs');
const path = require('path');
cmd({ pattern: "setpp", alias: ["changepp"], desc: "Set bot profile picture (owner only)", category: "owner", react: "🖼️", filename: __filename }, async (conn, mek, m, { from, reply, quoted, isOwner }) => {
    if (!isOwner) return reply("Owner only.");
    let img = quoted?.message?.imageMessage || mek.message.imageMessage;
    if (!img) return reply("Reply to an image.");
    let buf = await conn.downloadMediaMessage(img);
    let tmp = path.join(__dirname, '../temp_pp.jpg');
    fs.writeFileSync(tmp, buf);
    await conn.updateProfilePicture(conn.user.id, { url: tmp });
    fs.unlinkSync(tmp);
    reply("✅ Profile picture updated.");
});
cmd({ pattern: "getpp", alias: ["pp"], desc: "Get user profile picture", category: "tools", react: "📸", filename: __filename }, async (conn, mek, m, { from, reply, args, quoted, isGroup }) => {
    let target = m.mentionedJid?.[0] || (quoted?.sender) || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net') || (isGroup ? m.sender : null);
    if (!target) return reply("Tag a user or provide number.");
    let url;
    try { url = await conn.profilePictureUrl(target, 'image'); } catch { return reply("No profile picture."); }
    await conn.sendMessage(from, { image: { url }, caption: `Profile picture of @${target.split('@')[0]}` }, { quoted: mek, mentions: [target] });
});
