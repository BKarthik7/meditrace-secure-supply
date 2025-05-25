
import React, { createContext, useContext, useState } from 'react';

interface Transaction {
  id: string;
  productId: string;
  type: 'created' | 'assigned' | 'sold' | 'verified';
  timestamp: string;
  from: string;
  to?: string;
  details: any;
  hash: string;
  txHash?: string; // MetaMask transaction hash
  gasCost?: string; // Actual gas cost paid
}

interface Product {
  id: string;
  name: string;
  manufacturer: string;
  expirationDate: string;
  batchNumber: string;
  description: string;
  currentHolder: string;
  status: 'manufactured' | 'assigned' | 'sold' | 'verified';
  qrCode?: string;
  blockchainTxHash?: string; // Associated blockchain transaction
}

interface BlockchainContextType {
  products: Product[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id' | 'status' | 'currentHolder' | 'blockchainTxHash'>, txHash?: string) => string;
  assignProduct: (productId: string, distributorEmail: string, dispatchDate: string, txHash?: string) => void;
  sellProduct: (productId: string, healthcareProvider: string, txHash?: string) => string;
  getProductHistory: (productId: string, txHash?: string) => Transaction[];
  getProduct: (productId: string) => Product | undefined;
  verifyProduct: (productId: string, txHash?: string) => boolean;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const generateHash = () => {
    return Math.random().toString(36).substr(2, 16);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'hash' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      hash: generateHash(),
      timestamp: new Date().toISOString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  };

  const addProduct = (productData: Omit<Product, 'id' | 'status' | 'currentHolder' | 'blockchainTxHash'>, txHash?: string) => {
    const productId = `MED-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const newProduct: Product = {
      ...productData,
      id: productId,
      status: 'manufactured',
      currentHolder: productData.manufacturer,
      blockchainTxHash: txHash,
    };

    setProducts(prev => [...prev, newProduct]);

    addTransaction({
      productId,
      type: 'created',
      from: productData.manufacturer,
      details: productData,
      txHash,
    });

    console.log('Product added to blockchain with transaction:', { product: newProduct, txHash });
    return productId;
  };

  const assignProduct = (productId: string, distributorEmail: string, dispatchDate: string, txHash?: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: 'assigned', currentHolder: distributorEmail }
        : product
    ));

    addTransaction({
      productId,
      type: 'assigned',
      from: products.find(p => p.id === productId)?.currentHolder || '',
      to: distributorEmail,
      details: { dispatchDate },
      txHash,
    });

    console.log('Product assigned with blockchain transaction:', { productId, distributorEmail, dispatchDate, txHash });
  };

  const sellProduct = (productId: string, healthcareProvider: string, txHash?: string) => {
    const qrCode = `QR-${productId}-${Date.now()}`;
    
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: 'sold', currentHolder: healthcareProvider, qrCode }
        : product
    ));

    addTransaction({
      productId,
      type: 'sold',
      from: products.find(p => p.id === productId)?.currentHolder || '',
      to: healthcareProvider,
      details: { qrCode },
      txHash,
    });

    console.log('Product sold with blockchain transaction:', { productId, qrCode, txHash });
    return qrCode;
  };

  const getProductHistory = (productId: string, txHash?: string) => {
    if (txHash) {
      addTransaction({
        productId,
        type: 'verified',
        from: 'system',
        details: { verification: true },
        txHash,
      });
    }
    return transactions.filter(tx => tx.productId === productId);
  };

  const getProduct = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  const verifyProduct = (productId: string, txHash?: string) => {
    const product = getProduct(productId);
    if (!product) return false;

    if (txHash) {
      addTransaction({
        productId,
        type: 'verified',
        from: 'verification_system',
        details: { verified: true, timestamp: new Date().toISOString() },
        txHash,
      });
    }

    return true;
  };

  const value = {
    products,
    transactions,
    addProduct,
    assignProduct,
    sellProduct,
    getProductHistory,
    getProduct,
    verifyProduct,
  };

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>;
};
