const fs = require('fs');
const path = require('path');

// Global commands storage
if (!global.commands) {
    global.commands = new Map();
}
if (!global.aliases) {
    global.aliases = new Map();
}
if (!global.commandsArray) {
    global.commandsArray = [];
}

function registerCommand(cmd) {
    if (cmd.command) {
        global.commands.set(cmd.command, cmd);
        if (cmd.alias && Array.isArray(cmd.alias)) {
            cmd.alias.forEach(alias => {
                global.aliases.set(alias, cmd.command);
            });
        }
        // Add to array for menu
        global.commandsArray.push(cmd);
    }
}

function getCommand(cmdName) {
    let command = global.commands.get(cmdName);
    if (!command && global.aliases.has(cmdName)) {
        command = global.commands.get(global.aliases.get(cmdName));
    }
    return command;
}

function cmd(options, func) {
    const commandData = {
        command: options.pattern,
        alias: options.alias || [],
        desc: options.desc || "No description",
        category: options.category || "general",
        react: options.react || "✅",
        function: func,
        filename: options.filename || __filename,
        use: options.use || "",
        pattern: options.pattern
    };
    
    if (registerCommand) {
        registerCommand(commandData);
    }
}

// Export for other plugins
module.exports = { 
    cmd, 
    registerCommand, 
    getCommand,
    commands: global.commands,
    commandsArray: global.commandsArray
};
