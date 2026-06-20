// plugins/crush.js - XERO-MD Crush Command
global.registerCommand({
    command: "crush",
    alias: ["love", "like", "simp"],
    desc: "Send a cute crush message to someone",
    category: "fun",
    function: async (conn, m, { from, reply, args, mentionedJid, sender, isGroup }) => {
        try {
            // Check if a target is provided
            let targetJid = mentionedJid?.[0] || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            
            // If in DM and no target, use the other participant
            if (!targetJid && !isGroup) {
                // In DM, the other person is the recipient
                // Get the other participant (not the bot)
                const chat = await conn.getChat(from);
                if (chat && chat.participants) {
                    const participants = chat.participants.filter(p => p.id !== conn.user.id);
                    if (participants.length > 0) {
                        targetJid = participants[0].id;
                    }
                }
            }

            if (!targetJid) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *CRUSH COMMAND*
┊•
┊• 💡 *Usage* :
┊•   .crush @username (in group)
┊•   .crush 255712345678 (phone number)
┊•   .crush (in DM - automatically targets the other person)
┊•
┊• 💕 *It will send a cute crush message to the person*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            // Get sender's name
            let senderName = "Someone";
            try {
                const contact = await conn.getContact(sender);
                if (contact.notify) senderName = contact.notify;
                else if (contact.vname) senderName = contact.vname;
            } catch (e) {}

            // Get target's name
            let targetName = targetJid.split('@')[0];
            try {
                const contact = await conn.getContact(targetJid);
                if (contact.notify) targetName = contact.notify;
                else if (contact.vname) targetName = contact.vname;
            } catch (e) {}

            // ========== CRUSH MESSAGES COLLECTION ==========
            const crushMessages = [
                "I just wanted to let you know that you're always on my mind 💭❤️",
                "Every time I see you, my heart skips a beat 💓😍",
                "I think I'm falling for you... and I don't want to get up 💕😊",
                "You make my days brighter just by existing ✨💫",
                "I can't stop thinking about you... and I don't want to 🥰💖",
                "If I could choose anyone in the world, I'd choose you every time 🌍❤️",
                "You're like a song that I want to listen to on repeat 🎵💕",
                "I'm not good at words, but I'm good at liking you 😅❤️",
                "They say love is blind, but I can see you perfectly 👀💖",
                "You're the reason I smile when I check my phone 📱😊",
                "I wish I could tell you this in person, but here goes... I like you 💕",
                "You're beautiful, you're amazing, and I'm lucky to know you 🌟❤️",
                "I have a crush on you and I'm not afraid to say it! 💗",
                "You're like a dream I don't want to wake up from 😴💕",
                "Every moment with you feels special ✨❤️",
                "I think you're the best thing that's happened to me 🥰💖"
            ];

            // ========== PICKUP LINES (Optional) ==========
            const pickupLines = [
                "Are you a magician? Because whenever I look at you, everyone else disappears ✨",
                "Do you have a map? I keep getting lost in your eyes 🗺️👀",
                "Is your name Google? Because you have everything I'm searching for 🔍❤️",
                "Are you made of copper and tellurium? Because you're Cu-Te 😉",
                "Do you have a Band-Aid? Because I just scraped my knee falling for you 🩹💕",
                "If you were a vegetable, you'd be a cute-cumber 🥒😄",
                "Do you have a sunburn, or are you always this hot? ☀️🔥",
                "Can I follow you home? Cause my parents always told me to follow my dreams 💭✨"
            ];

            // Randomly select a message and a pickup line
            const randomMessage = crushMessages[Math.floor(Math.random() * crushMessages.length)];
            const randomPickup = pickupLines[Math.floor(Math.random() * pickupLines.length)];
            const usePickup = Math.random() > 0.5;

            // ========== SEND CRUSH MESSAGE ==========
            const crushText = `╭┈┈❍ *XERO-MD* ❍
┊• 💕 *YOU HAVE A CRUSH!* 💕
┊•
┊• 👤 *From* : ${senderName}
┊• 📱 *Number* : ${sender.split('@')[0]}
┊• 💌 *Message* : 
┊• ${randomMessage}
┊•
${usePickup ? `┊• 💬 *Pickup line* : ${randomPickup}\n┊•` : ''}
┊• 💖 *Will you accept their love?*
┊• ⏰ *Time* : ${new Date().toLocaleString()}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

            // Send to the target
            await conn.sendMessage(targetJid, {
                text: crushText,
                mentions: [sender, targetJid],
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

            // Send confirmation to the sender
            const confirmText = `╭┈┈❍ *XERO-MD* ❍
┊• ✅ *Crush sent successfully!*
┊•
┊• 💕 *To* : ${targetName} (${targetJid.split('@')[0]})
┊• 💌 *Message sent* : "${randomMessage}"
┊•
┊• 💖 *Good luck! Hope they say yes!* 💖
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

            await reply(confirmText);

        } catch (error) {
            console.error("Crush Error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Error sending crush!*
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
