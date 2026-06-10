const { cmd } = require("../command");   // ← Fixed import
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "vv3",
    alias: ["retrieve", "viewonce"],
    desc: "Fetch and resend a ViewOnce message (image/video/audio).",
    category: "tools",
    react: "🔓",
    filename: __filename
}, async (conn, mek, m, { from, reply, quoted }) => {
    try {
        // 1. Make sure we have a quoted message (the view‑once message)
        if (!quoted) {
            return reply("❌ *No quoted message!*\n\nReply to a ViewOnce message with `.vv3`");
        }

        // 2. Extract the actual view‑once content
        let viewOnceMsg = null;
        if (quoted.message.viewOnceMessageV2) {
            viewOnceMsg = quoted.message.viewOnceMessageV2.message;
        } else if (quoted.message.viewOnceMessageV2Extension) {
            viewOnceMsg = quoted.message.viewOnceMessageV2Extension.message;
        } else {
            return reply("⚠️ *Not a ViewOnce message!*\nReply to a message with the 🔒 icon.");
        }

        // 3. Determine media type and download
        let mediaBuffer = null;
        let mimeType = "";
        let caption = "";
        let type = "";

        if (viewOnceMsg.imageMessage) {
            mediaBuffer = await downloadMediaMessage(viewOnceMsg.imageMessage, 'buffer', {}, { 
                logger: console, 
                reuploadRequest: conn.updateMediaMessage 
            });
            mimeType = viewOnceMsg.imageMessage.mimetype;
            caption = viewOnceMsg.imageMessage.caption || "";
            type = "image";
        } 
        else if (viewOnceMsg.videoMessage) {
            mediaBuffer = await downloadMediaMessage(viewOnceMsg.videoMessage, 'buffer', {}, { 
                logger: console, 
                reuploadRequest: conn.updateMediaMessage 
            });
            mimeType = viewOnceMsg.videoMessage.mimetype;
            caption = viewOnceMsg.videoMessage.caption || "";
            type = "video";
        }
        else if (viewOnceMsg.audioMessage) {
            mediaBuffer = await downloadMediaMessage(viewOnceMsg.audioMessage, 'buffer', {}, { 
                logger: console, 
                reuploadRequest: conn.updateMediaMessage 
            });
            mimeType = viewOnceMsg.audioMessage.mimetype;
            caption = viewOnceMsg.audioMessage.caption || "";
            type = "audio";
        }
        else {
            return reply("❌ Unsupported media type in this ViewOnce message.");
        }

        if (!mediaBuffer) {
            return reply("❌ Failed to download the ViewOnce media.");
        }

        // 4. Send back the retrieved media
        await reply(`🔓 *ViewOnce Opened (${type})*\n📝 Caption: ${caption || "None"}\n\n> XERO-MD`);

        if (type === "image") {
            await conn.sendMessage(from, {
                image: mediaBuffer,
                caption: `🔓 *Retrieved ViewOnce Image*\n\n📝 ${caption || "No caption"}\n\n> XERO-MD`
            }, { quoted: mek });
        } 
        else if (type === "video") {
            await conn.sendMessage(from, {
                video: mediaBuffer,
                caption: `🔓 *Retrieved ViewOnce Video*\n\n📝 ${caption || "No caption"}\n\n> XERO-MD`,
                mimetype: mimeType
            }, { quoted: mek });
        }
        else if (type === "audio") {
            await conn.sendMessage(from, {
                audio: mediaBuffer,
                mimetype: mimeType,
                ptt: false
            }, { quoted: mek });
        }

    } catch (error) {
        console.error("VV3 Error:", error);
        reply(`❌ *Error*\n${error.message || "Could not retrieve the ViewOnce message."}`);
    }
});

// ============================================================
// CREDIT NOTICE (as requested by original author)
// ============================================================
// if you want use the codes give me credit on your channel and repo 
// in this file and my all files – adapted for XERO-MD by nyoni-xmd
