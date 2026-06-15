// plugins/anticall.js - XERO-MD Anti-Call Feature
let antiCallEnabled = false;

global.registerCommand({
    command: "anticall",
    alias: ["callblock"],
    desc: "Enable or disable auto call reject",
    category: "settings",
    function: async (conn, m, { reply, args }) => {
        const action = args[0]?.toLowerCase();
        
        if (!action) {
            const status = antiCallEnabled ? "✅ ENABLED" : "❌ DISABLED";
            return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *Anti-Call* : ${status}
┊• *Usage* : .anticall on/off
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }

        if (action === "on") {
            antiCallEnabled = true;
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• *Anti-Call* : ✅ ENABLED
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        } else if (action === "off") {
            antiCallEnabled = false;
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• *Anti-Call* : ❌ DISABLED
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

// Call handler
let callListenerSet = false;

global.registerCommand({
    command: "callhandler",
    desc: "Internal call handler",
    on: "body",
    function: async (conn, m) => {
        if (!callListenerSet) {
            conn.ev.on('call', async (calls) => {
                if (!antiCallEnabled) return;
                for (const call of calls) {
                    if (call.status !== "offer") continue;
                    try {
                        await conn.rejectCall(call.id, call.from);
                        if (!call.isGroup) {
                            await conn.sendMessage(call.from, {
                                text: `╭┈┈❍ *XERO-MD* ❍
┊• *Call automatically rejected!*
┊• *Owner is currently busy*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                                contextInfo: {
                                    forwardingScore: 999,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: '120363399470975987@newsletter',
                                        newsletterName: 'XERO-MD',
                                        serverMessageId: 143
                                    }
                                }
                            });
                        }
                    } catch (err) {}
                }
            });
            callListenerSet = true;
        }
    }
});
