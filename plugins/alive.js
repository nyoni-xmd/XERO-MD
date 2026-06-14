global.registerCommand({
    command: "alive",
    desc: "Check if bot is running",
    category: "info",
    function: async (conn, m, store, { reply }) => {
        reply("✨ XERO-MD is alive and online!\n⚡ Power - Speed - Control");
    }
});
