const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
module.exports = {
    SESSION_ID: process.env.SESSION_ID || "",
    PREFIX: process.env.PREFIX || ".",
    MODE: process.env.MODE || "public",
    READ_MESSAGE: process.env.READ_MESSAGE || "false",
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
    AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*SEEN YOUR STATUS BY XERO-MD*",
    AUTO_REACT: process.env.AUTO_REACT || "false",
    CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
    CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
    BOT_NAME: process.env.BOT_NAME || "XERO-MD",
    OWNER_NAME: process.env.OWNER_NAME || "nyoni-xmd",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "255763111390,255610209120",
    DEV: process.env.DEV || "255763111390",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
    ANTI_DELETE: process.env.ANTI_DELETE || "true",
    ANTI_CALL: process.env.ANTI_CALL || "true",
    ANTI_LINK: process.env.ANTI_LINK || "false",
    WELCOME: process.env.WELCOME || "false",
    GOODBYE: process.env.GOODBYE || "false",
    DESCRIPTION: process.env.DESCRIPTION || "*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ-xᴍᴅ*",
    MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/gyaka2.png",
    ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/gyaka2.png",
    LIVE_MSG: process.env.LIVE_MSG || "> *XERO-MD always online ⚡*"
}
