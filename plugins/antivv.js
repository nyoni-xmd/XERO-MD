const { cmd } = require('./command.js');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Anti View Once Function
async function handleViewOnce(conn, mek, from, reply) {
    try {
        // Check if it's a view once message
        let viewOnceMsg = null;
        let msgType = null;
        
        if (mek.message.viewOnceMessageV2) {
            viewOnceMsg = mek.message.viewOnceMessageV2.message;
            msgType = 'vv';
        } else if (mek.message.viewOnceMessageV2Extension) {
            viewOnceMsg = mek.message.viewOnceMessageV2Extension.message;
            msgType = 'vv';
        }
        
        if (!viewOnceMsg) return null;
        
        // Get the actual content
        let mediaBuffer = null;
        let mimeType = null;
        let caption = "";
        
        if (viewOnceMsg.imageMessage) {
            // View once image
            mediaBuffer = await conn.downloadMediaMessage(viewOnceMsg.imageMessage);
            mimeType = viewOnceMsg.imageMessage.mimetype;
            caption = viewOnceMsg.imageMessage.caption || "";
            msgType = 'image';
        } else if (viewOnceMsg.videoMessage) {
            // View once video
            mediaBuffer = await conn.downloadMediaMessage(viewOnceMsg.videoMessage);
            mimeType = viewOnceMsg.videoMessage.mimetype;
            caption = viewOnceMsg.videoMessage.caption || "";
            msgType = 'video';
        } else if (viewOnceMsg.audioMessage) {
            // View once audio
            mediaBuffer = await conn.downloadMediaMessage(viewOnceMsg.audioMessage);
            mimeType = viewOnceMsg.audioMessage.mimetype;
            caption = viewOnceMsg.audioMessage.caption || "";
            msgType = 'audio';
        }
        
        if (!mediaBuffer) return null;
        
        return { mediaBuffer, mimeType, caption, msgType, viewOnceMsg };
        
    } catch (error) {
        console.error('View once handling error:', error);
        return null;
    }
}

// Command to open view once message by replying
cmd({
    pattern: "vv",
    alias: ["viewonce", "openvv", "savevv"],
    desc: "Open view once message (reply to a view once message)",
    category: "tools",
    react: "🔓",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner }) => {
    try {
        // Check if replying to a message
        let quotedMsg = null;
        
        if (mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo) {
            quotedMsg = mek.message.extendedTextMessage.contextInfo.quotedMessage;
        }
        
        if (!quotedMsg) {
            return reply(`╭━━❍ *VIEW ONCE OPENER* ❍
┃ ❍ *ᴜsᴀɢᴇ* : Reply to a view once message
┃ ❍ *ᴇxᴀᴍᴘʟᴇ* : 
┃   1. Receive a view once message
┃   2. Reply to it with *${config.PREFIX || '.'}vv*
┃   3. Bot will open and save it
╰━━━━━━━━━━━━━━━━━━━❍

> POWERED BY nyoni-xmd`);
        }
        
        // Check if quoted message is view once
        let isViewOnce = false;
        let viewOnceData = null;
        
        if (quotedMsg.viewOnceMessageV2) {
            isViewOnce = true;
            viewOnceData = quotedMsg.viewOnceMessageV2.message;
        } else if (quotedMsg.viewOnceMessageV2Extension) {
            isViewOnce = true;
            viewOnceData = quotedMsg.viewOnceMessageV2Extension.message;
        }
        
        if (!isViewOnce) {
            return reply("❌ *Not a view once message!*\n\nReply to a message with 🔒 icon (view once).");
        }
        
        await reply("🔓 *Opening view once message...*");
        
        // Extract media from view once
        let mediaBuffer = null;
        let mimeType = null;
        let caption = "";
        let type = "";
        
        if (viewOnceData.imageMessage) {
            mediaBuffer = await conn.downloadMediaMessage(viewOnceData.imageMessage);
            mimeType = viewOnceData.imageMessage.mimetype || "image/jpeg";
            caption = viewOnceData.imageMessage.caption || "";
            type = "image";
        } else if (viewOnceData.videoMessage) {
            mediaBuffer = await conn.downloadMediaMessage(viewOnceData.videoMessage);
            mimeType = viewOnceData.videoMessage.mimetype || "video/mp4";
            caption = viewOnceData.videoMessage.caption || "";
            type = "video";
        } else if (viewOnceData.audioMessage) {
            mediaBuffer = await conn.downloadMediaMessage(viewOnceData.audioMessage);
            mimeType = viewOnceData.audioMessage.mimetype || "audio/mpeg";
            caption = viewOnceData.audioMessage.caption || "";
            type = "audio";
        }
        
        if (!mediaBuffer) {
            return reply("❌ *Failed to open view once message!*\n\nMedia could not be downloaded.");
        }
        
        // Send the media
        if (type === "image") {
            await conn.sendMessage(from, {
                image: mediaBuffer,
                caption: `🔓 *View Once Opened*\n\n📝 *Caption:* ${caption || "None"}\n\n> XERO-MD`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: mek });
        } else if (type === "video") {
            await conn.sendMessage(from, {
                video: mediaBuffer,
                caption: `🔓 *View Once Opened*\n\n📝 *Caption:* ${caption || "None"}\n\n> XERO-MD`,
                mimetype: mimeType,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: mek });
        } else if (type === "audio") {
            await conn.sendMessage(from, {
                audio: mediaBuffer,
                mimetype: mimeType,
                ptt: true,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: mek });
            
            await reply(`🔓 *View Once Audio Opened*\n\n📝 *Caption:* ${caption || "None"}\n\n> XERO-MD`);
        }
        
        // Send success message
        await reply(`✅ *View Once Message Successfully Opened!*

╭━━━━━━━━━━━━━━━━━╮
│ 📎 *Type* : ${type}
│ 📝 *Caption* : ${caption || "No caption"}
│ 🔓 *Status* : Opened
│ 🤖 *Bot* : XERO-MD
╰━━━━━━━━━━━━━━━━━╯

> POWERED BY nyoni-xmd`);
        
    } catch (error) {
        console.error(error);
        reply(`❌ *Error opening view once message!*\n\n${error.message}`);
    }
});

