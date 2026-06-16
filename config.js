// ======================== XERO-MD CONFIG ========================
const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

module.exports = {
    // ========== SESSION ==========
    SESSION_ID: process.env.SESSION_ID || "",
    
    // ========== BOT SETTINGS ==========
    PREFIX: process.env.PREFIX || ".",
    MODE: process.env.MODE || "public",
    BOT_NAME: process.env.BOT_NAME || "XERO-MD",
    OWNER_NAME: process.env.OWNER_NAME || "nyoni-xmd",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "255763111390,255610209120",
    DEV: process.env.DEV || "255763111390",
    
    // ========== ALIVE SETTINGS ==========
    ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/gyaka2.png",
    LIVE_MSG: process.env.LIVE_MSG || "> *XERO-MD always online ⚡*",
    MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/gyaka2.png",
    DESCRIPTION: process.env.DESCRIPTION || "*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ-xᴍᴅ*",
    
    // ========== AUTO STATUS SETTINGS ==========
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
    AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "👀 Status viewed!",
    
    // ========== AUTO REACT ==========
    AUTO_REACT: process.env.AUTO_REACT || "true",
    CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
    CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
    
    // ========== AUTO TYPING & RECORDING ==========
    AUTO_TYPING: process.env.AUTO_TYPING || "true",
    AUTO_RECORDING: process.env.AUTO_RECORDING || "true",
    
    // ========== ANTI SETTINGS ==========
    ANTI_DELETE: process.env.ANTI_DELETE || "true",
    ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "same",
    ANTI_CALL: process.env.ANTI_CALL || "true",
    ANTI_LINK: process.env.ANTI_LINK || "false",
    
    // ========== GROUP EVENTS ==========
    WELCOME: process.env.WELCOME || "true",
    GOODBYE: process.env.GOODBYE || "true",
    ADMIN_ACTION: process.env.ADMIN_ACTION || "true",
    
    // ========== READ MESSAGES ==========
    READ_MESSAGE: process.env.READ_MESSAGE || "false",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true"
};
