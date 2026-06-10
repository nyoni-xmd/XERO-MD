const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd({
    pattern: "ai",
    alias: ["ask", "gpt", "chatgpt", "bot"],
    desc: "Chat with AI (ChatGPT like)",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, pushname }) => {
    try {
        let question = q;

        // Kama hakuna swali, angalia kama ametumia reply
        if (!question) {
            const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                question = quoted.conversation || quoted.extendedTextMessage?.text || "";
            }
        }

        if (!question) {
            return reply(`╭━━〔 🤖 *AI USAGE* 〕━━⬣
┃
┃ Example:
┃ ${config.PREFIX}ai What is WhatsApp?
┃
┃ Or reply to a message with:
┃ ${config.PREFIX}ai
┃
╰━━━━━━━━━━━━━━━━━━⬣
> *XERO-MD Artificial Intelligence*`);
        }

        // Onyesha typing indicator
        await conn.sendPresenceUpdate("composing", from);

        let aiResponse = null;

        // API 1: DavidCyril (free & fast)
        try {
            const { data } = await axios.get(`https://api.davidcyriltech.my.id/ai/chatgpt?text=${encodeURIComponent(question)}`, {
                timeout: 15000
            });
            if (data?.result) aiResponse = data.result;
            else if (data?.response) aiResponse = data.response;
        } catch (e) {
            console.log("API 1 failed");
        }

        // API 2: Fallback – VihangaYT
        if (!aiResponse) {
            try {
                const { data } = await axios.get(`https://vihangayt.me/api/gpt4?q=${encodeURIComponent(question)}`, {
                    timeout: 15000
                });
                if (data?.response) aiResponse = data.response;
            } catch (e) {
                console.log("API 2 failed");
            }
        }

        // API 3: Siputzx
        if (!aiResponse) {
            try {
                const { data } = await axios.get(`https://api.siputzx.my.id/api/ai/gpt4?text=${encodeURIComponent(question)}`, {
                    timeout: 15000
                });
                if (data?.result) aiResponse = data.result;
                else if (data?.data) aiResponse = data.data;
            } catch (e) {
                console.log("API 3 failed");
            }
        }

        if (!aiResponse) {
            return reply(`╭━━〔 ❌ *AI ERROR* 〕━━⬣
┃
┃ All AI services are busy.
┃ Please try again later.
┃
╰━━━━━━━━━━━━━━━━━━⬣
> *XERO-MD AI*`);
        }

        // Kata ujumbe mrefu
        if (aiResponse.length > 3000) {
            aiResponse = aiResponse.substring(0, 3000) + "\n\n... [Message truncated]";
        }

        const resultText = `╭━━〔 🤖 *XERO-MD AI* 〕━━⬣
┃
┃ 👤 *You* : ${question.length > 60 ? question.substring(0, 60) + "..." : question}
┃
┃ 🤖 *Answer* :
┃ ${aiResponse}
┃
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ *Powered by XERO-MD & AI*`;

        await conn.sendMessage(from, { text: resultText }, { quoted: mek });

    } catch (error) {
        console.error("AI error:", error);
        reply(`╭━━〔 ❌ *AI ERROR* 〕━━⬣
┃
┃ ${error.message}
┃ Please try again later.
┃
╰━━━━━━━━━━━━━━━━━━⬣`);
    }
});
