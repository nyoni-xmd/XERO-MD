// plugins/ping.js
global.registerCommand({
    command: "ping",
    alias: ["p"],
    desc: "Check bot response",
    category: "info",
    function: async (conn, m, { reply }) => {
        await reply("🏓 Pong! Bot is alive and responding.");
    }
});
