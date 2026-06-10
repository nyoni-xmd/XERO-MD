const { cmd } = require("../command");
const config = require("../config");

// IQ test function – random but fun
function getIQResult(name) {
    const iq = Math.floor(Math.random() * (160 - 50 + 1)) + 50;
    let level = "";
    let emoji = "";
    
    if (iq >= 130) {
        level = "Genius 🔥🧠";
        emoji = "🏆";
    } else if (iq >= 110) {
        level = "Above Average 💡";
        emoji = "📈";
    } else if (iq >= 90) {
        level = "Normal 👤";
        emoji = "✅";
    } else if (iq >= 70) {
        level = "Below Average ⚠️";
        emoji = "📉";
    } else {
        level = "Need Improvement 🍂";
        emoji = "🌱";
    }
    
    return { iq, level, emoji };
}

cmd({
    pattern: "iqc",
    alias: ["iq", "iqtest", "brain"],
    desc: "Check your IQ level (random test)",
    category: "fun",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, reply, pushname }) => {
    try {
        const name = pushname || m.pushName || "User";
        const { iq, level, emoji } = getIQResult(name);
        
        const resultText = `╭━━〔 🧠 *IQ TEST RESULT* 〕━━⬣
┃
┃ 👤 *Name* : ${name}
┃ 🧩 *IQ Score* : ${iq}
┃ 📊 *Level* : ${level} ${emoji}
┃
┃ 💬 *Comment* : 
┃ ${iq >= 130 ? "You're a genius! Keep shining 🌟" : 
    iq >= 110 ? "Smart one! 👏" :
    iq >= 90 ? "Average but can improve 💪" :
    iq >= 70 ? "Time to read more books 📚" :
    "Don't worry, everyone has their own strengths 🌈"}
┃
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ *XERO-MD • IQ Checker*`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/gyaka2.png" },
            caption: resultText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363418161689316@newsletter",
                    newsletterName: "XERO-MD",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
        
    } catch (error) {
        console.error("IQC error:", error);
        reply("❌ Failed to process IQ test.");
    }
});
