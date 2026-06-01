const { cmd } = require('./command.js');

const truths = [
    "What's your biggest fear?",
    "What's the biggest lie you've told?",
    "What's your secret dream job?",
    "What's something you regret?",
    "What's your biggest insecurity?"
];

const dares = [
    "Send a random sticker to someone",
    "Change your profile picture for 10 minutes",
    "Send a voice note saying 'XERO-MD is awesome'",
    "Post a funny meme",
    "Tell a joke"
];

cmd({
    pattern: "tod",
    alias: ["truthordare"],
    desc: "Play truth or dare",
    category: "fun",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { reply, args }) => {
    const choice = (args[0] || "").toLowerCase();
    if (choice === "truth") {
        const truth = truths[Math.floor(Math.random() * truths.length)];
        reply(`📖 *TRUTH*\n${truth}`);
    } else if (choice === "dare") {
        const dare = dares[Math.floor(Math.random() * dares.length)];
        reply(`⚡ *DARE*\n${dare}`);
    } else {
        reply(`🎭 *Truth or Dare*\n\nUse:\n.tod truth\n.tod dare`);
    }
});
