import { DEMO_ORGANIZATIONS } from '../services/consentService';

export default function DemoGuide() {
  const guideStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '2rem',
    borderRadius: '16px',
    marginBottom: '2rem',
    position: 'relative',
    overflow: 'hidden',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 1,
  };

  const stepStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const orgCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '1rem',
    borderRadius: '8px',
    margin: '0.5rem 0',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  return (
    <div style={guideStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '1.8rem' }}>🚀</span>
          ConsentChain Demo Guide
        </h2>

        <p style={{
          fontSize: '1rem',
          marginBottom: '1.5rem',
          opacity: 0.9,
        }}>
          Experience decentralized, purpose-bound consent management. This demo showcases a scalable Web3 infrastructure for data governance.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={stepStyle}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              📋 Step 1: Connect Wallet
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Connect your MetaMask wallet to interact with the blockchain.
            </p>
          </div>

          <div style={stepStyle}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              📝 Step 2: Grant Consent
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Choose a demo organization and grant consent for specific data categories and purposes.
            </p>
          </div>

          <div style={stepStyle}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              🏢 Step 3: Switch to Org
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Switch your wallet to an organization address to request data access.
            </p>
          </div>

          <div style={stepStyle}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              📊 Step 4: View Audit Logs
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Monitor all consent activities with immutable blockchain audit trails.
            </p>
          </div>
        </div>

        <div style={stepStyle}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            🏢 Demo Organizations
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem' }}>
            {DEMO_ORGANIZATIONS.map((org) => (
              <div key={org.address} style={orgCardStyle}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {org.name}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                  {org.description}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  opacity: 0.7,
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  display: 'inline-block',
                }}>
                  {org.address.slice(0, 10)}...{org.address.slice(-4)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            🎯 Key Features Demonstrated
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            fontSize: '0.8rem',
            opacity: 0.9,
          }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
              Purpose-Bound Validation
            </span>
            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
              Immutable Audit Logs
            </span>
            <span style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
              Gas-Optimized Contracts
            </span>
            <span style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
              User-Controlled Revocation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}