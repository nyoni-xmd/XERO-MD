const { cmd } = require('../lib/functions');
const moment = require('moment-timezone');
cmd({ pattern: "alive", desc: "Check bot status", category: "info", react: "✨", filename: __filename }, async (conn, mek, m, { reply }) => { reply(`✨ XERO-MD is alive!\n⏰ ${moment().tz("Africa/Dar_es_Salaam").format("HH:mm:ss")}\n⚡ Power - Speed - Control`); });
