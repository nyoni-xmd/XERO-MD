const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd({
    pattern: "gpt",
    alias: ["ai", "chatgpt", "ask"],
    desc: "Chat with AI (ChatGPT)",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, pushname }) => {
    try {
        // Get question from command or quoted message
        let question = q;
        
        // If no question, check if replying to a message
        if (!question) {
            const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                question = quoted.conversation || quoted.extendedTextMessage?.text || "";
            }
        }
        
        if (!question) {
            return reply(`╭━━〔 🤖 *GPT USAGE* 〕━━⬣
┃
┃ Example:
┃ ${config.PREFIX}gpt What is WhatsApp?
┃
┃ Or reply to a message with:
┃ ${config.PREFIX}gpt
┃
╰━━━━━━━━━━━━━━━━━━⬣
> XERO-MD AI Assistant`);
        }

        // Send typing indicator
        await conn.sendPresenceUpdate("composing", from);
        
        // Try primary API
        let aiResponse = null;
        
        // Primary API (free ChatGPT)
        try {
            const response = await axios.get(`https://api.davidcyriltech.my.id/ai/chatgpt?text=${encodeURIComponent(question)}`, {
                timeout: 15000
            });
            if (response.data && response.data.result) {
                aiResponse = response.data.result;
            } else if (response.data && response.data.response) {
                aiResponse = response.data.response;
            } else if (response.data && response.data.message) {
                aiResponse = response.data.message;
            }
        } catch (e) {
            console.log("Primary API failed, trying fallback...");
        }
        
        // Fallback API 1 (if primary fails)
        if (!aiResponse) {
            try {
                const response = await axios.get(`https://api.siputzx.my.id/api/ai/gpt4?text=${encodeURIComponent(question)}`, {
                    timeout: 15000
                });
                if (response.data && response.data.result) {
                    aiResponse = response.data.result;
                } else if (response.data && response.data.data) {
                    aiResponse = response.data.data;
                }
            } catch (e) {
                console.log("Fallback 1 failed");
            }
        }
        
        // Fallback API 2 (last resort)
        if (!aiResponse) {
            try {
                const response = await axios.get(`https://vihangayt.me/api/gpt4?q=${encodeURIComponent(question)}`, {
                    timeout: 15000
                });
                if (response.data && response.data.response) {
                    aiResponse = response.data.response;
                }
            } catch (e) {
                console.log("Fallback 2 failed");
            }
        }
        
        if (!aiResponse) {
            return reply(`╭━━〔 ❌ *GPT ERROR* 〕━━⬣
┃
┃ All AI services are busy.
┃ Please try again later.
┃
╰━━━━━━━━━━━━━━━━━━⬣
> XERO-MD AI`);
        }
        
        // Limit response length (avoid huge messages)
        if (aiResponse.length > 3000) {
            aiResponse = aiResponse.substring(0, 3000) + "\n\n... [Message truncated]";
        }
        
        const resultText = `╭━━〔 🤖 *XERO-GPT* 〕━━⬣
┃
┃ 👤 *You* : ${question.length > 50 ? question.substring(0, 50) + "..." : question}
┃
┃ 🤖 *AI* :
┃ ${aiResponse}
┃
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ Powered by XERO-MD AI`;

        await conn.sendMessage(from, { text: resultText }, { quoted: mek });
        
    } catch (error) {
        console.error("GPT error:", error);
        reply(`╭━━〔 ❌ *GPT ERROR* 〕━━⬣
┃
┃ An error occurred: ${error.message}
┃ Please try again later.
┃
╰━━━━━━━━━━━━━━━━━━⬣`);
    }
});
