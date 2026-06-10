const { cmd } = require("../command");
const config = require("../config");
const os = require("os");

let botVersion = "2.0.0";

try {
  botVersion = require("../../package.json").version || "2.0.0";
} catch {
  botVersion = "2.0.0";
}

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

function formatUptime(seconds) {
  if (!seconds || isNaN(seconds)) return "0s";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// Fake quoted message for XERO-MD
const botInfoMsg = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    conversation: "📊 XERO-MD System Info"
  }
};

cmd({
  pattern: "botinfo",
  alias: ["system", "info", "status"],
  react: "📊",
  desc: "Show complete bot information",
  category: "utility",
  filename: __filename
}, async (conn, mek, m, { from, reply, prefix }) => {
  try {
    await conn.sendMessage(from, {
      react: { text: "📊", key: mek.key }
    });

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const cpuInfo = os.cpus() || [];
    const cpuModel = cpuInfo[0]?.model || "Unknown CPU";
    const cpuCores = cpuInfo.length || 1;

    // Count total commands
    let totalCommands = 0;
    if (global.commands && Array.isArray(global.commands)) {
      totalCommands = global.commands.length;
    } else if (global.plugins && Array.isArray(global.plugins)) {
      totalCommands = global.plugins.length;
    } else if (global._commands && typeof global._commands.size === "number") {
      totalCommands = global._commands.size;
    } else {
      totalCommands = 52; // default value
    }

    const botName = config.BOT_NAME || "XERO-MD";
    const menuImage = config.ALIVE_IMG || "https://files.catbox.moe/gyaka2.png";
    const newsletterJid = "120363418161689316@newsletter";
    const newsletterName = "XERO-MD";

    const senderId = m?.sender || mek?.key?.remoteJid || from;
    const senderName = senderId.split("@")[0] || "User";

    const dec = `
╭━━━━━━━━━━━━━━━━━━━━━━━⬣
┃ 🤖 ${botName} BOT INFO
╰━━━━━━━━━━━━━━━━━━━━━━━⬣

👋 Hello @${senderName}

╭━━〔 👑 BOT DETAILS 〕━━⬣
┃ 🏷️ Name : ${botName}
┃ ⚡ Version : ${botVersion}
┃ 🔖 Prefix : ${prefix || "."}
┃ 📦 Commands : ${totalCommands}
┃ 🚀 Node.js : ${process.version}
┃ ⏰ Uptime : ${formatUptime(process.uptime())}
╰━━━━━━━━━━━━━━━━━━⬣

╭━━〔 💻 SYSTEM INFO 〕━━⬣
┃ 🖥️ Platform : ${os.platform()}
┃ 🏗️ Architecture : ${os.arch()}
┃ 🔥 CPU : ${cpuModel.slice(0, 30)}
┃ ⚙️ Cores : ${cpuCores}
┃ 📊 RAM Used : ${formatBytes(usedMem)}
┃ 💾 RAM Free : ${formatBytes(freeMem)}
┃ 📦 RAM Total : ${formatBytes(totalMem)}
┃ ⏱️ System Uptime : ${formatUptime(os.uptime())}
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ XERO-MD • Powered by NYONI XMD
`;

    await conn.sendMessage(
      from,
      {
        image: { url: menuImage },
        caption: dec,
        mentions: [senderId],
        contextInfo: {
          mentionedJid: [senderId],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: newsletterName
          }
        }
      },
      { quoted: botInfoMsg }
    );

    await conn.sendMessage(from, {
      react: { text: "✅", key: mek.key }
    });

  } catch (e) {
    console.error("BotInfo error:", e);
    reply("❌ An error occurred while fetching bot info.\n" + e.message);
  }
});
