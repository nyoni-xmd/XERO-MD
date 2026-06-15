global.registerCommand({
    command: "ping",
    alias: ["p"],
    desc: "Check bot response",
    category: "info",
    function: async (conn, m, { reply }) => {
        await reply(`╭┈┈❍ *XERO-MD* ❍
┊• *Pong! Bot is alive!*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
    }
});
