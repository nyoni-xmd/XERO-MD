// ============================================================
// command.js - XERO-MD Command Registration System
// ============================================================
const fs = require('fs');
const path = require('path');

// Global storage for commands (in case index.js hasn't initialized them yet)
if (!global.commandsArray) global.commandsArray = [];
if (!global.commands) global.commands = new Map();
if (!global.aliases) global.aliases = new Map();

// Register a command
function registerCommand(cmd) {
    if (cmd.command) {
        global.commands.set(cmd.command, cmd);
        if (cmd.alias && Array.isArray(cmd.alias)) {
            cmd.alias.forEach(alias => {
                global.aliases.set(alias, cmd.command);
            });
        }
        // Also push to array for menu listing
        global.commandsArray.push(cmd);
    }
}

// Get a command by name or alias
function getCommand(cmdName) {
    let command = global.commands.get(cmdName);
    if (!command && global.aliases.has(cmdName)) {
        command = global.commands.get(global.aliases.get(cmdName));
    }
    return command;
}

// The main cmd() function that plugins will use
function cmd(options, functionToExecute) {
    const commandData = {
        command: options.pattern,
        alias: options.alias || [],
        desc: options.desc || "No description",
        category: options.category || "general",
        react: options.react || "✅",
        function: functionToExecute,
        filename: options.filename || __filename,
        use: options.use || "",
        pattern: options.pattern
    };
    
    if (registerCommand) {
        registerCommand(commandData);
    }
}

// Export for plugins
module.exports = {
    cmd,
    registerCommand,
    getCommand,
    commands: global.commands,
    commandsArray: global.commandsArray
};
