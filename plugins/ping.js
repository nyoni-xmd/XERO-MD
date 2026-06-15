// plugins/ping.js
global.registerCommand({
    command: "ping",
    alias: ["p"],
    desc: "Check bot response",
    category: "info",
    function: async (conn, m, { reply }) => {
        const start = Date.now();
        const msg = await reply("🏓");
        const end = Date.now();
        const ping = end - start;
        
        await conn.sendMessage(m.key.remoteJid, {
            text: `╭┈┈❍ *XERO-MD* ❍
┊• *Pong!* : ${ping}ms
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
