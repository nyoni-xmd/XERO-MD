const { cmd } = require('./command.js');
const axios = require('axios');

cmd({
    pattern: "joke",
    alias: ["funny"],
    desc: "Get random joke",
    category: "fun",
    react: "😂",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const res = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const joke = `😂 *Joke Time!*\n\n${res.data.setup}\n\n👉 ${res.data.punchline}`;
        reply(joke);
    } catch (e) {
        reply(`😂 Why don't scientists trust atoms? Because they make up everything!`);
    }
});
