const axios = require("axios");
const { cmd } = require("../command");  

cmd({
  pattern: "npm",
  desc: "Search for a package on npm.",
  react: '📦',
  category: "convert",
  filename: __filename,
  use: ".npm <package-name>"
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    // Check if a package name is provided
    if (!args.length) {
      return reply("📦 Please provide the name of the npm package you want to search for.\nExample: .npm express");
    }

    const packageName = args.join(" ");
    const apiUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

    // Fetch package details from npm registry
    const response = await axios.get(apiUrl);
    if (response.status !== 200) {
      throw new Error("Package not found or an error occurred.");
    }

    const packageData = response.data;
    const latestVersion = packageData["dist-tags"].latest;
    const description = packageData.description || "No description available.";
    const npmUrl = `https://www.npmjs.com/package/${packageName}`;
    const license = packageData.license || "Unknown";
    const repository = packageData.repository ? packageData.repository.url : "Not available";

    // Create the response message (XERO-MD style)
    const message = `
╭━━〔 📦 *XERO-MD NPM SEARCH* 〕━━⬣
┃ 📛 *Package:* ${packageName}
┃ 📄 *Description:* ${description}
┃ 🔖 *Latest Version:* ${latestVersion}
┃ 📜 *License:* ${license}
┃ 🗂️ *Repository:* ${repository}
┃ 🔗 *URL:* ${npmUrl}
╰━━━━━━━━━━━━━━━━⬣

> *XERO-MD* • ⚡ POWER - SPEED - CONTROL
`.trim();

    // Send the message
    await conn.sendMessage(from, { text: message }, { quoted: mek });

  } catch (error) {
    console.error("Error:", error);

    // Send simplified error to avoid clutter
    let errorMsg = "❌ An error occurred while fetching npm package details.\n\n";
    if (error.response && error.response.status === 404) {
      errorMsg = `❌ Package "${args.join(' ')}" not found on npm.`;
    } else {
      errorMsg += `Error: ${error.message}`;
    }
    reply(errorMsg);
  }
});
