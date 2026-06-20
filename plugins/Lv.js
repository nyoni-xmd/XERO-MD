// plugins/lv.js - XERO-MD Lovers Advice
global.registerCommand({
    command: "lv",
    alias: ["love", "advice", "loveadvice", "mapenzi"],
    desc: "Get random love advice and wisdom",
    category: "fun",
    function: async (conn, m, { from, reply, sender }) => {
        try {
            // ========== LOVE ADVICE COLLECTION ==========
            const loveAdvice = [
                // English
                "Love is not about how many days you've been together, but about how much you love each other every single day. ❤️",
                "The best love is the kind that awakens the soul and makes us reach for more. 💫",
                "True love is not about perfection, but about accepting imperfections with grace. 🌹",
                "Love is when the other person's happiness is more important than your own. 💕",
                "Don't rush love. The best love stories happen when you least expect them. ✨",
                "A healthy relationship is built on trust, respect, and open communication. 🗣️",
                "Love is not about finding someone perfect, but learning to love an imperfect person perfectly. 💖",
                "The greatest happiness in life is the feeling of being loved for who you are. 🌟",
                "Real love doesn't meet you at your best. It meets you at your worst and stays. 💪",
                "Love is a decision, not just a feeling. Choose to love every day. 💝",
                
                // Kiswahili
                "Upendo sio idadi ya siku mlizokuwa pamoja, bali ni kiasi cha upendo mnayoelewana kila siku. ❤️",
                "Upendo bora ni ule unaoamsha roho na kufanya tuwe tunataka zaidi. 💫",
                "Upendo wa kweli si juu ya ukamilifu, bali ni kukubali dosari kwa neema. 🌹",
                "Upendo ni pale furaha ya mwenzako inapokuwa muhimu kuliko yako mwenyewe. 💕",
                "Usikimbilie mapenzi. Hadithi bora za mapenzi hutokea usipozitarajia. ✨",
                "Uhusiano mzuri umejengwa juu ya imani, heshima, na mawasiliano ya wazi. 🗣️",
                "Upendo si kumtafuta mtu mkamilifu, bali kujifunza kumpenda mtu asiye mkamilifu. 💖",
                "Furaha kubwa maishani ni kuhisi kupendwa kwa vile ulivyo. 🌟",
                "Upendo wa kweli haukutani nawe ulivyo bora. Unakutana nawe ulivyo mbovu na unabaki. 💪",
                "Upendo ni uamuzi, sio hisia tu. Chagua kupenda kila siku. 💝",
                
                // More English
                "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. 📖",
                "The best thing to hold onto in life is each other. 🤝",
                "Love is the bridge between two hearts that beats as one. 💓",
                "A loving heart is the truest wisdom. 💎",
                "Love is the only thing that grows when you give it away. 🌱",
                "True love stories never have endings. 📚",
                "Love is friendship set on fire. 🔥",
                "Being deeply loved gives you strength, while loving deeply gives you courage. 🦁",
                
                // More Kiswahili
                "Upendo ni uvumilivu, upendo ni wema. Hauna wivu, haujivuni, hauna kiburi. 📖",
                "Kitu bora kushikilia maishani ni kuwa pamoja. 🤝",
                "Upendo ni daraja kati ya mioyo miwili inayopiga kama moja. 💓",
                "Moyo wa upendo ndio hekima ya kweli. 💎",
                "Upendo ndio kitu pekee kinachokua unapotoa. 🌱",
                "Hadithi za upendo wa kweli hazina mwisho. 📚",
                "Upendo ni urafiki uliowaka moto. 🔥",
                "Kupendwa kwa undani kunakupa nguvu, huku kupenda kwa undani kunakupa ujasiri. 🦁",
                
                // Short quotes
                "Love is all you need. 💛",
                "You are my today and all of my tomorrows. 🌅",
                "I choose you. And I'll choose you over and over. Without pause, without doubt. 🥰",
                "Love is the greatest gift of all. 🎁",
                "Together is a beautiful place to be. 🌍",
                "Every love story is beautiful, but ours is my favorite. 📖"
            ];

            // Get random advice
            const randomAdvice = loveAdvice[Math.floor(Math.random() * loveAdvice.length)];
            
            // Get user's name
            let userName = "Friend";
            try {
                const contact = await conn.getContact(sender);
                if (contact.notify) userName = contact.notify;
                else if (contact.vname) userName = contact.vname;
            } catch (e) {}

            // Send love advice with style
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 💕 *LOVERS ADVICE*
┊•
┊• ${randomAdvice}
┊•
┊• 💌 *For you* : ${userName}
┊• ⏰ *Time* : ${new Date().toLocaleString()}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`);

        } catch (error) {
            console.error("LV Command Error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Error getting advice!*
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
