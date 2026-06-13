const { cmd } = require('../lib/functions');
const { Sticker } = require('wa-sticker-formatter');
cmd({ pattern: "sticker", alias: ["s"], desc: "Convert image to sticker", category: "convert", react: "🎴", filename: __filename }, async (conn, mek, m, { from, reply, quoted }) => {
    let media = mek.message.imageMessage || (quoted?.message?.imageMessage);
    if (!media) return reply("Reply to an image.");
    let buffer = await conn.downloadMediaMessage(media);
    let sticker = new Sticker(buffer, { pack: "XERO-MD", author: "nyoni-xmd" });
    await conn.sendMessage(from, { sticker: await sticker.toBuffer() }, { quoted: mek });
});
