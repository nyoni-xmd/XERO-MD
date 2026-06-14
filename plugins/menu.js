// plugins/menu.js – MENU NZURI KAMA XTREME-XMD
const config = require('../config');
const moment = require('moment-timezone');

// Small caps mapping
const smallCaps = {
  "A": "ᴀ", "B": "ʙ", "C": "ᴄ", "D": "ᴅ", "E": "ᴇ", "F": "ꜰ", "G": "ɢ", "H": "ʜ",
  "I": "ɪ", "J": "ᴊ", "K": "ᴋ", "L": "ʟ", "M": "ᴍ", "N": "ɴ", "O": "ᴏ", "P": "ᴘ",
  "Q": "ǫ", "R": "ʀ", "S": "s", "T": "ᴛ", "U": "ᴜ", "V": "ᴠ", "W": "ᴡ", "X": "x",
  "Y": "ʏ", "Z": "ᴢ"
};
const toSmallCaps = (text) => text.split('').map(ch => smallCaps[ch.toUpperCase()] || ch).join('');

global.registerCommand({
    command: "menu",
    alias: ["allmenu", "help", "cmd"],
    desc: "Show all bot commands",
    category: "menu",
    react: "💫",
    filename: __filename,
    function: async (conn, m, store, { from, reply, prefix }) => {
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

            // Header
            let menuText = `*╭━━*『 XERO-MD 』
*┃* ❃ *ᴜsᴇʀ* : @${m.sender.split("@")[0]}
*┃* ❃ *ʀᴜɴᴛɪᴍᴇ* : ${uptime()}
*┃* ❃ *ᴍᴏᴅᴇ* : ${config.MODE}
*┃* ❃ *ᴘʀᴇғɪx* : [${prefix}]
*┃* ❃ *ᴩʟᴜɢɪɴ* : ${totalCommands}
*┃* ❃ *ᴅᴇᴠ* : *\`nyoni-xmd\`*
*┃* ❃ *ɴᴜᴍʙᴇʀ 1* : +255763111390
*┃* ❃ *ɴᴜᴍʙᴇʀ 2* : +255610209120
*┃* ❃ *ᴠᴇʀsɪᴏɴ* : 3.0.0
*╰────────────────❍*

`;

            // Group commands by category
            let category = {};
            for (let cmd of allCommands) {
                let cat = cmd.category || "general";
                if (!category[cat]) category[cat] = [];
                category[cat].push(cmd);
            }

            // Order of categories (you can add more)
            const catOrder = ["menu", "convert", "download", "fun", "game", "group", "info", "logo", "main", "owner", "settings", "sticker", "tools", "utility"];
            const sorted = Object.keys(category).sort((a,b) => {
                let ia = catOrder.indexOf(a), ib = catOrder.indexOf(b);
                if (ia === -1) ia = 999;
                if (ib === -1) ib = 999;
                return ia - ib;
            });

            for (let cat of sorted) {
                if (category[cat].length === 0) continue;
                menuText += `\n*╭─ 「 \`${cat.toUpperCase()} MENU\`* 」`;
                const cmds = category[cat].sort((a,b) => (a.command || "").localeCompare(b.command || ""));
                for (let c of cmds) {
                    const cmdName = c.command;
                    if (!cmdName) continue;
                    menuText += `\n*│⤷ ${prefix}${toSmallCaps(cmdName)}*`;
                }
                menuText += `\n*╰──────────────⭑━➤*`;
            }

            menuText += `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ-xᴍᴅ*
⚡ *ᴘᴏᴡᴇʀ - sᴘᴇᴇᴅ - ᴄᴏɴᴛʀᴏʟ*
🚀 *ʙᴇʏᴏɴᴅ ʟɪᴍɪᴛs*`;

            // Send with image
            await conn.sendMessage(from, {
                image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/gyaka2.png" },
                caption: menuText,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363399470975987@newsletter",
                        newsletterName: "XERO-MD",
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
