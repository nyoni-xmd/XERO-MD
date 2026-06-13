const { cmd } = require('../lib/functions');
cmd({ pattern: "runtime", alias: ["uptime"], desc: "Bot uptime", category: "info", react: "⏰", filename: __filename }, async (conn, mek, m, { reply }) => { const u = process.uptime(); reply(`⏰ Uptime: ${Math.floor(u/3600)}h ${Math.floor((u%3600)/60)}m ${Math.floor(u%60)}s`); });
