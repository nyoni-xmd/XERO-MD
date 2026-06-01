const { cmd } = require('./command.js');

cmd({
    pattern: "alive",
    desc: "Check bot status",
    category: "info",
    react: "✨",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    reply(`✨ XERO-MD is alive and running! ✨

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS

✅ Mode: PUBLIC - Everyone can use`);
});
