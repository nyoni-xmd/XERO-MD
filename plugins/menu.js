const config = require('../config');
const moment = require('moment-timezone');
const { commands } = require('../lib/functions');

const smallCaps = {
  "A": "ᴀ", "B": "ʙ", "C": "ᴄ", "D": "ᴅ", "E": "ᴇ", "F": "ꜰ", "G": "ɢ", "H": "ʜ",
  "I": "ɪ", "J": "ᴊ", "K": "ᴋ", "L": "ʟ", "M": "ᴍ", "N": "ɴ", "O": "ᴏ", "P": "ᴘ",
  "Q": "ǫ", "R": "ʀ", "S": "s", "T": "ᴛ", "U": "ᴜ", "V": "ᴠ", "W": "ᴡ", "X": "x",
  "Y": "ʏ", "Z": "ᴢ"
};
const toSmallCaps = (text) => text.split('').map(ch => smallCaps[ch.toUpperCase()] || ch).join('');

cmd({
  pattern: "menu",
  alias: ["allmenu", "help", "cmd"],
  desc: "Show all bot commands",
  category: "menu",
  react: "💫",
  filename: __filename
}, async (conn, mek, m, { from, reply, prefix }) => {
  try {
    const allCommands = global.commandsArray || [];
    const totalCommands = allCommands.length;
    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };
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
    let category = {};
    for (let cmd of allCommands) {
      let cat = cmd.category || "general";
      if (!category[cat]) category[cat] = [];
      category[cat].push(cmd);
    }
    const categoryOrder = ["convert","download","downloader","fun","game","group","img_edit","info","logo","main","media","menu","misc","music","other","owner","private","settings","status","sticker","tools","utility"];
    const sortedKeys = Object.keys(category).sort((a,b) => {
      let ia = categoryOrder.indexOf(a), ib = categoryOrder.indexOf(b);
      if (ia === -1) ia = 999; if (ib === -1) ib = 999;
      return ia - ib;
    });
    for (let k of sortedKeys) {
      if (category[k].length === 0) continue;
      menuText += `\n*╭─ 「 \`${k.toUpperCase()} MENU\`* 」`;
      const cmds = category[k].sort((a,b) => (a.pattern || "").localeCompare(b.pattern || ""));
      for (let cmd of cmds) {
        const cmdName = cmd.pattern || cmd.command;
        if (!cmdName) continue;
        menuText += `\n*│⤷ ${prefix}${toSmallCaps(cmdName)}*`;
      }
      menuText += `\n*╰──────────────⭑━➤*`;
    }
    menuText += `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴʏᴏɴɪ-xᴍᴅ*
⚡ *ᴘᴏᴡᴇʀ - sᴘᴇᴇᴅ - ᴄᴏɴᴛʀᴏʟ*
🚀 *ʙᴇʏᴏɴᴅ ʟɪᴍɪᴛs*`;
    await conn.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/gyaka2.png" },
      caption: menuText,
      contextInfo: { mentionedJid: [m.sender], forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: "120363399470975987@newsletter", newsletterName: "XERO-MD", serverMessageId: 143 } }
    }, { quoted: mek });
  } catch (e) { reply(`❌ Error: ${e.message}`); }
});
