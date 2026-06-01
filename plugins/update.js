const { cmd } = require('./command.js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config');

// Current version from package.json
const packageJson = require('../package.json');
let currentVersion = packageJson.version || "3.0.0";
let updateChecking = false;
let lastUpdateCheck = null;

// GitHub repo info
const REPO_OWNER = "nyoni-xmd";
const REPO_NAME = "XERO-MD";
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// Function to check for updates from GitHub
async function checkForUpdates() {
    try {
        const response = await axios.get(`${GITHUB_API}/commits?per_page=1`, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        
        const latestCommit = response.data[0];
        const latestCommitDate = new Date(latestCommit.commit.author.date);
        const latestCommitSha = latestCommit.sha.substring(0, 7);
        const latestCommitMsg = latestCommit.commit.message.split('\n')[0];
        
        // Get current commit from local (if exists)
        let currentCommit = "unknown";
        try {
            const gitLog = await new Promise((resolve, reject) => {
                exec('git log -1 --format="%h"', (error, stdout) => {
                    if (error) reject(error);
                    else resolve(stdout.trim());
                });
            });
            currentCommit = gitLog;
        } catch(e) {}
        
        const hasUpdate = currentCommit !== latestCommitSha && currentCommit !== "unknown";
        
        return {
            hasUpdate: hasUpdate,
            currentCommit: currentCommit,
            latestCommit: latestCommitSha,
            latestCommitMsg: latestCommitMsg,
            latestCommitDate: latestCommitDate,
            latestCommitUrl: latestCommit.html_url
        };
    } catch (error) {
        console.error("Update check error:", error.message);
        return {
            hasUpdate: false,
            error: error.message
        };
    }
}

// Function to perform actual update
async function performUpdate() {
    return new Promise((resolve, reject) => {
        exec('git pull origin main', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                reject({ error: error.message, stdout, stderr });
            } else {
                // After pulling, install new dependencies if needed
                exec('npm install --production', { maxBuffer: 1024 * 1024 * 10 }, (npmError, npmStdout, npmStderr) => {
                    if (npmError) {
                        resolve({ 
                            success: true, 
                            gitOutput: stdout, 
                            npmOutput: npmStdout,
                            npmError: npmStderr,
                            warning: "Git pull successful but npm install had issues"
                        });
                    } else {
                        resolve({ 
                            success: true, 
                            gitOutput: stdout, 
                            npmOutput: npmStdout,
                            message: "Update successful! Restart bot to apply changes."
                        });
                    }
                });
            }
        });
    });
}

// Command to check for updates
cmd({
    pattern: "update",
    alias: ["checkupdate", "upgrade"],
    desc: "Check for updates from GitHub",
    category: "owner",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner, args }) => {
    try {
        if (!isOwner) return reply("❌ *Access Denied!*\nOnly bot owner can use this command.");
        
        await reply("🔍 *Checking for updates...* Please wait.");
        
        const updateInfo = await checkForUpdates();
        
        if (updateInfo.error) {
            return reply(`❌ *Update Check Failed*\n\nError: ${updateInfo.error}\n\nPlease check internet connection.`);
        }
        
        if (!updateInfo.hasUpdate) {
            const infoMsg = `╭━━❍ *UPDATE STATUS* ❍
┃ ❍ *sᴛᴀᴛᴜs* : ✅ UP TO DATE
┃ ❍ *ᴄᴜʀʀᴇɴᴛ* : ${updateInfo.currentCommit}
┃ ❍ *ʟᴀᴛᴇsᴛ* : ${updateInfo.latestCommit}
┃ ❍ *ᴍᴇssᴀɢᴇ* : ${updateInfo.latestCommitMsg}
╰━━━━━━━━━━━━━━━━━━━❍

⚡ XERO-MD is running the latest version!
📦 No updates available.`;
            reply(infoMsg);
        } else {
            const updateMsg = `╭━━❍ *UPDATE AVAILABLE* ❍
┃ ❍ *ᴠᴇʀsɪᴏɴ* : ${currentVersion}
┃ ❍ *ᴄᴜʀʀᴇɴᴛ* : ${updateInfo.currentCommit}
┃ ❍ *ʟᴀᴛᴇsᴛ* : ${updateInfo.latestCommit}
┃ ❍ *ᴍᴇssᴀɢᴇ* : ${updateInfo.latestCommitMsg}
┃ ❍ *ᴅᴀᴛᴇ* : ${updateInfo.latestCommitDate.toLocaleString()}
╰━━━━━━━━━━━━━━━━━━━❍

╭─〔 ACTIONS 〕─╮
│ • .update now - Install update
│ • .update check - Check again
╰───────────────╯

💡 *New features available!*`;
            reply(updateMsg);
        }
        
    } catch (error) {
        console.error(error);
        reply(`❌ Error checking updates: ${error.message}`);
    }
});

