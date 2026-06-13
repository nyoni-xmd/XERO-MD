const { cmd } = require('../lib/functions');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
cmd({ pattern: "vv", alias: ["viewonce"], desc: "Open view once", category: "tools", react: "🔓", filename: __filename }, async (conn, mek, m, { from, reply, quoted }) => {
    if (!quoted) return reply("Reply to a view once message.");
    let msg = quoted.message;
    if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;
    if (msg.imageMessage) {
        let buf = await downloadMediaMessage(msg.imageMessage);
        await conn.sendMessage(from, { image: buf, caption: "Opened view once" }, { quoted: mek });
    } else if (msg.videoMessage) {
        let buf = await downloadMediaMessage(msg.videoMessage);
        await conn.sendMessage(from, { video: buf }, { quoted: mek });
    } else reply("Not a view once media.");
});
