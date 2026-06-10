const fs = require('fs');
const { getConfig } = require("./lib/configdb");

if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: './config.env' });
}

function convertToBool(text, fault = "true") {
    return String(text).toLowerCase() === fault.toLowerCase();
}

module.exports = {

    // ===============================
    // BOT CORE SETTINGS
    // ===============================
    SESSION_ID: process.env.SESSION_ID || "Your session Id here",
    PREFIX: process.env.PREFIX || getConfig("PREFIX") || ".",
    CHATBOT: process.env.CHATBOT || getConfig("CHATBOT") || "off",
    CHATBOTGROUP: process.env.CHATBOTGROUP || getConfig("CHATBOTGROUP") || "off",
    
    BOT_NAME:
        process.env.BOT_NAME ||
        getConfig("BOT_NAME") ||
        "QUEEN-LORA",

    MODE:
        process.env.MODE ||
        getConfig("MODE") ||
        "public",

    REPO:
        process.env.REPO ||
        "https://github.com/QUEEN-DIANA/QUEEN-LORA",

    BAILEYS:
        process.env.BAILEYS ||
        "@whiskeysockets/baileys",

    OWNER_NUMBER:
        process.env.OWNER_NUMBER ||
        "18492823944",

    OWNER_NAME:
        process.env.OWNER_NAME ||
        getConfig("OWNER_NAME") ||
        "ᴅɪᴀɴᴀ ᴛᴇᴄʜ",

    DEV:
        process.env.DEV ||
        "18492823944",

    DEVELOPER_NUMBER:
        process.env.DEVELOPER_NUMBER ||
        "18099065877@s.whatsapp.net",

    // ===============================
    // NEWSLETTER
    // ===============================
    NEWSLETTER:
        process.env.NEWSLETTER ||
        "120363336396621021@newsletter",

    NEWSLETTER_NAME:
        process.env.NEWSLETTER_NAME ||
        "QUEEN DIANA TECH",

    // ===============================
    // ALIVE SETTINGS
    // ===============================
    ALIVE_IMG:
        process.env.ALIVE_IMG ||
        getConfig("ALIVE_IMG") ||
        "https://files.catbox.moe/czmlou.jpeg",

    LIVE_MSG:
        process.env.LIVE_MSG ||
        getConfig("LIVE_MSG") ||
        "*🤖 QUEEN LORA IS ONLINE AND RUNNING SUCCESSFULLY*",

    // ===============================
    // AUTO REPLY SETTINGS
    // ===============================
    AUTO_REPLY:
        process.env.AUTO_REPLY || "false",

    AUTO_STATUS_REPLY:
        process.env.AUTO_STATUS_REPLY || "false",

    AUTO_STATUS_MSG:
        process.env.AUTO_STATUS_MSG ||
        "*QUEEN LORA VIEWED YOUR STATUS 🤖*",

    READ_MESSAGE:
        process.env.READ_MESSAGE || "false",

    READ_CMD:
        process.env.READ_CMD || "false",

    REJECT_MSG:
        process.env.REJECT_MSG ||
        "*📞 CALL NOT ALLOWED ON THIS NUMBER 📵*",

    // ===============================
    // REACTIONS & STICKERS
    // ===============================
    AUTO_REACT:
        process.env.AUTO_REACT || "false",

    OWNER_REACT:
        process.env.OWNER_REACT || "false",

    CUSTOM_REACT:
        process.env.CUSTOM_REACT || "false",

    CUSTOM_REACT_EMOJIS:
        process.env.CUSTOM_REACT_EMOJIS ||
        getConfig("CUSTOM_REACT_EMOJIS") ||
        "🔥,❤️,💙,💚",

    STICKER_NAME:
        process.env.STICKER_NAME ||
        "ᴅɪᴀɴᴀ ᴛᴇᴄʜ",

    AUTO_STICKER:
        process.env.AUTO_STICKER || "false",

    // ===============================
    // MEDIA AUTOMATION
    // ===============================
    AUTO_RECORDING:
        process.env.AUTO_RECORDING || "false",

    AUTO_TYPING:
        process.env.AUTO_TYPING || "false",

    MENTION_REPLY:
        process.env.MENTION_REPLY || "false",

    MENU_IMAGE_URL:
        process.env.MENU_IMAGE_URL ||
        getConfig("MENU_IMAGE_URL") ||
        "https://res.cloudinary.com/dqxlb29uz/image/upload/v1778178937/bwm_uploads/media-1778178936946.jpg",

    // ===============================
    // SECURITY
    // ===============================
    ANTI_DELETE:
        process.env.ANTI_DELETE || "true",

    ANTI_CALL:
        process.env.ANTI_CALL || "true",

    ANTI_BAD:
        process.env.ANTI_BAD ||
        process.env.ANTI_BAD_WORD ||
        "false",

    ANTI_BAD_WORD:
        process.env.ANTI_BAD_WORD || "false",

    ANTI_LINK:
        process.env.ANTI_LINK || "true",

    ANTI_VV:
        process.env.ANTI_VV || "true",

    DELETE_LINKS:
        process.env.DELETE_LINKS || "true",

    ANTI_DEL_PATH:
        process.env.ANTI_DEL_PATH || "same",

    ANTI_BOT:
        process.env.ANTI_BOT || "true",

    PM_BLOCKER:
        process.env.PM_BLOCKER || "false",

    // ===============================
    // APPEARANCE & BEHAVIOR
    // ===============================
    DESCRIPTION:
        process.env.DESCRIPTION ||
        "*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅɪᴀɴᴀ ᴛᴇᴄʜ*",

    PUBLIC_MODE:
        process.env.PUBLIC_MODE || "true",

    ALWAYS_ONLINE:
        process.env.ALWAYS_ONLINE || "false",

    AUTO_STATUS_REACT:
        process.env.AUTO_STATUS_REACT || "false",

    AUTO_STATUS_SEEN:
        process.env.AUTO_STATUS_SEEN || "false",

    AUTO_BIO:
        process.env.AUTO_BIO || "false",

    WELCOME:
        process.env.WELCOME || "false",

    GOODBYE:
        process.env.GOODBYE || "false",

    ADMIN_ACTION:
        process.env.ADMIN_ACTION || "true",

    // ===============================
    // BOOLEAN HELPERS
    // ===============================
    isPublic: convertToBool(
        process.env.PUBLIC_MODE || "true"
    ),

    isAntiDelete: convertToBool(
        process.env.ANTI_DELETE || "true"
    ),

    isAntiCall: convertToBool(
        process.env.ANTI_CALL || "true"
    ),

    isReadCmd: convertToBool(
        process.env.READ_CMD || "false"
    ),

    isAntiBad: convertToBool(
        process.env.ANTI_BAD ||
        process.env.ANTI_BAD_WORD ||
        "false"
    ),

    isAutoReply: convertToBool(
        process.env.AUTO_REPLY || "false"
    ),

    isAutoReact: convertToBool(
        process.env.AUTO_REACT || "false"
    ),

    isWelcome: convertToBool(
        process.env.WELCOME || "false"
    ),

    isGoodbye: convertToBool(
        process.env.GOODBYE || "false"
    )
};
