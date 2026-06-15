// plugins/update.js - XERO-MD Auto Update Plugin
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AdmZip = require("adm-zip");
const { exec } = require('child_process');

// XERO-MD GitHub repo (SAHIHI)
const REPO_OWNER = "nyoni-xmd";
const REPO_NAME = "XERO-MD";
const REPO_URL = `https://github.com/nyoni-xmd/xero-md`;
const API_URL = `https://api.github.com/repos/nyoni-xmd/xero-md/commits/main`;

// Helper function to copy folders while preserving important files
function copyFolderSync(source, target, preserveFiles = ['config.js', 'app.json', 'config.env', 'sessions']) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        // Skip preserving files
        if (preserveFiles.includes(item)) {
            console.log(`📁 Preserved: ${item}`);
            continue;
        }

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyFolderSync(srcPath, destPath, preserveFiles);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Helper function to get current commit hash
function getCurrentCommitHash() {
    try {
        const hashFile = path.join(__dirname, '../.current_hash');
        if (fs.existsSync(hashFile)) {
            return fs.readFileSync(hashFile, 'utf-8').trim();
        }
    } catch (e) {}
    return null;
}

// Helper function to save commit hash
function saveCommitHash(hash) {
    try {
        const hashFile = path.join(__dirname, '../.current_hash');
        fs.writeFileSync(hashFile, hash);
    } catch (e) {}
}

global.registerCommand({
    command: "update",
    alias: ["upgrade", "sync", "gitpull"],
    desc: "Update XERO-MD bot to the latest version",
    category: "owner",
    function: async (conn, m, { from, reply, isOwner }) => {
        if (!isOwner) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ Access Denied!*
┊• *Only bot owner can use this command*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        try {
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 🔍 *Checking for updates...*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            // Fetch latest commit from GitHub
            const { data: commitData } = await axios.get(API_URL);
            const latestCommitHash = commitData.sha;
            const latestCommitMsg = commitData.commit.message.split('\n')[0];
            const latestCommitDate = new Date(commitData.commit.author.date).toLocaleString();

            // Get current commit hash
            const currentHash = getCurrentCommitHash();

            if (currentHash === latestCommitHash) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *Bot is already up to date!*
┊•
┊• 📦 *Current version* : ${latestCommitHash.substring(0, 7)}
┊• 📅 *Last update* : ${latestCommitDate}
┊• 💬 *Message* : ${latestCommitMsg}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 🚀 *Update available!*
┊•
┊• 📦 *Current* : ${currentHash ? currentHash.substring(0, 7) : 'Unknown'}
┊• 📦 *Latest* : ${latestCommitHash.substring(0, 7)}
┊• 💬 *Message* : ${latestCommitMsg}
┊• 📅 *Date* : ${latestCommitDate}
┊•
┊• ⏳ *Downloading update...*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            // Download latest code as zip
            const zipPath = path.join(__dirname, "latest.zip");
            const downloadUrl = `https://github.com/nyoni-xmd/xero-md/archive/main.zip`;
            const { data: zipData } = await axios.get(downloadUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(zipPath, zipData);

            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📦 *Extracting update...*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            // Extract zip
            const extractPath = path.join(__dirname, 'xero_update');
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractPath, true);

            // Copy files (preserve config.js and app.json)
            const sourcePath = path.join(extractPath, `${REPO_NAME}-main`);
            const destinationPath = path.join(__dirname, '..');
            
            copyFolderSync(sourcePath, destinationPath, ['config.js', 'app.json', 'config.env', 'sessions']);

            // Save new commit hash
            saveCommitHash(latestCommitHash);

            // Cleanup
            fs.unlinkSync(zipPath);
            fs.rmSync(extractPath, { recursive: true, force: true });

            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *Update complete!*
┊•
┊• 📦 *New version* : ${latestCommitHash.substring(0, 7)}
┊• 🔄 *Restarting bot...*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            // Restart bot
            setTimeout(() => {
                process.exit(0);
            }, 2000);

        } catch (error) {
            console.error("Update error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Update failed!*
┊•
┊• 🔧 *Error* : ${error.message}
┊•
┊• 📝 *Try manual update from* : ${REPO_URL}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

// Check version command
global.registerCommand({
    command: "version",
    alias: ["ver", "about"],
    desc: "Show bot version information",
    category: "info",
    function: async (conn, m, { from, reply }) => {
        try {
            const currentHash = getCurrentCommitHash();
            
            // Try to get latest version info
            let latestInfo = "";
            try {
                const { data: commitData } = await axios.get(API_URL, { timeout: 5000 });
                const latestHash = commitData.sha.substring(0, 7);
                const isUpToDate = currentHash === commitData.sha;
                latestInfo = `┊• 📦 *Latest* : ${latestHash}
┊• 🟢 *Status* : ${isUpToDate ? '✅ Up to date' : '⚠️ Update available'}`;
            } catch (e) {
                latestInfo = `┊• 📦 *Latest* : Unable to check`;
            }

            const verMsg = `╭┈┈❍ *XERO-MD* ❍
┊• 🤖 *Bot* : XERO-MD
┊• 👨‍💻 *Developer* : nyoni-xmd
┊• 📞 *Number 1* : +255763111390
┊• 📞 *Number 2* : +255610209120
┊• 📦 *Version* : 3.0.0
┊• 🔢 *Commit* : ${currentHash ? currentHash.substring(0, 7) : 'Unknown'}
${latestInfo}
┊•
┊• ⚡ *Power - Speed - Control*
┊• 🚀 *Beyond Limits*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`;

            await reply(verMsg);
        } catch (error) {
            reply(`❌ Error: ${error.message}`);
        }
    }
});
