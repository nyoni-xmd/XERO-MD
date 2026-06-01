const { cmd } = require('./command.js');
const config = require('../config');

cmd({
    pattern: "allsettings",
    alias: ["settings", "config"],
    desc: "Show all bot settings",
    category: "settings",
    react: "⚙️",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Only owner can use this command!");
        
        const settings = `╭━━❍ *XERO-MD SETTINGS* ❍
┃
┃ 📌 *STATUS SETTINGS*
┃ ❍ Auto Status Seen: ${config.AUTO_STATUS_SEEN === "true" ? "✅ ON" : "❌ OFF"}
┃ ❍ Auto Status React: ${config.AUTO_STATUS_REACT === "true" ? "✅ ON" : "❌ OFF"}
┃ ❍ Auto Status Reply: ${config.AUTO_STATUS_REPLY === "true" ? "✅ ON" : "❌ OFF"}
┃ ❍ Status Reply MSG: ${config.AUTO_STATUS_MSG || "Default"}
┃
┃ 📌 *MESSAGE SETTINGS*
┃ ❍ Auto Read Msg: ${config.READ_MESSAGE === "true" ? "✅ ON" : "❌ OFF"}
┃ ❍ Auto React: ${config.AUTO_REACT === "true" ? "✅ ON" : "❌ OFF"}
┃
┃ 📌 *SECURITY SETTINGS*
┃ ❍ Anti View Once: ${config.ANTI_VV === "true" ? "✅ ON" : "❌ OFF"}
┃
┃ 📌 *PRESENCE SETTINGS*
┃ ❍ Always Online: ${config.ALWAYS_ONLINE === "true" ? "✅ ON" : "❌ OFF"}
┃
┃ 📌 *BOT SETTINGS*
┃ ❍ Bot Mode: ${config.MODE || "public"}
┃ ❍ Bot Prefix: ${config.PREFIX || "."}
┃ ❍ Bot Name: ${config.BOT_NAME || "XERO-MD"}
┃ ❍ Owner Name: ${config.OWNER_NAME || "nyoni-xmd"}
╰━━━━━━━━━━━━━━━━━━━❍

> POWERED BY nyoni-xmd`;
        
        reply(settings);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
