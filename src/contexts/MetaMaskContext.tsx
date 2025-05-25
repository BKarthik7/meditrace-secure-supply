import React, { createContext, useContext, useState, useEffect } from 'react';

interface MetaMaskContextType {
  account: string | null;
  isConnected: boolean;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendTransaction: (to: string, value: string, data?: string) => Promise<string>;
  isMetaMaskInstalled: boolean;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error('useMetaMask must be used within a MetaMaskProvider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Browser-compatible function to convert string to hex
const stringToHex = (str: string): string => {
  return '0x' + Array.from(new TextEncoder().encode(str))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const MetaMaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState(false);

  const isMetaMaskInstalled = typeof window !== 'undefined' && Boolean(window.ethereum);

  useEffect(() => {
    if (isMetaMaskInstalled) {
      checkConnection();
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [isMetaMaskInstalled]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      getBalance(accounts[0]);
    }
  };

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        getBalance(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      alert('Please install MetaMask to continue');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
      getBalance(accounts[0]);
      console.log('Connected to MetaMask:', accounts[0]);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setBalance('0');
    console.log('Wallet disconnected');
  };

  const getBalance = async (address: string) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(balanceInEth.toFixed(4));
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const sendTransaction = async (to: string, value: string, data?: string): Promise<string> => {
    if (!account) {
      throw new Error('No wallet connected');
    }

    try {
      const valueInWei = (parseFloat(value) * Math.pow(10, 18)).toString(16);
      
      const transactionParameters = {
        to,
        from: account,
        value: '0x' + valueInWei,
        gas: '0x5208', // 21000 gas limit
        // Only include data if not sending to self
        ...(to.toLowerCase() !== account.toLowerCase() && { data: data || '0x' })
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log('Transaction sent:', txHash);
      return txHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const value = {
    account,
    isConnected,
    balance,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    isMetaMaskInstalled,
  };

  return <MetaMaskContext.Provider value={value}>{children}</MetaMaskContext.Provider>;
};
