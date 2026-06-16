// plugins/dmchatbot.js - XERO-MD DM AI Chatbot (Private Chat Only) WITH 3 APIS
const config = require("../config");
const axios = require('axios');

// DM AI Chatbot status
let dmAiEnabled = true;

// ==================== DM AI CHATBOT EVENT HANDLER ====================
global.registerCommand({
    command: "dmaichat",
    desc: "Internal DM AI handler",
    on: "body",
    function: async (conn, m, { from, body, isGroup, isCmd, isOwner }) => {
        try {
            // Check if DM AI is enabled, NOT in group, not a command, not own message
            if (dmAiEnabled && !isGroup && !isCmd && !m.key?.fromMe && body) {
                const text = body.toLowerCase();
                let aiReply = "";

                // --- CUSTOM BRAIN: Quick responses for DM ---
                if (text.includes("wewe ni nani") || text.includes("jina lako") || text.includes("who are you")) {
                    aiReply = "Mimi naitwa *XERO-MD*, bot yako msaidizi wa kibinafsi! 🤖\n\nNiko hapa kukusaidia na maswali yako yoyote. Uliza lolote!";
                }
                else if (text.includes("namba ya mwenye boti") || text.includes("namba ya boss") || text.includes("owner number")) {
                    aiReply = "📞 *Namba za Owner:*\n• +255763111390\n• +255610209120\n\nKaribu kuwasiliana kwa maswali au usaidizi.";
                }
                else if (text.includes("developer") || text.includes("dev") || text.includes("creator")) {
                    aiReply = "👨‍💻 *Developer:* nyoni-xmd\n\nNi yule aliyenitengeneza na kuniweka kwenye serva. Ana namba +255763111390.";
                }
                else if (text.includes("thanks") || text.includes("asante") || text.includes("thank you")) {
                    aiReply = "Karibu sana! 😊 Niko hapa kukusaidia wakati wote. Usisite kuuliza zaidi!";
                }
                else if (text.includes("hello") || text.includes("hujambo") || text.includes("hi") || text.includes("sasa")) {
                    aiReply = "Hujambo! Habari yako? 👋\n\nNi furaha kuzungumza nawe. Ninakusaidiaje leo?";
                }
                else if (text.includes("help") || text.includes("msaada") || text.includes("saidia")) {
                    aiReply = "📋 *Msaada / Help*\n\nNinajibu maswali yako kwa lugha yoyote.\n\n*Commands zangu:*\n• .menu - Orodha ya commands zote\n• .ping - Kuangalia kama niko online\n• .owner - Mawasiliano ya owner\n• .alive - Kuangalia status yangu\n\nUliza chochote, nitajaribu kukusaidia!";
                }
                else if (text.includes("jina langu") || text.includes("my name")) {
                    aiReply = `Jina lako ni *${m.pushName || "Friend"}*! 😊\nNimekumbuka!`;
                }
                else if (text.includes("time") || text.includes("saa") || text.includes("muda")) {
                    const now = new Date();
                    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    aiReply = `⏰ *Sasa ni:* ${time}\n📅 *Tarehe:* ${now.toLocaleDateString()}\n\nTanzania Timezone (UTC+3)`;
                }

                // If no custom reply, try APIs
                if (!aiReply) {
                    await conn.sendPresenceUpdate('composing', from);
                    
                    // ========== API 1: YUPRA GPT5 ==========
                    try {
                        const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encodeURIComponent(body)}`;
                        const response = await axios.get(apiUrl, { timeout: 15000 });
                        if (response.data && (response.data.status === 200 || response.data.success) && response.data.result) {
                            aiReply = response.data.result || response.data.message || response.data.data;
                        }
                    } catch (e) { console.log("Yupra API error:", e.message); }
                }

                // ========== API 2: DavidCyrilTech ==========
                if (!aiReply) {
                    try {
                        const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(body)}`;
                        const response = await axios.get(apiUrl, { timeout: 10000 });
                        if (response.data && (response.data.status === 200 || response.data.success) && response.data.result) {
                            aiReply = response.data.result || response.data.message;
                        }
                    } catch (e) { console.log("DavidCyrilTech error:", e.message); }
                }

                // ========== API 3: Siputzx ==========
                if (!aiReply) {
                    try {
                        const apiUrl = `https://api.siputzx.my.id/api/ai/gpt4?text=${encodeURIComponent(body)}`;
                        const response = await axios.get(apiUrl, { timeout: 10000 });
                        if (response.data && response.data.status && response.data.data) {
                            aiReply = response.data.data;
                        }
                    } catch (e) { console.log("Siputzx error:", e.message); }
                }

                // If all APIs fail
                if (!aiReply) {
                    aiReply = "Samahani, nina tatizo la kiufundi kwa sasa. Jaribu tena baadaye. 🛠️\n\nUnaweza pia kujaribu kuuliza swali tofauti.";
                }

                // Send reply with stylish format
                if (aiReply) {
                    await conn.sendMessage(from, {
                        text: `╭┈┈❍ *XERO-MD DM AI* ❍
┊• 🤖 ${aiReply}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> *Response Time:* ${new Date().toLocaleTimeString()}
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
    desc: "Enable or disable DM AI Chatbot (Private Chat)",
    category: "owner",
    function: async (conn, m, { from, reply, args, isOwner }) => {
        try {
            if (!isOwner) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ Access Denied!*
┊• *Only bot owner can use this command*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            const action = args[0]?.toLowerCase();

            if (action === 'on') {
                dmAiEnabled = true;
                await conn.sendMessage(from, {
                    image: { url: "https://files.catbox.moe/gyaka2.png" },
                    caption: `╭┈┈❍ *XERO-MD* ❍
┊• *✅ DM AI Chatbot Activated!*
┊• *I will now reply to all private messages*
┊• *Powered by XERO-MD AI*
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
┊• *❌ DM AI Chatbot Deactivated!*
┊• *I will no longer respond in private messages*
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
┊• 🤖 *DM Chatbot Status* : ${dmAiEnabled ? "✅ ON" : "❌ OFF"}
┊•
┊• *Usage* :
┊•   .dmai on  - Enable AI in private chat
┊•   .dmai off - Disable AI in private chat
┊•
┊• *Note* : This affects only Direct Messages
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }
        } catch (error) {
            console.error("❌ DM Chatbot command error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ Error: ${error.message}*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
