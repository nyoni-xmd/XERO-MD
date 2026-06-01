const { cmd } = require('./command.js');

cmd({
    pattern: "say",
    alias: ["echo"],
    desc: "Bot repeats your message",
    category: "fun",
    react: "📢",
    filename: __filename
}, async (conn, mek, m, { reply, q, isOwner }) => {
    if (!q) return reply("What should I say?");
    reply(q);
});
