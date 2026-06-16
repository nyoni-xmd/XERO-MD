// plugins/dmchatbot.js - XERO-MD DM AI Chatbot (YUPRA API ONLY)
const config = require("../config");
const axios = require('axios');

let dmAiEnabled = true;

// ==================== DM AI CHATBOT EVENT HANDLER ====================
global.registerCommand({
    command: "dmaichat",
    desc: "Internal DM AI handler",
    on: "body",
    function: async (conn, m, { from, body, isGroup, isCmd, isOwner }) => {
        try {
            if (dmAiEnabled && !isGroup && !isCmd && !m.key?.fromMe && body) {
                const text = body.toLowerCase();
                let aiReply = "";

                // Custom quick responses
                if (text.includes("wewe ni nani") || text.includes("jina lako") || text.includes("who are you")) {
                    aiReply = "Mimi naitwa *XERO-MD*, bot yako msaidizi wa kibinafsi! 🤖\nNiko hapa kukusaidia na maswali yako yoyote.";
                }
                else if (text.includes("namba ya mwenye boti") || text.includes("namba ya boss") || text.includes("owner number")) {
                    aiReply = "📞 Namba za Owner:\n• +255763111390\n• +255610209120";
                }
                else if (text.includes("developer") || text.includes("dev") || text.includes("creator")) {
                    aiReply = "👨‍💻 Developer: nyoni-xmd";
                }
                else if (text.includes("thanks") || text.includes("asante") || text.includes("thank you")) {
                    aiReply = "Karibu sana! 😊 Niko hapa kukusaidia wakati wote.";
                }
                else if (text.includes("hello") || text.includes("hujambo") || text.includes("hi") || text.includes("sasa")) {
                    aiReply = "Hujambo! Habari yako? 👋\nNinakusaidiaje leo?";
                }
                else if (text.includes("help") || text.includes("msaada") || text.includes("saidia")) {
                    aiReply = "📋 Msaada / Help\n\nCommands zangu:\n• .menu - Orodha ya commands\n• .ping - Check bot\n• .owner - Owner info\n• .alive - Bot status\n\nUliza chochote!";
                }
                else if (text.includes("time") || text.includes("saa") || text.includes("muda")) {
                    const now = new Date();
                    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    aiReply = `⏰ Sasa ni: ${time}\n📅 Tarehe: ${now.toLocaleDateString()}\n\nTanzania Timezone (UTC+3)`;
                }

                if (!aiReply) {
                    await conn.sendPresenceUpdate('composing', from);
                    
                    try {
                        const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encodeURIComponent(body)}`;
                        const response = await axios.get(apiUrl, { timeout: 15000 });
                        
                        if (response.data && (response.data.status === 200 || response.data.success) && response.data.result) {
                            aiReply = response.data.result || response.data.message || response.data.data;
                        } else {
                            aiReply = "Samahani, nina tatizo la kiufundi. Jaribu tena baadaye. 🛠️";
                        }
                    } catch (e) {
                        console.error("Yupra API error:", e.message);
                        aiReply = "Samahani, nina tatizo la kiufundi. Jaribu tena baadaye. 🛠️";
                    }
                }

                if (aiReply) {
                    await conn.sendMessage(from, {
                        text: `╭┈┈❍ *XERO-MD DM AI* ❍
┊• 🤖 ${aiReply}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363399470975987@newsletter',
                                newsletterName: 'XERO-MD',
                                serverMessageId: 143
                            }
                        }
                    }, { quoted: m });
                }
            }
        } catch (error) {
            console.error("❌ DM AI Chatbot Error:", error);
        }
    }
});

// ==================== TOGGLE DM CHATBOT COMMAND ====================
global.registerCommand({
    command: "dmai",
    alias: ["dmaibot", "privai"],
    desc: "Enable or disable DM AI Chatbot",
    category: "owner",
    function: async (conn, m, { from, reply, args, isOwner }) => {
        try {
            if (!isOwner) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ Access Denied!
┊• Only bot owner can use this
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            const action = args[0]?.toLowerCase();

            if (action === 'on') {
                dmAiEnabled = true;
                await conn.sendMessage(from, {
                    image: { url: "https://files.catbox.moe/gyaka2.png" },
                    caption: `╭┈┈❍ *XERO-MD* ❍
┊• ✅ DM AI Chatbot Activated!
┊• Now I will reply to all private messages
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            } 
            else if (action === 'off') {
                dmAiEnabled = false;
                await conn.sendMessage(from, {
                    image: { url: "https://files.catbox.moe/gyaka2.png" },
                    caption: `╭┈┈❍ *XERO-MD* ❍
┊• ❌ DM AI Chatbot Deactivated!
┊• No longer respond in private messages
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            }
            else {
                await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 🤖 DM Chatbot Status : ${dmAiEnabled ? "ON" : "OFF"}
┊•
┊• Usage :
┊•   .dmai on  - Enable AI in private chat
┊•   .dmai off - Disable AI in private chat
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }
        } catch (error) {
            console.error("❌ DM Chatbot command error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ Error: ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
