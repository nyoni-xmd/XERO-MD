// data/messages.js - XERO-MD Message Storage
const fs = require('fs');
const path = require('path');

const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Ensure messages file exists
if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
}

// ========== SAVE MESSAGE ==========
function saveMessage(messageData) {
    try {
        const messages = getMessages();
        messages.push({
            ...messageData,
            timestamp: Date.now()
        });
        
        // Keep only last 1000 messages
        if (messages.length > 1000) {
            messages.splice(0, messages.length - 1000);
        }
        
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        return true;
    } catch (e) {
        console.error("Save message error:", e);
        return false;
    }
}

// ========== GET ALL MESSAGES ==========
function getMessages() {
    try {
        const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// ========== GET MESSAGES BY SENDER ==========
function getMessagesBySender(senderJid, limit = 5) {
    const messages = getMessages();
    const filtered = messages
        .filter(msg => msg.sender === senderJid)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    return filtered;
}

// ========== GET MESSAGES BY RECIPIENT ==========
function getMessagesByRecipient(recipientJid, limit = 5) {
    const messages = getMessages();
    const filtered = messages
        .filter(msg => msg.recipient === recipientJid)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    return filtered;
}

// ========== GET MESSAGES BETWEEN TWO PEOPLE ==========
function getMessagesBetween(jid1, jid2, limit = 5) {
    const messages = getMessages();
    const filtered = messages
        .filter(msg => 
            (msg.sender === jid1 && msg.recipient === jid2) ||
            (msg.sender === jid2 && msg.recipient === jid1)
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    return filtered;
}

// ========== CLEAR MESSAGES ==========
function clearMessages() {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
    return true;
}

module.exports = {
    saveMessage,
    getMessages,
    getMessagesBySender,
    getMessagesByRecipient,
    getMessagesBetween,
    clearMessages
};
