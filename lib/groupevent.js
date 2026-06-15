// lib/groupevents.js - XERO-MD Group Events Handler
const config = require('../config');

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
            
            // ========== WELCOME ==========
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
            
            // ========== GOODBYE ==========
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
            
            // ========== DEMOTE ==========
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
            
            // ========== PROMOTE ==========
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
