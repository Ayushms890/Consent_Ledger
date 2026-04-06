# 🧪 ConsentChain Demo Testing Checklist

## Pre-Demo Setup
- [ ] Hardhat node running (`npx hardhat node`)
- [ ] Contracts deployed (`npx hardhat run scripts/deploy.js --network localhost`)
- [ ] Frontend running (`npm run dev` in frontend folder)
- [ ] Browser at `http://localhost:5174`
- [ ] MetaMask on "Hardhat Local" network
- [ ] MetaMask account has 10,000 ETH

---

## Core Features Testing

### 1. **Wallet Connection** ✅
- [ ] Click "Connect MetaMask"
- [ ] See account address in header
- [ ] See green connected indicator
- [ ] Network shows "Hardhat Local"

### 2. **Grant Consent** ✅
- [ ] Go to "Grant Consent" tab
- [ ] Select "TechCorp Analytics" from dropdown
- [ ] Select data category (e.g., "LOCATION_DATA")
- [ ] Select purpose (e.g., "ANALYTICS")
- [ ] Set duration (e.g., "7 Days")
- [ ] Click "Grant Consent"
- [ ] See success message "Consent granted successfully!"
- [ ] MetaMask shows transaction
- [ ] Transaction confirms

### 3. **View Dashboard** ✅
- [ ] Go to "Dashboard" tab
- [ ] See granted consent in the list
- [ ] Shows user address, org, category, purpose, expiry
- [ ] Shows "ACTIVE" status
- [ ] Shows transaction hash

### 4. **Revoke Consent** ✅
- [ ] Click "🗑️ Revoke" button on a consent
- [ ] MetaMask shows transaction
- [ ] Consent status changes to "REVOKED"
- [ ] Cannot request access after revoked
- [ ] Audit log shows revocation event

### 5. **Organization Access Request** ✅
- [ ] Switch MetaMask to org account:
  - Private key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
  - Address: `0x70997970c51812dc3a010c7d01b50e0d17dc79c8`
- [ ] Go to "Org Access" tab
- [ ] Enter consent ID (e.g., 1)
- [ ] Select matching purpose
- [ ] Click "Request Access"
- [ ] See "ACCESS VALID" message
- [ ] See approval event in audit log

### 6. **Purpose Mismatch** ✅
- [ ] Still in org account
- [ ] Try requesting with WRONG purpose
- [ ] See "ACCESS DENIED" message
- [ ] See denial event in audit log
- [ ] No transaction fails (graceful rejection)

### 7. **Audit Logs** ✅
- [ ] Go to "Audit Log" tab
- [ ] See all events listed (ConsentGranted, AccessRequested, etc.)
- [ ] Events show correct details (user, org, purpose)
- [ ] Can filter by event type
- [ ] Shows transaction hash and block number
- [ ] Newest events at top

### 8. **Admin Panel** ✅
- [ ] Switch back to main account
- [ ] Go to "Admin" tab
- [ ] See registered organizations
- [ ] See organization status (verified/unverified)
- [ ] Can register new org (if needed)

---

## Edge Cases & Error Handling

### Expiry Test
- [ ] Grant consent with "1 Hour" duration
- [ ] Verify it shows expiry time
- [ ] After expiry, access request should fail

### Consent Details
- [ ] Click "View" on any consent
- [ ] See full details (user, org, category, purpose, expiry, status)

### Switching Wallets
- [ ] Switch between user and org accounts in MetaMask
- [ ] Frontend correctly recognizes role switch
- [ ] UI updates accordingly

### Meta

Mask Network Switch
- [ ] Can only use on "Hardhat Local"
- [ ] Shows error if connected to wrong network
- [ ] Cannot grant consent or request access on wrong network

---

## Performance Checks

- [ ] Page loads in < 2 seconds
- [ ] Grant consent transaction < 30 seconds
- [ ] Dashboard updates without page refresh
- [ ] No console errors (F12 → Console)
- [ ] Audit log loads all events quickly

---

## UI/UX Checks

- [ ] All buttons clearly labeled
- [ ] Error messages are helpful
- [ ] Success messages show immediately
- [ ] Forms have proper validation
- [ ] Responsive on different screen sizes
- [ ] Dark theme looks good
- [ ] All icons are recognizable

---

## Demo Script (5-Minute Flow)

**Time: 0:00 - Start**
```
1. Show wallet connection (0:15)
2. Grant consent (0:45)
3. View dashboard (1:00)
4. Show audit log (1:30)
5. Switch to org wallet (2:00)
6. Request access - Success (2:30)
7. Request access - Failure (3:00)
8. Show purpose validation (3:30)
9. Explain architecture (4:00)
10. Q&A (5:00)
```

---

## Known Issues & Workarounds

| Issue | Workaround |
|-------|-----------|
| "Insufficient ETH" | Make sure on Hardhat Local + test account with 10k ETH |
| Contracts not found | Redeploy: `npx hardhat run scripts/deploy.js --network localhost` |
| Audit logs empty | Refresh page (Ctrl+F5) |
| MetaMask won't connect | Make sure RPC URL is correct and Hardhat node running |

---

## Post-Demo Checklist

- [ ] All features demonstrated worked correctly
- [ ] No crashes or errors
- [ ] Take screenshots for documentation
- [ ] Note any issues for improvement
- [ ] Update this checklist based on findings
