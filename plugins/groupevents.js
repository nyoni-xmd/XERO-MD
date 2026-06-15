// plugins/groupevents.js - XERO-MD Group Events (Welcome, Goodbye, Promote, Demote)
const config = require('../config');

global.registerCommand({
    command: "setwelcome",
    alias: ["welcomeon", "welcometoggle"],
    desc: "Enable or disable welcome messages in group",
    category: "group",
    function: async (conn, m, { from, isGroup, isAdmins, reply, args }) => {
        if (!isGroup) return reply("❌ This command only works in groups.");
        if (!isAdmins) return reply("❌ Only admins can use this command.");

        const action = args[0]?.toLowerCase();
        
        if (action === 'on') {
            config.WELCOME = "true";
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *WELCOME ENABLED!*
┊•
┊• 🎉 New members will be welcomed
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        } else if (action === 'off') {
            config.WELCOME = "false";
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *WELCOME DISABLED!*
┊•
┊• 🚫 No welcome messages will be sent
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        } else {
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📍 *WELCOME SETTINGS*
┊•
┊• 📊 Status : ${config.WELCOME === "true" ? '✅ ON' : '❌ OFF'}
┊•
┊• 📝 Usage :
┊•   .setwelcome on  - Enable
┊•   .setwelcome off - Disable
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

global.registerCommand({
    command: "setgoodbye",
    alias: ["goodbyeon", "goodbyetoggle"],
    desc: "Enable or disable goodbye messages in group",
    category: "group",
    function: async (conn, m, { from, isGroup, isAdmins, reply, args }) => {
        if (!isGroup) return reply("❌ This command only works in groups.");
        if (!isAdmins) return reply("❌ Only admins can use this command.");

        const action = args[0]?.toLowerCase();
        
        if (action === 'on') {
            config.GOODBYE = "true";
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *GOODBYE ENABLED!*
┊•
┊• 👋 Leaving members will be bid farewell
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        } else if (action === 'off') {
            config.GOODBYE = "false";
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *GOODBYE DISABLED!*
┊•
┊• 🚫 No goodbye messages will be sent
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        } else {
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📍 *GOODBYE SETTINGS*
┊•
┊• 📊 Status : ${config.GOODBYE === "true" ? '✅ ON' : '❌ OFF'}
┊•
┊• 📝 Usage :
┊•   .setgoodbye on  - Enable
┊•   .setgoodbye off - Disable
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

global.registerCommand({
    command: "setadminevents",
    alias: ["adminevents", "adminnotify"],
    desc: "Enable or disable promote/demote notifications",
    category: "group",
    function: async (conn, m, { from, isGroup, isAdmins, reply, args }) => {
        if (!isGroup) return reply("❌ This command only works in groups.");
        if (!isAdmins) return reply("❌ Only admins can use this command.");

        const action = args[0]?.toLowerCase();
        
        if (action === 'on') {
            config.ADMIN_ACTION = "true";
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *ADMIN EVENTS ENABLED!*
┊•
┊• 👑 Promote/Demote notifications ON
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        } else if (action === 'off') {
            config.ADMIN_ACTION = "false";
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *ADMIN EVENTS DISABLED!*
┊•
┊• 🚫 No promote/demote notifications
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        } else {
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📍 *ADMIN EVENTS SETTINGS*
┊•
┊• 📊 Status : ${config.ADMIN_ACTION === "true" ? '✅ ON' : '❌ OFF'}
┊•
┊• 📝 Usage :
┊•   .setadminevents on  - Enable
┊•   .setadminevents off - Disable
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

// ========== GROUP EVENT HANDLER ==========
const GroupEvents = async (conn, update) => {
    try {
        const { id, action, participants, author } = update;
        
        if (!id.endsWith('@g.us')) return;
        
        const metadata = await conn.groupMetadata(id);
        const groupName = metadata.subject || "Group";
        const groupMembersCount = metadata.participants.length;
        
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(id, 'image');
        } catch {
            ppUrl = 'https://files.catbox.moe/gyaka2.png';
        }
        
        const timestamp = new Date().toLocaleString();
        
        for (const num of participants) {
            const userName = num.split('@')[0];
            
            // ========== WELCOME MESSAGE ==========
            if (action === "add" && config.WELCOME === "true") {
                const WelcomeText = `╭┈┈❍ *XERO-MD* ❍
┊• ✨ *WELCOME NEW MEMBER!*
┊•
┊• 🎉 *User* : @${userName}
┊• 👑 *Owner* : nyoni-xmd
┊• 📞 *Number 1* : +255763111390
┊• 📞 *Number 2* : +255610209120
┊• 👥 *Members* : #${groupMembersCount}
┊• ⏰ *Time* : ${timestamp}
┊• 📛 *Group* : ${groupName}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

                await conn.sendMessage(id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                });
            }
            
            // ========== GOODBYE MESSAGE ==========
            else if (action === "remove" && config.GOODBYE === "true") {
                const GoodbyeText = `╭┈┈❍ *XERO-MD* ❍
┊• 🌟 *MEMBER LEFT*
┊•
┊• 👋 *User* : @${userName}
┊• 👑 *Owner* : nyoni-xmd
┊• 📞 *Number 1* : +255763111390
┊• 📞 *Number 2* : +255610209120
┊• 👥 *Remaining* : #${groupMembersCount}
┊• ⏰ *Time* : ${timestamp}
┊• 📛 *Group* : ${groupName}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

                await conn.sendMessage(id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                });
            }
            
            // ========== DEMOTE EVENT ==========
            else if (action === "demote" && config.ADMIN_ACTION === "true") {
                const demoter = author?.split('@')[0] || "Admin";
                await conn.sendMessage(id, {
                    text: `╭┈┈❍ *XERO-MD* ❍
┊• ⚡ *DEMOTION NOTICE*
┊•
┊• 📛 *Demoted* : @${userName}
┊• 👑 *By* : @${demoter}
┊• 👥 *Group* : ${groupName}
┊• ⏰ *Time* : ${timestamp}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                    mentions: [author, num],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                });
            }
            
            // ========== PROMOTE EVENT ==========
            else if (action === "promote" && config.ADMIN_ACTION === "true") {
                const promoter = author?.split('@')[0] || "Admin";
                await conn.sendMessage(id, {
                    text: `╭┈┈❍ *XERO-MD* ❍
┊• 🎉 *PROMOTION NOTICE*
┊•
┊• 👑 *Promoted* : @${userName}
┊• 👑 *By* : @${promoter}
┊• 👥 *Group* : ${groupName}
┊• ⏰ *Time* : ${timestamp}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                    mentions: [author, num],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363399470975987@newsletter',
                            newsletterName: 'XERO-MD',
                            serverMessageId: 143
                        }
                    }
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
