# ConsentChain — System Architecture

## Overview

ConsentChain is a **Decentralized Purpose-Bound Consent & Data Governance Protocol** deployed on the Polygon blockchain (EVM-compatible). It enables users to grant, manage, and revoke consent for their data in a verifiable, tamper-proof manner.

**No raw personal data is stored on-chain** — only metadata (hashes, addresses, timestamps, and status flags).

---

## Architecture Layers

### 1. Identity Layer
- **User Wallet (EOA)**: The user's MetaMask wallet serves as their decentralized identity. The wallet address (`msg.sender`) is the unique identifier.
- **Organization Wallet**: Each organization requesting data access is identified by its Ethereum address.
- **Digital Signature Validation**: All transactions are cryptographically signed by the wallet owner before submission.

### 2. Smart Contract Layer (Core Governance)
The `ConsentManager.sol` contract is the core of the protocol. It is responsible for:
- **Consent Creation** (`grantConsent`)
- **Consent Revocation** (`revokeConsent`)
- **Purpose Validation** (`requestAccess`)
- **Expiry Enforcement** (via `block.timestamp`)
- **Audit Logging** (via emitted events)

### 3. Application Layer
- **User Dashboard**: View active/expired/revoked consents, grant new ones, revoke existing ones.
- **Organization Dashboard** (Phase 2): Request data access, view approval status.
- **Audit Viewer** (Phase 2): Query blockchain events for complete audit trail.

### 4. Storage Layer
- **On-chain**: Consent metadata only (addresses, bytes32 hashes, expiry, status).
- **Off-chain**: Encrypted personal data (future: IPFS integration).
- **Hash Verification**: Off-chain data integrity verified against on-chain hashes.

---

## Data Flow

```
USER (MetaMask Wallet)
    │
    ├── grantConsent() ──► ConsentManager.sol ──► Stores metadata on-chain
    │                                          └── Emits ConsentGranted event
    │
    ├── revokeConsent() ──► ConsentManager.sol ──► Updates active=false
    │                                           └── Emits ConsentRevoked event
    │
ORGANIZATION (Wallet)
    │
    ├── requestAccess() ──► ConsentManager.sol ──► Validates:
    │                                              ├── active == true?
    │                                              ├── block.timestamp <= expiry?
    │                                              ├── org == consent.organization?
    │                                              └── purpose == consent.purpose?
    │                                          ──► Emits AccessApproved / AccessDenied
    │
FRONTEND / BACKEND
    │
    └── queryFilter(events) ──► Blockchain ──► Displays audit logs
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Polygon (EVM) |
| Smart Contracts | Solidity 0.8.20 |
| Contract Framework | Hardhat |
| Access Control | OpenZeppelin Ownable |
| Frontend | React (Vite) |
| Styling | TailwindCSS v4 |
| Wallet Integration | Ethers.js v6 + MetaMask |
| Testing | Chai + Hardhat |

---

## Security Model

- **Only the user** (`msg.sender == consent.user`) can revoke their consent.
- **Only the designated organization** can request access.
- **Purpose matching** is enforced at the smart contract level (bytes32 comparison).
- **Automatic expiry** via `block.timestamp` — no manual action needed.
- **Custom errors** instead of string reverts for gas efficiency.
- **No reentrancy risk** — no external calls or ETH transfers.
- **Events are immutable** — once emitted, they cannot be altered.
