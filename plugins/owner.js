const { cmd } = require('./command.js');

cmd({
    pattern: "owner",
    alias: ["creator", "dev"],
    desc: "Owner info",
    category: "info",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    reply(`👑 *OWNER INFORMATION*

╭━━━━━━━━━━━━━━━╮
│ Name: nyoni-xmd
│ Number: +255763111390
│ Number 2: +255610209120
│ Bot: XERO-MD
╰━━━━━━━━━━━━━━━╯

💬 Bot is PUBLIC - Anyone can use!`);
});
