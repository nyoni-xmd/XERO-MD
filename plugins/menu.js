global.registerCommand({
    command: "menu",
    alias: ["help", "cmd"],
    desc: "Show all bot commands",
    category: "menu",
    function: async (conn, m, { from, reply, prefix, sender }) => {
        try {
            const allCommands = global.commandsList || [];
            const totalCommands = allCommands.length;
            
            const uptime = () => {
                let sec = process.uptime();
                let h = Math.floor(sec / 3600);
                let m = Math.floor((sec % 3600) / 60);
                let s = Math.floor(sec % 60);
                return `${h}h ${m}m ${s}s`;
            };

            let senderNumber = "User";
            if (sender) {
                senderNumber = sender.split('@')[0];
            } else if (m.sender) {
                senderNumber = m.sender.split('@')[0];
            }

            let menuText = `*╭━━*『 XERO-MD 』
*┃* ❃ *ᴜsᴇʀ* : @${senderNumber}
*┃* ❃ *ʀᴜɴᴛɪᴍᴇ* : ${uptime()}
*┃* ❃ *ᴍᴏᴅᴇ* : public
*┃* ❃ *ᴘʀᴇғɪx* : [${prefix}]
*┃* ❃ *ᴩʟᴜɢɪɴ* : ${totalCommands}
*┃* ❃ *ᴅᴇᴠ* : *nyoni-xmd*
*┃* ❃ *ɴᴜᴍʙᴇʀ 1* : +255763111390
*┃* ❃ *ɴᴜᴍʙᴇʀ 2* : +255610209120
*┃* ❃ *ᴠᴇʀsɪᴏɴ* : 3.0.0
*╰────────────────❍*

*╭─ 「 MAIN MENU 」*
*│⤷ ${prefix}menu - Show menu*
*│⤷ ${prefix}ping - Check bot*
*│⤷ ${prefix}alive - Bot status*
*│⤷ ${prefix}owner - Owner info*
*│⤷ ${prefix}runtime - Bot uptime*
*│⤷ ${prefix}getpp - Get profile pic*
*│⤷ ${prefix}vv - Open view once*
*╰──────────────⭑━➤*

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ-xᴍᴅ*
⚡ *ᴘᴏᴡᴇʀ - sᴘᴇᴇᴅ - ᴄᴏɴᴛʀᴏʟ*
🚀 *ʙᴇʏᴏɴᴅ ʟɪᴍɪᴛs*`;

            await conn.sendMessage(from, {
                image: { url: 'https://files.catbox.moe/gyaka2.png' },
                caption: menuText,
                contextInfo: {
                    mentionedJid: [`${senderNumber}@s.whatsapp.net`],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363399470975987@newsletter',
                        newsletterName: 'XERO-MD',
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });
        } catch (e) {
            console.error(e);
            reply(`❌ Error: ${e.message}`);
        }
    }
});
