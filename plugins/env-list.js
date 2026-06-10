// env-list.js - XERO-MD Environment Variables Lister
// Owner-only command to view all configured environment variables

const { cmd } = require('../command');
const config = require('../config');

// List of sensitive keys to hide partially (show only first/last characters)
const sensitiveKeys = [
    'SESSION_ID', 'OWNER_NUMBER', 'DEV', 'DEVELOPER_NUMBER',
    'OWNER_NAME', 'BOT_NAME', 'NEWSLETTER', 'ALIVE_IMG', 'MENU_IMAGE_URL'
];

// Function to mask sensitive values
const maskValue = (key, value) => {
    if (sensitiveKeys.includes(key) && value && value.length > 8) {
        // Show first 4 and last 4 characters, replace middle with ****
        const firstPart = value.substring(0, 4);
        const lastPart = value.substring(value.length - 4);
        return `${firstPart}****${lastPart}`;
    }
    if (sensitiveKeys.includes(key) && value && value.length <= 8) {
        return '******';
    }
    return value;
};

cmd({
    pattern: "envlist",
    alias: ["env", "configlist", "vars"],
    desc: "List all environment variables configured for the bot.",
    category: "owner",
    react: "🔧",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❌ *Access Denied!*\nOnly the bot owner can view environment variables.");

        // Gather all environment variables (process.env)
        const envVars = process.env;
        let envList = [];
        
        // Also include config.js values that are not in process.env (like default values)
        const configKeys = [
            'PREFIX', 'MODE', 'BOT_NAME', 'OWNER_NAME', 'OWNER_NUMBER',
            'NEWSLETTER', 'ALIVE_IMG', 'MENU_IMAGE_URL', 'AUTO_STATUS_SEEN',
            'AUTO_STATUS_REACT', 'AUTO_STATUS_REPLY', 'AUTO_REACT', 'CUSTOM_REACT',
            'ANTI_DELETE', 'ANTI_CALL', 'ANTI_LINK', 'READ_MESSAGE', 'ALWAYS_ONLINE'
        ];
        
        // Add process.env variables
        for (const [key, value] of Object.entries(envVars)) {
            // Only show keys that are likely relevant (start with common prefixes or are in our config)
            if (key.startsWith('AUTO_') || key.startsWith('ANTI_') || 
                key.includes('SESSION') || key.includes('OWNER') ||
                key.includes('BOT') || key.includes('MODE') ||
                key.includes('PREFIX') || key.includes('NEWSLETTER') ||
                key.includes('ALIVE') || key.includes('MENU') ||
                key === 'PORT' || key === 'RAILWAY_STATIC_URL' || key === 'HEROKU_APP_NAME') {
                envList.push({ key, value: maskValue(key, value) });
            }
        }
        
        // Also add config defaults that might not be in process.env
        for (const key of configKeys) {
            if (!envList.some(item => item.key === key) && config[key] !== undefined && config[key] !== '') {
                envList.push({ key, value: maskValue(key, String(config[key])) });
            }
        }
        
        if (envList.length === 0) {
            return reply("ℹ️ No environment variables found.");
        }
        
        // Sort alphabetically
        envList.sort((a, b) => a.key.localeCompare(b.key));
        
        // Format the message
        let message = `╭━━〔 🔧 *ENVIRONMENT VARIABLES* 〕━━⬣\n`;
        for (const item of envList) {
            message += `┃ ◈ *${item.key}* : \`${item.value}\`\n`;
        }
        message += `╰━━━━━━━━━━━━━━━━━━━⬣\n\n> *XERO-MD* | Total: ${envList.length} vars`;
        
        // Send as text (could also send as document if too long)
        if (message.length > 30000) {
            // If too long, send as a file
            const fs = require('fs');
            const path = require('path');
            const tempFile = path.join(__dirname, '../temp_env_list.txt');
            fs.writeFileSync(tempFile, message);
            await conn.sendMessage(from, {
                document: fs.readFileSync(tempFile),
                mimetype: 'text/plain',
                fileName: 'env_list.txt',
                caption: "📄 Environment variables list (truncated as text file)"
            }, { quoted: mek });
            fs.unlinkSync(tempFile);
        } else {
            await conn.sendMessage(from, { text: message }, { quoted: mek });
        }
        
    } catch (error) {
        console.error("Env list error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
