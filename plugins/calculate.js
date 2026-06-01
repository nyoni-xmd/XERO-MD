const { cmd } = require('./command.js');
const math = require('mathjs');

cmd({
    pattern: "calc",
    alias: ["calculate", "math"],
    desc: "Calculate mathematical expressions",
    category: "tools",
    react: "🧮",
    filename: __filename
}, async (conn, mek, m, { reply, args, q }) => {
    try {
        if (!q) return reply("Example: .calc 10 + 20");
        const result = math.evaluate(q);
        reply(`📟 *Result:* ${result}`);
    } catch (e) {
        reply(`❌ Invalid expression: ${q}`);
    }
});
