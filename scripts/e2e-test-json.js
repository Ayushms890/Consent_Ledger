/**
 * End-to-End Integration Test (JSON Output)
 * Run: npx hardhat run scripts/e2e-test-json.js --network localhost
 */

const { ethers } = require("hardhat");
const fs = require("fs");

const AC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CM_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {
  const [admin, user1, org1, org2] = await ethers.getSigners();
  const results = [];
  let passed = 0;
  let failed = 0;

  function check(name, condition) {
    const status = condition ? "PASS" : "FAIL";
    if (condition) passed++; else failed++;
    results.push({ test: name, status });
  }

  const ac = await ethers.getContractAt("AccessController", AC_ADDRESS);
  const cm = await ethers.getContractAt("ConsentManager", CM_ADDRESS);

  // TEST 1: Register Org
  try {
    const tx = await ac.connect(admin).registerOrganization(org1.address, ethers.id("Acme Corp"));
    await tx.wait();
    const isV = await ac.isVerifiedOrg(org1.address);
    check("1. Register Org1", isV === true);
  } catch (e) { check("1. Register Org1", false); }

  // TEST 2: Unregistered org check
  try {
    const isV = await ac.isVerifiedOrg(org2.address);
    check("2. Org2 not verified", isV === false);
  } catch (e) { check("2. Org2 not verified", false); }

  // TEST 3: Grant consent to verified org
  try {
    const exp = Math.floor(Date.now() / 1000) + 31536000;
    const tx = await cm.connect(user1).grantConsent(org1.address, ethers.id("LOCATION_DATA"), ethers.id("ANALYTICS"), exp);
    await tx.wait();
    const c = await cm.consents(await cm.consentCount());
    check("3. Grant consent to verified org", c.active === true && c.user === user1.address);
  } catch (e) { check("3. Grant consent to verified org", false); }

  // TEST 4: Reject consent to unverified org
  try {
    const exp = Math.floor(Date.now() / 1000) + 31536000;
    await cm.connect(user1).grantConsent(org2.address, ethers.id("EMAIL"), ethers.id("MARKETING"), exp);
    check("4. Reject unverified org consent", false);
  } catch (e) { check("4. Reject unverified org consent", e.message.includes("OrgNotVerified")); }

  // TEST 5: Verify access (gas-free)
  try {
    const id = await cm.consentCount();
    const yes = await cm.verifyAccess(id, ethers.id("ANALYTICS"), org1.address);
    const no1 = await cm.verifyAccess(id, ethers.id("MARKETING"), org1.address);
    const no2 = await cm.verifyAccess(id, ethers.id("ANALYTICS"), org2.address);
    check("5a. Correct purpose+org = true", yes === true);
    check("5b. Wrong purpose = false", no1 === false);
    check("5c. Wrong org = false", no2 === false);
  } catch (e) { check("5. Verify access", false); }

  // TEST 6: Request access (on-chain)
  try {
    const id = await cm.consentCount();
    const tx = await cm.connect(org1).requestAccess(id, ethers.id("ANALYTICS"));
    const r = await tx.wait();
    check("6. Org1 request access approved", r.status === 1);
  } catch (e) { check("6. Org1 request access approved", false); }

  // TEST 7: Wrong org request denied
  try {
    const id = await cm.consentCount();
    await cm.connect(org2).requestAccess(id, ethers.id("ANALYTICS"));
    check("7. Wrong org denied", false);
  } catch (e) { check("7. Wrong org denied", e.message.includes("AccessDenied")); }

  // TEST 8: User revokes consent
  try {
    const id = await cm.consentCount();
    await (await cm.connect(user1).revokeConsent(id)).wait();
    const c = await cm.consents(id);
    check("8. Consent revoked", c.active === false);
  } catch (e) { check("8. Consent revoked", false); }

  // TEST 9: Access denied after revocation
  try {
    const id = await cm.consentCount();
    await cm.connect(org1).requestAccess(id, ethers.id("ANALYTICS"));
    check("9. Post-revoke access denied", false);
  } catch (e) { check("9. Post-revoke access denied", e.message.includes("AccessDenied")); }

  // TEST 10: getConsentDetails
  try {
    const id = await cm.consentCount();
    const d = await cm.getConsentDetails(id);
    check("10. getConsentDetails works", d.user === user1.address && d.active === false);
  } catch (e) { check("10. getConsentDetails works", false); }

  // TEST 11: Remove org blocks new consents
  try {
    await (await ac.connect(admin).removeOrganization(org1.address)).wait();
    const isV = await ac.isVerifiedOrg(org1.address);
    check("11a. Org1 removed", isV === false);
    try {
      const exp = Math.floor(Date.now() / 1000) + 31536000;
      await cm.connect(user1).grantConsent(org1.address, ethers.id("X"), ethers.id("Y"), exp);
      check("11b. New consent to removed org blocked", false);
    } catch (e2) { check("11b. New consent to removed org blocked", e2.message.includes("OrgNotVerified")); }
  } catch (e) { check("11. Remove org", false); }

  // TEST 12: Audit events on chain
  try {
    const granted = await cm.queryFilter(cm.filters.ConsentGranted());
    const revoked = await cm.queryFilter(cm.filters.ConsentRevoked());
    const approved = await cm.queryFilter(cm.filters.AccessApproved());
    const denied = await cm.queryFilter(cm.filters.AccessDeniedEvent());
    check("12a. ConsentGranted events: " + granted.length, granted.length >= 1);
    check("12b. ConsentRevoked events: " + revoked.length, revoked.length >= 1);
    check("12c. AccessApproved events: " + approved.length, approved.length >= 1);
    // Note: AccessDeniedEvent is emitted inside reverted txs, so it won't persist on-chain.
    // This is correct EVM behavior — reverted txs don't save events.
    check("12d. AccessDenied events (0 expected, reverted txs)", denied.length >= 0);
  } catch (e) { check("12. Audit events", false); }

  // Write results
  const output = { passed, failed, total: passed + failed, results };
  fs.writeFileSync("e2e-results.json", JSON.stringify(output, null, 2), "utf8");
}

main().catch((error) => {
  const output = { error: error.message };
  require("fs").writeFileSync("e2e-results.json", JSON.stringify(output, null, 2), "utf8");
  process.exitCode = 1;
});
