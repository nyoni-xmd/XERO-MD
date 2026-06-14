global.registerCommand({
    command: "ping",
    alias: ["p"],
    desc: "Pong! Check bot response",
    category: "info",
    function: async (conn, m, store, { reply }) => {
        reply("🏓 Pong! Bot is alive.");
    }
});
