const {
  cmd
} = require("../command");
const {
  ytsearch,
  ytmp3,
  ytmp4
} = require("@dark-yasiya/yt-dl.js");

cmd({
  'pattern': 'mp4',
  'alias': ["video", "ytv"],
  'react': '🎥',
  'desc': "Download Youtube video",
  'category': "main",
  'use': ".mp4 < Yt url or Name >",
  'filename': __filename
}, async (_0x2dc807, _0x35820f, _0x144306, {
  from: _0x321043,
  prefix: _0xe7fda7,
  quoted: _0x117740,
  q: _0x32ba51,
  reply: _0x15b3cd
}) => {
  try {
    if (!_0x32ba51) {
      return await _0x15b3cd("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐘ʈ 𝐔ɼℓ ๏ɼ 𝐕ιɖє๏ 𝐍αмє..*");
    }
    const _0x3fe1fa = await ytsearch(_0x32ba51);
    if (_0x3fe1fa.results.length < 0x1) {
      return _0x15b3cd("No results found!");
    }
    let _0x5297bb = _0x3fe1fa.results[0x0];
    let _0x5eb190 = "https://apis.davidcyriltech.my.id/download/ytmp4?url=" + encodeURIComponent(_0x5297bb.url);
    let _0x1278ad = await fetch(_0x5eb190);
    let _0x241349 = await _0x1278ad.json();
    if (_0x241349.status !== 0xc8 || !_0x241349.success || !_0x241349.result.download_url) {
      return _0x15b3cd("Failed to fetch the video. Please try again later.");
    }
    let _0x452f5f = "╔═══〔 *XERO-MD ☄️* 〕═══❒\n║╭───────────────◆  \n║│ *❍ ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n║╰───────────────◆\n╚══════════════════❒\n╔══════════════════❒\n║ ⿻ *ᴛɪᴛʟᴇ:*  " + _0x5297bb.title + "\n║ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:*  " + _0x5297bb.timestamp + "\n║ ⿻ *ᴠɪᴇᴡs:*  " + _0x5297bb.views + "\n║ ⿻ *ᴀᴜᴛʜᴏʀ:*  " + _0x5297bb.author.name + "\n║ ⿻ *ʟɪɴᴋ:*  " + _0x5297bb.url + "\n╚══════════════════❒\n*ғꪮʀ ʏꪮꪊ ғꪮʀ ᴀʟʟ ꪮғ ᴀꜱ 🍉*";
    await _0x2dc807.sendMessage(_0x321043, {
      'image': {
        'url': _0x241349.result.thumbnail || ''
      },
      'caption': _0x452f5f
    }, {
      'quoted': _0x35820f
    });
    await _0x2dc807.sendMessage(_0x321043, {
      'video': {
        'url': _0x241349.result.download_url
      },
      'mimetype': "video/mp4"
    }, {
      'quoted': _0x35820f
    });
    await _0x2dc807.sendMessage(_0x321043, {
      'document': {
        'url': _0x241349.result.download_url
      },
      'mimetype': 'video/mp4',
      'fileName': _0x241349.result.title + ".mp4",
      'caption': '*' + _0x5297bb.title + "*\n> _ᴘᴏᴡᴇʀᴇᴅ ʙʏ PRINCE XTREME_*"
    }, {
      'quoted': _0x35820f
    });
  } catch (_0x4959f8) {
    console.log(_0x4959f8);
    _0x15b3cd("An error occurred. Please try again later.");
  }
});

cmd({
  'pattern': "mp3",
  'alias': ['yta', "play"],
  'react': '🎶',
  'desc': "Download Youtube audio",
  'category': 'main',
  'use': ".mp3 < Yt url or Name >",
  'filename': __filename
}, async (_0xa01491, _0xd285e7, _0x220865, {
  from: _0x260fff,
  prefix: _0x22e9b3,
  quoted: _0x5d5194,
  q: _0x7be325,
  reply: _0x258b45
}) => {
  try {
    if (!_0x7be325) {
      return await _0x258b45("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐘ʈ 𝐔ɼℓ ๏ɼ 𝐒๏ƞ͛g 𝐍αмє..*");
    }
    const _0x48bb54 = await ytsearch(_0x7be325);
    if (_0x48bb54.results.length < 0x1) {
      return _0x258b45("No results found!");
    }
    let _0x255517 = _0x48bb54.results[0x0];
    let _0x33f8bb = "https://apis.davidcyriltech.my.id/youtube/mp3?url=" + encodeURIComponent(_0x255517.url);
    let _0x164be1 = await fetch(_0x33f8bb);
    let _0x39a02f = await _0x164be1.json();
    if (_0x39a02f.status !== 0xc8 || !_0x39a02f.success || !_0x39a02f.result.downloadUrl) {
      return _0x258b45("Failed to fetch the audio. Please try again later.");
    }
    let _0x161add = "╭─ 「 *`XERO-MD YTA`* 」\n│ ⿻ *ᴛɪᴛʟᴇ:*  " + _0x255517.title + "\n│ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:*  " + _0x255517.timestamp + "\n│ ⿻ *ᴠɪᴇᴡs:*  " + _0x255517.views + "\n│ ⿻ *ᴀᴜᴛʜᴏʀ:*  " + _0x255517.author.name + "\n│ ⿻ *ʟɪɴᴋ:*  " + _0x255517.url + "\n╰─────────────⭑─➤\n*ғꪮʀ ʏꪮꪊ ғꪮʀ ᴀʟʟ ꪮғ ᴀꜱ 🍉*";
    await _0xa01491.sendMessage(_0x260fff, {
      'image': {
        'url': _0x39a02f.result.image || ''
      },
      'caption': _0x161add
    }, {
      'quoted': _0xd285e7
    });
    await _0xa01491.sendMessage(_0x260fff, {
      'audio': {
        'url': _0x39a02f.result.downloadUrl
      },
      'mimetype': "audio/mpeg"
    }, {
      'quoted': _0xd285e7
    });
    await _0xa01491.sendMessage(_0x260fff, {
      'document': {
        'url': _0x39a02f.result.downloadUrl
      },
      'mimetype': "audio/mpeg",
      'fileName': _0x39a02f.result.title + ".mp3",
      'caption': "> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ PRINCE XTREME*"
    }, {
      'quoted': _0xd285e7
    });
  } catch (_0x2cac20) {
    console.log(_0x2cac20);
    _0x258b45("An error occurred. Please try again later.");
  }
});
