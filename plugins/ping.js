const { cmd } = require('./command.js');

cmd({
    pattern: "ping",
    desc: "Check bot response",
    category: "info",
    react: "🏓",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    reply('🏓 Pong! Bot is alive ✅');
});
