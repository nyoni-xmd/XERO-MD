const config = require('../config');
const { cmd } = require('../command'); // ✅ Badala ya DianaTech
const { runtime } = require('../lib/functions');

cmd({
    pattern: "tagall",
    react: "🔊",
    alias: ["gc_tagall"],
    desc: "Tag all group members",
    category: "group",
    use: '.tagall [message]',
    filename: __filename
},
async (conn, mek, m, { from, reply, isGroup, isAdmins, isCreator, command, body }) => {
    try {
        if (!isGroup) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *GROUP ONLY COMMAND*");
        }

        if (!isAdmins && !isCreator) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *ADMIN ONLY COMMAND*");
        }

        // 📌 Get group data properly
        let groupMetadata = await conn.groupMetadata(from);
        let groupName = groupMetadata.subject;
        let participants = groupMetadata.participants;
        let totalMembers = participants.length;

        const botName = "XERO-MD"; // ✅ Changed to XERO-MD

        // 🔥 Style Packs
        const emojis = ['🔥','⚡','🚀','💎','👑','🌟','💥','🎯','🛡️','📢','🌀','✨'];
        const lines = ['━','─','═','▭','▰','⬣'];
        const line = lines[Math.floor(Math.random() * lines.length)];

        // 📝 Safe message
        let message = body ? body.replace(command, '').trim() : '';
        if (!message) message = "🚨 Attention Everyone";

        // 💎 Header
        let teks = `
╔${line.repeat(5)}〔 👑 ${botName} 👑 〕${line.repeat(5)}╗
║ 🏷️ *GROUP:* ${groupName}
║ 👥 *MEMBERS:* ${totalMembers}
║ 💬 *MESSAGE:* ${message}
╚${line.repeat(15)}╝

┏━━━〔 🔊 TAG ALL MEMBERS 〕━━━┓
`;

        // 👥 Mentions
        for (let mem of participants) {
            if (!mem.id) continue;
            let randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            teks += `┃ ${randomEmoji} *HI* @${mem.id.split('@')[0]}\n`;
        }

        teks += `┗${line.repeat(20)}┛
✨ POWERED BY ${botName} ⚡`;

        // 🖼️ Send message with XERO-MD image (or fallback to config.MENU_IMAGE_URL)
        let imageUrl = config.MENU_IMAGE_URL || "https://files.catbox.moe/gyaka2.png";
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: teks,
            mentions: participants.map(a => a.id)
        }, { quoted: mek });

    } catch (e) {
        console.error("TagAll Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
