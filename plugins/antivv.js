const { cmd } = require('./command.js');
const config = require('../config');

cmd({
    pattern: "antivv",
    alias: ["antiviewonce", "savevv"],
    desc: "Manage anti-view once (save view once messages)",
    category: "settings",
    react: "🔒",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Only owner can use this command!");
        
        const action = args[0]?.toLowerCase();
        if (action === "on") {
            config.ANTI_VV = "true";
            reply("✅ *Anti View Once* ENABLED!\nBot will save view once messages and forward them.");
        } else if (action === "off") {
            config.ANTI_VV = "false";
            reply("❌ *Anti View Once* DISABLED!\nBot will not save view once messages.");
        } else {
            const current = config.ANTI_VV === "true" ? "ON" : "OFF";
            reply(`🔒 *Anti View Once*\nCurrent: ${current}\n\n.antivv on - Enable\n.antivv off - Disable`);
        }
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
