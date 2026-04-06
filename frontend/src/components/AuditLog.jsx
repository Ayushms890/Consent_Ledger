import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/consentService';

export default function AuditLog({ provider }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetchLogs = async () => {
    if (!provider) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditLogs(provider);
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [provider]);

  const eventTypes = ['ALL', 'ConsentGranted', 'ConsentRevoked', 'AccessRequested', 'AccessApproved', 'AccessDenied'];

  const filteredLogs = filter === 'ALL' ? logs : logs.filter((l) => l.type === filter);

  const getEventColor = (type) => {
    switch (type) {
      case 'ConsentGranted': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.2)' };
      case 'ConsentRevoked': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
      case 'AccessRequested': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' };
      case 'AccessApproved': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.2)' };
      case 'AccessDenied': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' };
      default: return { bg: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', border: 'var(--color-border)' };
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'ConsentGranted': return '✅';
      case 'ConsentRevoked': return '🗑️';
      case 'AccessRequested': return '📨';
      case 'AccessApproved': return '🔓';
      case 'AccessDenied': return '🚫';
      default: return '📋';
    }
  };

  const shortAddr = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—';
  const shortHash = (h) => h ? `${h.slice(0, 10)}...${h.slice(-6)}` : '—';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📜</span>
          Immutable Audit Log
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--color-accent-light)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}>
            {filteredLogs.length} Events
          </span>
          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            {loading ? '⏳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.35rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: filter === type ? 'var(--color-accent)' : 'var(--color-border)',
              background: filter === type ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-bg-card)',
              color: filter === type ? 'var(--color-accent-light)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            {type === 'ALL' ? '📋 All' : `${getEventIcon(type)} ${type.replace('Consent', '').replace('Access', '')}`}
          </button>
        ))}
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
      {loading && logs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Scanning blockchain events...
        </div>
      )}

      {/* Empty */}
      {!loading && filteredLogs.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--color-text-muted)',
          background: 'var(--color-bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
          <p>No audit events found{filter !== 'ALL' ? ` for "${filter}"` : ''}.</p>
        </div>
      )}

      {/* Event List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {filteredLogs.map((log, index) => {
          const colors = getEventColor(log.type);
          return (
            <div
              key={`${log.txHash}-${log.type}-${index}`}
              className="animate-fade-in"
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.2s',
                animationDelay: `${index * 0.03}s`,
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = colors.border}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              {/* Event Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: colors.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0,
              }}>
                {getEventIcon(log.type)}
              </div>

              {/* Event Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: colors.bg,
                    color: colors.color,
                    border: `1px solid ${colors.border}`,
                  }}>
                    {log.type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Consent #{log.consentId}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {log.user && <span>User: <span style={{ fontFamily: 'monospace', color: 'var(--color-accent-light)' }}>{shortAddr(log.user)}</span></span>}
                  {log.org && <span>Org: <span style={{ fontFamily: 'monospace', color: 'var(--color-accent-light)' }}>{shortAddr(log.org)}</span></span>}
                  <span>Block: {log.blockNumber}</span>
                </div>
              </div>

              {/* TX Hash */}
              <div style={{
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                color: 'var(--color-text-muted)',
                flexShrink: 0,
              }}>
                {shortHash(log.txHash)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
