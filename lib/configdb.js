let configs = {};
async function setConfig(key, value) { configs[key] = value; return true; }
async function getConfig(key) { return configs[key] || null; }
module.exports = { setConfig, getConfig };
