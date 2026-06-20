// plugins/ps.js - XERO-MD Put Status Command
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

global.registerCommand({
    command: "ps",
    alias: ["putstatus", "setstatus", "poststatus"],
    desc: "Put replied message/media as WhatsApp status",
    category: "owner",
    function: async (conn, m, { from, reply, quoted, args, isOwner }) => {
        // Allow only owner (remove this check if you want everyone to use it)
        if (!isOwner) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Access Denied!*
┊• 🔒 Only bot owner can post status
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        // Check if replying to a message
        if (!quoted && !args[0]) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *PUT STATUS COMMAND*
┊•
┊• 💡 *Usage* :
┊•   Reply to a message with .ps
┊•   .ps Hello world (for text status)
┊•
┊• 📎 *Supports* :
┊•   • Text messages
┊•   • Images (photo)
┊•   • Videos
┊•   • Audio (voice notes)
┊•   • GIFs
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        try {
            // ========== TEXT STATUS ==========
            if (args[0]) {
                const textStatus = args.join(" ");
                await conn.updateProfileStatus(textStatus);
                
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *Status updated successfully!*
┊•
┊• 📝 *Text* : ${textStatus}
┊• ⏰ *Time* : ${new Date().toLocaleString()}
┊• 👤 *Posted by* : @${m.sender.split('@')[0]}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`, { mentions: [m.sender] });
            }

            // ========== MEDIA STATUS (Reply to media) ==========
            if (!quoted) {
                return reply("❌ Please reply to a message or provide text.");
            }

            let msg = quoted.message;
            let mediaBuffer = null;
            let mimeType = "";
            let caption = "";
            let mediaType = "";

            // Check for view once (if someone replies to view once)
            if (msg.viewOnceMessageV2) {
                msg = msg.viewOnceMessageV2.message;
            }

            // ========== IMAGE ==========
            if (msg.imageMessage) {
                mediaBuffer = await downloadMedia(msg.imageMessage);
                mimeType = msg.imageMessage.mimetype || "image/jpeg";
                caption = msg.imageMessage.caption || "";
                mediaType = "image";
            }
            // ========== VIDEO ==========
            else if (msg.videoMessage) {
                mediaBuffer = await downloadMedia(msg.videoMessage);
                mimeType = msg.videoMessage.mimetype || "video/mp4";
                caption = msg.videoMessage.caption || "";
                mediaType = "video";
            }
            // ========== AUDIO ==========
            else if (msg.audioMessage) {
                mediaBuffer = await downloadMedia(msg.audioMessage);
                mimeType = msg.audioMessage.mimetype || "audio/mpeg";
                caption = msg.audioMessage.caption || "";
                mediaType = "audio";
            }
            // ========== DOCUMENT ==========
            else if (msg.documentMessage) {
                mediaBuffer = await downloadMedia(msg.documentMessage);
                mimeType = msg.documentMessage.mimetype || "application/octet-stream";
                caption = msg.documentMessage.caption || "";
                mediaType = "document";
            }
            // ========== STICKER ==========
            else if (msg.stickerMessage) {
                mediaBuffer = await downloadMedia(msg.stickerMessage);
                mimeType = "image/webp";
                caption = "Sticker";
                mediaType = "sticker";
            }
            // ========== TEXT (if quoted but no media) ==========
            else if (msg.conversation || msg.extendedTextMessage) {
                const textContent = msg.conversation || msg.extendedTextMessage?.text || "";
                if (textContent) {
                    await conn.updateProfileStatus(textContent);
                    return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *Status updated successfully!*
┊•
┊• 📝 *Text* : ${textContent}
┊• ⏰ *Time* : ${new Date().toLocaleString()}
┊• 👤 *Posted by* : @${m.sender.split('@')[0]}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`, { mentions: [m.sender] });
                }
                return reply("❌ Could not extract content from quoted message.");
            }
            else {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Unsupported media type!*
┊•
┊• 📎 *Supported* : Image, Video, Audio, GIF, Sticker
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            if (!mediaBuffer) {
                return reply("❌ Failed to download media.");
            }

            // ========== SEND TO STATUS ==========
            await conn.sendMessage('status@broadcast', {
                [mediaType]: mediaBuffer,
                caption: caption || `📌 Status posted at ${new Date().toLocaleString()}`
            });

            // ========== CONFIRMATION ==========
            const statusMsg = `╭┈┈❍ *XERO-MD* ❍
┊• ✅ *Status posted successfully!*
┊•
┊• 📎 *Type* : ${mediaType.toUpperCase()}
┊• 📝 *Caption* : ${caption || "No caption"}
┊• ⏰ *Time* : ${new Date().toLocaleString()}
┊• 👤 *Posted by* : @${m.sender.split('@')[0]}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

            await reply(statusMsg, { mentions: [m.sender] });

        } catch (error) {
            console.error("PS Command Error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Failed to post status!*
┊•
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

// ========== HELPER: DOWNLOAD MEDIA ==========
async function downloadMedia(msg) {
    const stream = await downloadContentFromMessage(msg, msg.mimetype?.split('/')[0] || 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}
