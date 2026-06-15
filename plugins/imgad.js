// plugins/ad.js - XERO-MD Image Editor (Ad/Scan Effect)
const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

global.registerCommand({
  command: "ad",
  alias: ["adedit", "adscan"],
  desc: "Add ad/scan effect to images",
  category: "tools",
  function: async (conn, m, { from, reply, quoted }) {
    try {
      // Check if quoted message exists and has media
      const quotedMsg = quoted || m;
      const msgObj = quotedMsg.message || quotedMsg;
      let mimeType = '';
      
      if (msgObj.imageMessage) {
        mimeType = msgObj.imageMessage.mimetype || '';
      } else if (msgObj.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        mimeType = msgObj.extendedTextMessage.contextInfo.quotedMessage.imageMessage.mimetype || '';
      } else if (msgObj.msg?.mimetype) {
        mimeType = msgObj.msg.mimetype;
      } else if (quotedMsg?.msg?.mimetype) {
        mimeType = quotedMsg.msg.mimetype;
      }

      if (!mimeType || !mimeType.startsWith('image/')) {
        return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *Please reply to an image file!*
┊• *Supported formats* : JPEG/PNG
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
      }

      await reply(`╭┈┈❍ *XERO-MD* ❍
┊• *📸 Processing image...*
┊• *Please wait*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

      // Download the media
      let mediaBuffer;
      if (msgObj.imageMessage) {
        mediaBuffer = await conn.downloadMediaMessage(msgObj.imageMessage);
      } else if (quotedMsg?.msg?.mimetype) {
        mediaBuffer = await quotedMsg.download();
      } else if (quotedMsg) {
        mediaBuffer = await quotedMsg.download();
      } else {
        return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ Failed to download image!*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
      }

      const fileSize = formatBytes(mediaBuffer.length);
      
      // Get file extension based on mime type
      let extension = '';
      if (mimeType.includes('image/jpeg')) extension = '.jpg';
      else if (mimeType.includes('image/png')) extension = '.png';
      else {
        return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *Unsupported image format!*
┊• *Please use JPEG or PNG*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
      }

      const tempFilePath = path.join(os.tmpdir(), `imgscan_${Date.now()}${extension}`);
      fs.writeFileSync(tempFilePath, mediaBuffer);

      // Upload to Catbox
      const form = new FormData();
      form.append('fileToUpload', fs.createReadStream(tempFilePath), `image${extension}`);
      form.append('reqtype', 'fileupload');

      const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      const imageUrl = uploadResponse.data;
      fs.unlinkSync(tempFilePath);

      if (!imageUrl) {
        throw new Error("Failed to upload image to Catbox");
      }

      // Scan the image using the API
      const apiUrl = `https://api.popcat.xyz/v2/ad?image=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      if (!response || !response.data) {
        return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ API error! Try again later*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
      }

      const imageBuffer = Buffer.from(response.data, "binary");

      await conn.sendMessage(from, {
        image: imageBuffer,
        caption: `╭┈┈❍ *XERO-MD* ❍
┊• *✅ Ad effect applied!*
┊• *Size* : ${fileSize}
┊• *Format* : ${extension.toUpperCase()}
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

    } catch (error) {
      console.error("Ad Error:", error);
      reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ An error occurred!*
┊• *Error* : ${error.message || "Unknown error"}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
    }
  }
});
