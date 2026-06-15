// plugins/speed.js
global.registerCommand({
    command: "speed",
    alias: ["sp", "test"],
    desc: "Test bot speed and memory usage",
    category: "info",
    function: async (conn, m, { reply }) => {
        const start = Date.now();
        const mem = process.memoryUsage();
        const toMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);
        const msg = await reply("⏱️ Testing...");
        const speed = Date.now() - start;

        await conn.sendMessage(m.key.remoteJid, {
            text: `╭┈┈❍ *XERO-MD* ❍
┊• *Speed* : ${speed}ms
┊• *RAM Used* : ${toMB(mem.heapUsed)} MB
┊• *RAM Total* : ${toMB(mem.heapTotal)} MB
┊• *External* : ${toMB(mem.external)} MB
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363399470975987@newsletter',
                    newsletterName: 'XERO-MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: msg });
    }
});
