const { cmd } = require('./command.js');
const config = require('../config');

cmd({
    pattern: "setreply",
    desc: "Set custom status reply message",
    category: "status",
    react: "💬",
    filename: __filename
}, async (conn, mek, m, { from, reply, q, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ Only owner can use this command!");
        if (!q) return reply("Example: .setreply Thanks for the status update!");
        
        config.AUTO_STATUS_MSG = q;
        reply(`✅ Status reply message set to:\n\n"${q}"`);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
