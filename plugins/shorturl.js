const { cmd } = require('./command.js');
const axios = require('axios');

cmd({
    pattern: "short",
    alias: ["shorturl"],
    desc: "Shorten long URLs",
    category: "tools",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q || !q.startsWith('http')) return reply("Example: .short https://example.com/long/url");
        const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(q)}`;
        const res = await axios.get(apiUrl);
        reply(`🔗 *Short URL:* ${res.data}`);
    } catch (e) {
        reply(`❌ Error shortening URL`);
    }
});
