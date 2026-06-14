const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'messages.json');

async function saveMessage(m) {
    // Simple logging - you can expand later
    console.log(`💾 Message saved from ${m.key?.remoteJid}`);
    return true;
}

module.exports = { saveMessage };
