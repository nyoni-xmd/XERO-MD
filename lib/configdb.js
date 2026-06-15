// lib/configdb.js - XERO-MD Config Database
let configs = {};

async function setConfig(key, value) {
    configs[key] = value;
    return true;
}

async function getConfig(key) {
    return configs[key] || null;
}

async function getAllConfigs() {
    return configs;
}

module.exports = { setConfig, getConfig, getAllConfigs };
