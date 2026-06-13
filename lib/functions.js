const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
async function sms(conn, m) { return m; }
async function AntiDelete(conn, updates) { console.log('AntiDelete triggered'); }
async function downloadMediaMessage(msg) {
    let stream = await downloadContentFromMessage(msg, msg.mimetype.split('/')[0]);
    let buf = Buffer.from([]);
    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
    return buf;
}
async function getBuffer(url) { return (await axios({ url, responseType: 'arraybuffer' })).data; }
async function getGroupAdmins(participants) { return participants.filter(p => p.admin).map(p => p.id); }
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
module.exports = { sms, AntiDelete, downloadMediaMessage, getBuffer, getGroupAdmins, sleep };
