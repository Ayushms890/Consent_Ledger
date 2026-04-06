# ConsentChain — Security Model

## Threat Analysis

### 1. Unauthorized Consent Revocation
- **Threat**: A malicious actor or organization could revoke a user's consent.
- **Mitigation**: `revokeConsent()` checks `c.user == msg.sender`. Only the original consent creator (wallet owner) can revoke.
- **Custom Error**: `OnlyUserCanRevoke()`

### 2. Unauthorized Data Access
- **Threat**: An organization requests access to data it was not granted consent for.
- **Mitigation**: `requestAccess()` verifies `c.organization == msg.sender`. Only the specific organization named in the consent can request access.

### 3. Purpose Mismatch Attack
- **Threat**: An organization attempts to use consented data for a different purpose than what was agreed.
- **Mitigation**: The `purpose` parameter is hashed to `bytes32` and compared at contract level. `c.purpose != _requestedPurpose` triggers `AccessDenied`.

### 4. Expired Consent Usage
- **Threat**: An organization tries to access data after consent has expired.
- **Mitigation**: `block.timestamp > c.expiry` is checked in every `requestAccess()` call. Expiry is enforced deterministically by the blockchain's timestamp.

### 5. Replay Attacks
- **Threat**: A signed transaction is replayed to grant duplicate consent.
- **Mitigation**: Each consent gets a unique sequential ID (`consentCount++`). The same transaction replayed would simply create a new consent with a new ID — it cannot overwrite or interfere with existing consents.

### 6. Front-Running
- **Threat**: A miner or MEV bot observes a pending `revokeConsent` transaction and front-runs it with a `requestAccess` call.
- **Mitigation**: This is a known EVM-level concern. For this protocol, the risk is minimal because:
  - Consent data is metadata only (no financial value at stake).
  - The `requestAccess` function only emits events; it does not transfer funds or tokens.

### 7. Reentrancy
- **Threat**: Reentrancy attack during state changes.
- **Mitigation**: No risk — the contract:
  - Makes no external calls.
  - Transfers no ETH or tokens.
  - Has no callbacks or delegatecalls.

---

## Access Control Summary

| Action | Who Can Perform | Validation |
|--------|----------------|------------|
| Grant Consent | Any user (EOA) | `msg.sender` becomes `consent.user` |
| Revoke Consent | Only consent user | `c.user == msg.sender` |
| Request Access | Only named org | `c.organization == msg.sender` |
| Verify Access | Anyone (view) | Read-only, no state change |
| Deploy Contract | Deployer | Becomes `owner` via Ownable |

---

## On-Chain Data Privacy

| Data | Stored On-Chain? | Format |
|------|-----------------|--------|
| User wallet address | Yes | `address` |
| Organization address | Yes | `address` |
| Data category | Yes | `bytes32` (keccak256 hash) |
| Purpose | Yes | `bytes32` (keccak256 hash) |
| Expiry timestamp | Yes | `uint48` |
| Active status | Yes | `bool` |
| Actual user data | **NO** | Encrypted off-chain |

**No personally identifiable information (PII) is stored on-chain.** Only cryptographic hashes and metadata.
