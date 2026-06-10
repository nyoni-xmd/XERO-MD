const { cmd } = require('../command');  // ← Imebadilishwa kutoka DianaTech → command
const config = require('../config');
const fetch = require('node-fetch');

const languages = {
    af: "Afrikaans",
    sq: "Albanian",
    ar: "Arabic",
    hy: "Armenian",
    az: "Azerbaijani",
    eu: "Basque",
    be: "Belarusian",
    bn: "Bengali",
    bs: "Bosnian",
    bg: "Bulgarian",
    ca: "Catalan",
    ceb: "Cebuano",
    zh: "Chinese",
    hr: "Croatian",
    cs: "Czech",
    da: "Danish",
    nl: "Dutch",
    en: "English",
    eo: "Esperanto",
    et: "Estonian",
    fi: "Finnish",
    fr: "French",
    gl: "Galician",
    ka: "Georgian",
    de: "German",
    el: "Greek",
    gu: "Gujarati",
    ht: "Haitian Creole",
    ha: "Hausa",
    he: "Hebrew",
    hi: "Hindi",
    hu: "Hungarian",
    is: "Icelandic",
    id: "Indonesian",
    ga: "Irish",
    it: "Italian",
    ja: "Japanese",
    kn: "Kannada",
    ko: "Korean",
    la: "Latin",
    lv: "Latvian",
    lt: "Lithuanian",
    mk: "Macedonian",
    ms: "Malay",
    ml: "Malayalam",
    mt: "Maltese",
    mr: "Marathi",
    ne: "Nepali",
    no: "Norwegian",
    fa: "Persian",
    pl: "Polish",
    pt: "Portuguese",
    pa: "Punjabi",
    ro: "Romanian",
    ru: "Russian",
    sr: "Serbian",
    si: "Sinhala",
    sk: "Slovak",
    sl: "Slovenian",
    so: "Somali",
    es: "Spanish",
    sw: "Swahili",
    sv: "Swedish",
    ta: "Tamil",
    te: "Telugu",
    th: "Thai",
    tr: "Turkish",
    uk: "Ukrainian",
    ur: "Urdu",
    vi: "Vietnamese",
    cy: "Welsh",
    yi: "Yiddish"
};

cmd({
    pattern: "translate",
    alias: ["trt", "trans"],
    desc: "Translate Text",
    category: "tools",
    react: "🌐",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

    try {

        let text = "";
        let lang = "";

        const quoted =
            mek.message?.extendedTextMessage
            ?.contextInfo?.quotedMessage;

        if (quoted) {

            text =
                quoted.conversation ||
                quoted.extendedTextMessage?.text ||
                quoted.imageMessage?.caption ||
                quoted.videoMessage?.caption ||
                "";

            lang = q?.trim();

        } else {

            if (!q) {

                const list = Object.entries(languages)
                    .slice(0, 20)
                    .map(([c, n]) => `▫️ ${c} = ${n}`)
                    .join('\n');

                return reply(
`╭━━〔 🌐 TRANSLATOR 〕━━⬣

Example:
.tr hello fr
.translate hello es

Or Reply:
.tr fr

Some Languages:

${list}

+ 50 Languages Supported
╰━━━━━━━━━━━━━━⬣
> ${config.BOT_NAME || "XERO-MD"}`
                );
            }

            const args = q.split(" ");

            lang = args.pop().toLowerCase();
            text = args.join(" ");
        }

        if (!text)
            return reply("❌ No text found.");

        if (!languages[lang])
            return reply(
                "❌ Invalid language code.\nExample: fr, es, en, hi, ar"
            );

        await conn.sendMessage(
            from,
            {
                react: {
                    text: "⏳",
                    key: mek.key
                }
            }
        );

        let translated = null;

        try {

            const res = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
            );

            const data = await res.json();

            translated =
                data?.[0]
                    ?.map(v => v[0])
                    ?.join("");

        } catch {}

        if (!translated) {

            try {

                const res = await fetch(
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`
                );

                const data = await res.json();

                translated =
                    data?.responseData?.translatedText;

            } catch {}
        }

        if (!translated)
            return reply(
                "❌ Translation failed."
            );

        await conn.sendMessage(
            from,
            {
                text:
`╭━━〔 🌐 TRANSLATED 〕━━⬣
┃ 📝 Text:
┃ ${text}
┃
┃ 🌍 Language:
┃ ${languages[lang]}
┃
┃ ✅ Result:
┃ ${translated}
╰━━━━━━━━━━━━━━⬣
> ${config.BOT_NAME || "XERO-MD"}`
            },
            { quoted: mek }
        );

        await conn.sendMessage(
            from,
            {
                react: {
                    text: "✅",
                    key: mek.key
                }
            }
        );

    } catch (err) {

        console.log(err);

        reply(
            "❌ Failed to translate text."
        );
    }
});
