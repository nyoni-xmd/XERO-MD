// plugins/prefix.js - XERO-MD Set Prefix Command
const { setConfig, getConfig } = require('../lib/configdb');
const config = require('../config');

// Override config.PREFIX with saved value if exists
const savedPrefix = getConfig('PREFIX');
if (savedPrefix) {
    config.PREFIX = savedPrefix;
}

// Function to update prefix globally
function updatePrefix(newPrefix) {
    config.PREFIX = newPrefix;
    setConfig('PREFIX', newPrefix);
    return true;
}

global.registerCommand({
    command: "setprefix",
    alias: ["changeprefix", "newprefix"],
    desc: "Change the bot's command prefix",
    category: "owner",
    function: async (conn, m, { from, reply, args, isOwner }) => {
        try {
            if (!isOwner) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Access Denied!*
┊• 🔒 Only bot owner can change prefix
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            if (!args[0]) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *SET PREFIX COMMAND*
┊•
┊• 💡 *Usage* :
┊•   .setprefix [new_prefix]
┊•
┊• 📌 *Examples* :
┊•   .setprefix !   → Prefix becomes !
┊•   .setprefix #   → Prefix becomes #
┊•   .setprefix .   → Prefix becomes .
┊•
┊• 📊 *Current prefix* : ${config.PREFIX}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            const newPrefix = args[0].trim();
            
            // Validate prefix (max 2 characters)
            if (newPrefix.length > 2) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Invalid prefix!*
┊• 📝 Prefix should be 1-2 characters
┊• 📌 Example : .setprefix !  or  .setprefix .
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            // Update prefix
            updatePrefix(newPrefix);

            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *Prefix changed successfully!*
┊•
┊• 🔧 *Old prefix* : ${config.PREFIX}
┊• 🔧 *New prefix* : ${newPrefix}
┊•
┊• 💡 *Now use* : ${newPrefix}menu, ${newPrefix}ping, etc.
┊• ⏰ *Updated* : ${new Date().toLocaleString()}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`);

        } catch (error) {
            console.error("SetPrefix Error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Error changing prefix!*
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

// ==================== CHECK CURRENT PREFIX ====================
global.registerCommand({
    command: "prefix",
    alias: ["getprefix", "currentprefix"],
    desc: "Check the current bot prefix",
    category: "info",
    function: async (conn, m, { from, reply }) => {
        try {
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *CURRENT PREFIX*
┊•
┊• 🔧 *Prefix* : ${config.PREFIX}
┊• 📌 *Usage* : ${config.PREFIX}menu, ${config.PREFIX}ping, etc.
┊• 💡 *To change* : ${config.PREFIX}setprefix [new_prefix]
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`);
        } catch (error) {
            reply(`❌ Error: ${error.message}`);
        }
    }
});
