const { cmd } = require('../lib/functions');
cmd({ pattern: "quote", desc: "Random quote", category: "fun", react: "💬", filename: __filename }, async (conn, mek, m, { reply }) => { reply("Believe in yourself! - XERO-MD"); });
cmd({ pattern: "joke", desc: "Random joke", category: "fun", react: "😂", filename: __filename }, async (conn, mek, m, { reply }) => { reply("Why did the bot go to school? To learn JavaScript!"); });
cmd({ pattern: "roll", desc: "Roll a dice", category: "fun", react: "🎲", filename: __filename }, async (conn, mek, m, { reply }) => { reply(`🎲 You rolled: ${Math.floor(Math.random()*6)+1}`); });
