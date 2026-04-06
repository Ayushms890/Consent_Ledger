import { ethers } from 'ethers';
import ConsentManagerABI from '../abi/ConsentManager.json';
import AccessControllerABI from '../abi/AccessController.json';

// Contract addresses from environment variables
const CONSENT_MANAGER_ADDRESS = import.meta.env.VITE_CONSENT_MANAGER_ADDRESS;
const ACCESS_CONTROLLER_ADDRESS = import.meta.env.VITE_ACCESS_CONTROLLER_ADDRESS;

// ========================
// CONTRACT INSTANCES
// ========================

export function getConsentManagerRead(provider) {
  return new ethers.Contract(CONSENT_MANAGER_ADDRESS, ConsentManagerABI.abi, provider);
}

export function getConsentManagerWrite(signer) {
  return new ethers.Contract(CONSENT_MANAGER_ADDRESS, ConsentManagerABI.abi, signer);
}

export function getAccessControllerRead(provider) {
  return new ethers.Contract(ACCESS_CONTROLLER_ADDRESS, AccessControllerABI.abi, provider);
}

export function getAccessControllerWrite(signer) {
  return new ethers.Contract(ACCESS_CONTROLLER_ADDRESS, AccessControllerABI.abi, signer);
}

// ========================
// UTILITY
// ========================

/**
 * Convert a human-readable string to a bytes32 hash (keccak256).
 */
export function toBytes32(text) {
  return ethers.id(text);
}

// ========================
// CONSENT FUNCTIONS
// ========================

/**
 * Grant consent on the blockchain.
 */
