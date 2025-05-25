
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Package, QrCode, LogOut, Wallet, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { useMetaMask } from "@/contexts/MetaMaskContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { TRANSACTION_COSTS, formatEthAmount, getTransactionDescription } from "@/utils/transactionCosts";

// Browser-compatible function to convert string to hex
const stringToHex = (str: string): string => {
  return '0x' + Array.from(new TextEncoder().encode(str))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

const DistributorDashboard = () => {
  const { user, logout } = useAuth();
  const { products, sellProduct } = useBlockchain();
  const { 
    account, 
    isConnected, 
    balance, 
    connectWallet, 
    sendTransaction, 
    isMetaMaskInstalled 
  } = useMetaMask();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sellForm, setSellForm] = useState({
    productId: "",
    healthcareProvider: "",
  });
  const [isProcessingTx, setIsProcessingTx] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'distributor') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "MetaMask wallet connected successfully",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect MetaMask wallet",
        variant: "destructive",
      });
    }
  };

  const handleSellProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sellForm.productId || !sellForm.healthcareProvider) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === sellForm.productId);
    if (!product || product.currentHolder !== user?.email || product.status !== 'assigned') {
      toast({
        title: "Invalid Product",
        description: "Product not found or not assigned to you",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingTx(true);

    try {
      // Send blockchain transaction using browser-compatible encoding
      const txData = stringToHex(JSON.stringify({
        action: 'SELL_PRODUCT',
        productId: sellForm.productId,
        healthcareProvider: sellForm.healthcareProvider,
        timestamp: new Date().toISOString()
      }));

      const txHash = await sendTransaction(
        account,
        TRANSACTION_COSTS.SELL_PRODUCT,
        txData
      );

      const qrCode = sellProduct(sellForm.productId, sellForm.healthcareProvider, txHash);

      toast({
        title: "Product Sold Successfully",
        description: `QR Code generated: ${qrCode}. Transaction: ${txHash}`,
      });

      setSellForm({
        productId: "",
        healthcareProvider: "",
      });

    } catch (error) {
      console.error('Sell product transaction failed:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to process blockchain transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessingTx(false);
    }
  };

  const assignedProducts = products.filter(product => 
    product.currentHolder === user?.email && product.status === 'assigned'
  );

  const soldProducts = products.filter(product => 
    products.find(p => p.id === product.id)?.status === 'sold' && 
    product.currentHolder === user?.email
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold">MedChain - Distributor</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              
              {/* MetaMask Wallet Section */}
              {!isMetaMaskInstalled ? (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">MetaMask not installed</span>
                </div>
              ) : !isConnected ? (
                <Button onClick={handleConnectWallet} variant="outline" size="sm">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wallet className="h-4 w-4" />
                    <span>Connected</span>
                  </div>
                  <span className="text-gray-600">|</span>
                  <span className="font-mono text-xs">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-green-600 font-medium">{balance} ETH</span>
                </div>
              )}
              
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sell Product Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>Sell Product</span>
              </CardTitle>
              <CardDescription>
                Generate QR code and sell to healthcare provider
                <br />
                <span className="text-green-600 font-medium">
                  Cost: {formatEthAmount(TRANSACTION_COSTS.SELL_PRODUCT)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSellProduct} className="space-y-4">
                <div>
                  <Label htmlFor="productId">Product ID</Label>
                  <Input
                    id="productId"
                    value={sellForm.productId}
                    onChange={(e) => setSellForm(prev => ({...prev, productId: e.target.value}))}
                    placeholder="Enter product ID"
                    required
                    disabled={isProcessingTx}
                  />
                </div>
                
                <div>
                  <Label htmlFor="healthcareProvider">Healthcare Provider</Label>
                  <Input
                    id="healthcareProvider"
                    value={sellForm.healthcareProvider}
                    onChange={(e) => setSellForm(prev => ({...prev, healthcareProvider: e.target.value}))}
                    placeholder="Hospital or clinic name"
                    required
                    disabled={isProcessingTx}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!isConnected || isProcessingTx}
                >
                  {isProcessingTx ? "Processing..." : "Generate QR & Sell"}
                </Button>
                
                {!isConnected && (
                  <p className="text-sm text-gray-500 text-center">
                    Connect MetaMask wallet to sell products
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Assigned Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Assigned Products</span>
              </CardTitle>
              <CardDescription>
                Products assigned to you ({assignedProducts.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {assignedProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No assigned products</p>
                ) : (
                  assignedProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                          {product.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">ID: {product.id}</p>
                      <p className="text-xs text-gray-600">Batch: {product.batchNumber}</p>
                      <p className="text-xs text-gray-600">Expires: {product.expirationDate}</p>
                      <p className="text-xs text-gray-600">From: {product.manufacturer}</p>
                      {product.blockchainTxHash && (
                        <p className="text-xs text-blue-600 font-mono">
                          Blockchain Tx: {product.blockchainTxHash.slice(0, 10)}...
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sold Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>Sold Products</span>
              </CardTitle>
              <CardDescription>
                Products sold with QR codes ({soldProducts.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {soldProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No sold products yet</p>
                ) : (
                  soldProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          {product.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">ID: {product.id}</p>
                      <p className="text-xs text-gray-600">QR: {product.qrCode}</p>
                      <p className="text-xs text-gray-600">Sold to: {product.currentHolder}</p>
                      {product.blockchainTxHash && (
                        <p className="text-xs text-blue-600 font-mono">
                          Blockchain Tx: {product.blockchainTxHash.slice(0, 10)}...
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DistributorDashboard;
