global.registerCommand({
    command: "runtime",
    alias: ["uptime"],
    desc: "Bot uptime",
    category: "info",
    function: async (conn, m, { reply }) => {
        const u = process.uptime();
        const hours = Math.floor(u / 3600);
        const minutes = Math.floor((u % 3600) / 60);
        const seconds = Math.floor(u % 60);
        reply(`⏰ *BOT UPTIME*\n┈────────────┈\n🕐 ${hours}h ${minutes}m ${seconds}s`);
    }
});
