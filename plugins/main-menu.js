const config = require('../config');
const moment = require('moment-timezone');
const { cmd, commands } = require('../command');
const axios = require('axios');

const smallCaps = {
  "A": "ᴀ",
  "B": "ʙ",
  "C": "ᴄ",
  "D": "ᴅ",
  "E": "ᴇ",
  "F": "ꜰ",
  "G": "ɢ",
  "H": "ʜ",
  "I": "ɪ",
  "J": "ᴊ",
  "K": "ᴋ",
  "L": "ʟ",
  "M": "ᴍ",
  "N": "ɴ",
  "O": "ᴏ",
  "P": "ᴘ",
  "Q": "ǫ",
  "R": "ʀ",
  "S": "s",
  "T": "ᴛ",
  "U": "ᴜ",
  "V": "ᴠ",
  "W": "ᴡ",
  "X": "x",
  "Y": "ʏ",
  "Z": "ᴢ"
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
async (conn, mek, m, { from, reply }) => {
  try {
    const totalCommands = commands.length;
    const date = moment().tz("Africa/Dar_es_Salaam").format("dddd, DD MMMM YYYY");

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
*┃* ❃ *ᴘʀᴇғɪx* : [${config.PREFIX}]
*┃* ❃ *ᴩʟᴜɢɪɴ* : ${totalCommands}
*┃* ❃ *ᴅᴇᴠ* : *\`nyoni-xmd\`*
*┃* ❃ *ɴᴜᴍʙᴇʀ 1* : +255763111390
*┃* ❃ *ɴᴜᴍʙᴇʀ 2* : +255610209120
*┃* ❃ *ᴠᴇʀsɪᴏɴ* : 3.0.0
*╰────────────────❍*

`;

    let category = {};
    for (let cmd of commands) {
      if (!cmd.category) continue;
      if (!category[cmd.category]) category[cmd.category] = [];
      category[cmd.category].push(cmd);
    }

    const keys = Object.keys(category).sort();
    for (let k of keys) {
      menuText += `\n*╭─ 「 \`${k.toUpperCase()} MENU\`* 」`;
      const cmds = category[k].filter(c => c.pattern).sort((a, b) => a.pattern.localeCompare(b.pattern));
      cmds.forEach((cmd) => {
        const usage = cmd.pattern.split('|')[0];
        menuText += `\n*│⤷ ${config.PREFIX}${toSmallCaps(usage)}*`;
      });
      menuText += `\n*╰──────────────⭑━➤*`;
    }

    // IMAGE URL - USE RELIABLE IMAGE HOSTING
    const imageUrl = 'https://files.catbox.moe/gyaka2.png';
    
    // Alternative images in case first fails
    const backupImages = [
      'https://telegra.ph/file/8b2b8e4e5c5e5c5e5c5e5.png',
      'https://files.catbox.moe/gyaka2.png'
    ];

    // Try to send with image
    try {
      // Download and verify image first
      const imageCheck = await axios.get(imageUrl, { timeout: 5000 });
      if (imageCheck.status === 200) {
        await conn.sendMessage(from, {
          image: { url: imageUrl },
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
      } else {
        throw new Error('Image not accessible');
      }
    } catch (imgError) {
      console.log('Image send failed, trying backup...');
      try {
        // Try backup image
        await conn.sendMessage(from, {
          image: { url: backupImages[0] },
          caption: menuText,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true
          }
        }, { quoted: mek });
      } catch (backupError) {
        console.log('Backup image also failed, sending text only');
        // Send as text only
        await conn.sendMessage(from, {
          text: menuText,
          contextInfo: {
            mentionedJid: [m.sender]
          }
        }, { quoted: mek });
      }
    }

  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});
