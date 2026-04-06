# Consent_Ledger
# ConsentChain — Decentralized Consent Governance Demo

> **Live Demo**: Experience purpose-bound consent management on the blockchain

[![Built on Polygon](https://img.shields.io/badge/Built%20on-Polygon-8247E5?style=flat-square)](https://polygon.technology/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat-square)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square)](https://reactjs.org/)

## 🚀 Quick Start Demo

Get the full ConsentChain experience running in under 5 minutes!

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MetaMask](https://metamask.io/) browser extension
- Terminal/Command Prompt

### 1. Clone & Setup
```bash
git clone <repository-url>
cd consent-chain
npm install
```

### 2. Start Local Blockchain
```bash
# Terminal 1: Start Hardhat local network
npx hardhat node
```

### 3. Deploy Demo Contracts
```bash
# Terminal 2: Deploy contracts with demo data
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Configure Frontend
Update `frontend/.env.local` with deployed addresses (shown in deployment output):
```env
VITE_CONSENT_MANAGER_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_ACCESS_CONTROLLER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 5. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 6. Experience the Demo
1. **Connect MetaMask** to `http://localhost:8545`
2. **Grant Consent** to demo organizations
3. **Switch wallet** to organization addresses
4. **Request access** and view audit logs

---

## 🎯 Demo Features

### ✅ Core Functionality
- **Grant Consent**: Purpose-bound data sharing with time limits
- **Revoke Consent**: User-controlled revocation anytime
- **Access Requests**: Organization data access with validation
- **Audit Trail**: Immutable blockchain event logging
- **Role Management**: Verified organizations via AccessController

### ✅ Technical Highlights
- **Gas Optimized**: Custom errors, struct packing, event-based logging
- **Purpose Validation**: Contract-level enforcement of consent boundaries
- **Emergency Pause**: Circuit breaker functionality
- **Batch Operations**: Efficient bulk consent granting
- **Multi-Role Access**: Separate admin and organization permissions

### ✅ Demo Organizations
| Organization | Address | Category |
|--------------|---------|----------|
| TechCorp Analytics | `0x742d...f44e` | Technology |
| MarketPro Research | `0x742d...f44f` | Research |
| HealthData Solutions | `0x742d...f44a` | Healthcare |
| FinanceFlow Inc | `0x742d...f44b` | Finance |
| SocialSync Network | `0x742d...f44c` | Social Media |

---

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Wallet   │────│  Smart Contracts │────│   Frontend UI   │
│   (MetaMask)    │    │  (Polygon Test)  │    │   (React)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Audit Events   │
                       │  (Immutable)    │
                       └─────────────────┘
```

### Smart Contracts
- **ConsentManager**: Core consent lifecycle management
- **AccessController**: Organization verification and RBAC

### Key Innovations
- **Purpose-Bound Validation**: Contracts enforce consent scope
- **Event-Based Audit**: Gas-efficient immutable logging
- **User Sovereignty**: Revocation without third-party permission
- **Scalable Design**: Modular architecture for enterprise use

---

## 📊 Demo Scenarios

### Scenario 1: User Grants Consent
1. User selects "TechCorp Analytics"
2. Chooses "Location Data" + "Analytics" purpose
3. Sets 30-day expiry
4. Transaction confirms on-chain

### Scenario 2: Organization Requests Access
1. Switch MetaMask to TechCorp address
2. Request access for specific consent ID
3. Contract validates purpose match
4. Access approved or denied with event logging

### Scenario 3: Audit & Compliance
1. View all consent events in Audit Log
2. Filter by user, organization, or time
3. Export compliance reports
4. Verify data usage against granted purposes

---

## 🔧 Development Commands

```bash
# Run tests
npx hardhat test

# Deploy to Polygon Mumbai
npx hardhat run scripts/deploy.js --network polygonMumbai

# Generate contract types
npx hardhat typechain

# Start local development
npm run dev
```

---

## 🎓 Learning Outcomes

This demo showcases:
- **Web3 Development**: Smart contract interaction patterns
- **DeFi Security**: Access control and emergency mechanisms
- **Gas Optimization**: Efficient Solidity programming
- **UX Design**: Intuitive blockchain application flows
- **Scalability**: Modular architecture for growth

---

## 🚀 Production Path

The demo foundation supports:
- **Multi-Chain Deployment**: Polygon, Ethereum, Arbitrum
- **IPFS Integration**: Encrypted off-chain data storage
- **ZK-Proofs**: Privacy-preserving consent verification
- **Enterprise Features**: Bulk operations, advanced reporting
- **Upgradeable Contracts**: UUPS proxy pattern

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Docs**: [Architecture Guide](./docs/architecture.md)
- **Demo**: Run `npm run demo-setup` for guided setup

---

**Built with ❤️ for the Web3 ecosystem**

