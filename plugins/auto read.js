const { cmd } = require('./command.js');
const config = require('../config');

cmd({
    pattern: "autoread",
    alias: ["readmsg"],
    desc: "Manage auto read messages",
    category: "settings",
    react: "📖",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Only owner can use this command!");
        
        const action = args[0]?.toLowerCase();
        if (action === "on") {
            config.READ_MESSAGE = "true";
            reply("✅ *Auto Read Messages* ENABLED!\nBot will automatically mark messages as read.");
        } else if (action === "off") {
            config.READ_MESSAGE = "false";
            reply("❌ *Auto Read Messages* DISABLED!\nBot will not mark messages as read.");
        } else {
            const current = config.READ_MESSAGE === "true" ? "ON" : "OFF";
            reply(`📖 *Auto Read Settings*\nCurrent: ${current}\n\n.autoread on - Enable\n.autoread off - Disable`);
        }
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
