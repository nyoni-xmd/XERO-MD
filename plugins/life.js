// plugins/life.js - XERO-MD Life Advice & Wisdom
const fs = require('fs');
const path = require('path');

// Store ya maisha advice
const lifeAdvice = {
    categories: {
        love: [
            "Love is not about finding the perfect person, but learning to see an imperfect person perfectly.",
            "The best relationship is when you can act like lovers and best friends at the same time.",
            "Don't rush love. The best things happen unexpectedly.",
            "Self-love is the first step to receiving love from others.",
            "A healthy relationship will never require you to sacrifice your friends, dreams, or dignity."
        ],
        career: [
            "Your career doesn't define you, but how you approach it shows your character.",
            "Success is not about the destination, but the lessons learned along the journey.",
            "The only way to do great work is to love what you do.",
            "Don't wait for opportunity. Create it.",
            "Your passion is waiting for your courage to catch up."
        ],
        happiness: [
            "Happiness is not something ready-made. It comes from your own actions.",
            "The secret of happiness is not in doing what one likes, but in liking what one does.",
            "Happiness is a choice, not a result. Nothing will make you happy until you choose to be happy.",
            "True happiness comes from within, not from external validation.",
            "Find joy in the ordinary moments; they make up most of life."
        ],
        growth: [
            "Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.",
            "You cannot grow without being uncomfortable.",
            "The only person you should try to be better than is the person you were yesterday.",
            "Growth begins when we start to accept our own weaknesses.",
            "Every experience, good or bad, is a priceless collector's item in your growth journey."
        ],
        money: [
            "Money is a tool for living, not the purpose of life.",
            "Financial freedom comes from living below your means, not from earning more.",
            "Invest in experiences, not just things. Memories appreciate, objects depreciate.",
            "The best investment you can make is in yourself.",
            "Wealth is not about having a lot of money; it's about having a lot of options."
        ],
        health: [
            "Your body hears everything your mind says. Stay positive.",
            "Take care of your body. It's the only place you have to live.",
            "Health is the greatest possession. Contentment is the greatest treasure.",
            "Mental health is just as important as physical health.",
            "Self-care is not selfish. You cannot serve from an empty vessel."
        ],
        purpose: [
            "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate.",
            "Don't ask what the world needs. Ask what makes you come alive, and go do it.",
            "Your time is limited, so don't waste it living someone else's life.",
            "The two most important days in your life are the day you are born and the day you find out why.",
            "Find what you love and let it kill you."
        ]
    },
    
    dynamicAdvice: {
        morning: [
            "Start your day with gratitude. It changes your entire perspective.",
            "Today is a blank page. Write a beautiful story.",
            "The morning breeze has secrets to tell you. Don't go back to sleep.",
            "How you start your day determines how you live your day."
        ],
        afternoon: [
            "Take a moment to breathe. You're doing better than you think.",
            "The middle of the day is a good time to check in with yourself.",
            "Keep going. The hardest part is already behind you.",
            "This is your reminder to drink some water and stretch."
        ],
        evening: [
            "Reflect on what went well today, not just what went wrong.",
            "Let go of what you can't control. Tomorrow is a new day.",
            "Rest is not idle, it's essential for growth.",
            "The stars are always there, even when you can't see them."
        ],
        night: [
            "Sleep is the best meditation. Don't underestimate its power.",
            "Your dreams tonight will inspire your tomorrow.",
            "Let today's worries end with the sunset.",
            "The night is for resting, not regretting."
        ]
    }
};

// User-specific advice tracking
const userAdviceHistory = new Map();

// Get time-based advice
function getTimeBasedAdvice() {
    const hour = new Date().getHours();
    let timeOfDay;
    
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    const advices = lifeAdvice.dynamicAdvice[timeOfDay];
    return advices[Math.floor(Math.random() * advices.length)];
}

