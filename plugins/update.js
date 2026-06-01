const { cmd } = require("../command");
const config = require('../config');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const moment = require('moment-timezone');

// Store last update time
let lastUpdateTime = Date.now();
let lastDeployTime = null;
let currentVersion = "3.0.0";

// Read last deploy time from file if exists
const deployFile = path.join(__dirname, '../deploy.json');
if (fs.existsSync(deployFile)) {
    try {
        const data = JSON.parse(fs.readFileSync(deployFile, 'utf8'));
        lastDeployTime = data.lastDeployTime;
        currentVersion = data.version || "3.0.0";
    } catch (e) {}
}

// Function to save deploy time
function saveDeployTime() {
    const data = {
        lastDeployTime: Date.now(),
        version: currentVersion
    };
    fs.writeFileSync(deployFile, JSON.stringify(data, null, 2));
}

// Check for updates (simulated)
function checkForUpdates() {
    // In real scenario, you would check GitHub API
    // For now, returns false (no update)
    return {
        hasUpdate: false,
        latestVersion: currentVersion,
        lastCheck: new Date().toISOString()
    };
}

cmd({
    pattern: "update",
    alias: ["checkupdate", "versioninfo"],
    desc: "Check bot version and update status",
    category: "owner",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner, senderNumber }) => {
    try {
        if (!isOwner) {
            return reply("❌ *Access Denied!*\nOnly bot owner can use this command.");
        }

        const updateCheck = checkForUpdates();
        const runtime = process.uptime();
        const hours = Math.floor(runtime / 3600);
        const minutes = Math.floor((runtime % 3600) / 60);
        const seconds = Math.floor(runtime % 60);
        
        const currentTime = moment().tz("Africa/Dar_es_Salaam").format("HH:mm:ss");
        const currentDate = moment().tz("Africa/Dar_es_Salaam").format("dddd, DD MMMM YYYY");

        let lastDeployText = "Not recorded";
        if (lastDeployTime) {
            const deployDate = moment(lastDeployTime).tz("Africa/Dar_es_Salaam");
            lastDeployText = deployDate.format("DD/MM/YYYY HH:mm:ss");
        }

        const updateInfo = `╭━━❍ *UPDATE STATUS* ❍
┃ ❍ *ᴠᴇʀsɪᴏɴ* : ${currentVersion}
┃ ❍ *ʟᴀsᴛ ᴅᴇᴘʟᴏʏ* : ${lastDeployText}
┃ ❍ *ʙᴏᴛ ʀᴜɴᴛɪᴍᴇ* : ${hours}h ${minutes}m ${seconds}s
┃ ❍ *ᴄᴜʀʀᴇɴᴛ ᴛɪᴍᴇ* : ${currentTime}
┃ ❍ *ᴄᴜʀʀᴇɴᴛ ᴅᴀᴛᴇ* : ${currentDate}
╰━━━━━━━━━━━━━━━━━━━❍

╭─〔 UPDATE CHECK 〕─╮
│ 🔍 *sᴛᴀᴛᴜs* : ${updateCheck.hasUpdate ? '✅ UPDATE AVAILABLE!' : '✅ UP TO DATE'}
│ 📦 *ʟᴀᴛᴇsᴛ ᴠᴇʀsɪᴏɴ* : ${updateCheck.latestVersion}
│ 📅 *ʟᴀsᴛ ᴄʜᴇᴄᴋ* : ${updateCheck.lastCheck}
╰───────────────╯

╭─〔 COMMANDS 〕─╮
│ • .update - Check for updates
│ • .deploy - Record new deployment
│ • .runtime - Check bot uptime
│ • .alive - Check bot status
╰───────────────╯

> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`;

        await conn.sendMessage(from, {
            text: updateInfo,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// Command to record deployment
cmd({
    pattern: "deploy",
    alias: ["newdeploy", "recorddeploy"],
    desc: "Record new deployment time",
    category: "owner",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner }) => {
    try {
        if (!isOwner) {
            return reply("❌ *Access Denied!*\nOnly bot owner can use this command.");
        }

        saveDeployTime();
        const deployTime = moment().tz("Africa/Dar_es_Salaam").format("DD/MM/YYYY HH:mm:ss");
        
        reply(`✅ *Deployment Recorded!*

📅 *Deploy Time* : ${deployTime}
🔧 *Version* : ${currentVersion}
🔄 *Status* : Ready

> Use .update to check status`);
    } catch (error) {
        console.error(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// Command to show bot version
cmd({
    pattern: "version",
    alias: ["ver", "botversion"],
    desc: "Show bot version",
    category: "info",
    react: "📦",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const versionInfo = `╭━━❍ *XERO-MD VERSION* ❍
┃ ❍ *ᴠᴇʀsɪᴏɴ* : ${currentVersion}
┃ ❍ *ᴅᴇᴠ* : nyoni-xmd
┃ ❍ *ʙᴏᴛ* : XERO-MD
┃ ❍ *sᴛᴀᴛᴜs* : ʀᴜɴɴɪɴɢ
╰━━━━━━━━━━━━━━━━━━━❍

> ⚡ POWER - SPEED - CONTROL
> 🚀 BEYOND LIMITS`;

        reply(versionInfo);
    } catch (error) {
        console.error(error);
        reply(`❌ Error: ${error.message}`);
    }
});
