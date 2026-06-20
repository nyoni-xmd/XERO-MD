// plugins/lw.js - XERO-MD Lover Words (Sweet Romantic Messages)
global.registerCommand({
    command: "lw",
    alias: ["loverword", "loveword", "sweetword"],
    desc: "Send a sweet romantic message to your lover",
    category: "fun",
    function: async (conn, m, { from, reply, args }) => {
        try {
            // Get the name if provided
            let name = args.join(" ");
            if (name) {
                name = name.trim();
            }

            // ========== SWEET LOVER WORDS COLLECTION ==========
            const sweetWords = [
                "You are the most beautiful person I have ever known, and I fall in love with you more every single day. 💖",
                "In a world full of ordinary, you are extraordinary. You make my heart sing. 🎵",
                "Every moment I spend with you feels like a dream I never want to wake up from. 😴💕",
                "You are my sunshine on a cloudy day, my peace in chaos, my everything. ☀️🕊️",
                "I never knew what love truly meant until I met you. Now I can't imagine life without you. 💘",
                "You are the reason I smile, the reason I wake up happy, the reason I believe in love. 😊❤️",
                "I choose you, not because you're perfect, but because you're perfect for me. 🥰",
                "If love is a language, then you are my favorite word. 📖💬",
                "You make my world brighter just by being in it. Thank you for existing. 🌟✨",
                "My heart beats for you and only you. You are my one and only. 💓",
                "I would cross the oceans, climb the highest mountains, just to see you smile. 🌊⛰️😄",
                "You are the missing piece I never knew I needed. Now I'm complete. 🧩",
                "Every love story is beautiful, but ours is my favorite. 📖❤️",
                "I love you more than words can say, more than actions can show, more than you'll ever know. 💌",
                "You are my today and all of my tomorrows. 🌅💖",
                "Being with you feels like home. 🏠❤️",
                "You are the best thing that ever happened to me. 💝",
                "I fall in love with you a little more every day. 📅❤️",
                "You are my dream come true. 🌠",
                "I love you not only for who you are, but for who I am when I am with you. 💞"
            ];

            // Randomly select a sweet word
            const randomWord = sweetWords[Math.floor(Math.random() * sweetWords.length)];

            // Build the message with or without name
            let response = `╭┈┈❍ *XERO-MD* ❍
┊• 💕 *LOVER WORDS* 💕
┊•
`;
            if (name) {
                response += `┊• 💌 *To my dearest ${name}* :
`;
            }
            response += `┊• ${randomWord}
┊•
┊• 💖 *Sent with love from your secret admirer* 💖
┊• ⏰ *Time* : ${new Date().toLocaleString()}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

            await reply(response);

        } catch (error) {
            console.error("LW Error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Error sending lover words!*
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
