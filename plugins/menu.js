const { cmd } = require('./command.js');
const config = require('../config');
const moment = require('moment-timezone');

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
    // Get commands from global
    const commandsList = global.commandsArray || [];
    const totalCommands = commandsList.length;
    
    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    let menuText = `╭━━━━━━━━━━━━━━━━━━╮
│   *XERO-MD MENU*
╰━━━━━━━━━━━━━━━━━━╯

╭─〔 BOT INFO 〕─╮
│ 👤 USER: @${m.sender.split("@")[0]}
│ ⏱️ RUNTIME: ${uptime()}
│ 📳 MODE: ${config.MODE || 'public'}
│ 🔧 PREFIX: ${prefix || '.'}
│ 📦 PLUGINS: ${totalCommands}
│ 👨‍💻 DEV: nyoni-xmd
│ 📞 NUMBER 1: +255763111390
│ 📞 NUMBER 2: +255610209120
│ 🔢 VERSION: 3.0.0
╰───────────────╯

`;

    // Group commands by category
    let category = {};
    for (let cmd of commandsList) {
      if (!cmd.category) continue;
      if (!category[cmd.category]) category[cmd.category] = [];
      category[cmd.category].push(cmd);
    }

    const keys = Object.keys(category).sort();
    for (let k of keys) {
      menuText += `\n╭─ 「 ${k.toUpperCase()} 」─╮`;
      const cmds = category[k].filter(c => c.pattern);
      cmds.forEach((cmd) => {
        const usage = cmd.pattern.split('|')[0];
        menuText += `\n│ ⤷ ${prefix || '.'}${usage}`;
      });
      menuText += `\n╰───────────────╯`;
    }

    menuText += `\n\n> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`;

    await conn.sendMessage(from, {
      image: { url: 'https://files.catbox.moe/gyaka2.png' },
      caption: menuText,
      contextInfo: {
        mentionedJid: [m.sender]
      }
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});
