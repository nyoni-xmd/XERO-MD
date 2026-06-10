//---------------------------------------------------------------------------
//           XERO-MD SETTINGS & CONFIG 
//---------------------------------------------------------------------------
//  ✅ XERO-MD - POWER SPEED CONTROL
//---------------------------------------------------------------------------
const { cmd, commands } = require('../command'); 
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions');
const { writeFileSync } = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const { setConfig, getConfig } = require("../lib/configdb");

// SET BOT IMAGE
cmd({
  pattern: "setbotimage",
  alias: ["botdp", "botpic", "botimage"],
  desc: "Set the bot's image URL",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("❌ Only the bot owner can use this command.");

    let imageUrl = args[0];

    // Upload image if replying to one
    if (!imageUrl && m.quoted) {
      const quotedMsg = m.quoted;
      const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
      if (!mimeType.startsWith("image")) return reply("❌ Please reply to an image.");

      const mediaBuffer = await quotedMsg.download();
      const extension = mimeType.includes("jpeg") ? ".jpg" : ".png";
      const tempFilePath = path.join(os.tmpdir(), `botimg_${Date.now()}${extension}`);
      fs.writeFileSync(tempFilePath, mediaBuffer);

      const form = new FormData();
      form.append("fileToUpload", fs.createReadStream(tempFilePath), `botimage${extension}`);
      form.append("reqtype", "fileupload");

      const response = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      fs.unlinkSync(tempFilePath);

      if (typeof response.data !== 'string' || !response.data.startsWith('https://')) {
        throw new Error(`Catbox upload failed: ${response.data}`);
      }

      imageUrl = response.data;
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
      return reply("❌ Provide a valid image URL or reply to an image.");
    }

    await setConfig("MENU_IMAGE_URL", imageUrl);

    await reply(`✅ Bot image updated.\n\n*New URL:* ${imageUrl}\n\n♻️ Restarting...`);
    setTimeout(() => exec("pm2 restart all"), 2000);

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message || err}`);
  }
});

// SET PREFIX
cmd({
  pattern: "setprefix",
  alias: ["prefix", "prifix"],
  desc: "Set the bot's command prefix",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❌ Only the bot owner can use this command.");
  const newPrefix = args[0]?.trim();
  if (!newPrefix || newPrefix.length > 2) return reply("❌ Provide a valid prefix (1–2 characters).");

  await setConfig("PREFIX", newPrefix);

  await reply(`✅ Prefix updated to: *${newPrefix}*\n\n♻️ Restarting...`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});

// SET BOT NAME
cmd({
  pattern: "setbotname",
  alias: ["botname"],
  desc: "Set the bot's name",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❌ Only the bot owner can use this command.");
  const newName = args.join(" ").trim();
  if (!newName) return reply("❌ Provide a bot name.");

  await setConfig("BOT_NAME", newName);

  await reply(`✅ Bot name updated to: *${newName}*\n\n♻️ Restarting...`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});

// SET OWNER NAME
cmd({
  pattern: "setownername",
  alias: ["ownername"],
  desc: "Set the owner's name",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❌ Only the bot owner can use this command.");
  const name = args.join(" ").trim();
  if (!name) return reply("❌ Provide an owner name.");

  await setConfig("OWNER_NAME", name);

  await reply(`✅ Owner name updated to: *${name}*\n\n♻️ Restarting...`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});

// WELCOME
cmd({
    pattern: "welcome",
    alias: ["setwelcome"],
    react: "✅",
    desc: "Enable or disable welcome messages for new members",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.WELCOME = "true";
        return reply("✅ Welcome messages are now enabled.");
    } else if (status === "off") {
        config.WELCOME = "false";
        return reply("❌ Welcome messages are now disabled.");
    } else {
        return reply(`Example: .welcome on`);
    }
});

// GOODBYE
cmd({
    pattern: "goodbye",
    alias: ["setgoodbye"],
    react: "✅",
    desc: "Enable or disable goodbye messages for leaving members",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.GOODBYE = "true";
        return reply("✅ Goodbye messages are now enabled.");
    } else if (status === "off") {
        config.GOODBYE = "false";
        return reply("❌ Goodbye messages are now disabled.");
    } else {
        return reply(`Example: .goodbye on`);
    }
});

// MODE (public/private)
cmd({
    pattern: "mode",
    alias: ["setmode", "mod"],
    react: "✅",
    desc: "Set bot mode to private or public.",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the owner can use this command!");
    const currentMode = getConfig("MODE") || "public";
    if (!args[0]) {
        return reply(`📌 Current mode: *${currentMode}*\n\nUsage: .mode private OR .mode public`);
    }
    const modeArg = args[0].toLowerCase();
    if (["private", "public"].includes(modeArg)) {
        setConfig("MODE", modeArg);
        await reply(`✅ Bot mode is now set to *${modeArg.toUpperCase()}*.\n\n♻️ Restarting bot to apply changes...`);
        exec("pm2 restart all", (error, stdout, stderr) => {
            if (error) console.error("Restart error:", error);
            else console.log("PM2 Restart:", stdout || stderr);
        });
    } else {
        return reply("❌ Invalid mode. Please use `.mode private` or `.mode public`.");
    }
});

// ANTI-CALL
cmd({
    pattern: "anti-call",
    react: "🚫",
    alias: ["anticall"],
    desc: "Enable or disable anti-call feature",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ANTI_CALL = "true";
        return reply("✅ Anti-call has been enabled.");
    } else if (status === "off") {
        config.ANTI_CALL = "false";
        return reply("❌ Anti-call has been disabled.");
    } else {
        return reply(`Example: .anti-call on/off`);
    }
});

// AUTO TYPING
cmd({
    pattern: "autotyping",
    alias: ["auto-typing", "typing"],
    react: "⌨️",
    description: "Enable or disable auto-typing feature.",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        return reply("Example: .autotyping on");
    }
    config.AUTO_TYPING = status === "on" ? "true" : "false";
    return reply(`Auto typing has been turned ${status}.`);
});

// ALWAYS ONLINE
cmd({
    pattern: "alwaysonline",
    alias: ["online", "always-online"],
    react: "🟢",
    desc: "Enable or disable always online feature",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ALWAYS_ONLINE = "true";
        return reply("✅ Always online is now enabled.");
    } else if (status === "off") {
        config.ALWAYS_ONLINE = "false";
        return reply("❌ Always online is now disabled.");
    } else {
        return reply(`Example: .alwaysonline on`);
    }
});

// AUTO RECORDING
cmd({
    pattern: "autorecoding",
    alias: ["recoding", "auto-recoding"],
    react: "🎙️",
    desc: "Enable or disable auto-recording feature",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_RECORDING = "true";
        return reply("✅ Auto recording is now enabled.");
    } else if (status === "off") {
        config.AUTO_RECORDING = "false";
        return reply("❌ Auto recording is now disabled.");
    } else {
        return reply(`Example: .autorecoding on`);
    }
});

// AUTO STATUS REACT
cmd({
    pattern: "autostatusreact",
    alias: ["status-react", "statusreact", "sreact"],
    react: "❤️",
    desc: "Enable or disable auto-react on statuses",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STATUS_REACT = "true";
        return reply("✅ Auto-react on statuses is now enabled.");
    } else if (status === "off") {
        config.AUTO_STATUS_REACT = "false";
        return reply("❌ Auto-react on statuses is now disabled.");
    } else {
        return reply(`Example: .autostatusreact on`);
    }
});

// AUTO STATUS VIEW
cmd({
    pattern: "autostatusview",
    alias: ["status-view", "sview", "statusview"],
    desc: "Enable or disable auto-view of statuses",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STATUS_SEEN = "true";
        return reply("✅ Auto-view of statuses is now enabled.");
    } else if (status === "off") {
        config.AUTO_STATUS_SEEN = "false";
        return reply("❌ Auto-view of statuses is now disabled.");
    } else {
        return reply(`Example: .autostatusview on`);
    }
});

// READ MESSAGE
cmd({
    pattern: "read-message",
    alias: ["autoread"],
    desc: "Enable or disable auto-read messages",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.READ_MESSAGE = "true";
        return reply("✅ Auto-read messages is now enabled.");
    } else if (status === "off") {
        config.READ_MESSAGE = "false";
        return reply("❌ Auto-read messages is now disabled.");
    } else {
        return reply(`Example: .read-message on`);
    }
});

// ANTI-BAD WORD
cmd({
    pattern: "antibad",
    alias: ["anti-bad", "antibadword"],
    react: "⚠️",
    desc: "Enable or disable anti-bad word feature",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ANTI_BAD_WORD = "true";
        return reply("✅ Anti-bad word is now enabled.");
    } else if (status === "off") {
        config.ANTI_BAD_WORD = "false";
        return reply("❌ Anti-bad word is now disabled.");
    } else {
        return reply(`Example: .antibad on`);
    }
});

// AUTO STICKER
cmd({
    pattern: "autosticker",
    alias: ["auto-sticker"],
    react: "🎴",
    desc: "Enable or disable auto-sticker feature",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STICKER = "true";
        return reply("✅ Auto-sticker is now enabled.");
    } else if (status === "off") {
        config.AUTO_STICKER = "false";
        return reply("❌ Auto-sticker is now disabled.");
    } else {
        return reply(`Example: .autosticker on`);
    }
});

// AUTO REPLY
cmd({
    pattern: "autoreply",
    alias: ["auto-reply"],
    react: "💬",
    desc: "Enable or disable auto-reply feature",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_REPLY = "true";
        return reply("✅ Auto-reply is now enabled.");
    } else if (status === "off") {
        config.AUTO_REPLY = "false";
        return reply("❌ Auto-reply is now disabled.");
    } else {
        return reply(`Example: .autoreply on`);
    }
});

// AUTO REACT (on normal messages)
cmd({
    pattern: "autoreact",
    alias: ["auto-react"],
    react: "😊",
    desc: "Enable or disable auto-react on messages",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_REACT = "true";
        return reply("✅ Auto-react on messages is now enabled.");
    } else if (status === "off") {
        config.AUTO_REACT = "false";
        return reply("❌ Auto-react on messages is now disabled.");
    } else {
        return reply(`Example: .autoreact on`);
    }
});

// AUTO STATUS REPLY
cmd({
    pattern: "autostatusreply",
    react: "💬",
    alias: ["statusreply", "status-reply"],
    desc: "Enable or disable auto-reply on statuses",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STATUS_REPLY = "true";
        return reply("✅ Auto-reply on statuses is now enabled.");
    } else if (status === "off") {
        config.AUTO_STATUS_REPLY = "false";
        return reply("❌ Auto-reply on statuses is now disabled.");
    } else {
        return reply(`Example: .autostatusreply on`);
    }
});

// ANTI-BOT (in groups)
cmd({
  pattern: "antibot",
  react: "🤖",
  alias: ["anti-bot"],
  desc: "Enable or disable anti-bot feature in groups",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { isGroup, isBotAdmins, isAdmins, args, reply }) => {
  try {
    if (!isGroup) return reply('This command can only be used in a group.');
    if (!isBotAdmins) return reply('Bot must be an admin to use this command.');
    if (!isAdmins) return reply('You must be an admin to use this command.');
    if (args[0] === "on") {
      config.ANTI_BOT = "true";
      await reply("✅ ANTI_BOT is now enabled in this group.");
    } else if (args[0] === "off") {
      config.ANTI_BOT = "false";
      await reply("❌ ANTI_BOT is now disabled in this group.");
    } else {
      await reply(`Invalid input! Use 'on' or 'off'. Example: .antibot on`);
    }
  } catch (error) {
    return reply(`Error: ${error.message}`);
  }
});

// ANTI-LINK
cmd({
  pattern: "antilink",
  react: "🔗",
  alias: ["anti-link"],
  desc: "Enable or disable anti-link feature in groups",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { isGroup, isBotAdmins, isAdmins, args, reply }) => {
  try {
    if (!isGroup) return reply('This command can only be used in a group.');
    if (!isBotAdmins) return reply('Bot must be an admin to use this command.');
    if (!isAdmins) return reply('You must be an admin to use this command.');
    if (args[0] === "on") {
      config.ANTI_LINK = "true";
      await reply("✅ Anti-link is now enabled in this group.");
    } else if (args[0] === "off") {
      config.ANTI_LINK = "false";
      await reply("❌ Anti-link is now disabled in this group.");
    } else {
      await reply(`Invalid input! Use 'on' or 'off'. Example: .antilink on`);
    }
  } catch (error) {
    return reply(`Error: ${error.message}`);
  }
});

// MENTION REPLY
cmd({
    pattern: "mention-reply",
    alias: ["menetionreply", "mee"],
    desc: "Enable or disable mention reply feature",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.MENTION_REPLY = "true";
        return reply("✅ Mention reply is now enabled.");
    } else if (status === "off") {
        config.MENTION_REPLY = "false";
        return reply("❌ Mention reply is now disabled.");
    } else {
        return reply(`Example: .mention-reply on`);
    }
});

// ADMIN EVENTS
cmd({
    pattern: "admin-events",
    alias: ["adminevents", "adminaction"],
    desc: "Enable or disable admin event notifications",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ADMIN_ACTION = "true";
        return reply("✅ Admin event notifications are now enabled.");
    } else if (status === "off") {
        config.ADMIN_ACTION = "false";
        return reply("❌ Admin event notifications are now disabled.");
    } else {
        return reply(`Example: .admin-events on`);
    }
});

// OWNER REACT
cmd({
    pattern: "ownerreact",
    alias: ["owner-react", "selfreact", "self-react"],
    react: "👑",
    desc: "Enable or disable owner react feature",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.OWNER_REACT = "true";
        return reply("✅ Owner react is now enabled.");
    } else if (status === "off") {
        config.OWNER_REACT = "false";
        return reply("❌ Owner react is now disabled.");
    } else {
        return reply(`Example: .ownerreact on`);
    }
});

// DELETE LINKS
cmd({
  pattern: "deletelink",
  alias: ["delete-links"],
  desc: "Enable or disable DELETE_LINKS in groups",
  category: "group",
  react: "❌",
  filename: __filename
}, async (conn, mek, m, { isGroup, isAdmins, isBotAdmins, args, reply }) => {
  try {
    if (!isGroup) return reply('This command can only be used in a group.');
    if (!isBotAdmins) return reply('Bot must be an admin to use this command.');
    if (!isAdmins) return reply('You must be an admin to use this command.');
    if (args[0] === "on") {
      config.DELETE_LINKS = "true";
      reply("✅ DELETE_LINKS is now enabled.");
    } else if (args[0] === "off") {
      config.DELETE_LINKS = "false";
      reply("❌ DELETE_LINKS is now disabled.");
    } else {
      reply("Usage: *.deletelink on/off*");
    }
  } catch (e) {
    reply(`Error: ${e.message}`);
  }
});

// CUSTOM REACT (toggle)
cmd({
    pattern: "customreact",
    alias: ["creact", "reactc"],
    react: "😎",
    desc: "Enable or disable custom reactions",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the bot owner can use this command!");
    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.CUSTOM_REACT = "true";
        return reply("✅ Custom reactions are now enabled.");
    } else if (status === "off") {
        config.CUSTOM_REACT = "false";
        return reply("❌ Custom reactions are now disabled.");
    } else {
        return reply(`Example: .customreact on`);
    }
});

// SET CUSTOM REACT EMOJIS
cmd({
  pattern: "setreacts",
  alias: ["customemojis", "emojis", "cemojis"],
  desc: "Set custom reaction emojis for the bot",
  category: "owner",
  react: "🌈",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❌ Only the bot owner can use this command.");
  const emojiList = args.join(" ").trim();
  if (!emojiList) return reply("❌ Please provide a comma-separated list of emojis.\n\nExample:\n.setreacts 💖,💗,💘,💕");
  await setConfig("CUSTOM_REACT_EMOJIS", emojiList);
  await reply(`✅ Custom reaction emojis updated to:\n${emojiList}\n\n♻️ Restarting bot to apply changes...`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});
