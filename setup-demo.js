#!/usr/bin/env node

/**
 * ConsentChain - Complete Demo Setup Script
 * Handles: Node setup, contract deployment, frontend config, testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(60)}\n`, 'cyan');
}

function step(num, title) {
  log(`\n[${num}] ${title}`, 'bright');
}

function success(msg) {
  log(`  ✅ ${msg}`, 'green');
}

function warning(msg) {
  log(`  ⚠️  ${msg}`, 'yellow');
}

function error(msg) {
  log(`  ❌ ${msg}`, 'red');
}

async function runCommand(cmd, description) {
  try {
    log(`    Running: ${cmd}`, 'blue');
    execSync(cmd, { stdio: 'inherit', shell: true });
    success(description);
    return true;
  } catch (err) {
    error(`${description} failed`);
    return false;
  }
}

async function setupDemo() {
  header('🚀 ConsentChain Complete Demo Setup');

  // Step 1: Check Node.js
  step(1, 'Checking Node.js');
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    success(`Node.js ${nodeVersion} found`);
  } catch (err) {
    error('Node.js not found. Install from https://nodejs.org/');
    process.exit(1);
  }

  // Step 2: Install dependencies
  step(2, 'Installing dependencies');
  await runCommand('npm install', 'Root dependencies installed');

  // Step 3: Compile contracts
  step(3, 'Compiling smart contracts');
  await runCommand('npx hardhat compile', 'Contracts compiled successfully');

  // Step 4: Run tests
  step(4, 'Running test suite');
  const testsPass = await runCommand('npx hardhat test', 'All tests passed');
  if (!testsPass) {
    warning('Some tests failed - continuing anyway');
  }

  // Step 5: Check .env.local
  step(5, 'Checking frontend environment');
  const envPath = path.join(__dirname, 'frontend', '.env.local');
  if (!fs.existsSync(envPath)) {
    error('.env.local not found');
    log('  Create frontend/.env.local with:', 'yellow');
    log('  VITE_CONSENT_MANAGER_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', 'yellow');
    log('  VITE_ACCESS_CONTROLLER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3', 'yellow');
  } else {
    success('.env.local exists');
  }

  // Step 6: Frontend dependencies
  step(6, 'Installing frontend dependencies');
  await runCommand('cd frontend && npm install', 'Frontend dependencies installed');

  // Summary
  header('✨ Setup Complete!');

  log('\n📋 Next Steps:\n', 'bright');
  log('1️⃣  Start the local blockchain:', 'cyan');
  log('   npx hardhat node\n', 'yellow');

  log('2️⃣  Deploy contracts (in another terminal):', 'cyan');
  log('   npx hardhat run scripts/deploy.js --network localhost\n', 'yellow');

  log('3️⃣  Start frontend (in another terminal):', 'cyan');
  log('   cd frontend && npm run dev\n', 'yellow');

  log('4️⃣  Open browser:', 'cyan');
  log('   http://localhost:5174\n', 'yellow');

  log('5️⃣  Connect MetaMask:', 'cyan');
  log('   Network: http://127.0.0.1:8545', 'yellow');
  log('   Chain ID: 31337', 'yellow');
  log('   Use test account with 10,000 ETH\n', 'yellow');

  log('📚 Demo Features:', 'bright');
  log('  • Grant consent to organizations', 'green');
  log('  • View and revoke consents', 'green');
  log('  • Switch to org wallet and request access', 'green');
  log('  • View immutable audit logs', 'green');
  log('  • Test purpose-bound validation', 'green');

  log('\n💡 Tips:', 'bright');
  log('  • Keep all 3 terminals open (node, deploy, dev)', 'cyan');
  log('  • Refresh browser (Ctrl+F5) after deployment', 'cyan');
  log('  • MetaMask must be on "Hardhat Local" network', 'cyan');
  log('  • Use test private key for org wallets\n', 'cyan');

  log('🎉 Happy demoing!\n', 'green');
}

setupDemo().catch(err => {
  error('Setup failed: ' + err.message);
  process.exit(1);
});
