const { cmd } = require('./command.js');
const config = require('../config');

cmd({
    pattern: "online",
    alias: ["alwaysonline", "presence"],
    desc: "Manage always online status",
    category: "settings",
    react: "🟢",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Only owner can use this command!");
        
        const action = args[0]?.toLowerCase();
        if (action === "on") {
            config.ALWAYS_ONLINE = "true";
            reply("✅ *Always Online* ENABLED!\nBot will appear online 24/7.");
            // Set presence to available
            await conn.sendPresenceUpdate('available');
        } else if (action === "off") {
            config.ALWAYS_ONLINE = "false";
            reply("❌ *Always Online* DISABLED!\nBot will show normal presence.");
            // Set presence to unavailable
            await conn.sendPresenceUpdate('unavailable');
        } else {
            const current = config.ALWAYS_ONLINE === "true" ? "ON" : "OFF";
            reply(`🟢 *Always Online Status*\nCurrent: ${current}\n\n.online on - Enable\n.online off - Disable`);
        }
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
