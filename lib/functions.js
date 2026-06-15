// lib/functions.js - XERO-MD Helper Functions
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');

// ========== SMS FUNCTION ==========
async function sms(conn, m) {
    return m;
}

// ========== ANTI-DELETE FUNCTION ==========
async function AntiDelete(conn, updates) {
    try {
        const { loadMessage, getAnti } = require('../data');
        const { isJidGroup } = require('@whiskeysockets/baileys');
        const config = require('../config');
        
        const antiDeleteStatus = await getAnti();
        if (!antiDeleteStatus) return;

        for (const update of updates) {
            if (update.update.message === null) {
                const store = await loadMessage(update.key.id);
                if (store && store.message) {
                    const mek = store.message;
                    const isGroup = isJidGroup(store.jid);
                    const deleteTime = new Date().toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    });

                    let deleteInfo, jid;
                    
                    if (isGroup) {
                        const groupMetadata = await conn.groupMetadata(store.jid);
                        const groupName = groupMetadata.subject || "Unknown Group";
                        const sender = mek.key.participant?.split('@')[0] || "Unknown";
                        const deleter = update.key.participant?.split('@')[0] || "Unknown";

                        deleteInfo = `╭┈┈❍ *XERO-MD* ❍
┊• 🧟 *ANTI-DELETE ALERT*
┊•
┊• 😂 *Sender* : @${sender}
┊• 👥 *Group* : ${groupName}
┊• ⏰ *Time* : ${deleteTime}
┊• 🧎 *Deleted by* : @${deleter}
┊• ⚠️ *Action* : Message Deleted`;
                        jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : store.jid;
                    } else {
                        const senderNumber = mek.key.remoteJid?.split('@')[0] || "Unknown";
                        const deleterNumber = update.key.remoteJid?.split('@')[0] || "Unknown";
                        
                        deleteInfo = `╭┈┈❍ *XERO-MD* ❍
┊• 🤖 *ANTI-DELETE ALERT*
┊•
┊• 🎭 *Sender* : @${senderNumber}
┊• ⏰ *Time* : ${deleteTime}
┊• ⚠️ *Action* : Message Deleted`;
                        jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : update.key.remoteJid;
                    }

                    const messageContent = mek.message?.conversation || mek.message?.extendedTextMessage?.text || 'Unknown content';
                    deleteInfo += `\n┊• 📝 *Content* : ${messageContent}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n\n> POWERED BY nyoni-xmd`;

                    await conn.sendMessage(jid, { text: deleteInfo, mentions: [update.key.participant, mek.key.participant] }, { quoted: mek });
                }
            }
        }
    } catch (err) {
        console.error('AntiDelete error:', err);
    }
}

// ========== DOWNLOAD MEDIA FUNCTION ==========
async function downloadMediaMessage(msg) {
    const stream = await downloadContentFromMessage(msg, msg.mimetype?.split('/')[0] || 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}

// ========== GET BUFFER FROM URL ==========
async function getBuffer(url) {
    try {
        const res = await axios({ url, responseType: 'arraybuffer', timeout: 15000 });
        return res.data;
    } catch { return null; }
}

// ========== GET GROUP ADMINS ==========
function getGroupAdmins(participants) {
    let admins = [];
    for (let i of participants) {
        if (i.admin) admins.push(i.id);
    }
    return admins;
}

// ========== SLEEP FUNCTION ==========
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== RUNTIME FUNCTION ==========
function runtime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
}

// ========== GET RANDOM ==========
function getRandom(length = 10) {
    return Math.random().toString(36).substring(2, 2 + length);
}

// ========== IS URL ==========
function isUrl(url) {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(url);
}

// ========== FORMAT BYTES ==========
function h2k(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ========== FETCH JSON ==========
async function fetchJson(url, options = {}) {
    try {
        const res = await axios({ url, ...options });
        return res.data;
    } catch (e) {
        return null;
    }
}

module.exports = {
    sms,
    AntiDelete,
    downloadMediaMessage,
    getBuffer,
    getGroupAdmins,
    sleep,
    runtime,
    getRandom,
    isUrl,
    h2k,
    fetchJson
};
