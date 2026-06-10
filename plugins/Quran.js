const { cmd, commands } = require('../DianaTech');
const { fetchJson } = require('../lib/functions');
const { translate } = require('@vitalets/google-translate-api');
const axios = require('axios');

cmd({
  pattern: "quran",
  alias: ["surah"],
  react: "🍨",
  desc: "Get Quran Surah details and explanation.",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    let surahInput = args[0];

    if (!surahInput) {
      return reply('Type Surah Number or Type *.Surahmenu* for getting Surah numbers');
    }

    let surahListRes = await fetchJson('https://quran-endpoint.vercel.app/quran');
    let surahList = surahListRes.data;

    let surahData = surahList.find(surah => 
        surah.number === Number(surahInput) || 
        surah.asma.ar.short.toLowerCase() === surahInput.toLowerCase() || 
        surah.asma.en.short.toLowerCase() === surahInput.toLowerCase()
    );

    if (!surahData) {
      return reply(`Couldn't find surah with number or name "${surahInput}"`);
    }

    let res = await axios.get(`https://quran-endpoint.vercel.app/quran/${surahData.number}`);
    
    if (res.status !== 200) {
      return reply(`API request failed with status ${res.status} and message ${res.statusText}`);
    }

    let json = res.data;

    let translatedTafsirUrdu = await translate(json.data.tafsir.id, { to: 'ur', autoCorrect: true });
    let translatedTafsirEnglish = await translate(json.data.tafsir.id, { to: 'en', autoCorrect: true });

   let quranSurah = `
╭───『 *QURAN: THE HOLY BOOK* 』───❏
│
├─❏ *📖 SURAH INFO*
│  ├─∘ *Number:* ${json.data.number}
│  ├─∘ *Arabic:* ${json.data.asma.ar.long}
│  ├─∘ *English:* ${json.data.asma.en.long}
│  ├─∘ *Type:* ${json.data.type.en}
│  └─∘ *Verses:* ${json.data.ayahCount}
│
├─❏ *🔮 EXPLANATION (URDU)*
│  └─∘ ${translatedTafsirUrdu.text}
│
├─❏ *🔮 EXPLANATION (ENGLISH)*
│  └─∘ ${translatedTafsirEnglish.text}
╰───❏`.trim();

    await conn.sendMessage(
      from,
      {
        image: { url: `https://files.catbox.moe/3lzhi9.jpg` },
        caption: quranSurah,
        contextInfo: {
          mentionedJid: [m.sender], 
          forwardingScore: 999,  
          isForwarded: true,   
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363336396621021@newsletter', 
            newsletterName: 'QUEEN LORA', 
            serverMessageId: 143
          }
        }
      },
      { quoted: mek }
    );

    if (json.data.recitation.full) {
      await conn.sendMessage(from, {
        audio: { url: json.data.recitation.full },
        mimetype: 'audio/mpeg',  
        ptt: true
      }, { quoted: mek });
    }

  } catch (error) {
    console.error(error);
    reply(`Error: ${error.message}`);
  }
});

