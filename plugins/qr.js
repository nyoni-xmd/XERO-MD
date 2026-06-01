const { cmd } = require('./command.js');
const QRCode = require('qrcode');

cmd({
    pattern: "qr",
    desc: "Generate QR code from text",
    category: "tools",
    react: "📱",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("Example: .qr https://xero-md.com");
        const qrBuffer = await QRCode.toBuffer(q);
        await conn.sendMessage(from, { image: qrBuffer, caption: `QR Code for: ${q}` }, { quoted: mek });
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
