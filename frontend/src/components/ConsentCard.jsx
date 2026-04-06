import { useState } from 'react';
import { revokeConsent } from '../services/consentService';

export default function ConsentCard({ consent, signer, onRevoke }) {
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState(null);

  const isExpired = Date.now() / 1000 > consent.expiry;
  const isActive = consent.active && !isExpired;

  const handleRevoke = async () => {
    setRevoking(true);
    setError(null);
    try {
      await revokeConsent(signer, consent.id);
      if (onRevoke) onRevoke(consent.id);
    } catch (err) {
      setError(err.reason || err.message || 'Revocation failed');
    } finally {
      setRevoking(false);
    }
  };

  const getStatusBadge = () => {
    if (!consent.active) {
      return { label: 'REVOKED', bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' };
    }
    if (isExpired) {
      return { label: 'EXPIRED', bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' };
    }
    return { label: 'ACTIVE', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' };
  };

  const status = getStatusBadge();
  const expiryDate = new Date(consent.expiry * 1000).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const shortOrg = consent.organization
    ? `${consent.organization.slice(0, 6)}...${consent.organization.slice(-4)}`
    : '—';

  // Reverse-map known hashes (for display purposes)
  const knownHashes = {};
  const categories = ['LOCATION_DATA', 'EMAIL_DATA', 'HEALTH_RECORDS', 'FINANCIAL_DATA', 'BROWSING_HISTORY', 'SOCIAL_MEDIA', 'DEVICE_INFO', 'BIOMETRIC_DATA'];
  const purposes = ['ANALYTICS', 'MARKETING', 'RESEARCH', 'PERSONALIZATION', 'COMPLIANCE', 'THIRD_PARTY_SHARING', 'SERVICE_IMPROVEMENT', 'ADVERTISING'];
  
  // We can't reverse a hash, so we'll just show the first 10 chars
  const shortHash = (h) => h ? `${h.slice(0, 10)}...` : '—';

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '14px',
        padding: '1.5rem',
        transition: 'all 0.3s',
        cursor: 'default',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-active)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
        }}>
          Consent #{consent.id}
        </span>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          background: status.bg,
          color: status.color,
          border: `1px solid ${status.border}`,
        }}>
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Organization</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--color-accent-light)', fontSize: '0.8rem' }}>{shortOrg}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Data Category</span>
          <span style={{ color: 'var(--color-text-primary)', fontSize: '0.8rem' }}>{shortHash(consent.dataCategory)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Purpose</span>
          <span style={{ color: 'var(--color-text-primary)', fontSize: '0.8rem' }}>{shortHash(consent.purpose)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Expires</span>
          <span style={{ color: isExpired ? 'var(--color-warning)' : 'var(--color-text-primary)', fontSize: '0.8rem' }}>{expiryDate}</span>
        </div>
      </div>

      {/* TX Hash */}
      {consent.txHash && (
        <div style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          background: 'var(--color-bg-primary)',
          fontSize: '0.7rem',
          fontFamily: 'monospace',
          color: 'var(--color-text-muted)',
          marginBottom: '1rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          TX: {consent.txHash}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--color-danger)',
          fontSize: '0.8rem',
          marginBottom: '0.75rem',
        }}>
          {error}
        </div>
      )}

      {/* Revoke Button */}
      {isActive && (
        <button
          onClick={handleRevoke}
          disabled={revoking}
          style={{
            width: '100%',
            padding: '0.65rem',
            borderRadius: '10px',
            background: revoking ? 'var(--color-bg-primary)' : 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-danger)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            cursor: revoking ? 'wait' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => { if (!revoking) e.target.style.background = 'rgba(239, 68, 68, 0.2)'; }}
          onMouseOut={(e) => { if (!revoking) e.target.style.background = 'rgba(239, 68, 68, 0.1)'; }}
        >
          {revoking ? '⏳ Revoking...' : '🗑️ Revoke Consent'}
        </button>
      )}
    </div>
  );
}