cmd({
    pattern: "quranmenu",
    alias: ["surahmenu", "surahlist"],
    desc: "menu the bot",
    category: "menu",
    react: "❤️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
 let dec = `
╭───『 *🌹 QURAN KAREEM 🌹* 』───❏
│
├─❏ *💫 ALL SURAH LIST*
│  ├─∘ *Command:* .surah [number]
│  └─∘ *Example:* .surah 36
│
├─❏ *📖 SURAH 1-20*
│  ├─∘ 1. 🕌 Al-Fatiha (The Opening) - الفاتحہ
│  ├─∘ 2. 🐄 Al-Baqarah (The Cow) - البقرہ
│  ├─∘ 3. 🏠 Aali Imran - آل عمران
│  ├─∘ 4. 👩 An-Nisa' (The Women) - النساء
│  ├─∘ 5. 🍽️ Al-Ma'idah - المائدہ
│  ├─∘ 6. 🐪 Al-An'am (The Cattle) - الانعام
│  ├─∘ 7. ⛰️ Al-A'raf (The Heights) - الأعراف
│  ├─∘ 8. ⚔️ Al-Anfal - الانفال
│  ├─∘ 9. 🙏 At-Tawbah - التوبہ
│  ├─∘ 10. 🐟 Yunus (Jonah) - یونس
│  ├─∘ 11. 🌩️ Hud - ہود
│  ├─∘ 12. 👶 Yusuf (Joseph) - یوسف
│  ├─∘ 13. ⚡ Ar-Rad (The Thunder) - الرعد
│  ├─∘ 14. 🕊️ Ibrahim - ابراہیم
│  ├─∘ 15. 🪨 Al-Hijr - الحجر
│  ├─∘ 16. 🐝 An-Nahl (The Bee) - النحل
│  ├─∘ 17. 🌙 Al-Isra' - الإسراء
│  ├─∘ 18. 🕳️ Al-Kahf (The Cave) - الکہف
│  ├─∘ 19. 🧕🏻 Maryam - مریم
│  └─∘ 20. 📜 Ta-Ha - طٰہٰ
│
├─❏ *📖 SURAH 21-40*
│  ├─∘ 21. 📖 Al-Anbiya' - الانبیاء
│  ├─∘ 22. 🕋 Al-Hajj - الحج
│  ├─∘ 23. 🙌 Al-Mu'minun - المؤمنون
│  ├─∘ 24. 💡 An-Nur - النور
│  ├─∘ 25. ⚖️ Al-Furqan - الفرقان
│  ├─∘ 26. 🎤 Ash-Shu'ara' - الشعراء
│  ├─∘ 27. 🐜 An-Naml - النمل
│  ├─∘ 28. 📚 Al-Qasas - القصص
│  ├─∘ 29. 🕷️ Al-Ankabut - الأنعام
│  ├─∘ 30. 🏛️ Ar-Rum - الروم
│  ├─∘ 31. 📖 Luqman - لقمان
│  ├─∘ 32. 🙇 As-Sajda - السجدہ
│  ├─∘ 33. ⚔️ Al-Ahzab - الاحزاب
│  ├─∘ 34. 🌸 Saba' - سبا
│  ├─∘ 35. 🛠️ Fatir - فاطر
│  ├─∘ 36. 📖 Ya-Sin - یس
│  ├─∘ 37. 🛡️ As-Saffat - الصافات
│  ├─∘ 38. 🅱️ Sad - صاد
│  ├─∘ 39. 🪖 Az-Zumar - الزمر
│  └─∘ 40. 🤲 Ghafir - غافر
│
├─❏ *📖 SURAH 41-60*
│  ├─∘ 41. 📜 Fussilat - فصلت
│  ├─∘ 42. 🗣️ Ash-Shura - الشوری
│  ├─∘ 43. 💰 Az-Zukhruf - الزخرف
│  ├─∘ 44. 💨 Ad-Dukhan - الدخان
│  ├─∘ 45. 🐊 Al-Jathiyah - الجاثیہ
│  ├─∘ 46. 🌪️ Al-Ahqaf - الأحقاف
│  ├─∘ 47. 🕋 Muhammad - محمد
│  ├─∘ 48. 🏆 Al-Fath - الفتح
│  ├─∘ 49. 🏠 Al-Hujurat - الحجرات
│  ├─∘ 50. 🔤 Qaf - قاف
│  ├─∘ 51. 🌬️ Adh-Dhariyat - الذاریات
│  ├─∘ 52. ⛰️ At-Tur - الطور
│  ├─∘ 53. 🌟 An-Najm - النجم
│  ├─∘ 54. 🌙 Al-Qamar - القمر
│  ├─∘ 55. 💖 Ar-Rahman - الرحمن
│  ├─∘ 56. 🌌 Al-Waqi'a - الواقعہ
│  ├─∘ 57. 🔩 Al-Hadid - الحدید
│  ├─∘ 58. 👩‍⚖️ Al-Mujadila - المجادلہ
│  ├─∘ 59. 🏴 Al-Hashr - الحشر
│  └─∘ 60. 🔍 Al-Mumtahanah - الممتحنہ
│
├─❏ *📖 SURAH 61-80*
│  ├─∘ 61. 📊 As-Saff - الصف
│  ├─∘ 62. 🕌 Al-Jumu'ah - الجمعة
│  ├─∘ 63. 🤥 Al-Munafiqun - المنافقون
│  ├─∘ 64. 🌪️ At-Taghabun - التغابن
│  ├─∘ 65. 💔 At-Talaq - الطلاق
│  ├─∘ 66. 🚫 At-Tahrim - التحریم
│  ├─∘ 67. 👑 Al-Mulk - المُلك
│  ├─∘ 68. 🖋️ Al-Qalam - القلم
│  ├─∘ 69. 🔍 Al-Haqqah - الحقہ
│  ├─∘ 70. ⬆️ Al-Ma'arij - المعارج
│  ├─∘ 71. 🌊 Nuh - نوح
│  ├─∘ 72. 👻 Al-Jinn - الجن
│  ├─∘ 73. 🕵️‍♂️ Al-Muzzammil - المزمل
│  ├─∘ 74. 🧕 Al-Muddathir - المُدثر
│  ├─∘ 75. 🌅 Al-Qari'ah - القارعة
│  ├─∘ 76. 🧑‍🤝‍🧑 Al-Insan - الانسان
│  ├─∘ 77. ✉️ Al-Mursalat - المُرسلات
│  ├─∘ 78. 📣 An-Naba' - النبأ
│  ├─∘ 79. 🪤 An-Nazi'at - النازعات
│  └─∘ 80. 😠 Abasa - عبس
│
├─❏ *📖 SURAH 81-114*
│  ├─∘ 81. 💥 At-Takwir - التکوير
│  ├─∘ 82. 💔 Al-Infitar - الانفطار
│  ├─∘ 83. ⚖️ Al-Mutaffifin - المطففين
│  ├─∘ 84. 🌀 Al-Inshiqaq - الانشقاق
│  ├─∘ 85. 🌌 Al-Buruj - البروج
│  ├─∘ 86. 🌠 At-Tariq - الطارق
│  ├─∘ 87. 🌍 Al-Ala - الأعلى
│  ├─∘ 88. 🌊 Al-Ghashiyah - الغاشیہ
│  ├─∘ 89. 🌅 Al-Fajr - الفجر
│  ├─∘ 90. 🏙️ Al-Balad - البلد
│  ├─∘ 91. ☀️ Ash-Shams - الشمس
│  ├─∘ 92. 🌜 Al-Lail - اللیل
│  ├─∘ 93. 🌅 Ad-Duha - الضحی
│  ├─∘ 94. 📖 As-Sharh - الشرح
│  ├─∘ 95. 🍈 At-Tin - التین
│  ├─∘ 96. 💧 Al-Alaq - العلق
│  ├─∘ 97. ⚡ Al-Qadr - القدر
│  ├─∘ 98. 📜 Al-Bayyinah - البینة
│  ├─∘ 99. 🌍 Az-Zalzalah - الزلزلة
│  ├─∘ 100. 🐎 Al-Adiyat - العادیات
│  ├─∘ 101. ⚡ Al-Qari'ah - القارعة
│  ├─∘ 102. 💰 At-Takathur - التکاثر
│  ├─∘ 103. ⏳ Al-Asr - العصر
│  ├─∘ 104. 😠 Al-Humazah - الہمزہ
│  ├─∘ 105. 🐘 Al-Fil - الفیل
│  ├─∘ 106. 🕌 Quraysh - قریش
│  ├─∘ 107. 🤲 Al-Ma'un - الماعون
│  ├─∘ 108. 🍇 Al-Kawthar - الکوثر
│  ├─∘ 109. ❌ Al-Kafirun - الکافرون
│  ├─∘ 110. 🛡️ An-Nasr - النصر
│  ├─∘ 111. 🔥 Al-Lahab - اللہب
│  ├─∘ 112. ❤️ Al-Ikhlas - الإخلاص
│  ├─∘ 113. 🌅 Al-Falaq - الفلق
│  └─∘ 114. 🌐 An-Nas - الناس
│
├─❏ *💫 USAGE GUIDE*
│  ├─∘ *Format:* .surah [number]
│  ├─∘ *Example:* .surah 1
│  └─∘ *Range:* 1-114
╰───❏`.trim();

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/3lzhi9.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363336396621021@newsletter',
                        newsletterName: 'QUEEN LORA',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});


