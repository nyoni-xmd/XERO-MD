const { cmd } = require("../command");

cmd({
    pattern: "ping",
    alias: ["pong", "latency"],
    desc: "Check bot response time (latency)",
    category: "utility",
    react: "🏓",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    const start = Date.now();
    await reply("🏓 Pinging...");
    const end = Date.now();
    const latency = end - start;
    reply(`🏓 *Pong!*\n📡 Latency: ${latency}ms\n⚡ Bot is alive and fast.`);
});
