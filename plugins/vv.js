// plugins/vv.js - XERO-MD View Once Opener
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function downloadMedia(msg, type) {
    const stream = await downloadContentFromMessage(msg, type || 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}

global.registerCommand({
    command: "vv",
    alias: ["viewonce", "vv2"],
    desc: "Open view once message (image/video/audio)",
    category: "tools",
    function: async (conn, m, { from, reply, quoted, isOwner }) => {
        try {
            if (!isOwner) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *Access Denied!*
┊• *This command is for owner only*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            if (!quoted) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *Please reply to a view once message!*
┊• *Example* : Reply to a 🔒 message with .vv
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            let msg = quoted.message;
            if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;
            if (msg.viewOnceMessageV2Extension) msg = msg.viewOnceMessageV2Extension.message;

            let buffer, caption = "", mimeType = "";

            if (msg.imageMessage) {
                buffer = await downloadMedia(msg.imageMessage, 'image');
                caption = msg.imageMessage.caption || "🔓 View once image opened!";
                mimeType = msg.imageMessage.mimetype || "image/jpeg";
                
                await conn.sendMessage(from, {
                    image: buffer,
                    caption: `╭┈┈❍ *XERO-MD* ❍
┊• ${caption}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            } 
            else if (msg.videoMessage) {
                buffer = await downloadMedia(msg.videoMessage, 'video');
                caption = msg.videoMessage.caption || "🔓 View once video opened!";
                mimeType = msg.videoMessage.mimetype || "video/mp4";
                
                await conn.sendMessage(from, {
                    video: buffer,
                    caption: `╭┈┈❍ *XERO-MD* ❍
┊• ${caption}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            }
            else if (msg.audioMessage) {
                buffer = await downloadMedia(msg.audioMessage, 'audio');
                mimeType = msg.audioMessage.mimetype || "audio/mpeg";
                
                await conn.sendMessage(from, {
                    audio: buffer,
                    mimetype: mimeType,
                    ptt: msg.audioMessage.ptt || false,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
                
                await reply(`╭┈┈❍ *XERO-MD* ❍
┊• *🔓 View once audio opened!*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }
            else {
                await reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ Not a view once message!*
┊• *Only image, video, and audio are supported*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }
        } catch (error) {
            console.error("VV Error:", error);
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ Error opening view once message!*
┊• *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
