// plugins/antidel.js - XERO-MD Anti-Delete Control Command
const { setAnti, getAnti } = require('../data');
const config = require('../config');

global.registerCommand({
    command: "antidel",
    alias: ["antidelete", "anti-del", "ad"],
    desc: "Enable or disable anti-delete feature",
    category: "owner",
    function: async (conn, m, { from, reply, args, isOwner }) => {
        if (!isOwner) {
            return reply(`╭╼━━━━━━━━━━━━━━━━━━╮
┃ ❌ ACCESS DENIED!
┃ 🔒 Owner only
╰━━━━━━━━━━━━━━━━━━╯
> POWERED BY nyoni-xmd`);
        }

        const action = args[0]?.toLowerCase();
        const currentStatus = await getAnti();

        if (!action) {
            return reply(`╭╼━━━━━━━━━━━━━━━━━━╮
┃ 🛡️ ANTI-DELETE STATUS
┃
┃ 📊 Status : ${currentStatus ? '✅ ENABLED' : '❌ DISABLED'}
┃
┃ 📝 Usage :
┃   .antidel on  - Enable
┃   .antidel off - Disable
╰━━━━━━━━━━━━━━━━━━╯
> POWERED BY nyoni-xmd`);
        }

        if (action === 'on') {
            await setAnti(true);
            return reply(`╭╼━━━━━━━━━━━━━━━━━━╮
┃ ✅ ANTI-DELETE ENABLED!
┃
┃ 🛡️ Status : ENABLED
┃ 📍 Mode : ${config.ANTI_DEL_PATH === "inbox" ? 'Inbox' : 'Same Chat'}
┃
┃ 💡 Bot will recover deleted messages
╰━━━━━━━━━━━━━━━━━━╯
> POWERED BY nyoni-xmd`);
        } 
        else if (action === 'off') {
            await setAnti(false);
            return reply(`╭╼━━━━━━━━━━━━━━━━━━╮
┃ ❌ ANTI-DELETE DISABLED!
┃
┃ 🛡️ Status : DISABLED
┃
┃ 💡 Bot will not recover messages
╰━━━━━━━━━━━━━━━━━━╯
> POWERED BY nyoni-xmd`);
        }
        else {
            return reply(`╭╼━━━━━━━━━━━━━━━━━━╮
┃ ❌ INVALID OPTION!
┃
┃ 📝 Usage : .antidel on/off
╰━━━━━━━━━━━━━━━━━━╯
> POWERED BY nyoni-xmd`);
        }
    }
});

// Command to check anti-delete settings
global.registerCommand({
    command: "antidelinfo",
    alias: ["adinfo", "antidelstatus"],
    desc: "Show anti-delete settings and info",
    category: "owner",
    function: async (conn, m, { from, reply, isOwner }) => {
        if (!isOwner) return reply("❌ Owner only.");

        const status = await getAnti();
        const pathMode = config.ANTI_DEL_PATH === "inbox" ? "📥 Inbox (Owner DM)" : "💬 Same Chat";
        
        const infoMsg = `╭╼━━━━━━━━━━━━━━━━━━╮
┃ 📊 ANTI-DELETE INFO
┃
┃ 🔘 Status : ${status ? '✅ ENABLED' : '❌ DISABLED'}
┃ 📍 Path : ${pathMode}
┃
┃ 📌 Features :
┃   • Recovers deleted text
┃   • Recovers images/videos
┃   • Recovers audio/docs
┃   • Shows who deleted
┃   • Shows original content
┃
┃ 🔧 Commands :
┃   .antidel on/off
┃   .antidelpath inbox/same
╰━━━━━━━━━━━━━━━━━━╯
> POWERED BY nyoni-xmd`;
        
        reply(infoMsg);
    }
});

// Command to change anti-delete path
global.registerCommand({
    command: "antidelpath",
    alias: ["adpath"],
    desc: "Change anti-delete path (inbox or same)",
    category: "owner",
    function: async (conn, m, { from, reply, args, isOwner }) => {
        if (!isOwner) {
            return reply(`╭╼━━━━━━━━━━━━━━━━━━╮
┃ ❌ ACCESS DENIED!
┃ 🔒 Owner only
╰━━━━━━━━━━━━━━━━━━╯
> POWERED BY nyoni-xmd`);
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || (action !== 'inbox' && action !== 'same')) {
            return reply(`╭╼━━━━━━━━━━━━━━━━━━╮
┃ 📍 ANTI-DELETE PATH
┃
┃ 📊 Current : ${config.ANTI_DEL_PATH === "inbox" ? '📥 Inbox' : '💬 Same Chat'}
┃
┃ 📝 Usage :
┃   .antidelpath inbox
┃   .antidelpath same
╰━━━━━━━━━━━━━━━━━━╯
> POWERED BY nyoni-xmd`);
        }

        config.ANTI_DEL_PATH = action;
        
        return reply(`╭╼━━━━━━━━━━━━━━━━━━╮
┃ ✅ PATH UPDATED!
┃
┃ 📍 New Path : ${action === 'inbox' ? '📥 Inbox (Owner DM)' : '💬 Same Chat'}
┃
┃ 💡 Deleted messages will go to
┃    ${action === 'inbox' ? 'owner DM' : 'same chat'}
╰━━━━━━━━━━━━━━━━━━╯
> POWERED BY nyoni-xmd`);
    }
});
