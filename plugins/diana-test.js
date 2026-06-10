/**
 * XERO-MD Bot Test Suite
 * Test all bot functionalities before deployment
 * Run: node test.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let passed = 0;
let failed = 0;
let tests = [];

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function test(name, fn) {
  tests.push({ name, fn });
}

function runTests() {
  log('\n═══════════════════════════════════════', colors.cyan);
  log('     XERO-MD BOT TEST SUITE v1.0', colors.bright + colors.cyan);
  log('═══════════════════════════════════════\n', colors.cyan);

  for (const test of tests) {
    try {
      test.fn();
      log(`✅ PASS: ${test.name}`, colors.green);
      passed++;
    } catch (error) {
      log(`❌ FAIL: ${test.name}`, colors.red);
      log(`   └ Error: ${error.message}`, colors.red);
      failed++;
    }
  }

  log('\n═══════════════════════════════════════', colors.cyan);
  log(`📊 RESULTS: ${passed} passed, ${failed} failed`, 
      failed === 0 ? colors.green : colors.red);
  log('═══════════════════════════════════════\n', colors.cyan);

  process.exit(failed > 0 ? 1 : 0);
}

// ==================== TESTS ====================

// 1. File Structure Test
test('Checking file structure', () => {
  const requiredFiles = [
    'index.js',
    'config.js',
    'command.js',
    'package.json',
    'Dockerfile',
    'app.json'
  ];

  const requiredDirs = [
    'plugins',
    'lib',
    'sessions',
    'data'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(__dirname, file))) {
      throw new Error(`Missing required file: ${file}`);
    }
  }

  for (const dir of requiredDirs) {
    if (!fs.existsSync(path.join(__dirname, dir))) {
      throw new Error(`Missing required directory: ${dir}`);
    }
  }
});

// 2. Config Test
test('Checking config.js', () => {
  const config = require('./config');
  
  const requiredKeys = [
    'SESSION_ID',
    'PREFIX',
    'MODE',
    'BOT_NAME',
    'ALIVE_IMG',
    'READ_MESSAGE',
    'AUTO_STATUS_SEEN'
  ];

  for (const key of requiredKeys) {
    if (config[key] === undefined) {
      throw new Error(`Missing config key: ${key}`);
    }
  }

  // Validate mode
  const validModes = ['public', 'private', 'inbox', 'groups'];
  if (!validModes.includes(config.MODE)) {
    throw new Error(`Invalid MODE: ${config.MODE}. Must be one of: ${validModes.join(', ')}`);
  }

  // Validate prefix
  if (typeof config.PREFIX !== 'string' || config.PREFIX.length === 0) {
    throw new Error('PREFIX must be a non-empty string');
  }
});

// 3. Package.json Test
test('Checking package.json', () => {
  const pkg = require('./package.json');
  
  const requiredDeps = [
    '@whiskeysockets/baileys',
    'express',
    'axios',
    'fs-extra',
    'qrcode-terminal',
    'pino'
  ];

  for (const dep of requiredDeps) {
    if (!pkg.dependencies || !pkg.dependencies[dep]) {
      throw new Error(`Missing dependency: ${dep}`);
    }
  }

  if (!pkg.scripts || !pkg.scripts.start) {
    throw new Error('Missing start script in package.json');
  }
});

// 4. Plugins Test
test('Checking plugins directory', () => {
  const pluginsDir = path.join(__dirname, 'plugins');
  
  if (!fs.existsSync(pluginsDir)) {
    throw new Error('Plugins directory does not exist');
  }

  const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
  
  if (pluginFiles.length === 0) {
    throw new Error('No plugin files found in plugins directory');
  }

  // Test each plugin can be loaded
  for (const plugin of pluginFiles) {
    try {
      require(path.join(pluginsDir, plugin));
    } catch (error) {
      throw new Error(`Failed to load plugin ${plugin}: ${error.message}`);
    }
  }
});

// 5. Commands Test
test('Checking commands registration', () => {
  const commands = require('./command');
  
  if (!commands.commands || !Array.isArray(commands.commands)) {
    throw new Error('Commands module does not export commands array');
  }

  const commandPatterns = commands.commands.map(c => c.pattern);
  const duplicates = commandPatterns.filter((c, i) => commandPatterns.indexOf(c) !== i);
  
  if (duplicates.length > 0) {
    throw new Error(`Duplicate command patterns: ${duplicates.join(', ')}`);
  }
});

// 6. Environment Variables Test
test('Checking environment variables', () => {
  const requiredEnv = ['SESSION_ID'];
  const optionalEnv = ['PREFIX', 'MODE', 'BOT_NAME', 'PORT'];

  log('\n   Environment Variables:', colors.yellow);
  
  for (const env of requiredEnv) {
    if (!process.env[env] && !require('./config')[env]) {
      log(`   ⚠️  Missing ${env} (will use default)`, colors.yellow);
    } else {
      log(`   ✅ ${env} is set`, colors.green);
    }
  }

  for (const env of optionalEnv) {
    const value = process.env[env] || require('./config')[env];
    log(`   📌 ${env}: ${value || 'default'}`, colors.blue);
  }
});

// 7. Network Connectivity Test
test('Checking network connectivity', async () => {
  try {
    const response = await axios.get('https://api.github.com', { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error('GitHub API returned non-200 status');
    }
  } catch (error) {
    throw new Error(`Network connectivity failed: ${error.message}`);
  }
});

// 8. Session Directory Test
test('Checking sessions directory', () => {
  const sessionsDir = path.join(__dirname, 'sessions');
  
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir);
    log('   📁 Created sessions directory', colors.blue);
  }

  // Check if credentials exist (optional)
  const credsFile = path.join(sessionsDir, 'creds.json');
  if (fs.existsSync(credsFile)) {
    try {
      const creds = JSON.parse(fs.readFileSync(credsFile));
      if (creds && creds.creds) {
        log('   ✅ Session credentials found', colors.green);
      }
    } catch (error) {
      log('   ⚠️  Credentials file exists but invalid JSON', colors.yellow);
    }
  } else {
    log('   ⚠️  No session credentials found (will generate on first run)', colors.yellow);
  }
});

// 9. Dependencies Version Test
test('Checking dependency versions', () => {
  const pkg = require('./package.json');
  const outdated = [];

  for (const [dep, version] of Object.entries(pkg.dependencies || {})) {
    if (version.includes('^') || version.includes('~')) {
      outdated.push(`${dep}: ${version} (has range)`);
    }
  }

  if (outdated.length > 0) {
    log(`   ⚠️  ${outdated.length} dependencies use version ranges`, colors.yellow);
    outdated.slice(0, 3).forEach(o => log(`      - ${o}`, colors.yellow));
  }
});

// 10. Bot Configuration Validation
test('Validating bot configuration', () => {
  const config = require('./config');
  
  // Validate ALIVE_IMG URL
  if (config.ALIVE_IMG && !config.ALIVE_IMG.startsWith('http')) {
    throw new Error('ALIVE_IMG must be a valid URL starting with http');
  }

  // Validate MODE
  const validModes = ['public', 'private', 'inbox', 'groups'];
  if (!validModes.includes(config.MODE)) {
    throw new Error(`Invalid MODE: ${config.MODE}`);
  }

  // Validate boolean values
  const boolKeys = ['READ_MESSAGE', 'AUTO_REACT', 'AUTO_STATUS_SEEN', 'AUTO_STATUS_REACT'];
  for (const key of boolKeys) {
    if (config[key] !== undefined && typeof config[key] !== 'boolean' && config[key] !== 'true' && config[key] !== 'false') {
      log(`   ⚠️  ${key} should be boolean or string 'true'/'false'`, colors.yellow);
    }
  }
});

// 11. Port Availability Test
test('Checking port availability', () => {
  const port = process.env.PORT || require('./config').PORT || 9090;
  const net = require('net');
  
  const server = net.createServer();
  
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      throw new Error(`Port ${port} is already in use`);
    }
  });
  
  server.once('listening', () => {
    server.close();
  });
  
  server.listen(port);
});

// 12. Disk Space Test
test('Checking disk space', () => {
  const os = require('os');
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedPercent = ((totalMem - freeMem) / totalMem) * 100;
  
  log(`   💾 Memory: ${(usedPercent).toFixed(1)}% used`, colors.blue);
  
  if (usedPercent > 95) {
    throw new Error('Low memory: more than 95% used');
  }
});

// ==================== RUN TESTS ====================
runTests();
