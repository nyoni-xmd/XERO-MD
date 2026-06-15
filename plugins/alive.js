// plugins/alive.js
const moment = require('moment-timezone');

let botStartTime = Date.now();

global.registerCommand({
    command: "alive",
    alias: ["alive"],
    desc: "Check if bot is active",
    category: "info",
    function: async (conn, m, { from, reply, sender }) => {
        const currentTime = moment().tz("Africa/Dar_es_Salaam").format("HH:mm:ss");
        const currentDate = moment().tz("Africa/Dar_es_Salaam").format("dddd, MMMM Do YYYY");
        
        const runtime = Date.now() - botStartTime;
        const hours = Math.floor(runtime / (1000 * 60 * 60));
        const minutes = Math.floor((runtime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((runtime % (1000 * 60)) / 1000);

        let senderNumber = sender ? sender.split('@')[0] : "User";

        const aliveText = `╭┈┈❍ *XERO-MD* ❍
┊• *Bot is active & online!*
┊• *User* : @${senderNumber}
┊• *Owner* : nyoni-xmd
┊• *Number 1* : +255763111390
┊• *Number 2* : +255610209120
┊• *Version* : 3.0.0
┊• *Time* : ${currentTime}
┊• *Mode* : public
┊• *Date* : ${currentDate}
┆• *Uptime* : ${hours}h ${minutes}m ${seconds}s
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`;

        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/gyaka2.png' },
            caption: aliveText,
            contextInfo: {
                mentionedJid: [`${senderNumber}@s.whatsapp.net`],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363399470975987@newsletter',
                    newsletterName: 'XERO-MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
    }
});
