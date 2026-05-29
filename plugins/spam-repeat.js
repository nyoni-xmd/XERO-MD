

const {
  cmd
} = require("../command");
cmd({
  'pattern': "spam",
  'desc': "Repeat a provided phrase a specified number of times (owner only).",
  'category': "tools",
  'react': '📣',
  'filename': __filename,
  'use': '<text>|<number>'
}, async (_0x211033, _0x3f4b4e, _0x564785, {
  from: _0x3c11f1,
  args: _0x3583ba,
  isOwner: _0x14fbd1,
  reply: _0x3c149f
}) => {
  try {
    if (!_0x14fbd1) {
      return _0x3c149f("❌ You are not authorized to use this command.");
    }
    const _0xd609ad = _0x3583ba.join(" ");
    if (!_0xd609ad.includes('|')) {
      return _0x3c149f("❌ Please use the format: .spam <text>|<number>");
    }
    const [_0x7efe48, _0x3b616f] = _0xd609ad.split('|');
    const _0x1e7038 = parseInt(_0x3b616f.trim());
    if (!_0x7efe48 || isNaN(_0x1e7038) || _0x1e7038 <= 0x0) {
      return _0x3c149f("❌ Invalid format or number. Usage: .spam <text>|<number>");
    }
    if (_0x1e7038 > 0x64) {
      return _0x3c149f("❌ The maximum spam count allowed is 100.");
    }
    let _0x40fa50 = '';
    for (let _0x462ab4 = 0x0; _0x462ab4 < _0x1e7038; _0x462ab4++) {
      _0x40fa50 += _0x7efe48 + "\n";
    }
    await _0x3c149f(_0x40fa50.trim());
  } catch (_0x240d60) {
    console.error("Spam command error:", _0x240d60);
    _0x3c149f("❌ An error occurred while processing the spam command.");
  }
});
