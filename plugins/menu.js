const config = require('../config');
const moment = require('moment-timezone');
const { cmd, commands, commandsArray } = require('../command');
const axios = require('axios');

const smallCaps = {
  "A": "ᴀ", "B": "ʙ", "C": "ᴄ", "D": "ᴅ", "E": "ᴇ", "F": "ꜰ", "G": "ɢ", "H": "ʜ",
  "I": "ɪ", "J": "ᴊ", "K": "ᴋ", "L": "ʟ", "M": "ᴍ", "N": "ɴ", "O": "ᴏ", "P": "ᴘ",
  "Q": "ǫ", "R": "ʀ", "S": "s", "T": "ᴛ", "U": "ᴜ", "V": "ᴠ", "W": "ᴡ", "X": "x",
  "Y": "ʏ", "Z": "ᴢ"
};

const toSmallCaps = (text) => {
  return text.split('').map(char => smallCaps[char.toUpperCase()] || char).join('');
};

cmd({
  pattern: "menu",
  alias: ["allmenu", "help", "cmd"],
  use: '.menu',
  desc: "Show all bot commands",
  category: "menu",
  react: "💫",
  filename: __filename
},
async (conn, mek, m, { from, reply, prefix }) => {
  try {
    // Get all commands from global
    const allCommands = global.commandsArray || [];
    const totalCommands = allCommands.length;
    
    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    // Header menu
    let menuText = `*╭━━*『 XERO-MD 』
*┃* ❃ *ᴜsᴇʀ* : @${m.sender.split("@")[0]}
*┃* ❃ *ʀᴜɴᴛɪᴍᴇ* : ${uptime()}
*┃* ❃ *ᴍᴏᴅᴇ* : ${config.MODE}
*┃* ❃ *ᴘʀᴇғɪx* : [${prefix || '.'}]
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
      if (!cmd.category) continue;
      if (!category[cmd.category]) category[cmd.category] = [];
      category[cmd.category].push(cmd);
    }

    // Sort categories
    const categoryOrder = ["menu", "convert", "download", "downloader", "fun", "game", "group", "img_edit", "info", "logo", "main", "media", "misc", "music", "other", "owner", "private", "settings", "status", "sticker", "tools", "utility"];
    
    const keys = Object.keys(category).sort((a, b) => {
      return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
    });
    
    for (let k of keys) {
      if (category[k].length === 0) continue;
      menuText += `\n*╭─ 「 \`${k.toUpperCase()} MENU\`* 」`;
      const cmds = category[k].filter(c => c.pattern).sort((a, b) => a.pattern.localeCompare(b.pattern));
      cmds.forEach((cmd) => {
        const usage = cmd.pattern.split('|')[0];
        menuText += `\n*│⤷ ${prefix || '.'}${toSmallCaps(usage)}*`;
      });
      menuText += `\n*╰──────────────⭑━➤*`;
    }

    // Send menu with image
    try {
      await conn.sendMessage(from, {
        image: { url: 'https://files.catbox.moe/gyaka2.png' },
        caption: menuText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363418161689316@newsletter',
            newsletterName: 'XERO-MD',
            serverMessageId: 143
          }
        }
      }, { quoted: mek });
    } catch (imgError) {
      // If image fails, send as text
      await conn.sendMessage(from, {
        text: menuText,
        contextInfo: { mentionedJid: [m.sender] }
      }, { quoted: mek });
    }

  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});
