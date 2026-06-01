const { cmd } = require('./command.js');
const moment = require('moment-timezone');

cmd({
    pattern: "time",
    alias: ["tanzania", "tz"],
    desc: "Show current time in Tanzania",
    category: "info",
    react: "⏰",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    const time = moment().tz("Africa/Dar_es_Salaam").format("HH:mm:ss");
    const date = moment().tz("Africa/Dar_es_Salaam").format("dddd, DD MMMM YYYY");
    reply(`⏰ *Tanzania Time*\n🕐 ${time}\n📅 ${date}`);
});
