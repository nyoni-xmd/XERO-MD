const fs = require('fs')
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' })

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
    BOT_NAME: process.env.BOT_NAME || "XERO-MD",
    OWNER_NAME: process.env.OWNER_NAME || "nyoni-xmd",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "255763111390,255610209120",
    DEV: process.env.DEV || "255763111390",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true"
}
