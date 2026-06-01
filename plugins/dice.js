const { cmd } = require('./command.js');

cmd({
    pattern: "dice",
    alias: ["roll"],
    desc: "Roll a dice",
    category: "fun",
    react: "🎲",
    filename: __filename
}, async (conn, mek, m, { reply, args }) => {
    let sides = parseInt(args[0]) || 6;
    if (sides < 2) sides = 2;
    if (sides > 100) sides = 100;
    const result = Math.floor(Math.random() * sides) + 1;
    reply(`🎲 *Dice Roll*\n🎯 Result: ${result}\n🎲 Sides: ${sides}`);
});
