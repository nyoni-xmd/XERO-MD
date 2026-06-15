// plugins/friends.js - XERO-MD Friends List
global.registerCommand({
    command: "friends",
    alias: ["myfriends", "bffs"],
    desc: "Show a stylish list of your friends",
    category: "fun",
    function: async (conn, m, { reply }) => {
        try {
            // ✅ Customize your friends here
            const friendsList = [
                "👑 dullah",
                "🔥 Popkid-kenya",
                "💎 Raheem",
                "🌟 abuu",
                "⚡ Raheem-cm"
            ];

            let msg = `╭┈┈❍ *XERO-MD* ❍
┊• *MY FRIENDS LIST*
┊•
${friendsList.map(f => `┊• ${f}`).join('\n')}
┊•
┊• *✨ Always loyal • Always shining ✨*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`;

            await reply(msg);
        } catch (err) {
            console.error(err);
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ Error showing friends list*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
