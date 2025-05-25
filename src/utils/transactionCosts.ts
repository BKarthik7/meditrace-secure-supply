
export const TRANSACTION_COSTS = {
  ADD_PRODUCT: '0.001', // ETH
  ASSIGN_PRODUCT: '0.0008', // ETH
  SELL_PRODUCT: '0.0006', // ETH
  VIEW_HISTORY: '0.0002', // ETH for verification
} as const;

export const formatEthAmount = (amount: string): string => {
  return `${amount} ETH`;
};

export const calculateGasCost = (gasPrice: number, gasLimit: number): string => {
  const costInWei = gasPrice * gasLimit;
  const costInEth = costInWei / Math.pow(10, 18);
  return costInEth.toFixed(6);
};

export const getTransactionDescription = (type: keyof typeof TRANSACTION_COSTS): string => {
  const descriptions = {
    ADD_PRODUCT: 'Adding product to blockchain',
    ASSIGN_PRODUCT: 'Assigning product to distributor',
    SELL_PRODUCT: 'Recording product sale',
    VIEW_HISTORY: 'Verifying product authenticity',
  };
  return descriptions[type];
};