// Generate dynamic advice based on user history
function getDynamicAdvice(userId, category) {
    const history = userAdviceHistory.get(userId) || [];
    
    if (history.length > 0) {
        const dynamics = {
            love: [
                "Love evolves. What worked yesterday may need adjustment today.",
                "Every relationship teaches you something new about yourself.",
                "The heart grows wiser with every experience."
            ],
            career: [
                "Your career path is unique. Don't compare your chapter 1 to someone's chapter 20.",
                "Skills can be learned, passion must be discovered.",
                "Success leaves clues. Follow what energizes you."
            ],
            growth: [
                "Growth happens in the uncomfortable spaces between what you know and what you discover.",
                "Your past doesn't define you; it prepares you.",
                "Transformation often feels like loss before it feels like gain."
            ],
            happiness: [
                "Happiness is a practice, not a permanent state.",
                "Joy multiplies when shared, but doesn't divide.",
                "The pursuit of happiness is the happiness itself."
            ]
        };
        
        if (dynamics[category]) {
            return dynamics[category][Math.floor(Math.random() * dynamics[category].length)];
        }
    }
    
    const defaults = [
        "This moment is perfect for new beginnings.",
        "Trust the timing of your life.",
        "You are exactly where you need to be right now.",
        "Every experience is preparing you for what's next.",
        "Your journey is unique. Honor it."
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)];
}

// Get random affirmation
function getAffirmation() {
    const affirmations = [
        "I am capable of amazing things.",
        "I choose peace over perfection.",
        "I am growing every day.",
        "My potential is limitless.",
        "I trust my journey.",
        "I am exactly where I need to be.",
        "I attract positive energy.",
        "I am worthy of love and respect.",
        "My mind is clear and focused.",
        "I create my own happiness."
    ];
    
    return affirmations[Math.floor(Math.random() * affirmations.length)];
}

// Store user advice history
function storeAdviceHistory(userId, advice) {
    if (!userAdviceHistory.has(userId)) {
        userAdviceHistory.set(userId, []);
    }
    
    const history = userAdviceHistory.get(userId);
    history.push({
        advice: advice,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
    });
    
    if (history.length > 10) {
        history.shift();
    }
}

// ==================== LIFE ADVICE COMMAND ====================
global.registerCommand({
    command: "life",
    alias: ["advice", "wisdom"],
    desc: "Get personalized life advice",
    category: "fun",
    function: async (conn, m, { from, reply, sender }) => {
        try {
            const userId = sender.split('@')[0];
            const userName = m.pushName || "Friend";
            
            const timeAdvice = getTimeBasedAdvice();
            const categories = Object.keys(lifeAdvice.categories);
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const categoryAdvices = lifeAdvice.categories[randomCategory];
            const randomAdvice = categoryAdvices[Math.floor(Math.random() * categoryAdvices.length)];
            const dynamic = getDynamicAdvice(userId, randomCategory);
            const affirmation = getAffirmation();
            
            storeAdviceHistory(userId, randomAdvice);
            
            const message = `╭┈┈❍ *XERO-MD* ❍
┊• *💭 LIFE ADVICE FOR ${userName.toUpperCase()}*
┊•
┊• *"${randomAdvice}"*
┊•
┊• 📌 *Category* : ${randomCategory.toUpperCase()}
┊• ⏰ *For this moment* : ${timeAdvice}
┊• 💡 *Personal insight* : ${dynamic}
┊•
┊• 🌱 *Remember* : This advice is unique to this moment.
┊• ✨ *Today's affirmation* : "${affirmation}"
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`;

            await conn.sendMessage(from, {
                text: message,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363399470975987@newsletter',
                        newsletterName: 'XERO-MD',
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });
            
        } catch (error) {
            console.error("Life command error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ Couldn't generate life advice!*
┊• *Try again later*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

// ==================== MY ADVICE HISTORY ====================
global.registerCommand({
    command: "mylife",
    alias: ["myadvice", "advicehistory"],
    desc: "See your life advice history",
    category: "fun",
    function: async (conn, m, { from, reply, sender }) => {
        try {
            const userId = sender.split('@')[0];
            const history = userAdviceHistory.get(userId) || [];
            
            if (history.length === 0) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *📭 No advice history yet!*
┊• *Use* : .life *first*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }
            
            let message = `╭┈┈❍ *XERO-MD* ❍
┊• *📜 YOUR ADVICE HISTORY*
┊•
`;
            
            history.forEach((item, index) => {
                const date = new Date(item.timestamp).toLocaleDateString();
                message += `┊• *${index + 1}.* "${item.advice.substring(0, 60)}${item.advice.length > 60 ? '...' : ''}"
┊•   📅 ${date}
┊•
`;
            });
            
            message += `┊• ✨ *Total advices* : ${history.length}
┊• 💡 *Use* : .life *for more wisdom*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`;
            
            await conn.sendMessage(from, { text: message }, { quoted: m });
            
        } catch (error) {
            console.error("MyLife command error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ Couldn't retrieve history!*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
