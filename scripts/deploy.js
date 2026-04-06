const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying ConsentChain Demo...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}\n`);

  // 1. Deploy AccessController
  console.log("1. 📋 Deploying AccessController...");
  const AccessController = await ethers.getContractFactory("AccessController");
  const accessController = await AccessController.deploy();
  await accessController.waitForDeployment();
  const acAddress = await accessController.getAddress();
  console.log(`   ✅ AccessController: ${acAddress}`);

  // 2. Deploy ConsentManager with AccessController address
  console.log("2. 📄 Deploying ConsentManager...");
  const ConsentManager = await ethers.getContractFactory("ConsentManager");
  const consentManager = await ConsentManager.deploy(acAddress);
  await consentManager.waitForDeployment();
  const cmAddress = await consentManager.getAddress();
  console.log(`   ✅ ConsentManager: ${cmAddress}`);

  // 3. Setup Demo Organizations
  console.log("\n3. 🏢 Setting up Demo Organizations...");

  // Create demo org addresses using existing Hardhat test accounts
  const demoOrgs = [
    {
      name: "TechCorp Analytics",
      address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      description: "Data analytics company"
    },
    {
      name: "MarketPro Research",
      address: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
      description: "Market research firm"
    },
    {
      name: "HealthData Solutions",
      address: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
      description: "Healthcare data processor"
    }
  ];

  for (const org of demoOrgs) {
    const nameHash = ethers.keccak256(ethers.toUtf8Bytes(org.name));
    await accessController.registerOrganization(org.address, nameHash);
    console.log(`   ✅ Registered: ${org.name} (${org.address.slice(0, 10)}...)`);
  }

  // 4. Create Sample Consents (if we have test accounts)
  console.log("\n4. 📝 Creating Sample Consents...");

  // Use deployer as a user for demo consents
  const userAddress = deployer.address;
  const expiryTime = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year

  const sampleConsents = [
    {
      org: demoOrgs[0].address,
      category: "Personal Data",
      purpose: "Analytics",
      expiry: expiryTime
    },
    {
      org: demoOrgs[1].address,
      category: "Location Data",
      purpose: "Market Research",
      expiry: expiryTime
    },
    {
      org: demoOrgs[2].address,
      category: "Health Data",
      purpose: "Medical Research",
      expiry: expiryTime
    }
  ];

  for (const consent of sampleConsents) {
    const categoryHash = ethers.keccak256(ethers.toUtf8Bytes(consent.category));
    const purposeHash = ethers.keccak256(ethers.toUtf8Bytes(consent.purpose));

    await consentManager.grantConsent(
      consent.org,
      categoryHash,
      purposeHash,
      consent.expiry
    );
    console.log(`   ✅ Consent: ${consent.category} → ${consent.purpose} (${consent.org.slice(0, 10)}...)`);
  }

  console.log("\n🎉 Demo Setup Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📋 AccessController: ${acAddress}`);
  console.log(`📄 ConsentManager:   ${cmAddress}`);
  console.log(`👤 Demo User:        ${userAddress}`);
  console.log(`🏢 Demo Orgs:        ${demoOrgs.length} registered`);
  console.log(`📝 Sample Consents:  ${sampleConsents.length} created`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // 5. Auto-update frontend .env.local with deployed addresses
  console.log("\n💾 Updating frontend/.env.local with deployed addresses...");
  const envPath = path.join(__dirname, "../frontend/.env.local");
  const envContent = `# Environment variables for ConsentChain frontend
# Auto-updated by deploy.js - do not edit manually

VITE_CONSENT_MANAGER_ADDRESS=${cmAddress}
VITE_ACCESS_CONTROLLER_ADDRESS=${acAddress}
`;
  
  try {
    fs.writeFileSync(envPath, envContent, "utf-8");
    console.log(`   ✅ .env.local synchronized!\n`);
  } catch (error) {
    console.warn(`   ⚠️  Could not update .env.local: ${error.message}`);
    console.log(`   📋 Copy these addresses manually:\n`);
    console.log(`      VITE_CONSENT_MANAGER_ADDRESS=${cmAddress}`);
    console.log(`      VITE_ACCESS_CONTROLLER_ADDRESS=${acAddress}\n`);
  }

  console.log("🚀 Ready for demo! Start the frontend with:");
  console.log("   cd frontend && npm run dev");
  console.log("\n📖 Demo Flow:");
  console.log("   1. Connect wallet (use demo user)");
  console.log("   2. View existing consents");
  console.log("   3. Grant new consents to demo orgs");
  console.log("   4. Switch to org wallet to request access");
  console.log("   5. Check audit logs");
}

// Call main if run directly
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Export for use in frontend setup
module.exports = { main };
