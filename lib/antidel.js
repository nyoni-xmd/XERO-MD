// lib/antidelete.js - XERO-MD Anti-Delete Feature (Premium Styled)
const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    const messageContent = mek.message?.conversation || mek.message?.extendedTextMessage?.text || 'Unknown content';
    deleteInfo += `\n┃ 📝 *CONTENT* : ${messageContent}\n╰━━━━━━━━━━━━━━━━━━━━━╯`;

    await conn.sendMessage(
        jid,
        {
            text: deleteInfo,
            contextInfo: {
                mentionedJid: isGroup ? [update.key.participant, mek.key.participant] : [update.key.remoteJid],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363399470975987@newsletter',
                    newsletterName: 'XERO-MD',
                    serverMessageId: 143,
                },
            },
        },
        { quoted: mek },
    );
};

const DeletedMedia = async (conn, mek, jid, deleteInfo) => {
    const antideletedmek = structuredClone(mek.message);
    const messageType = Object.keys(antideletedmek)[0];
    
    if (antideletedmek[messageType]) {
        antideletedmek[messageType].contextInfo = {
            stanzaId: mek.key.id,
            participant: mek.sender,
            quotedMessage: mek.message,
        };
    }
    
    if (messageType === 'imageMessage' || messageType === 'videoMessage') {
        antideletedmek[messageType].caption = deleteInfo;
    } else if (messageType === 'audioMessage' || messageType === 'documentMessage') {
        await conn.sendMessage(jid, { 
            text: `╭╼━≪• *XERO-MD* •≫━╾╮
┃ ⚠️ *DELETED MEDIA ALERT* ⚠️
┃
${deleteInfo}
╰━━━━━━━━━━━━━━━━━━━━━╯
> POWERED BY nyoni-xmd`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363399470975987@newsletter',
                    newsletterName: 'XERO-MD',
                    serverMessageId: 143,
                },
            }
        }, { quoted: mek });
    }
    await conn.relayMessage(jid, antideletedmek, {});
};

const AntiDelete = async (conn, updates) => {
    for (const update of updates) {
        if (update.update.message === null) {
            const store = await loadMessage(update.key.id);

            if (store && store.message) {
                const mek = store.message;
                const isGroup = isJidGroup(store.jid);
                const antiDeleteStatus = await getAnti();
                if (!antiDeleteStatus) continue;

                const deleteTime = new Date().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });

                let deleteInfo, jid;
                
                if (isGroup) {
                    const groupMetadata = await conn.groupMetadata(store.jid);
                    const groupName = groupMetadata.subject;
                    const sender = mek.key.participant?.split('@')[0];
                    const deleter = update.key.participant?.split('@')[0];

                    deleteInfo = `╭╼━≪• *XERO-MD* •≫━╾╮
┃ 🧟 *ANTI-DELETE ALERT*
┃
┃ 😂 *SENDER* : @${sender}
┃ 👥 *GROUP* : ${groupName}
┃ ⏰ *TIME* : ${deleteTime}
┃ 🧎 *DELETED BY* : @${deleter}
┃ ⚠️ *ACTION* : Message Deleted`;
                    jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : store.jid;
                } else {
                    const senderNumber = mek.key.remoteJid?.split('@')[0];
                    const deleterNumber = update.key.remoteJid?.split('@')[0];
                    
                    deleteInfo = `╭╼━≪• *XERO-MD* •≫━╾╮
┃ 🤖 *ANTI-DELETE ALERT*
┃
┃ 🎭 *SENDER* : @${senderNumber}
┃ ⏰ *TIME* : ${deleteTime}
┃ ⚠️ *ACTION* : Message Deleted`;
                    jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : update.key.remoteJid;
                }

                if (mek.message?.conversation || mek.message?.extendedTextMessage) {
                    await DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
                } else {
                    await DeletedMedia(conn, mek, jid, deleteInfo);
                }
            }
        }
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
};
