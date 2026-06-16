// plugins/block.js - XERO-MD Block/Unblock Commands
global.registerCommand({
    command: "block",
    alias: ["blockuser", "ban"],
    desc: "Block a user from contacting the bot",
    category: "owner",
    function: async (conn, m, { from, reply, args, quoted, sender, isOwner }) => {
        if (!isOwner) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Access Denied!*
┊• 🔒 Only bot owner can use this
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        // Get target user
        let target = m.mentionedJid?.[0] || (quoted?.sender) || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net') || sender;

        if (!target) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *No user specified!*
┊•
┊• 📝 *Usage* :
┊•   .block @user
┊•   .block 255712345678
┊•   Reply to user's message with .block
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        if (target === conn.user.id) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 😂 *I can't block myself!*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        try {
            await conn.updateBlockStatus(target, 'block');
            
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *User Blocked Successfully!*
┊•
┊• 👤 *User* : @${target.split('@')[0]}
┊• 🚫 *Status* : BLOCKED
┊•
┊• 💡 This user can no longer contact you
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`, { mentions: [target] });
        } catch (error) {
            console.error(error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Failed to block user!*
┊•
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

// ==================== UNBLOCK COMMAND ====================
global.registerCommand({
    command: "unblock",
    alias: ["unblockuser", "unban"],
    desc: "Unblock a user",
    category: "owner",
    function: async (conn, m, { from, reply, args, quoted, sender, isOwner }) => {
        if (!isOwner) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Access Denied!*
┊• 🔒 Only bot owner can use this
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        // Get target user
        let target = m.mentionedJid?.[0] || (quoted?.sender) || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net') || sender;

        if (!target) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *No user specified!*
┊•
┊• 📝 *Usage* :
┊•   .unblock @user
┊•   .unblock 255712345678
┊•   Reply to user's message with .unblock
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        try {
            await conn.updateBlockStatus(target, 'unblock');
            
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *User Unblocked Successfully!*
┊•
┊• 👤 *User* : @${target.split('@')[0]}
┊• 🟢 *Status* : UNBLOCKED
┊•
┊• 💡 This user can now contact you again
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`, { mentions: [target] });
        } catch (error) {
            console.error(error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Failed to unblock user!*
┊•
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

// ==================== BLOCK LIST COMMAND ====================
global.registerCommand({
    command: "blocklist",
    alias: ["blocked", "bannedlist"],
    desc: "View list of blocked users",
    category: "owner",
    function: async (conn, m, { from, reply, isOwner }) => {
        if (!isOwner) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Access Denied!*
┊• 🔒 Only bot owner can use this
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        try {
            const blocklist = await conn.fetchBlocklist();
            
            if (!blocklist || blocklist.length === 0) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *Blocked Users List*
┊•
┊• ✅ No users are currently blocked
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            let listText = `╭┈┈❍ *XERO-MD* ❍
┊• 📋 *Blocked Users List*
┊• 👥 *Total* : ${blocklist.length} users
┊•
`;
            blocklist.forEach((jid, index) => {
                listText += `┊• ${index + 1}. @${jid.split('@')[0]}\n`;
            });
            listText += `╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

            await reply(listText, { mentions: blocklist });
        } catch (error) {
            console.error(error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Failed to fetch block list!*
┊•
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
