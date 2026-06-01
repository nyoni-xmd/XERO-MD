const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "owner",
    react: "✅", 
    desc: "Get owner number",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from, reply }) => {
    try {
        const ownerNumber1 = "255763111390";
        const ownerNumber2 = "255610209120";
        const ownerName = "nyoni-xmd";

        // VCard for first owner
        const vcard1 = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName} (Owner 1)\n` +  
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber1}:+${ownerNumber1}\n` + 
                      'END:VCARD';

        // VCard for second owner
        const vcard2 = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName} (Owner 2)\n` +  
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber2}:+${ownerNumber2}\n` + 
                      'END:VCARD';

        // Send both vCards
        await conn.sendMessage(from, {
            contacts: {
                displayName: `${ownerName} (Owners)`,
                contacts: [
                    { vcard: vcard1 },
                    { vcard: vcard2 }
                ]
            }
        });

        // Send the owner contact message with new image
        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/ni9ns1.png' },
            caption: `╭━━━━━━━━━━━━━━━━━━╮
│    *XERO-MD OWNER*
╰━━━━━━━━━━━━━━━━━━╯

╭─〔 CONTACT 〕─╮
│ 👑 *NAME* : ${ownerName}
│ 📞 *NUMBER 1* : +${ownerNumber1}
│ 📞 *NUMBER 2* : +${ownerNumber2}
│ 🤖 *BOT* : XERO-MD
│ ⚡ *VERSION* : 3.0.0
╰───────────────╯

╭─〔 INFO 〕─╮
│ 💬 *Feel free to contact*
│ 📨 *For support or queries*
│ ⭐ *Owner is online 24/7*
╰─────────────╯

> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`,
            contextInfo: {
                mentionedJid: [`${ownerNumber1}@s.whatsapp.net`, `${ownerNumber2}@s.whatsapp.net`], 
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363418161689316@newsletter',
                    newsletterName: 'XERO-MD',
                    serverMessageId: 143
                }            
            }
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply(`❌ An error occurred: ${error.message}`);
    }
});
