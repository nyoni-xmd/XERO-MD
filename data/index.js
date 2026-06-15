// data/index.js - Database handlers for anti-delete and messages
const fs = require('fs');
const path = require('path');

const ANTI_DELETE_FILE = path.join(__dirname, 'antidel.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// ========== ANTI-DELETE FUNCTIONS ==========
async function getAnti() {
    try {
        if (fs.existsSync(ANTI_DELETE_FILE)) {
            const data = fs.readFileSync(ANTI_DELETE_FILE, 'utf-8');
            return JSON.parse(data).enabled === true;
        }
    } catch (e) {}
    return false; // Default disabled
}

async function setAnti(enabled) {
    try {
        fs.writeFileSync(ANTI_DELETE_FILE, JSON.stringify({ enabled: enabled }, null, 2));
        return true;
    } catch (e) {
        console.error("Failed to save anti-delete status:", e);
        return false;
    }
}

// ========== MESSAGE STORAGE FUNCTIONS ==========
async function saveMessage(mek) {
    try {
        let messages = {};
        if (fs.existsSync(MESSAGES_FILE)) {
            messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
        }
        
        const messageId = mek.key?.id;
        if (messageId) {
            messages[messageId] = {
                message: mek.message,
                jid: mek.key.remoteJid,
                timestamp: Date.now()
            };
            
            // Keep only last 100 messages
            const keys = Object.keys(messages);
            if (keys.length > 100) {
                const oldestKey = keys.sort((a, b) => messages[a].timestamp - messages[b].timestamp)[0];
                delete messages[oldestKey];
            }
            
            fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        }
        return true;
    } catch (e) {
        console.error("Failed to save message:", e);
        return false;
    }
}

async function loadMessage(id) {
    try {
        if (fs.existsSync(MESSAGES_FILE)) {
            const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
            return messages[id] || null;
        }
    } catch (e) {}
    return null;
}

// ========== OTHER HELPER FUNCTIONS ==========
async function saveContact(jid, name) {
    // Implement if needed
    return true;
}

async function getName(jid) {
    return jid.split('@')[0];
}

async function getChatSummary(jid) {
    return "Chat summary";
}

async function saveGroupMetadata(jid, metadata) {
    return true;
}

async function getGroupMetadata(jid) {
    return null;
}

async function saveMessageCount(jid, count) {
    return true;
}

async function getInactiveGroupMembers(jid, days) {
    return [];
}

async function getGroupMembersMessageCount(jid) {
    return {};
}

async function initializeAntiDeleteSettings() {
    return true;
}

// Export all functions
module.exports = {
    getAnti,
    setAnti,
    saveMessage,
    loadMessage,
    saveContact,
    getName,
    getChatSummary,
    saveGroupMetadata,
    getGroupMetadata,
    saveMessageCount,
    getInactiveGroupMembers,
    getGroupMembersMessageCount,
    initializeAntiDeleteSettings
};
