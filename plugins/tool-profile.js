const { cmd } = require('../command');  // Badala ya DianaTech
const { getBuffer, fetchJson } = require('../lib/functions');

// Fake contact ya ku-quote (ili kuongeza uhalisi)
const fakeContact = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "XERO-MD VERIFIED ✅",
            vcard: `
BEGIN:VCARD
VERSION:3.0
FN:nyoni-xmd
ORG:XERO-MD
TEL;type=CELL;type=VOICE;waid=255763111390:+255763111390
TEL;type=CELL;type=VOICE;waid=255610209120:+255610209120
END:VCARD`
        }
    }
};

cmd({
    pattern: "profile",
    react: "🍿",
    alias: ["userinfo", "person"],
    desc: "Get complete user profile information",
    category: "utility",
    use: '.person [@tag or reply]',
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply, quoted, participants }) => {
    try {
        let userJid = quoted?.sender || 
                     mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     sender;

        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ User not found on WhatsApp");

        // PROFILE PIC
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        }

        // NAME
        let userName = userJid.split('@')[0];
        try {
            if (isGroup) {
                const member = participants.find(p => p.id === userJid);
                if (member?.notify) userName = member.notify;
            }

            if (userName === userJid.split('@')[0] && conn.contactDB) {
                const contact = await conn.contactDB.get(userJid).catch(() => null);
                if (contact?.name) userName = contact.name;
            }

            if (userName === userJid.split('@')[0]) {
                const presence = await conn.presenceSubscribe(userJid).catch(() => null);
                if (presence?.pushname) userName = presence.pushname;
            }
        } catch {}

        // BIO
        let bio = {};
        try {
            const statusData = await conn.fetchStatus(userJid).catch(() => null);
            if (statusData?.status) {
                bio = {
                    text: statusData.status,
                    type: "Personal",
                    updated: statusData.setAt ? new Date(statusData.setAt * 1000) : null
                };
            } else {
                const businessProfile = await conn.getBusinessProfile(userJid).catch(() => null);
                if (businessProfile?.description) {
                    bio = {
                        text: businessProfile.description,
                        type: "Business",
                        updated: null
                    };
                }
            }
        } catch {}

        // ROLE
        let groupRole = "";
        if (isGroup) {
            const participant = participants.find(p => p.id === userJid);
            groupRole = participant?.admin ? "👑 Admin" : "👥 Member";
        }

        const formattedBio = bio.text ? 
            `${bio.text}\n└─ 📌 ${bio.type} Bio${bio.updated ? ` | 🕒 ${bio.updated.toLocaleString()}` : ''}` : 
            "No bio available";

        const userInfo = `
╭━━〔 👤 *USER PROFILE* 〕━━⬣
┃ ✦ 📛 Name : ${userName}
┃ ✦ 🔢 Number : ${userJid.replace(/@.+/, '')}
┃ ✦ 📌 Type : ${user.isBusiness ? "💼 Business" : user.isEnterprise ? "🏢 Enterprise" : "👤 Personal"}
┃
┃ ✦ 📝 About :
┃ ${formattedBio}
┃
┃ ✦ ⚙️ Info :
┃ ✓ Registered : ${user.isUser ? "Yes" : "No"}
┃ ✓ Verified : ${user.verifiedName ? "✅ Yes" : "❌ No"}
${isGroup ? `┃ ✦ 👥 Role : ${groupRole}` : ''}
╰━━━━━━━━━━━━━━⬣
`.trim();

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: userInfo,
            mentions: [userJid],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363399470975987@newsletter",
                    newsletterName: "XERO-MD",
                    serverMessageId: Math.floor(Math.random() * 1000)
                }
            }
        }, { quoted: fakeContact });

    } catch (e) {
        console.error("Person command error:", e);
        reply(`❌ Error: ${e.message || "Failed to fetch profile"}`);
    }
});
