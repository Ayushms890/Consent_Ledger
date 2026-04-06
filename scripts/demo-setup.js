const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Demo Setup Script
 * Run this after deploying contracts to:
 * 1. Update frontend .env.local with deployed addresses
 * 2. Display demo information
 */
async function setupDemo() {
  console.log("🎭 Setting up ConsentChain Demo...\n");

  // Check if contracts are deployed by looking for deployment artifacts
  const acArtifact = path.join(__dirname, "../artifacts/contracts/AccessController.sol/AccessController.json");
  const cmArtifact = path.join(__dirname, "../artifacts/contracts/ConsentManager.sol/ConsentManager.json");

  if (!fs.existsSync(acArtifact) || !fs.existsSync(cmArtifact)) {
    console.log("❌ Contracts not compiled. Run 'npx hardhat compile' first.");
    process.exit(1);
  }

  // For demo purposes, we'll use the addresses from a local deployment
  // In a real scenario, you'd get these from the deployment script output
  console.log("📋 Demo Configuration:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Update your frontend/.env.local with:");
  console.log("");
  console.log("VITE_CONSENT_MANAGER_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  console.log("VITE_ACCESS_CONTROLLER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3");
  console.log("");
  console.log("🏢 Demo Organizations (use these addresses in MetaMask):");
  console.log("• TechCorp Analytics: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8");
  console.log("• MarketPro Research: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc");
  console.log("• HealthData Solutions: 0x90f79bf6eb2c4f870365e785982e1f101e93b906");
  console.log("");
  console.log("📝 Demo Flow:");
  console.log("1. Start Hardhat: npx hardhat node");
  console.log("2. Deploy contracts: npx hardhat run scripts/deploy.js --network localhost");
  console.log("3. Start frontend: cd frontend && npm run dev");
  console.log("4. Connect wallet and test all features!");
  console.log("");
  console.log("🎯 Demo Features to Showcase:");
  console.log("• ✅ Grant consent to organizations");
  console.log("• ✅ View and revoke consents");
  console.log("• ✅ Organization access requests");
  console.log("• ✅ Audit log with blockchain events");
  console.log("• ✅ Purpose-bound validation");
  console.log("• ✅ Gas-optimized operations");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

setupDemo().catch(console.error);