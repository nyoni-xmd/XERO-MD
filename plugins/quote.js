const { cmd } = require('./command.js');
const axios = require('axios');

cmd({
    pattern: "quote",
    alias: ["qotd"],
    desc: "Get random inspirational quote",
    category: "fun",
    react: "💬",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const res = await axios.get('https://api.quotable.io/random');
        const quote = `💭 *"${res.data.content}"*\n\n— ${res.data.author}`;
        reply(quote);
    } catch (e) {
        reply(`💭 "Believe you can and you're halfway there." — Theodore Roosevelt`);
    }
});
