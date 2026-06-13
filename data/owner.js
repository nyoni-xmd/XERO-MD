const { cmd } = require('../lib/functions');
cmd({ pattern: "owner", alias: ["creator", "dev"], desc: "Owner info", category: "info", react: "👑", filename: __filename }, async (conn, mek, m, { reply }) => { reply(`👑 OWNER\nName: nyoni-xmd\nNumber: +255763111390\nNumber 2: +255610209120\nBot: XERO-MD`); });
