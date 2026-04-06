import { useState, useEffect } from 'react';
import { getUserConsents } from '../services/consentService';
import ConsentCard from './ConsentCard';

export default function ConsentList({ provider, signer, account, refreshTrigger }) {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConsents = async () => {
    if (!provider || !account) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserConsents(provider, account);
      setConsents(data.reverse()); // newest first
    } catch (err) {
      setError(err.message || 'Failed to fetch consents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, [provider, account, refreshTrigger]);

  const handleRevoke = (id) => {
    setConsents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: false } : c))
    );
  };

  const activeCount = consents.filter((c) => c.active && Date.now() / 1000 <= c.expiry).length;
  const revokedCount = consents.filter((c) => !c.active).length;
  const expiredCount = consents.filter((c) => c.active && Date.now() / 1000 > c.expiry).length;

  return (
    <div className="animate-fade-in">
      {/* Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { label: 'Active', value: activeCount, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { label: 'Expired', value: expiredCount, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
          { label: 'Revoked', value: revokedCount, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: '1rem',
            borderRadius: '12px',
            background: stat.bg,
            border: `1px solid ${stat.color}22`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📋</span>
          Your Consents
        </h2>
        <button
          onClick={fetchConsents}
          disabled={loading}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.target.style.borderColor = 'var(--color-accent)'}
          onMouseOut={(e) => e.target.style.borderColor = 'var(--color-border)'}
        >
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: 'var(--color-danger)',
          fontSize: '0.85rem',
          marginBottom: '1rem',
        }}>
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading && consents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--color-text-muted)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Loading consents from blockchain...
        </div>
      )}

      {/* Empty State */}
      {!loading && consents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--color-text-muted)',
          background: 'var(--color-bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No consents found</p>
          <p style={{ fontSize: '0.85rem' }}>Grant your first consent using the form.</p>
        </div>
      )}

      {/* Consent Cards Grid */}
      {consents.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
        }}>
          {consents.map((consent, index) => (
            <div key={consent.id} style={{ animationDelay: `${index * 0.05}s` }}>
              <ConsentCard
                consent={consent}
                signer={signer}
                onRevoke={handleRevoke}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
