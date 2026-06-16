// plugins/chatbot.js - XERO-MD Group AI Chatbot (YUPRA API ONLY)
const config = require("../config");
const axios = require('axios');

// AI Chatbot status
let aiEnabled = config.AUTO_AI === "true";

// ==================== AI CHATBOT EVENT HANDLER ====================
global.registerCommand({
    command: "aichat",
    desc: "Internal AI handler",
    on: "body",
    function: async (conn, m, { from, body, isGroup, isCmd, isOwner }) => {
        try {
            if (aiEnabled && isGroup && !isCmd && !m.key?.fromMe && body) {
                const text = body.toLowerCase();
                let aiReply = "";

                // Custom quick responses
                if (text.includes("wewe ni nani") || text.includes("jina lako") || text.includes("who are you")) {
                    aiReply = "Mimi naitwa *XERO-MD*, bot yako msaidizi hapa groupuni! 🤖";
                }
                else if (text.includes("namba ya mwenye boti") || text.includes("namba ya boss") || text.includes("owner number")) {
                    aiReply = "Namba ya mwenye boti (Owner) ni:\n*+255763111390*\n*+255610209120* 📞";
                }
                else if (text.includes("developer") || text.includes("dev")) {
                    aiReply = "Developer wangu ni *nyoni-xmd* 👨‍💻";
                }
                else if (text.includes("thanks") || text.includes("asante") || text.includes("thank you")) {
                    aiReply = "Karibu sana! 😊 Niko hapa kukusaidia.";
                }
                else if (text.includes("hello") || text.includes("hujambo") || text.includes("hi")) {
                    aiReply = "Hujambo! Habari yako? 👋";
                }

                // If no custom reply, use Yupra API
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
                        text: `╭┈┈❍ *XERO-MD AI* ❍
┊• ${aiReply}
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
            console.error("❌ AI Chatbot Error:", error);
        }
    }
});

// ==================== TOGGLE CHATBOT COMMAND ====================
global.registerCommand({
    command: "chb",
    alias: ["chatbot", "aichat"],
    desc: "Enable or disable Group AI Chatbot",
    category: "owner",
    function: async (conn, m, { from, reply, args, isOwner, isAdmins }) => {
        try {
            if (!isOwner && !isAdmins) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ Access Denied!
┊• Only owner or group admins can use this
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            const action = args[0]?.toLowerCase();

            if (action === 'on') {
                aiEnabled = true;
                await conn.sendMessage(from, {
                    image: { url: "https://files.catbox.moe/gyaka2.png" },
                    caption: `╭┈┈❍ *XERO-MD* ❍
┊• ✅ Group AI Chatbot Activated!
┊• Now I will reply to all messages in this group
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
                aiEnabled = false;
                await conn.sendMessage(from, {
                    image: { url: "https://files.catbox.moe/gyaka2.png" },
                    caption: `╭┈┈❍ *XERO-MD* ❍
┊• ❌ Group AI Chatbot Deactivated!
┊• AI will no longer respond in this group
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
┊• 🤖 Group Chatbot Status : ${aiEnabled ? "ON" : "OFF"}
┊•
┊• Usage :
┊•   .chb on  - Enable AI in group
┊•   .chb off - Disable AI in group
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }
        } catch (error) {
            console.error("❌ Chatbot command error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ Error: ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
