import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

/**
 * Custom hook for MetaMask wallet connection.
 * Handles connecting, disconnecting, and listening for account/network changes.
 */
export function useWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && Boolean(window.ethereum);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install it to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const walletSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(walletSigner);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
    } catch (err) {
      if (err.code === 4001) {
        setError('Connection rejected by user.');
      } else {
        setError('Failed to connect wallet: ' + err.message);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  // Disconnect (clear local state)
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        // Re-establish signer
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        browserProvider.getSigner().then(setSigner);
        setProvider(browserProvider);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(Number(chainIdHex));
      // Re-establish provider and signer on chain change
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      browserProvider.getSigner().then(setSigner).catch(() => {});
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskInstalled, disconnectWallet]);

  // Format address for display
  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return {
    account,
    shortAddress,
    provider,
    signer,
    chainId,
    isConnecting,
    isMetaMaskInstalled,
    error,
    connectWallet,
    disconnectWallet,
  };
}
