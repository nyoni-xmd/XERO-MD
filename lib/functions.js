const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');

async function sms(conn, m) { return m; }

async function AntiDelete(conn, updates) {
    console.log('🛡️ Anti-delete triggered');
}

async function downloadMediaMessage(msg) {
    const stream = await downloadContentFromMessage(msg, msg.mimetype?.split('/')[0] || 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}

async function getBuffer(url) {
    try {
        const res = await axios({ url, responseType: 'arraybuffer', timeout: 15000 });
        return res.data;
    } catch { return null; }
}

async function getGroupAdmins(participants) {
    return participants.filter(p => p.admin).map(p => p.id);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { sms, AntiDelete, downloadMediaMessage, getBuffer, getGroupAdmins, sleep };