// Auto anti-view once (auto save when someone sends view once)
cmd({
    pattern: "antivv",
    alias: ["autovv"],
    desc: "Enable/disable auto save view once messages",
    category: "owner",
    react: "🔒",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ *Access Denied!*\nOnly bot owner can use this command.");
        
        const action = args[0]?.toLowerCase();
        
        if (action === "on") {
            if (!global.autoVVEnabled) global.autoVVEnabled = true;
            global.autoVVEnabled = true;
            reply(`✅ *Auto View Once Opener* ENABLED!

Bot will automatically open and save view once messages sent in chat.

⚠️ Note: Bot will reply with the opened media.`);
        } else if (action === "off") {
            global.autoVVEnabled = false;
            reply(`❌ *Auto View Once Opener* DISABLED!

Bot will not automatically open view once messages.`);
        } else {
            const status = global.autoVVEnabled ? "ON" : "OFF";
            reply(`🔒 *Anti View Once Settings*

Current Status: ${status}

Commands:
.antivv on - Enable auto open view once
.antivv off - Disable auto open view once
.vv - Open view once by replying`);
        }
    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});

// Auto handle view once messages if enabled
// Add this to your index.js or message handler
if (typeof global.autoVVEnabled === 'undefined') {
    global.autoVVEnabled = false;
}

// Export function to be used in index.js for auto handling
module.exports = {
    handleViewOnce,
    handleViewOnceAuto: async (conn, mek, from, reply) => {
        if (global.autoVVEnabled) {
            try {
                // Check if incoming message is view once
                let viewOnceMsg = null;
                
                if (mek.message.viewOnceMessageV2) {
                    viewOnceMsg = mek.message.viewOnceMessageV2.message;
                } else if (mek.message.viewOnceMessageV2Extension) {
                    viewOnceMsg = mek.message.viewOnceMessageV2Extension.message;
                }
                
                if (viewOnceMsg) {
                    // Wait a bit then auto open
                    setTimeout(async () => {
                        try {
                            let mediaBuffer = null;
                            let mimeType = null;
                            let caption = "";
                            let type = "";
                            
                            if (viewOnceMsg.imageMessage) {
                                mediaBuffer = await conn.downloadMediaMessage(viewOnceMsg.imageMessage);
                                mimeType = viewOnceMsg.imageMessage.mimetype;
                                caption = viewOnceMsg.imageMessage.caption || "";
                                type = "image";
                            } else if (viewOnceMsg.videoMessage) {
                                mediaBuffer = await conn.downloadMediaMessage(viewOnceMsg.videoMessage);
                                mimeType = viewOnceMsg.videoMessage.mimetype;
                                caption = viewOnceMsg.videoMessage.caption || "";
                                type = "video";
                            }
                            
                            if (mediaBuffer && type === "image") {
                                await conn.sendMessage(from, {
                                    image: mediaBuffer,
                                    caption: `🔓 *Auto Opened View Once*\n\n📝 *Caption:* ${caption || "None"}\n\n> XERO-MD (Auto)`
                                });
                            } else if (mediaBuffer && type === "video") {
                                await conn.sendMessage(from, {
                                    video: mediaBuffer,
                                    caption: `🔓 *Auto Opened View Once*\n\n📝 *Caption:* ${caption || "None"}\n\n> XERO-MD (Auto)`,
                                    mimetype: mimeType
                                });
                            }
                        } catch(e) {}
                    }, 1000);
                }
            } catch(e) {}
        }
    }
};
