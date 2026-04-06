import { useState } from 'react';
import { grantConsent, DATA_CATEGORIES, PURPOSES, DURATIONS, DEMO_ORGANIZATIONS } from '../services/consentService';

export default function GrantConsentForm({ signer, onSuccess }) {
  const [orgAddress, setOrgAddress] = useState('');
  const [category, setCategory] = useState(DATA_CATEGORIES[0]);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [duration, setDuration] = useState(DURATIONS[2]); // 7 days default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const receipt = await grantConsent(signer, orgAddress, category, purpose, duration.seconds);
      setSuccess(true);
      setOrgAddress('');
      if (onSuccess) onSuccess(receipt);
    } catch (err) {
      setError(err.reason || err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    background: 'var(--color-bg-primary)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    appearance: 'none',
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
    <div className="glass glow-accent animate-fade-in" style={{
      padding: '2rem',
      borderRadius: '16px',
    }}>
      <h2 style={{
        fontSize: '1.35rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ fontSize: '1.5rem' }}>📝</span>
        Grant New Consent
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Demo Organization Selector */}
        <div>
          <label style={labelStyle}>Demo Organizations</label>
          <select
            value=""
            onChange={(e) => {
              const selected = DEMO_ORGANIZATIONS.find(org => org.address === e.target.value);
              if (selected) {
                setOrgAddress(selected.address);
              }
            }}
            style={selectStyle}
          >
            <option value="">Select a demo organization...</option>
            {DEMO_ORGANIZATIONS.map((org) => (
              <option key={org.address} value={org.address}>
                {org.name} - {org.description}
              </option>
            ))}
          </select>
        </div>

        {/* Organization Address */}
        <div>
          <label style={labelStyle}>Organization Address (or use dropdown above)</label>
          <input
            type="text"
            placeholder="0x..."
            value={orgAddress}
            onChange={(e) => setOrgAddress(e.target.value)}
            required
            style={{
              ...selectStyle,
              fontFamily: 'monospace',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {/* Data Category */}
        <div>
          <label style={labelStyle}>Data Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={selectStyle}
          >
            {DATA_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label style={labelStyle}>Purpose</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            style={selectStyle}
          >
            {PURPOSES.map((p) => (
              <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label style={labelStyle}>Duration</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {DURATIONS.map((d) => (
              <button
                key={d.label}
                type="button"
                onClick={() => setDuration(d)}
                style={{
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: duration.label === d.label ? 'var(--color-accent)' : 'var(--color-border)',
                  background: duration.label === d.label ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-bg-primary)',
                  color: duration.label === d.label ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
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

        {/* Success */}
        {success && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--color-success)',
            fontSize: '0.85rem',
          }}>
            ✅ Consent granted successfully! Transaction confirmed on-chain.
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !orgAddress}
          style={{
            padding: '0.85rem',
            borderRadius: '12px',
            background: loading ? 'var(--color-bg-card)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white',
            border: 'none',
            cursor: loading ? 'wait' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.3s',
            opacity: loading || !orgAddress ? 0.6 : 1,
          }}
        >
          {loading ? '⏳ Confirming on Blockchain...' : '🔒 Grant Consent'}
        </button>
      </form>
    </div>
  );
}
