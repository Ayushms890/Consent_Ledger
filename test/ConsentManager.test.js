const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConsentChain Phase 2", function () {
  let accessController;
  let consentManager;
  let owner;
  let user1;
  let org1;
  let org2;
  let randomUser;

  const orgName = ethers.id("Acme Corp");
  const dataCategory = ethers.id("LOCATION_DATA");
  const purpose = ethers.id("ANALYTICS");
  const wrongPurpose = ethers.id("MARKETING");

  // Future expiry (approx 1 year from now)
  const expiry = Math.floor(Date.now() / 1000) + 31536000;
  // Past expiry
  const pastExpiry = Math.floor(Date.now() / 1000) - 1000;

  beforeEach(async function () {
    [owner, user1, org1, org2, randomUser] = await ethers.getSigners();

    // Deploy AccessController
    const AccessController = await ethers.getContractFactory("AccessController");
    accessController = await AccessController.deploy();
    await accessController.waitForDeployment();

    // Deploy ConsentManager with AccessController address
    const acAddress = await accessController.getAddress();
    const ConsentManager = await ethers.getContractFactory("ConsentManager");
    consentManager = await ConsentManager.deploy(acAddress);
    await consentManager.waitForDeployment();

    // Register org1 as a verified organization
    await accessController.registerOrganization(org1.address, orgName);
  });

  // ============================
  // ACCESS CONTROLLER TESTS
  // ============================
  describe("AccessController", function () {
    it("Should register an organization", async function () {
      const org = await accessController.organizations(org1.address);
      expect(org.verified).to.be.true;
      expect(org.wallet).to.equal(org1.address);
    });

    it("Should emit OrganizationRegistered event", async function () {
      await expect(
        accessController.registerOrganization(org2.address, ethers.id("Beta Inc"))
      ).to.emit(accessController, "OrganizationRegistered");
    });

    it("Should not allow duplicate registration", async function () {
      await expect(
        accessController.registerOrganization(org1.address, orgName)
      ).to.be.revertedWithCustomError(accessController, "OrgAlreadyRegistered");
    });

    it("Should allow admin to remove organization", async function () {
      await accessController.removeOrganization(org1.address);
      const org = await accessController.organizations(org1.address);
      expect(org.verified).to.be.false;
    });

    it("Should not allow non-admin to register organization", async function () {
      await expect(
        accessController.connect(randomUser).registerOrganization(org2.address, ethers.id("Random"))
      ).to.be.reverted;
    });

    it("Should re-verify a removed organization", async function () {
      await accessController.removeOrganization(org1.address);
      await accessController.verifyOrganization(org1.address);
      const isVerified = await accessController.isVerifiedOrg(org1.address);
      expect(isVerified).to.be.true;
    });

    it("Should return correct org count", async function () {
      const count = await accessController.getOrgCount();
      expect(count).to.equal(1n);
      await accessController.registerOrganization(org2.address, ethers.id("Beta Inc"));
      const count2 = await accessController.getOrgCount();
      expect(count2).to.equal(2n);
    });
  });

  // ============================
  // CONSENT MANAGER TESTS (Phase 2)
  // ============================
  describe("ConsentManager — Granting Consent", function () {
    it("Should grant consent to a verified organization", async function () {
      await expect(
        consentManager.connect(user1).grantConsent(org1.address, dataCategory, purpose, expiry)
      ).to.emit(consentManager, "ConsentGranted");

      const consent = await consentManager.consents(1);
      expect(consent.user).to.equal(user1.address);
      expect(consent.organization).to.equal(org1.address);
      expect(consent.active).to.equal(true);
    });

    it("Should reject consent to an unverified organization", async function () {
      await expect(
        consentManager.connect(user1).grantConsent(org2.address, dataCategory, purpose, expiry)
      ).to.be.revertedWithCustomError(consentManager, "OrgNotVerified");
    });

    it("Should reject consent with past expiry", async function () {
      await expect(
        consentManager.connect(user1).grantConsent(org1.address, dataCategory, purpose, pastExpiry)
      ).to.be.revertedWithCustomError(consentManager, "InvalidExpiry");
    });
  });

  describe("ConsentManager — Requesting Access", function () {
    beforeEach(async function () {
      await consentManager.connect(user1).grantConsent(org1.address, dataCategory, purpose, expiry);
    });

    it("Should allow access if purpose and org match", async function () {
      await expect(
        consentManager.connect(org1).requestAccess(1, purpose)
      ).to.emit(consentManager, "AccessApproved");
    });

    it("Should deny access if purpose mismatches", async function () {
      await expect(
        consentManager.connect(org1).requestAccess(1, wrongPurpose)
      ).to.emit(consentManager, "AccessDeniedEvent");
    });

    it("Should deny access if called by wrong organization", async function () {
      await expect(
        consentManager.connect(org2).requestAccess(1, purpose)
      ).to.emit(consentManager, "AccessDeniedEvent");
    });
  });

  describe("ConsentManager — Revoking Consent", function () {
    beforeEach(async function () {
      await consentManager.connect(user1).grantConsent(org1.address, dataCategory, purpose, expiry);
    });

    it("Should allow user to revoke their consent", async function () {
      await expect(consentManager.connect(user1).revokeConsent(1))
        .to.emit(consentManager, "ConsentRevoked")
        .withArgs(user1.address, org1.address, 1);

      const consent = await consentManager.consents(1);
      expect(consent.active).to.be.false;
    });

    it("Should not allow non-owner to revoke consent", async function () {
      await expect(
        consentManager.connect(org1).revokeConsent(1)
      ).to.be.revertedWithCustomError(consentManager, "OnlyUserCanRevoke");
    });

    it("Should deny access after revocation", async function () {
      await consentManager.connect(user1).revokeConsent(1);
      await expect(
        consentManager.connect(org1).requestAccess(1, purpose)
      ).to.emit(consentManager, "AccessDeniedEvent");
    });
  });

  describe("ConsentManager — View Functions", function () {
    beforeEach(async function () {
      await consentManager.connect(user1).grantConsent(org1.address, dataCategory, purpose, expiry);
    });

    it("Should verify access correctly (read-only)", async function () {
      const isValid = await consentManager.verifyAccess(1, purpose, org1.address);
      expect(isValid).to.be.true;
    });

    it("Should deny verify for wrong purpose", async function () {
      const isValid = await consentManager.verifyAccess(1, wrongPurpose, org1.address);
      expect(isValid).to.be.false;
    });

    it("Should return consent details via getConsentDetails", async function () {
      const details = await consentManager.getConsentDetails(1);
      expect(details.user).to.equal(user1.address);
      expect(details.organization).to.equal(org1.address);
      expect(details.active).to.be.true;
      expect(details.isExpired).to.be.false;
    });
  });

  describe("Integration — Org Removal & Consent", function () {
    it("Should still allow existing consents after org removal", async function () {
      // Grant consent while org is verified
      await consentManager.connect(user1).grantConsent(org1.address, dataCategory, purpose, expiry);
      
      // Remove org
      await accessController.removeOrganization(org1.address);
      
      // Existing consent is still accessible
      const consent = await consentManager.consents(1);
      expect(consent.active).to.be.true;
      
      // But new consents to this org are blocked
      await expect(
        consentManager.connect(user1).grantConsent(org1.address, dataCategory, purpose, expiry)
      ).to.be.revertedWithCustomError(consentManager, "OrgNotVerified");
    });
  });
});
