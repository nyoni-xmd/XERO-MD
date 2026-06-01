const { cmd } = require('./command.js');
const config = require('../config');

cmd({
    pattern: "status",
    alias: ["viewstatus", "seenstatus"],
    desc: "View and react to status updates automatically",
    category: "status",
    react: "👁️",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Only owner can use this command!");
        
        const currentStatus = config.AUTO_STATUS_SEEN === "true" ? "ON" : "OFF";
        const currentReact = config.AUTO_STATUS_REACT === "true" ? "ON" : "OFF";
        const currentReply = config.AUTO_STATUS_REPLY === "true" ? "ON" : "OFF";
        
        const statusInfo = `╭━━❍ *STATUS SETTINGS* ❍
┃ ❍ *AUTO STATUS SEEN* : ${currentStatus}
┃ ❍ *AUTO STATUS REACT* : ${currentReact}
┃ ❍ *AUTO STATUS REPLY* : ${currentReply}
┃ ❍ *STATUS REPLY MSG* : ${config.AUTO_STATUS_MSG || "Seen your status!"}
╰━━━━━━━━━━━━━━━━━━━❍

╭─〔 COMMANDS 〕─╮
│ • .status on - Enable auto status seen
│ • .status off - Disable auto status seen
│ • .react on - Enable auto status react
│ • .react off - Disable auto status react
│ • .reply on - Enable auto status reply
│ • .reply off - Disable auto status reply
│ • .setreply <text> - Set status reply message
╰───────────────╯

> POWERED BY nyoni-xmd`;
        
        reply(statusInfo);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Enable/Disable auto status seen
cmd({
    pattern: "status",
    alias: ["autoseen"],
    desc: "Enable/disable auto status seen",
    category: "status",
    react: "👁️",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Only owner can use this command!");
        
        const action = args[0]?.toLowerCase();
        if (action === "on") {
            config.AUTO_STATUS_SEEN = "true";
            reply("✅ *Auto Status Seen* ENABLED!\nBot will automatically view all status updates.");
        } else if (action === "off") {
            config.AUTO_STATUS_SEEN = "false";
            reply("❌ *Auto Status Seen* DISABLED!\nBot will not view status updates.");
        }
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
