const { cmd } = require('./command.js');
const axios = require('axios');
const fs = require('fs');

cmd({
    pattern: "tts",
    alias: ["voice"],
    desc: "Convert text to voice",
    category: "convert",
    react: "🔊",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("Example: .tts Hello XERO-MD");
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=en&client=tw-ob`;
        const response = await axios({ url, responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(response.data);
        await conn.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: mek });
    } catch (e) {
        reply(`❌ TTS failed`);
    }
});
