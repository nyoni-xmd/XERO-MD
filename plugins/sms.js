// plugins/sms.js - XERO-MD SMS History (Last 5 Messages)
const { getMessagesBetween, saveMessage } = require('../data/messages');

global.registerCommand({
    command: "sms",
    alias: ["history", "msgs", "lastmsg"],
    desc: "Get last 5 messages from the person you reply to",
    category: "tools",
    function: async (conn, m, { from, reply, quoted, sender }) => {
        try {
            // Check if replying to a message
            if (!quoted) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *SMS HISTORY COMMAND*
┊•
┊• 💡 *Usage* :
┊•   Reply to user's message with .sms
┊•
┊• 📌 *Example* :
┊•   Reply to a message → .sms
┊•   It will show last 5 messages from that person
┊•
┊• 🔧 *Returns* :
┊•   • Sender number
┊•   • Recipient number
┊•   • Message content
┊•   • Time sent
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            // Get target JID from quoted message
            let targetJid = quoted.sender || quoted.key?.participant || quoted.key?.remoteJid;
            
            if (!targetJid) {
                return reply("❌ Could not identify the user you replied to.");
            }

            const targetNumber = targetJid.split('@')[0];
            const senderNumber = sender.split('@')[0];

            // Get messages between sender and target
            const messages = getMessagesBetween(sender, targetJid, 5);
            const allMessages = getMessagesBetween(sender, targetJid, 10);

            if (messages.length === 0) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *SMS HISTORY*
┊•
┊• 👤 *User* : @${targetNumber}
┊• 📭 *No messages found!*
┊•
┊• 💡 Make sure you have chatted with this person
┊• 💡 Bot only saves messages when it's running
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`, { mentions: [targetJid] });
            }

            // Build message list
            let msgList = `╭┈┈❍ *XERO-MD* ❍
┊• 📋 *LAST 5 SMS HISTORY*
┊•
┊• 👤 *User* : @${targetNumber}
┊• 📊 *Total found* : ${allMessages.length}
┊•
`;

            messages.forEach((msg, index) => {
                const isFromTarget = msg.sender === targetJid;
                const number = isFromTarget ? targetNumber : senderNumber;
                const direction = isFromTarget ? '📥' : '📤';
                const time = new Date(msg.timestamp).toLocaleString();
                const content = msg.message || 'Media message';
                
                msgList += `┊• ${direction} *${number}*\n`;
                msgList += `┊•   💬 ${content}\n`;
                msgList += `┊•   ⏰ ${time}\n`;
                msgList += `┊•\n`;
            });

            msgList += `╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

            await reply(msgList, { mentions: [targetJid] });

        } catch (error) {
            console.error("SMS Command Error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Error fetching SMS history!*
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
