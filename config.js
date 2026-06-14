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
    BOT_NAME: process.env.BOT_NAME || "XERO-MD",
    OWNER_NAME: process.env.OWNER_NAME || "nyoni-xmd",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "255763111390,255610209120",
    MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/gyaka2.png"
};
