const { cmd } = require("../command");
const config = require("../config");
const { runtime } = require("../lib/functions");
const fs = require("fs");
const path = require("path");

// Image ya XERO-MD (unaeza badilisha)
const MENU_IMAGE = "https://files.catbox.moe/gyaka2.png";

cmd({
    pattern: "menu",
    alias: ["help", "cmds", "allmenu"],
    desc: "Show full menu with all commands",
    category: "menu",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply, prefix }) => {
    try {
        const uptime = runtime(process.uptime());
        const pluginCount = fs.readdirSync("./plugins").filter(f => f.endsWith(".js")).length;
        
        const menuText = `*╭━━*『 XERO-MD 』
*┃* ❃ *ᴜsᴇʀ* : @${pushname || m.pushName || "User"}
*┃* ❃ *ʀᴜɴᴛɪᴍᴇ* : ${uptime}
*┃* ❃ *ᴍᴏᴅᴇ* : ${config.MODE}
*┃* ❃ *ᴘʀᴇғɪx* : [${config.PREFIX}]
*┃* ❃ *ᴩʟᴜɢɪɴ* : ${pluginCount}
*┃* ❃ *ᴅᴇᴠ* : *\`NYONI XMD\`*
*┃* ❃ *ᴠᴇʀsɪᴏɴs* : 2.0.0
*╰────────────────❍*

*╭─ 「 \`CONVERT MENU\`* 」
*│⤷ .ᴛᴏᴜʀʟ*
*│⤷ .sᴛɪᴄᴋᴇʀ*
*│⤷ .ʀᴇɴᴀᴍᴇ*
*╰──────────────⭑━➤*

*╭─ 「 \`DOWNLOADER MENU\`* 」
*│⤷ .ᴍᴘ4*
*│⤷ .ᴍᴘ3*
*│⤷ .ᴛɪᴋᴛᴏᴋ*
*│⤷ .ꜰʙ*
*│⤷ .ɪɴsᴛᴀɢʀᴀᴍ*
*│⤷ .ᴛᴡɪᴛᴛᴇʀ*
*│⤷ .ɢᴅʀɪᴠᴇ*
*│⤷ .ᴀᴘᴋ*
*╰──────────────⭑━➤*

*╭─ 「 \`GROUP MENU\`* 」
*│⤷ .ʟɪɴᴋɢʀᴏᴜᴘ*
*│⤷ .ᴋɪᴄᴋ*
*│⤷ .ᴀᴅᴅ*
*│⤷ .ᴘʀᴏᴍᴏᴛᴇ*
*│⤷ .ᴅᴇᴍᴏᴛᴇ*
*│⤷ .ᴍᴜᴛᴇ*
*│⤷ .ᴜɴᴍᴜᴛᴇ*
*│⤷ .ᴛᴀɢᴀʟʟ*
*│⤷ .ᴛᴀɢᴀᴅᴍɪɴ*
*╰──────────────⭑━➤*

*╭─ 「 \`STICKER MENU\`* 」
*│⤷ .sᴛɪᴄᴋᴇʀ*
*│⤷ .ʀᴇɴᴀᴍᴇ*
*│⤷ .sᴍᴇᴍᴇ*
*╰──────────────⭑━➤*

*╭─ 「 \`FUN MENU\`* 」
*│⤷ .ꜰᴀɴᴄʏ*
*│⤷ .ᴄᴏᴜᴘʟᴇᴘᴘ*
*│⤷ .ʜᴜɢ*
*│⤷ .ᴋɪss*
*│⤷ .ꜰᴜɴɴʏᴘɪᴄs*
*╰──────────────⭑━➤*

*╭─ 「 \`TOOLS MENU\`* 」
*│⤷ .ᴘɪɴɢ*
*│⤷ .ᴜᴘᴛɪᴍᴇ*
*│⤷ .ɢɪᴛʜᴜʙ*
*│⤷ .ᴛᴛs*
*│⤷ .ᴡᴇᴀᴛʜᴇʀ*
*│⤷ .ɢᴇᴛᴘᴘ*
*╰──────────────⭑━➤*

*╭─ 「 \`INFO MENU\`* 」
*│⤷ .ᴀʟɪᴠᴇ*
*│⤷ .ᴏᴡɴᴇʀ*
*│⤷ .ᴠᴇʀsɪᴏɴ*
*│⤷ .ʀᴇᴘᴏ*
*╰──────────────⭑━➤*

*╭─ 「 \`OWNER MENU\`* 」
*│⤷ .ʙʀᴏᴀᴅᴄᴀsᴛ*
*│⤷ .sʜᴜᴛᴅᴏᴡɴ*
*│⤷ .ʀᴇsᴛᴀʀᴛ*
*│⤷ .ʀᴇᴘᴏʀᴛ*
*│⤷ .ᴜᴘᴅᴀᴛᴇ*
*╰──────────────⭑━➤*

*╭─ 「 \`UTILITY MENU\`* 」
*│⤷ .ᴅᴇꜰɪɴᴇ*
*│⤷ .ᴛʀᴀɴsʟᴀᴛᴇ*
*│⤷ .ꜰᴇᴛᴄʜ*
*│⤷ .ᴡᴇʙ*
*│⤷ .ss*
*╰──────────────⭑━➤*

*╭─ 「 \`OTHER MENU\`* 」
*│⤷ .ᴍᴇɴᴜ*
*│⤷ .ᴘɪɴɢ*
*│⤷ .ᴀʟɪᴠᴇ*
*│⤷ .ᴏᴡɴᴇʀ*
*╰──────────────⭑━➤*

> *⚡ XERO-MD • ᴘᴏᴡᴇʀᴇᴅ ʙʏ NYONI XMD*`;

        await conn.sendMessage(from, {
            image: { url: MENU_IMAGE },
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363418161689316@newsletter",
                    newsletterName: "XERO-MD",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
        
    } catch (error) {
        console.error("Menu error:", error);
        reply("❌ Menu generation failed");
    }
});
