const { cmd } = require('./command.js');
const config = require('../config');

cmd({
    pattern: "autoreact",
    desc: "Manage auto react on all messages",
    category: "settings",
    react: "😊",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Only owner can use this command!");
        
        const action = args[0]?.toLowerCase();
        if (action === "on") {
            config.AUTO_REACT = "true";
            reply("✅ *Auto React* ENABLED!\nBot will automatically react to all messages with random emojis.");
        } else if (action === "off") {
            config.AUTO_REACT = "false";
            reply("❌ *Auto React* DISABLED!\nBot will not react to messages.");
        } else {
            const current = config.AUTO_REACT === "true" ? "ON" : "OFF";
            reply(`😊 *Auto React Settings*\nCurrent: ${current}\n\n.autoreact on - Enable\n.autoreact off - Disable`);
        }
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
