global.registerCommand({
    command: "ping",
    alias: ["p"],
    desc: "Check bot response",
    category: "info",
    function: async (conn, m, { reply }) => {
        reply("🏓 Pong! Bot is alive and responding.");
    }
});
