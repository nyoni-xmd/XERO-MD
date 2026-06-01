const { cmd } = require('./command.js');
const fs = require('fs');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

cmd({
    pattern: "sticker",
    alias: ["s", "stik"],
    desc: "Convert image/video to sticker",
    category: "convert",
    react: "🎴",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, sender }) => {
    try {
        if (!mek.message) return reply("Reply to an image or video!");
        
        let media;
        if (mek.message.imageMessage) {
            media = mek.message.imageMessage;
        } else if (mek.message.videoMessage) {
            media = mek.message.videoMessage;
        } else if (mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo) {
            const quotedMsg = mek.message.extendedTextMessage.contextInfo.quotedMessage;
            if (quotedMsg.imageMessage) media = quotedMsg.imageMessage;
            else if (quotedMsg.videoMessage) media = quotedMsg.videoMessage;
            else return reply("Reply to an image or video!");
        } else {
            return reply("Reply to an image or video!");
        }
        
        const buffer = await conn.downloadMediaMessage(media);
        const sticker = new Sticker(buffer, {
            pack: "XERO-MD",
            author: "nyoni-xmd",
            type: StickerTypes.FULL,
            categories: ['🤩', '🎉'],
            id: "12345",
            quality: 100
        });
        
        const stickerBuffer = await sticker.toBuffer();
        await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
});
