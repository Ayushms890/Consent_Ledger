/**
 * End-to-End Integration Test
 * Simulates the FULL user journey against the live Hardhat node.
 * Run: npx hardhat run scripts/e2e-test.js --network localhost
 */

const { ethers } = require("hardhat");

const AC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CM_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {
  const [admin, user1, org1, org2] = await ethers.getSigners();

  console.log("=".repeat(60));
  console.log("  ConsentChain — End-to-End Integration Test");
  console.log("=".repeat(60));
  console.log(`  Admin:  ${admin.address}`);
  console.log(`  User:   ${user1.address}`);
  console.log(`  Org1:   ${org1.address}`);
  console.log(`  Org2:   ${org2.address}\n`);

  // Connect to deployed contracts
  const ac = await ethers.getContractAt("AccessController", AC_ADDRESS);
  const cm = await ethers.getContractAt("ConsentManager", CM_ADDRESS);

  let passed = 0;
  let failed = 0;

  function check(name, condition) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  // ==========================================
  // TEST 1: Admin registers Org1
  // ==========================================
  console.log("\n--- Test 1: Admin Registers Organization ---");
  try {
    const tx = await ac.connect(admin).registerOrganization(org1.address, ethers.id("Acme Corp"));
    await tx.wait();
    const isVerified = await ac.isVerifiedOrg(org1.address);
    check("Org1 is registered & verified", isVerified === true);
  } catch (err) {
    console.log(`  ❌ FAIL: Registration error: ${err.message}`);
    failed++;
  }

  // ==========================================
  // TEST 2: Check unregistered org
  // ==========================================
  console.log("\n--- Test 2: Verify Unregistered Org ---");
  try {
    const isVerified = await ac.isVerifiedOrg(org2.address);
    check("Org2 is NOT verified", isVerified === false);
  } catch (err) {
    console.log(`  ❌ FAIL: ${err.message}`);
    failed++;
  }

  // ==========================================
  // TEST 3: User grants consent to verified Org1
  // ==========================================
  console.log("\n--- Test 3: User Grants Consent to Verified Org ---");
  try {
    const expiry = Math.floor(Date.now() / 1000) + 31536000; // 1 year
    const tx = await cm.connect(user1).grantConsent(
      org1.address,
      ethers.id("LOCATION_DATA"),
      ethers.id("ANALYTICS"),
      expiry
    );
    await tx.wait();
    const count = await cm.consentCount();
    check("Consent created (ID: " + count + ")", Number(count) >= 1);
    
    const consent = await cm.consents(count);
    check("Consent user matches", consent.user === user1.address);
    check("Consent is active", consent.active === true);
    check("Consent org matches", consent.organization === org1.address);
  } catch (err) {
    console.log(`  ❌ FAIL: ${err.message}`);
    failed++;
  }

  // ==========================================
  // TEST 4: User tries to grant consent to unverified org
  // ==========================================
  console.log("\n--- Test 4: Grant Consent to Unverified Org (should fail) ---");
  try {
    const expiry = Math.floor(Date.now() / 1000) + 31536000;
    await cm.connect(user1).grantConsent(
      org2.address,
      ethers.id("EMAIL_DATA"),
      ethers.id("MARKETING"),
      expiry
    );
    check("Should have rejected unverified org", false);
  } catch (err) {
    check("Correctly rejected unverified org", err.message.includes("OrgNotVerified"));
  }

  // ==========================================
  // TEST 5: Org1 verifies access (read-only, no gas)
  // ==========================================
  console.log("\n--- Test 5: Verify Access (Gas-Free Read) ---");
  try {
    const consentId = await cm.consentCount();
    const hasAccess = await cm.verifyAccess(consentId, ethers.id("ANALYTICS"), org1.address);
    check("Org1 has valid access", hasAccess === true);

    const wrongPurpose = await cm.verifyAccess(consentId, ethers.id("MARKETING"), org1.address);
    check("Wrong purpose returns false", wrongPurpose === false);

    const wrongOrg = await cm.verifyAccess(consentId, ethers.id("ANALYTICS"), org2.address);
    check("Wrong org returns false", wrongOrg === false);
  } catch (err) {
    console.log(`  ❌ FAIL: ${err.message}`);
    failed++;
  }

  // ==========================================
  // TEST 6: Org1 requests access (on-chain tx)
  // ==========================================
  console.log("\n--- Test 6: Org Requests Access (On-Chain) ---");
  try {
    const consentId = await cm.consentCount();
    const tx = await cm.connect(org1).requestAccess(consentId, ethers.id("ANALYTICS"));
    const receipt = await tx.wait();
    check("Access approved (tx confirmed)", receipt.status === 1);
  } catch (err) {
    console.log(`  ❌ FAIL: ${err.message}`);
    failed++;
  }

  // ==========================================
  // TEST 7: Wrong org requests access (should fail)
  // ==========================================
  console.log("\n--- Test 7: Wrong Org Requests Access (should fail) ---");
  try {
    const consentId = await cm.consentCount();
    await cm.connect(org2).requestAccess(consentId, ethers.id("ANALYTICS"));
    check("Should have denied wrong org", false);
  } catch (err) {
    check("Correctly denied wrong org", err.message.includes("AccessDenied"));
  }

  // ==========================================
  // TEST 8: User revokes consent
  // ==========================================
  console.log("\n--- Test 8: User Revokes Consent ---");
  try {
    const consentId = await cm.consentCount();
    const tx = await cm.connect(user1).revokeConsent(consentId);
    await tx.wait();
    const consent = await cm.consents(consentId);
    check("Consent is now inactive", consent.active === false);
  } catch (err) {
    console.log(`  ❌ FAIL: ${err.message}`);
    failed++;
  }

  // ==========================================
  // TEST 9: Access denied after revocation
  // ==========================================
  console.log("\n--- Test 9: Access Denied After Revocation ---");
  try {
    const consentId = await cm.consentCount();
    await cm.connect(org1).requestAccess(consentId, ethers.id("ANALYTICS"));
    check("Should have denied post-revoke", false);
  } catch (err) {
    check("Correctly denied after revoke", err.message.includes("AccessDenied"));
  }

  // ==========================================
  // TEST 10: getConsentDetails helper
  // ==========================================
  console.log("\n--- Test 10: getConsentDetails View Function ---");
  try {
    const consentId = await cm.consentCount();
    const d = await cm.getConsentDetails(consentId);
    check("Details: user correct", d.user === user1.address);
    check("Details: org correct", d.organization === org1.address);
    check("Details: active = false (revoked)", d.active === false);
    check("Details: isExpired = false (not expired, just revoked)", d.isExpired === false);
  } catch (err) {
    console.log(`  ❌ FAIL: ${err.message}`);
    failed++;
  }

  // ==========================================
  // TEST 11: Admin removes org, new consents blocked
  // ==========================================
  console.log("\n--- Test 11: Remove Org & Block New Consents ---");
  try {
    await (await ac.connect(admin).removeOrganization(org1.address)).wait();
    const isVerified = await ac.isVerifiedOrg(org1.address);
    check("Org1 is now unverified", isVerified === false);

    const expiry = Math.floor(Date.now() / 1000) + 31536000;
    try {
      await cm.connect(user1).grantConsent(org1.address, ethers.id("HEALTH"), ethers.id("RESEARCH"), expiry);
      check("Should block consent to removed org", false);
    } catch (err2) {
      check("New consent to removed org blocked", err2.message.includes("OrgNotVerified"));
    }
  } catch (err) {
    console.log(`  ❌ FAIL: ${err.message}`);
    failed++;
  }

  // ==========================================
  // TEST 12: Audit Events on chain
  // ==========================================
  console.log("\n--- Test 12: Audit Event Logs ---");
  try {
    const granted = await cm.queryFilter(cm.filters.ConsentGranted());
    const revoked = await cm.queryFilter(cm.filters.ConsentRevoked());
    const approved = await cm.queryFilter(cm.filters.AccessApproved());
    const denied = await cm.queryFilter(cm.filters.AccessDeniedEvent());
    
    check("ConsentGranted events: " + granted.length, granted.length >= 1);
    check("ConsentRevoked events: " + revoked.length, revoked.length >= 1);
    check("AccessApproved events: " + approved.length, approved.length >= 1);
    check("AccessDenied events: " + denied.length, denied.length >= 1);
  } catch (err) {
    console.log(`  ❌ FAIL: ${err.message}`);
    failed++;
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log("\n" + "=".repeat(60));
  console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log("=".repeat(60));
  
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
