// plugins/menu.js - AUTO UPDATE MENU
const config = require('../config');

const smallCaps = {
    "A": "ᴀ", "B": "ʙ", "C": "ᴄ", "D": "ᴅ", "E": "ᴇ", "F": "ꜰ", "G": "ɢ", "H": "ʜ",
    "I": "ɪ", "J": "ᴊ", "K": "ᴋ", "L": "ʟ", "M": "ᴍ", "N": "ɴ", "O": "ᴏ", "P": "ᴘ",
    "Q": "ǫ", "R": "ʀ", "S": "s", "T": "ᴛ", "U": "ᴜ", "V": "ᴠ", "W": "ᴡ", "X": "x",
    "Y": "ʏ", "Z": "ᴢ"
};
const toSmallCaps = (text) => text.split('').map(ch => smallCaps[ch.toUpperCase()] || ch).join('');

// ✅ FIX: Ensure global.commandsList always exists before any plugin loads
if (!global.commandsList) global.commandsList = [];

// ✅ FIX: Wrap registerCommand to auto-push every command into commandsList
const _originalRegister = global.registerCommand.bind(global);
global.registerCommand = (cmdObj) => {
    // Push to commandsList if not already there (avoid duplicates on hot-reload)
    const exists = global.commandsList.some(c => c.command === cmdObj.command);
    if (!exists) {
        global.commandsList.push(cmdObj);
    }
    // Still call the original so the command actually works
    return _originalRegister(cmdObj);
};

global.registerCommand({
    command: "menu",
    alias: ["help", "cmd"],
    desc: "Show all bot commands",
    category: "menu",
    function: async (conn, m, { from, reply, prefix, sender }) => {
        try {
            // ✅ FIX: Fallback — also scan global.commands if commandsList is still short
            let allCommands = global.commandsList || [];

            // Some bots store commands in global.commands as a Map or Object
            if (global.commands) {
                if (global.commands instanceof Map) {
                    for (let [, cmd] of global.commands) {
                        if (!allCommands.some(c => c.command === cmd.command)) {
                            allCommands.push(cmd);
                        }
                    }
                } else if (typeof global.commands === 'object') {
                    for (let key in global.commands) {
                        const cmd = global.commands[key];
                        if (cmd && !allCommands.some(c => c.command === cmd.command)) {
                            allCommands.push(cmd);
                        }
                    }
                }
            }

            const totalCommands = allCommands.length;

            const uptime = () => {
                let sec = process.uptime();
                let h = Math.floor(sec / 3600);
                let min = Math.floor((sec % 3600) / 60);
                let s = Math.floor(sec % 60);
                return `${h}h ${min}m ${s}s`;
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
*┃* ❃ *ᴍᴏᴅᴇ* : ${config.MODE || 'public'}
*┃* ❃ *ᴘʀᴇғɪx* : [${prefix}]
*┃* ❃ *ᴩʟᴜɢɪɴ* : ${totalCommands}
*┃* ❃ *ᴅᴇᴠ* : *nyoni-xmd*
*┃* ❃ *ɴᴜᴍʙᴇʀ 1* : +255763111390
*┃* ❃ *ɴᴜᴍʙᴇʀ 2* : +255610209120
*┃* ❃ *ᴠᴇʀsɪᴏɴ* : 3.0.0
*╰────────────────❍*

`;

            // Group by category
            let categoryMap = {};
            for (let cmd of allCommands) {
                // ✅ FIX: Skip entries with no command name (avoids blank lines)
                if (!cmd || !cmd.command) continue;
                let cat = (cmd.category || "general").toLowerCase().trim();
                if (!categoryMap[cat]) categoryMap[cat] = [];
                // ✅ FIX: Skip duplicate command names within same category
                if (!categoryMap[cat].some(c => c.command === cmd.command)) {
                    categoryMap[cat].push(cmd);
                }
            }

            const categoryOrder = [
                "menu", "info", "tools", "group", "convert", "download",
                "fun", "game", "logo", "owner", "settings", "sticker",
                "utility", "general"
            ];

            const sortedCategories = Object.keys(categoryMap).sort((a, b) => {
                let ia = categoryOrder.indexOf(a);
                let ib = categoryOrder.indexOf(b);
                if (ia === -1) ia = 999;
                if (ib === -1) ib = 999;
                return ia - ib;
            });

            for (let cat of sortedCategories) {
                if (!categoryMap[cat] || categoryMap[cat].length === 0) continue;
                menuText += `\n*╭─ 「 \`${cat.toUpperCase()} MENU\`* 」`;
                const cmds = categoryMap[cat].sort((a, b) => (a.command || "").localeCompare(b.command || ""));
                for (let c of cmds) {
                    menuText += `\n*│⤷ ${prefix}${toSmallCaps(c.command)}*`;
                }
                menuText += `\n*╰──────────────⭑━➤*`;
            }

            menuText += `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ-xᴍᴅ*
⚡ *ᴘᴏᴡᴇʀ - sᴘᴇᴇᴅ - ᴄᴏɴᴛʀᴏʟ*
🚀 *ʙᴇʏᴏɴᴅ ʟɪᴍɪᴛs*`;

            await conn.sendMessage(from, {
                image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/gyaka2.png" },
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
            console.error('[MENU ERROR]', e);
            reply(`❌ Menu error: ${e.message}`);
        }
    }
});
