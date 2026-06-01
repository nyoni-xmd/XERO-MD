const { cmd } = require('./command.js');
const config = require('../config');

cmd({
    pattern: "react",
    desc: "Manage auto status reactions",
    category: "status",
    react: "❤️",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Only owner can use this command!");
        
        const action = args[0]?.toLowerCase();
        if (action === "on") {
            config.AUTO_STATUS_REACT = "true";
            reply("✅ *Auto Status React* ENABLED!\nBot will automatically react to status updates with random emojis.");
        } else if (action === "off") {
            config.AUTO_STATUS_REACT = "false";
            reply("❌ *Auto Status React* DISABLED!\nBot will not react to status updates.");
        }
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// Set custom reaction emojis
cmd({
    pattern: "setreact",
    desc: "Set custom reaction emojis for status",
    category: "status",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, reply, q, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Only owner can use this command!");
        if (!q) return reply("Example: .setreact ❤️,🔥,💯,✨,⭐");
        
        config.CUSTOM_REACT_EMOJIS = q;
        reply(`✅ Custom reaction emojis set to: ${q}`);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
