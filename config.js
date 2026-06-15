const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

module.exports = {
    SESSION_ID: process.env.SESSION_ID || "",
    PREFIX: process.env.PREFIX || ".",
    MODE: process.env.MODE || "public",
    BOT_NAME: "XERO-MD",
    OWNER_NAME: "nyoni-xmd",
    OWNER_NUMBER: "255763111390,255610209120"
};
