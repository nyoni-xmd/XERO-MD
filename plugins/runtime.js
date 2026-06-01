const { cmd } = require('./command.js');

cmd({
    pattern: "runtime",
    alias: ["uptime"],
    desc: "Bot uptime",
    category: "info",
    react: "⏰",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    const runtime = process.uptime();
    const hours = Math.floor(runtime / 3600);
    const minutes = Math.floor((runtime % 3600) / 60);
    const seconds = Math.floor(runtime % 60);
    reply(`⏰ *BOT UPTIME*\n\n🕐 ${hours}h ${minutes}m ${seconds}s`);
});
