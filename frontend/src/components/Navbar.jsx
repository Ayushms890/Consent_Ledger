import { useState } from 'react';

export default function Navbar({ account, shortAddress, isConnecting, onConnect, onDisconnect, chainId }) {

  const getNetworkName = (id) => {
    const networks = {
      1: 'Ethereum',
      31337: 'Hardhat Local',
      80001: 'Polygon Mumbai',
      80002: 'Polygon Amoy',
      137: 'Polygon',
    };
    return networks[id] || `Chain ${id}`;
  };

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--color-border)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
        }}>
          🔗
        </div>
        <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          ConsentChain
        </span>
      </div>

      {/* Wallet Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {account && chainId && (
          <span style={{
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 500,
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--color-success)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}>
            {getNetworkName(chainId)}
          </span>
        )}

        {account ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              color: 'var(--color-accent-light)',
            }}>
              {shortAddress}
            </div>
            <button
              onClick={onDisconnect}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--color-danger)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.25)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="animate-pulse-glow"
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              border: 'none',
              cursor: isConnecting ? 'wait' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.3s',
              opacity: isConnecting ? 0.7 : 1,
            }}
          >
            {isConnecting ? 'Connecting...' : '🦊 Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}
