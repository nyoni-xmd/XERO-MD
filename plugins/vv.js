// plugins/vv.js
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function downloadMedia(msg) {
    const stream = await downloadContentFromMessage(msg, msg.mimetype?.split('/')[0] || 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}

global.registerCommand({
    command: "vv",
    alias: ["viewonce"],
    desc: "Open view once message",
    category: "tools",
    function: async (conn, m, { from, reply, quoted }) => {
        if (!quoted) return reply("❌ Reply to a view once message.");
        
        let msg = quoted.message;
        if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;
        
        if (msg.imageMessage) {
            let buffer = await downloadMedia(msg.imageMessage);
            await conn.sendMessage(from, { image: buffer, caption: "🔓 View once opened!" }, { quoted: m });
        } else if (msg.videoMessage) {
            let buffer = await downloadMedia(msg.videoMessage);
            await conn.sendMessage(from, { video: buffer, caption: "🔓 View once opened!" }, { quoted: m });
        } else {
            reply("❌ Not a view once message (image/video only).");
        }
    }
});
