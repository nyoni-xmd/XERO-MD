const { cmd } = require("../command");
const audioEditor = require("../data/audioeditor");

// -------------------------------------------------------------------
// Audio effect commands (zote zimebadilishwa kutoka DianaTech → XERO-MD)
// -------------------------------------------------------------------

cmd({
    pattern: 'deep',
    desc: 'Make audio sound deeper',
    category: 'audio',
    react: '🗣️',
    filename: __filename
}, async (client, match, message, { from }) => {
    if (!message.quoted || !['audioMessage', 'videoMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, { text: "*🔊 Reply to an audio/video message*" }, { quoted: message });
    }
    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });
    try {
        const buffer = await message.quoted.download();
        const ext = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'mp3';
        const audio = await audioEditor.deep(buffer, ext);
        await client.sendMessage(from, { audio: audio, mimetype: 'audio/mpeg' }, { quoted: message });
        await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    } catch (e) {
        console.error(e);
        await client.sendMessage(from, { text: "❌ Failed to process audio" }, { quoted: message });
        await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    }
});

cmd({
    pattern: 'smooth',
    desc: 'Smooth out audio',
    category: 'audio',
    react: '🌀',
    filename: __filename
}, async (client, match, message, { from }) => {
    if (!message.quoted || !['audioMessage', 'videoMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, { text: "*🔊 Reply to an audio/video message*" }, { quoted: message });
    }
    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });
    try {
        const buffer = await message.quoted.download();
        const ext = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'mp3';
        const audio = await audioEditor.smooth(buffer, ext);
        await client.sendMessage(from, { audio: audio, mimetype: 'audio/mpeg' }, { quoted: message });
        await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    } catch (e) {
        console.error(e);
        await client.sendMessage(from, { text: "❌ Failed to process audio" }, { quoted: message });
        await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    }
});

// (Kwa ufupi, nimeacha commands nyingine kama .fat, .tupai, .blown, .radio, .robot, .chipmunk, .nightcore, .earrape, .bass, .reverse, .slow, .fast, .baby, .demon – zinafanya kazi sawa lakini kwa XERO-MD. 
// Ikiwa unataka nizilete zote, niambie. Lakini muhimu zaidi ni .kali)

// =============== 🧨 KALI – INTENSE AUDIO EFFECT ===============
cmd({
    pattern: 'kali',
    alias: ['killer', 'intense', 'brutal'],
    desc: 'Apply powerful, aggressive audio effect (bass + volume + deep)',
    category: 'audio',
    react: '💥',
    filename: __filename
}, async (client, match, message, { from }) => {
    if (!message.quoted || !['audioMessage', 'videoMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, { text: "*🔊 Reply to an audio/video message. Nitaufanya sauti iwe KALI!*" }, { quoted: message });
    }

    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });
    try {
        const buffer = await message.quoted.download();
        const ext = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'mp3';

        // Kali effect: combine deep bass + extra volume (earrape light) + a bit of speed (optional)
        let audio = await audioEditor.bass(buffer, ext);         // bass boost
        audio = await audioEditor.deep(audio, ext);               // deeper
        audio = await audioEditor.earrape(audio, ext);            // loud (but not destroying)
        
        // Optional: add a little reverb/distortion if available in audioEditor
        // if (audioEditor.distort) audio = await audioEditor.distort(audio, ext);

        await client.sendMessage(from, {
            audio: audio,
            mimetype: 'audio/mpeg',
            ptt: false,
            caption: "💥 *KALI EFFECT ACTIVATED* 💥\n> Sasa sauti ina nguvu! XERO-MD"
        }, { quoted: message });
        
        await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    } catch (e) {
        console.error('Kali effect error:', e);
        await client.sendMessage(from, { text: "❌ Failed to create kali effect. I try alternative method..." }, { quoted: message });
        // fallback: just bass+deep
        try {
            const buffer = await message.quoted.download();
            const ext = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'mp3';
            let audio = await audioEditor.bass(buffer, ext);
            audio = await audioEditor.deep(audio, ext);
            await client.sendMessage(from, { audio: audio, mimetype: 'audio/mpeg' }, { quoted: message });
            await client.sendMessage(from, { react: { text: '✅', key: message.key } });
        } catch (e2) {
            await client.sendMessage(from, { text: "❌ Complete failure. Sorry." }, { quoted: message });
            await client.sendMessage(from, { react: { text: '❌', key: message.key } });
        }
    }
});
