const { cmd } = require('./command.js');
const axios = require('axios');

cmd({
    pattern: "translate",
    alias: ["tr"],
    desc: "Translate text to English",
    category: "tools",
    react: "🌐",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return reply("Example: .translate Hola mundo");
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(q)}`;
        const res = await axios.get(url);
        const translated = res.data[0][0][0];
        reply(`🌐 *Translation:*\n${translated}`);
    } catch (e) {
        reply(`❌ Translation failed`);
    }
});
