import { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import Navbar from './components/Navbar';
import GrantConsentForm from './components/GrantConsentForm';
import ConsentList from './components/ConsentList';
import OrgDashboard from './components/OrgDashboard';
import AuditLog from './components/AuditLog';
import AdminPanel from './components/AdminPanel';
import DemoGuide from './components/DemoGuide';

function App() {
  const {
    account,
    shortAddress,
    provider,
    signer,
    chainId,
    isConnecting,
    isMetaMaskInstalled,
    error: walletError,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleConsentGranted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'grant', icon: '📝', label: 'Grant Consent' },
    { id: 'org', icon: '🏢', label: 'Org Access' },
    { id: 'audit', icon: '📜', label: 'Audit Log' },
    { id: 'admin', icon: '🛡️', label: 'Admin' },
  ];

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.25rem',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s',
    background: activeTab === tab ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
    color: activeTab === tab ? 'var(--color-accent-light)' : 'var(--color-text-muted)',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Navbar
        account={account}
        shortAddress={shortAddress}
        isConnecting={isConnecting}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        chainId={chainId}
      />

      {/* Wallet Error */}
      {walletError && (
        <div style={{
          maxWidth: '900px',
          margin: '1rem auto',
          padding: '1rem',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: 'var(--color-danger)',
          fontSize: '0.9rem',
          textAlign: 'center',
        }}>
          {walletError}
        </div>
      )}

      <main style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}>
        {/* Not Connected State */}
        {!account && (
          <div className="animate-fade-in" style={{
            textAlign: 'center',
            padding: '5rem 2rem',
          }}>
            {/* Hero Section */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
              }}>
                🔗
              </div>
              <h1 className="gradient-text" style={{
                fontSize: '3rem',
                fontWeight: 800,
                marginBottom: '1rem',
                lineHeight: 1.2,
              }}>
                ConsentChain
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: 'var(--color-text-secondary)',
                maxWidth: '600px',
                margin: '0 auto 0.5rem',
                lineHeight: 1.6,
              }}>
                Decentralized Purpose-Bound Consent & Data Governance Protocol
              </p>
              <p style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-muted)',
                maxWidth: '500px',
                margin: '0 auto',
              }}>
                Take control of your data. Grant, manage, and revoke consent with blockchain-verified immutability.
              </p>
            </div>

            {/* Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              maxWidth: '900px',
              margin: '0 auto 3rem',
            }}>
              {[
                { icon: '🔒', title: 'Immutable Records', desc: 'Consent stored on Polygon blockchain' },
                { icon: '🎯', title: 'Purpose-Bound', desc: 'Enforced purpose matching at contract level' },
                { icon: '⏰', title: 'Auto-Expiry', desc: 'Consents expire automatically via block.timestamp' },
                { icon: '📊', title: 'Audit Trail', desc: 'Complete event-based audit logging' },
                { icon: '🛡️', title: 'Role-Based Access', desc: 'Verified organizations via AccessController' },
              ].map((feat) => (
                <div key={feat.title} className="glass" style={{
                  padding: '1.5rem',
                  borderRadius: '14px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feat.icon}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>{feat.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{feat.desc}</p>
                </div>
              ))}
            </div>

            {/* Connect CTA */}
            {!isMetaMaskInstalled ? (
              <div style={{
                padding: '1.5rem',
                borderRadius: '14px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                maxWidth: '500px',
                margin: '0 auto',
              }}>
                <p style={{ color: 'var(--color-warning)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  🦊 MetaMask Required
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Install MetaMask browser extension to interact with ConsentChain.
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    background: 'var(--color-warning)',
                    color: '#000',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  Install MetaMask →
                </a>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="animate-pulse-glow"
                style={{
                  padding: '0.85rem 2.5rem',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  transition: 'all 0.3s',
                }}
              >
                {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask to Start'}
              </button>
            )}
          </div>
        )}

        {/* Connected State */}
        {account && (
          <div className="animate-fade-in">
            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              gap: '0.35rem',
              marginBottom: '2rem',
              padding: '0.5rem',
              background: 'var(--color-bg-secondary)',
              borderRadius: '12px',
              overflowX: 'auto',
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  style={tabStyle(tab.id)}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Demo Guide */}
            <DemoGuide />

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <ConsentList
                provider={provider}
                signer={signer}
                account={account}
                refreshTrigger={refreshTrigger}
              />
            )}

            {/* Grant Tab */}
            {activeTab === 'grant' && (
              <div style={{ maxWidth: '550px' }}>
                <GrantConsentForm
                  signer={signer}
                  onSuccess={handleConsentGranted}
                />
              </div>
            )}

            {/* Org Dashboard Tab */}
            {activeTab === 'org' && (
              <div style={{ maxWidth: '650px' }}>
                <OrgDashboard
                  provider={provider}
                  signer={signer}
                  account={account}
                />
              </div>
            )}

            {/* Audit Log Tab */}
            {activeTab === 'audit' && (
              <AuditLog provider={provider} />
            )}

            {/* Admin Tab */}
            {activeTab === 'admin' && (
              <AdminPanel
                signer={signer}
                provider={provider}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--color-text-muted)',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--color-border)',
        marginTop: '3rem',
      }}>
        <span className="gradient-text" style={{ fontWeight: 600 }}>ConsentChain</span>
        {' '} — Decentralized Consent Governance Protocol • Built on Polygon
      </footer>
    </div>
  );
}

export default App;