export async function grantConsent(signer, orgAddress, dataCategory, purpose, durationSeconds) {
  const contract = getConsentManagerWrite(signer);
  const categoryHash = toBytes32(dataCategory);
  const purposeHash = toBytes32(purpose);
  const expiry = Math.floor(Date.now() / 1000) + durationSeconds;

  const tx = await contract.grantConsent(orgAddress, categoryHash, purposeHash, expiry);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * Batch grant multiple consents in a single transaction.
 */
export async function batchGrantConsents(signer, consents) {
  const contract = getConsentManagerWrite(signer);
  
  const orgs = consents.map(c => c.orgAddress);
  const categories = consents.map(c => toBytes32(c.dataCategory));
  const purposes = consents.map(c => toBytes32(c.purpose));
  const expiries = consents.map(c => Math.floor(Date.now() / 1000) + c.durationSeconds);

  const tx = await contract.batchGrantConsents(orgs, categories, purposes, expiries);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * Revoke a consent by its ID.
 */
export async function revokeConsent(signer, consentId) {
  const contract = getConsentManagerWrite(signer);
  const tx = await contract.revokeConsent(consentId);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * Request access to a consent (called by organization).
 */
export async function requestAccess(signer, consentId, purpose) {
  const contract = getConsentManagerWrite(signer);
  const purposeHash = toBytes32(purpose);
  const tx = await contract.requestAccess(consentId, purposeHash);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * Verify access (read-only, no gas cost).
 */
export async function verifyAccess(provider, consentId, purpose, orgAddress) {
  const contract = getConsentManagerRead(provider);
  const purposeHash = toBytes32(purpose);
  return await contract.verifyAccess(consentId, purposeHash, orgAddress);
}

/**
 * Get consent details by ID.
 */
export async function getConsent(provider, consentId) {
  const contract = getConsentManagerRead(provider);
  const consent = await contract.consents(consentId);
  return {
    user: consent.user,
    organization: consent.organization,
    dataCategory: consent.dataCategory,
    purpose: consent.purpose,
    expiry: Number(consent.expiry),
    active: consent.active,
  };
}

/**
 * Get consent details via the helper function.
 */
export async function getConsentDetails(provider, consentId) {
  const contract = getConsentManagerRead(provider);
  const details = await contract.getConsentDetails(consentId);
  return {
    user: details.user,
    organization: details.organization,
    dataCategory: details.dataCategory,
    purpose: details.purpose,
    expiry: Number(details.expiry),
    active: details.active,
    isExpired: details.isExpired,
  };
}

/**
 * Get total consent count.
 */
export async function getConsentCount(provider) {
  const contract = getConsentManagerRead(provider);
  return Number(await contract.consentCount());
}

/**
 * Fetch all ConsentGranted events for a specific user.
 */
export async function getUserConsents(provider, userAddress) {
  const contract = getConsentManagerRead(provider);
  const filter = contract.filters.ConsentGranted(userAddress);
  const events = await contract.queryFilter(filter);

  const consents = [];
  for (const event of events) {
    const args = event.args;
    const consentId = Number(args.consentId);
    const current = await getConsent(provider, consentId);
    consents.push({
      id: consentId,
      ...current,
      txHash: event.transactionHash,
    });
  }
  return consents;
}

// ========================
// ACCESS CONTROLLER FUNCTIONS
// ========================

/**
 * Register an organization (admin only).
 */
export async function registerOrganization(signer, orgAddress, orgName) {
  const contract = getAccessControllerWrite(signer);
  const nameHash = toBytes32(orgName);
  const tx = await contract.registerOrganization(orgAddress, nameHash);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * Remove organization verification (admin only).
 */
export async function removeOrganization(signer, orgAddress) {
  const contract = getAccessControllerWrite(signer);
  const tx = await contract.removeOrganization(orgAddress);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * Check if an address is a verified organization.
 */
export async function isVerifiedOrg(provider, orgAddress) {
  const contract = getAccessControllerRead(provider);
  return await contract.isVerifiedOrg(orgAddress);
}

/**
 * Get organization details.
 */
export async function getOrganization(provider, orgAddress) {
  const contract = getAccessControllerRead(provider);
  const org = await contract.organizations(orgAddress);
  return {
    name: org.name,
    wallet: org.wallet,
    verified: org.verified,
    registeredAt: Number(org.registeredAt),
  };
}

/**
 * Get total registered org count.
 */
export async function getOrgCount(provider) {
  const contract = getAccessControllerRead(provider);
  return Number(await contract.getOrgCount());
}

// ========================
// AUDIT LOG FUNCTIONS
// ========================

/**
 * Fetch all audit events (all types) — complete audit trail.
 */
export async function getAuditLogs(provider) {
  const contract = getConsentManagerRead(provider);
  const logs = [];

  try {
    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    
    // Query from block 0 to current (search entire history)
    const options = { fromBlock: 0, toBlock: currentBlock };

    // Fetch all event types
    const granted = await contract.queryFilter(contract.filters.ConsentGranted(), 0, currentBlock);
    const revoked = await contract.queryFilter(contract.filters.ConsentRevoked(), 0, currentBlock);
    const requested = await contract.queryFilter(contract.filters.AccessRequested(), 0, currentBlock);
    const approved = await contract.queryFilter(contract.filters.AccessApproved(), 0, currentBlock);
    const denied = await contract.queryFilter(contract.filters.AccessDeniedEvent(), 0, currentBlock);

  for (const e of granted) {
    logs.push({
      type: 'ConsentGranted',
      consentId: Number(e.args.consentId),
      user: e.args.user,
      org: e.args.org,
      dataCategory: e.args.dataCategory,
      purpose: e.args.purpose,
      expiry: Number(e.args.expiry),
      blockNumber: e.blockNumber,
      txHash: e.transactionHash,
    });
  }

  for (const e of revoked) {
    logs.push({
      type: 'ConsentRevoked',
      consentId: Number(e.args.consentId),
      user: e.args.user,
      org: e.args.org,
      blockNumber: e.blockNumber,
      txHash: e.transactionHash,
    });
  }

  for (const e of requested) {
    logs.push({
      type: 'AccessRequested',
      consentId: Number(e.args.consentId),
      org: e.args.org,
      purpose: e.args.requestedPurpose,
      blockNumber: e.blockNumber,
      txHash: e.transactionHash,
    });
  }

  for (const e of approved) {
    logs.push({
      type: 'AccessApproved',
      consentId: Number(e.args.consentId),
      org: e.args.org,
      blockNumber: e.blockNumber,
      txHash: e.transactionHash,
    });
  }

  for (const e of denied) {
    logs.push({
      type: 'AccessDenied',
      consentId: Number(e.args.consentId),
      org: e.args.org,
      blockNumber: e.blockNumber,
      txHash: e.transactionHash,
    });
  }

    // Sort by block number (newest first)
    logs.sort((a, b) => b.blockNumber - a.blockNumber);
    return logs;
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    // Return empty array on error instead of throwing
    return [];
  }
}

// ========================
// PRE-DEFINED OPTIONS
// ========================

export const DATA_CATEGORIES = [
  'LOCATION_DATA',
  'EMAIL_DATA',
  'HEALTH_RECORDS',
  'FINANCIAL_DATA',
  'BROWSING_HISTORY',
  'SOCIAL_MEDIA',
  'DEVICE_INFO',
  'BIOMETRIC_DATA',
];

export const PURPOSES = [
  'ANALYTICS',
  'MARKETING',
  'RESEARCH',
  'PERSONALIZATION',
  'COMPLIANCE',
  'THIRD_PARTY_SHARING',
  'SERVICE_IMPROVEMENT',
  'ADVERTISING',
];

export const DURATIONS = [
  { label: '1 Hour', seconds: 3600 },
  { label: '24 Hours', seconds: 86400 },
  { label: '7 Days', seconds: 604800 },
  { label: '30 Days', seconds: 2592000 },
  { label: '90 Days', seconds: 7776000 },
  { label: '1 Year', seconds: 31536000 },
];

// ========================
// DEMO ORGANIZATIONS
// ========================

export const DEMO_ORGANIZATIONS = [
  {
    name: 'TechCorp Analytics',
    address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    description: 'Data analytics and insights company',
    category: 'Technology'
  },
  {
    name: 'MarketPro Research',
    address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    description: 'Market research and consumer insights',
    category: 'Research'
  },
  {
    name: 'HealthData Solutions',
    address: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
    description: 'Healthcare data processing and analysis',
    category: 'Healthcare'
  },
  {
    name: 'FinanceFlow Inc',
    address: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
    description: 'Financial services and credit scoring',
    category: 'Finance'
  },
  {
    name: 'SocialSync Network',
    address: '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc',
    description: 'Social media analytics platform',
    category: 'Social Media'
  }
];
