import { useState } from 'react';
import {
  verifyAccess,
  requestAccess,
  getConsentDetails,
  isVerifiedOrg,
  PURPOSES,
} from '../services/consentService';

export default function OrgDashboard({ provider, signer, account }) {
  const [consentId, setConsentId] = useState('');
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [consentDetails, setConsentDetails] = useState(null);
  const [orgVerified, setOrgVerified] = useState(null);

  // Check if current wallet is a verified org
  const checkOrgStatus = async () => {
    try {
      const verified = await isVerifiedOrg(provider, account);
      setOrgVerified(verified);
    } catch (err) {
      setOrgVerified(false);
    }
  };

  // Auto-check on mount
  useState(() => { checkOrgStatus(); });

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setConsentDetails(null);

    try {
      const id = parseInt(consentId);
      if (isNaN(id) || id <= 0) throw new Error('Invalid Consent ID');

      // Get consent details
      const details = await getConsentDetails(provider, id);
      setConsentDetails(details);

      // Verify access (gas-free read)
      const hasAccess = await verifyAccess(provider, id, purpose, account);
      setResult({
        type: 'verify',
        hasAccess,
        message: hasAccess
          ? 'Access is VALID. You may proceed with data access.'
          : 'Access DENIED. Consent may be expired, revoked, or purpose/org mismatch.',
      });
    } catch (err) {
      setError(err.reason || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const id = parseInt(consentId);
      if (isNaN(id) || id <= 0) throw new Error('Invalid Consent ID');

      await requestAccess(signer, id, purpose);
      setResult({
        type: 'request',
        hasAccess: true,
        message: 'Access APPROVED! Event logged immutably on-chain.',
      });
    } catch (err) {
      const reason = err.reason || err.message || '';
      if (reason.includes('AccessDenied') || reason.includes('denied')) {
        setResult({
          type: 'request',
          hasAccess: false,
          message: 'Access DENIED by smart contract. Check purpose, expiry, and org.',
        });
      } else {
        setError(reason);
      }
    } finally {
      setLoading(false);
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

  const shortAddr = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—';

  return (
    <div className="animate-fade-in">
      {/* Org Status Banner */}
      <div style={{
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        background: orgVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        border: `1px solid ${orgVerified ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: orgVerified ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {orgVerified ? '✅ Verified Organization' : '⚠️ Unverified Wallet'}
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            {orgVerified
              ? 'Your wallet is registered as a verified organization.'
              : 'Your wallet is not registered. Request access may fail.'}
          </p>
        </div>
        <button
          onClick={checkOrgStatus}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Main Form */}
      <div className="glass glow-accent" style={{ padding: '2rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏢</span>
          Organization Access Panel
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Consent ID */}
          <div>
            <label style={labelStyle}>Consent ID</label>
            <input
              type="number"
              placeholder="Enter consent ID (e.g., 1)"
              value={consentId}
              onChange={(e) => setConsentId(e.target.value)}
              style={inputStyle}
              min="1"
              onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* Purpose */}
          <div>
            <label style={labelStyle}>Requested Purpose</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={inputStyle}>
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={handleVerify}
              disabled={loading || !consentId}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--color-info)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                opacity: loading || !consentId ? 0.6 : 1,
              }}
            >
              {loading ? '⏳' : '🔍'} Verify (Free)
            </button>
            <button
              onClick={handleRequestAccess}
              disabled={loading || !consentId}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                opacity: loading || !consentId ? 0.6 : 1,
              }}
            >
              {loading ? '⏳' : '📨'} Request Access
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--color-danger)',
              fontSize: '0.85rem',
            }}>
              ❌ {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: result.hasAccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${result.hasAccess ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
            }}>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                color: result.hasAccess ? 'var(--color-success)' : 'var(--color-danger)',
              }}>
                {result.hasAccess ? '✅ ACCESS VALID' : '🚫 ACCESS DENIED'}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {result.message}
              </p>
            </div>
          )}

          {/* Consent Details Preview */}
          {consentDetails && (
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>
                📄 Consent #{consentId} Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>User</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-accent-light)' }}>{shortAddr(consentDetails.user)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Organization</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-accent-light)' }}>{shortAddr(consentDetails.organization)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
                  <span style={{
                    color: consentDetails.active && !consentDetails.isExpired ? 'var(--color-success)' :
                           consentDetails.isExpired ? 'var(--color-warning)' : 'var(--color-danger)',
                    fontWeight: 600,
                  }}>
                    {!consentDetails.active ? 'REVOKED' : consentDetails.isExpired ? 'EXPIRED' : 'ACTIVE'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Expires</span>
                  <span>{new Date(consentDetails.expiry * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
