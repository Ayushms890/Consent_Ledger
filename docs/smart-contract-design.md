# ConsentChain — Smart Contract Design

## Contract: ConsentManager.sol

### Overview
The `ConsentManager` is the core smart contract of the ConsentChain protocol. It handles the full lifecycle of consent: creation, validation, revocation, and expiry.

---

## Consent Struct

```solidity
struct Consent {
    address user;           // 20 bytes — Slot 1
    uint48 expiry;          // 6 bytes  — Slot 1
    bool active;            // 1 byte   — Slot 1 (packed)
    address organization;   // 20 bytes — Slot 2
    bytes32 dataCategory;   // 32 bytes — Slot 3
    bytes32 purpose;        // 32 bytes — Slot 4
}
```

### Gas Optimization Decisions

| Decision | Reasoning |
|----------|-----------|
| `bytes32` for dataCategory/purpose | Hashing strings to `bytes32` saves ~50,000+ gas vs. storing `string`. Hashing is done off-chain with `keccak256`. |
| `uint48` for expiry | 6 bytes is sufficient for timestamps until year ~8 million. Saves 26 bytes vs `uint256`, allowing struct packing. |
| `mapping` instead of `array` | O(1) lookups. Arrays require O(n) iteration and are vulnerable to gas limit DOS. |
| Custom `error` types | ~200-500 gas cheaper per revert than `require("string message")`. |
| Events for audit logs | Emitting events costs ~375 gas + 8 gas/byte. Storing in state costs ~20,000 gas per slot. |

---

## Storage

```solidity
mapping(uint256 => Consent) public consents;
uint256 public consentCount = 0;
```

Sequential IDs via `consentCount++` ensure unique consent identifiers.

---

## Functions

### `grantConsent(address, bytes32, bytes32, uint48)`
- **Caller**: User (any EOA)
- **Action**: Creates a new consent record
- **Emits**: `ConsentGranted(user, org, consentId, dataCategory, purpose, expiry)`

### `revokeConsent(uint256)`
- **Caller**: Only the consent owner (user)
- **Action**: Sets `active = false`
- **Guards**: `OnlyUserCanRevoke`, `ConsentInactive`
- **Emits**: `ConsentRevoked(user, org, consentId)`

### `requestAccess(uint256, bytes32)`
- **Caller**: Organization
- **Action**: Validates consent against 4 conditions
- **Validation Checks**:
  1. `c.active == true`
  2. `block.timestamp <= c.expiry`
  3. `msg.sender == c.organization`
  4. `_requestedPurpose == c.purpose`
- **Emits**: `AccessApproved` or `AccessDenied` + reverts

### `verifyAccess(uint256, bytes32, address)` → `bool`
- **Caller**: Anyone (view function, no gas cost)
- **Action**: Read-only access check
- **Returns**: `true` if all 4 conditions pass, `false` otherwise

---

## Events (Immutable Audit Log)

```solidity
event ConsentGranted(address indexed user, address indexed org, uint256 indexed consentId, bytes32 dataCategory, bytes32 purpose, uint48 expiry);
event ConsentRevoked(address indexed user, address indexed org, uint256 indexed consentId);
event AccessRequested(address indexed org, uint256 indexed consentId, bytes32 requestedPurpose);
event AccessApproved(address indexed org, uint256 indexed consentId);
event AccessDeniedEvent(address indexed org, uint256 indexed consentId);
```

All events use `indexed` parameters for efficient filtering.

---

## Custom Errors

```solidity
error OnlyUserCanRevoke();
error ConsentInactive();
error AccessDenied();
```

These are cheaper than string-based `require()` statements.
