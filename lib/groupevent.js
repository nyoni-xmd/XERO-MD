// lib/groupevents.js - XERO-MD Group Events (XTREME-XMD Style)
// ✨ Premium Styled Group Events ✨

const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363399470975987@newsletter',
            newsletterName: 'XERO-MD',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://files.catbox.moe/gyaka2.png',
    'https://files.catbox.moe/gyaka2.png',
    'https://files.catbox.moe/gyaka2.png',
];

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;
        const groupName = metadata.subject || "Group";
        const groupOwner = metadata.owner?.split('@')[0] || "Unknown";

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            // ========== WELCOME MESSAGE (XTREME STYLE) ==========
            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `╭╼━≪• *XERO-MD* •≫━╾╮
┃ ✨ *WELCOME NEW MEMBER!* ✨
┃
┃ 🎉 *USER* : @${userName}
┃ 👑 *OWNER* : nyoni-xmd
┃ 📞 *NUMBER 1* : +255763111390
┃ 📞 *NUMBER 2* : +255610209120
┃ 👥 *MEMBERS* : #${groupMembersCount}
┃ ⏰ *TIME* : ${timestamp}
┃
┃ 📝 *GROUP DESCRIPTION*
┃ ${desc.length > 60 ? desc.substring(0, 60) + '...' : desc}
╰━━━━━━━━━━━━━━━━━━━━━╯
💫 *Enjoy your stay!*
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });
            }

            // ========== GOODBYE MESSAGE (XTREME STYLE) ==========
            else if (update.action === "remove" && config.GOODBYE === "true") {
                const GoodbyeText = `╭╼━≪• *XERO-MD* •≫━╾╮
┃ 🌟 *GOODBYE MEMBER!* 🌟
┃
┃ 👋 *USER* : @${userName}
┃ 👑 *OWNER* : nyoni-xmd
┃ 📞 *NUMBER 1* : +255763111390
┃ 📞 *NUMBER 2* : +255610209120
┃ 👥 *REMAINING* : #${groupMembersCount}
┃ ⏰ *TIME* : ${timestamp}
╰━━━━━━━━━━━━━━━━━━━━━╯
💫 *You will be missed!*
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });
            }

            // ========== DEMOTE EVENT (XTREME STYLE) ==========
            else if (update.action === "demote" && config.ADMIN_ACTION === "true") {
                const demoter = update.author?.split("@")[0] || "Admin";
                await conn.sendMessage(update.id, {
                    text: `╭╼⪨ *XERO-MD* ⪩╾╮
┃ ⚡ *DEMOTION NOTICE* ⚡
┃
┃ 📛 *DEMOTED* : @${userName}
┃ 👑 *BY* : @${demoter}
┃ 👥 *GROUP* : ${groupName}
┃ ⏰ *TIME* : ${timestamp}
╰─────────────────╯
> POWERED BY nyoni-xmd`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }

            // ========== PROMOTE EVENT (XTREME STYLE) ==========
            else if (update.action === "promote" && config.ADMIN_ACTION === "true") {
                const promoter = update.author?.split("@")[0] || "Admin";
                await conn.sendMessage(update.id, {
                    text: `╭╼⪨ *XERO-MD* ⪩╾╮
┃ 🎉 *PROMOTION NOTICE* 🎉
┃
┃ 👑 *PROMOTED* : @${userName}
┃ 👑 *BY* : @${promoter}
┃ 👥 *GROUP* : ${groupName}
┃ ⏰ *TIME* : ${timestamp}
╰─────────────────╯
> POWERED BY nyoni-xmd`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
