import { useState } from 'react';
import { registerOrganization, removeOrganization, isVerifiedOrg, getOrgCount } from '../services/consentService';

export default function AdminPanel({ signer, provider }) {
  const [orgAddress, setOrgAddress] = useState('');
  const [orgName, setOrgName] = useState('');
  const [checkAddress, setCheckAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      await registerOrganization(signer, orgAddress, orgName);
      setResult(`✅ Organization "${orgName}" registered successfully at ${orgAddress}`);
      setOrgAddress('');
      setOrgName('');
    } catch (err) {
      setError(err.reason || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      await removeOrganization(signer, orgAddress);
      setResult(`🗑️ Organization at ${orgAddress} has been removed.`);
      setOrgAddress('');
    } catch (err) {
      setError(err.reason || err.message || 'Removal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    setError(null);
    setResult(null);
    try {
      const verified = await isVerifiedOrg(provider, checkAddress);
      const count = await getOrgCount(provider);
      setResult(
        verified
          ? `✅ Address ${checkAddress} is a VERIFIED organization. Total orgs: ${count}`
          : `❌ Address ${checkAddress} is NOT verified. Total orgs: ${count}`
      );
    } catch (err) {
      setError(err.message || 'Check failed');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    background: 'var(--color-bg-primary)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Register / Remove Org */}
      <div className="glass glow-accent" style={{ padding: '2rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🛡️</span>
          Manage Organizations
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Organization Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={orgAddress}
              onChange={(e) => setOrgAddress(e.target.value)}
              style={{ ...inputStyle, fontFamily: 'monospace' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          <div>
            <label style={labelStyle}>Organization Name</label>
            <input
              type="text"
              placeholder="e.g., Acme Corp"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={handleRegister}
              disabled={loading || !orgAddress || !orgName}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                opacity: loading || !orgAddress || !orgName ? 0.6 : 1,
              }}
            >
              ✅ Register
            </button>
            <button
              onClick={handleRemove}
              disabled={loading || !orgAddress}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--color-danger)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                opacity: loading || !orgAddress ? 0.6 : 1,
              }}
            >
              🗑️ Remove
            </button>
          </div>
        </div>
      </div>

      {/* Verify Org Status */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🔍</span>
          Check Organization
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Wallet Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={checkAddress}
              onChange={(e) => setCheckAddress(e.target.value)}
              style={{ ...inputStyle, fontFamily: 'monospace' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={!checkAddress}
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--color-info)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              opacity: !checkAddress ? 0.6 : 1,
            }}
          >
            🔍 Check Verification Status
          </button>
        </div>

        {/* Results (shared) */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            marginTop: '1rem',
          }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: 'var(--color-accent-light)',
            fontSize: '0.85rem',
            marginTop: '1rem',
          }}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