// Command to perform actual update
cmd({
    pattern: "update",
    alias: ["updatenow"],
    desc: "Install updates from GitHub",
    category: "owner",
    react: "📥",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner, args }) => {
    try {
        if (!isOwner) return reply("❌ *Access Denied!*\nOnly bot owner can use this command.");
        
        const action = args[0]?.toLowerCase();
        
        if (action === "now") {
            await reply("🔄 *Installing updates...*\nThis may take a moment.");
            
            const result = await performUpdate();
            
            if (result.success) {
                const successMsg = `✅ *UPDATE SUCCESSFUL!*

╭━━━━━━━━━━━━━━━━━╮
│ 📦 *Git Output*:
│ ${result.gitOutput.substring(0, 200)}
│
│ 📚 *NPM Output*:
│ ${result.npmOutput ? result.npmOutput.substring(0, 200) : "Dependencies OK"}
╰━━━━━━━━━━━━━━━━━╯

⚠️ *RESTART REQUIRED!*
Type: .restart to apply changes.`;
                reply(successMsg);
            } else {
                reply(`❌ *Update Failed*\n\nError: ${result.error}\n\nTry manual update from GitHub.`);
            }
        } else {
            reply(`📥 *How to update:*
            
.update now - Install latest updates
.update check - Check for updates

⚠️ Bot will need restart after update.`);
        }
        
    } catch (error) {
        console.error(error);
        reply(`❌ Error installing update: ${error.message}`);
    }
});

// Command to restart bot after update
cmd({
    pattern: "restart",
    desc: "Restart the bot (apply updates)",
    category: "owner",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ *Access Denied!*\nOnly bot owner can use this command.");
        
        await reply("🔄 *Restarting bot...*\nPlease wait 10-15 seconds.");
        
        setTimeout(() => {
            process.exit(0);
        }, 2000);
        
    } catch (error) {
        console.error(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// Command to show version info
cmd({
    pattern: "version",
    alias: ["ver", "about"],
    desc: "Show bot version and update info",
    category: "info",
    react: "📦",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner }) => {
    try {
        let updateStatus = "Unknown";
        let latestCommit = "Unknown";
        let currentCommit = "Unknown";
        
        try {
            const updateInfo = await checkForUpdates();
            updateStatus = updateInfo.hasUpdate ? "⚠️ Update Available" : "✅ Up to Date";
            latestCommit = updateInfo.latestCommit;
            currentCommit = updateInfo.currentCommit;
        } catch(e) {}
        
        const versionInfo = `╭━━❍ *XERO-MD INFO* ❍
┃ ❍ *ʙᴏᴛ ɴᴀᴍᴇ* : XERO-MD
┃ ❍ *ᴠᴇʀsɪᴏɴ* : ${currentVersion}
┃ ❍ *ᴅᴇᴠ* : nyoni-xmd
┃ ❍ *ʀᴇᴘᴏ* : github.com/nyoni-xmd/XERO-MD
┃ ❍ *ᴄᴜʀʀᴇɴᴛ* : ${currentCommit}
┃ ❍ *ʟᴀᴛᴇsᴛ* : ${latestCommit}
┃ ❍ *ᴜᴘᴅᴀᴛᴇ sᴛᴀᴛᴜs* : ${updateStatus}
╰━━━━━━━━━━━━━━━━━━━❍

╭─〔 COMMANDS 〕─╮
│ • .update check - Check for updates
│ • .update now - Install updates
│ • .version - Show this info
╰───────────────╯

> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`;
        
        reply(versionInfo);
    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});

// Periodic update check (every 6 hours)
setInterval(async () => {
    if (!updateChecking) {
        updateChecking = true;
        try {
            const updateInfo = await checkForUpdates();
            if (updateInfo.hasUpdate) {
                console.log(`🔄 [AUTO] Update available: ${updateInfo.latestCommit} - ${updateInfo.latestCommitMsg}`);
                // You can add notification to owner here if needed
            }
        } catch(e) {}
        updateChecking = false;
    }
}, 6 * 60 * 60 * 1000); // Check every 6 hours

console.log("✅ Auto-update plugin loaded! Updates from: nyoni-xmd/XERO-MD");
