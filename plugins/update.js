// plugins/update.js - XERO-MD Auto Update (FIXED)
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AdmZip = require("adm-zip");

// XERO-MD GitHub repo
const REPO_OWNER = "nyoni-xmd";
const REPO_NAME = "XERO-MD";
const REPO_URL = `https://github.com/nyoni-xmd/xero-md`;
const API_URL = `https://api.github.com/repos/nyoni-xmd/xero-md/commits/main`;
const DOWNLOAD_URL = `https://github.com/nyoni-xmd/xero-md/archive/main.zip`;

// Helper: Copy folders while preserving important files
function copyFolderSync(source, target, preserveFiles = ['config.js', 'app.json', 'config.env', 'sessions', '.env']) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

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

// Helper: Get current commit hash
function getCurrentCommitHash() {
    try {
        const hashFile = path.join(__dirname, '../.current_hash');
        if (fs.existsSync(hashFile)) {
            return fs.readFileSync(hashFile, 'utf-8').trim();
        }
    } catch (e) {}
    return null;
}

// Helper: Save commit hash
function saveCommitHash(hash) {
    try {
        const hashFile = path.join(__dirname, '../.current_hash');
        fs.writeFileSync(hashFile, hash);
    } catch (e) {}
}

// ==================== UPDATE COMMAND ====================
global.registerCommand({
    command: "update",
    alias: ["upgrade", "sync", "gitpull"],
    desc: "Update XERO-MD bot to the latest version",
    category: "owner",
    function: async (conn, m, { from, reply, isOwner }) => {
        if (!isOwner) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ Access Denied!
┊• Only bot owner can use this command
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        try {
            // Step 1: Check for updates
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 🔍 Checking for updates...
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            const { data: commitData } = await axios.get(API_URL, { timeout: 10000 });
            const latestHash = commitData.sha;
            const latestMsg = commitData.commit.message.split('\n')[0];
            const latestDate = new Date(commitData.commit.author.date).toLocaleString();

            const currentHash = getCurrentCommitHash();

            // If already up to date
            if (currentHash && currentHash === latestHash) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ Bot is already up to date!
┊• 📦 Version : ${latestHash.substring(0, 7)}
┊• 📅 Updated : ${latestDate}
┊• 💬 ${latestMsg}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            // Step 2: Update available
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 🚀 Update available!
┊• 📦 Current : ${currentHash ? currentHash.substring(0, 7) : 'Unknown'}
┊• 📦 Latest : ${latestHash.substring(0, 7)}
┊• 💬 ${latestMsg}
┊• 📅 ${latestDate}
┊•
┊• ⏳ Downloading update...
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            // Step 3: Download zip
            const zipPath = path.join(__dirname, "latest.zip");
            const { data: zipData } = await axios.get(DOWNLOAD_URL, { 
                responseType: "arraybuffer",
                timeout: 60000 
            });
            fs.writeFileSync(zipPath, zipData);

            // Step 4: Extract
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📦 Extracting update...
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            const extractPath = path.join(__dirname, 'xero_update');
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractPath, true);

            // Step 5: Copy files (preserve config)
            const sourcePath = path.join(extractPath, `${REPO_NAME}-main`);
            const destPath = path.join(__dirname, '..');
            copyFolderSync(sourcePath, destPath, ['config.js', 'app.json', 'config.env', 'sessions', '.env']);

            // Step 6: Save new hash
            saveCommitHash(latestHash);

            // Step 7: Cleanup
            fs.unlinkSync(zipPath);
            fs.rmSync(extractPath, { recursive: true, force: true });

            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ Update complete!
┊• 📦 New version : ${latestHash.substring(0, 7)}
┊• 🔄 Restarting bot...
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            // Restart bot
            setTimeout(() => {
                process.exit(0);
            }, 2000);

        } catch (error) {
            console.error("Update error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ Update failed!
┊• 🔧 Error : ${error.message}
┊• 📝 Try manual: ${REPO_URL}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

// ==================== VERSION COMMAND ====================
global.registerCommand({
    command: "version",
    alias: ["ver", "about", "v"],
    desc: "Show bot version information",
    category: "info",
    function: async (conn, m, { reply }) => {
        try {
            const currentHash = getCurrentCommitHash();
            
            let latestInfo = "";
            try {
                const { data: commitData } = await axios.get(API_URL, { timeout: 5000 });
                const latestHash = commitData.sha.substring(0, 7);
                const isUpToDate = currentHash === commitData.sha;
                latestInfo = `┊• 📦 Latest : ${latestHash}
┊• 🟢 Status : ${isUpToDate ? '✅ Up to date' : '⚠️ Update available'}`;
            } catch (e) {
                latestInfo = `┊• 📦 Latest : Unable to check`;
            }

            const verMsg = `╭┈┈❍ *XERO-MD* ❍
┊• 🤖 Bot : XERO-MD
┊• 👨‍💻 Developer : nyoni-xmd
┊• 📞 Number 1 : +255763111390
┊• 📞 Number 2 : +255610209120
┊• 📦 Version : 3.0.0
┊• 🔢 Commit : ${currentHash ? currentHash.substring(0, 7) : 'Unknown'}
${latestInfo}
┊•
┊• ⚡ Power - Speed - Control
┊• 🚀 Beyond Limits
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`;

            await reply(verMsg);
        } catch (error) {
            reply(`❌ Error: ${error.message}`);
        }
    }
});

// ==================== FORCE UPDATE ====================
global.registerCommand({
    command: "forceupdate",
    alias: ["fupdate", "hardupdate"],
    desc: "Force update XERO-MD (ignore current version)",
    category: "owner",
    function: async (conn, m, { from, reply, isOwner }) => {
        if (!isOwner) {
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ Access Denied!
┊• Only bot owner can use this
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        try {
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 🔄 Force update started...
┊• ⏳ Downloading latest version...
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            // Download
            const zipPath = path.join(__dirname, "latest.zip");
            const { data: zipData } = await axios.get(DOWNLOAD_URL, { 
                responseType: "arraybuffer",
                timeout: 60000 
            });
            fs.writeFileSync(zipPath, zipData);

            // Extract
            const extractPath = path.join(__dirname, 'xero_update');
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractPath, true);

            // Copy
            const sourcePath = path.join(extractPath, `${REPO_NAME}-main`);
            const destPath = path.join(__dirname, '..');
            copyFolderSync(sourcePath, destPath, ['config.js', 'app.json', 'config.env', 'sessions', '.env']);

            // Save hash
            const { data: commitData } = await axios.get(API_URL);
            saveCommitHash(commitData.sha);

            // Cleanup
            fs.unlinkSync(zipPath);
            fs.rmSync(extractPath, { recursive: true, force: true });

            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ Force update complete!
┊• 🔄 Restarting bot...
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            setTimeout(() => {
                process.exit(0);
            }, 2000);

        } catch (error) {
            console.error("Force update error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ Force update failed!
┊• 🔧 Error : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
