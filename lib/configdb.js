// lib/configdb.js - XERO-MD Config Database
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../config.json');

// Ensure config file exists
if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({}, null, 2));
}

// ========== SET CONFIG ==========
function setConfig(key, value) {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        config[key] = value;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        return true;
    } catch (e) {
        console.error("Set config error:", e);
        return false;
    }
}

// ========== GET CONFIG ==========
function getConfig(key) {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        return config[key] || null;
    } catch (e) {
        return null;
    }
}

// ========== GET ALL CONFIG ==========
function getAllConfig() {
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch (e) {
        return {};
    }
}

module.exports = { setConfig, getConfig, getAllConfig };
