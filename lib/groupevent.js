// lib/groupevents.js - XERO-MD Group Events (Welcome, Goodbye, Promote, Demote)
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

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            let ppUrl;
            try {
                ppUrl = await conn.profilePictureUrl(num, 'image');
            } catch {
                try {
                    ppUrl = await conn.profilePictureUrl(update.id, 'image');
                } catch {
                    ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
                }
            }

            // WELCOME MESSAGE
            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `╭━ 「 *XERO-MD* 」
┃ ⥤ *Hi Dear* : @${userName}
┃ ⥤ *Group* : ${groupName}
┃ ⥤ *Members* : #${groupMembersCount}
┃ ⥤ *Time* : ${timestamp}
┃ ⥤ *Owner* : nyoni-xmd
┃ ⥤ *Number 1* : +255763111390
┃ ⥤ *Number 2* : +255610209120
╰━━━━━━━━━━━━━━━━━━➤

> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });
            }

            // GOODBYE MESSAGE
            else if (update.action === "remove" && config.GOODBYE === "true") {
                const GoodbyeText = `╭━ 「 *XERO-MD* 」
┃ ⥤ *Bye Dear* : @${userName}
┃ ⥤ *Group* : ${groupName}
┃ ⥤ *Members left* : #${groupMembersCount}
┃ ⥤ *Time* : ${timestamp}
┃ ⥤ *Owner* : nyoni-xmd
╰━━━━━━━━━━━━━━━━━━➤

> POWERED BY nyoni-xmd`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });
            }

            // DEMOTE EVENT
            else if (update.action === "demote" && config.ADMIN_ACTION === "true") {
                const demoter = update.author?.split("@")[0] || "Admin";
                await conn.sendMessage(update.id, {
                    text: `╭━ 「 *XERO-MD* 」
┃ ⥤ *Action* : Demoted
┃ ⥤ *User* : @${userName}
┃ ⥤ *By* : @${demoter}
╰━━━━━━━━━━━━━━━━━━➤

> POWERED BY nyoni-xmd`,
                    mentions: [num, update.author],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }

            // PROMOTE EVENT
            else if (update.action === "promote" && config.ADMIN_ACTION === "true") {
                const promoter = update.author?.split("@")[0] || "Admin";
                await conn.sendMessage(update.id, {
                    text: `╭━ 「 *XERO-MD* 」
┃ ⥤ *Action* : Promoted
┃ ⥤ *User* : @${userName}
┃ ⥤ *By* : @${promoter}
╰━━━━━━━━━━━━━━━━━━➤

> POWERED BY nyoni-xmd`,
                    mentions: [num, update.author],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
