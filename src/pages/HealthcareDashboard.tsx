
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, QrCode, Search, LogOut, Package, Clock, User, Truck, Wallet, AlertCircle } from "lucide-react";
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

const HealthcareDashboard = () => {
  const { user, logout } = useAuth();
  const { getProduct, getProductHistory } = useBlockchain();
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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [productHistory, setProductHistory] = useState<any[]>([]);
  const [isProcessingTx, setIsProcessingTx] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'healthcare') {
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Product ID or QR Code",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your MetaMask wallet to verify products",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingTx(true);

    try {
      // Send verification transaction first
      const txData = stringToHex(JSON.stringify({
        action: 'VIEW_HISTORY',
        productQuery: searchQuery,
        verifier: user?.email,
        timestamp: new Date().toISOString()
      }));

      const txHash = await sendTransaction(
        account,
        TRANSACTION_COSTS.VIEW_HISTORY,
        txData
      );

      // Extract product ID from QR code if needed
      let productId = searchQuery;
      if (searchQuery.startsWith('QR-')) {
        productId = searchQuery.split('-')[1];
      }

      const product = getProduct(productId);
      
      if (product) {
        setSearchResult(product);
        const history = getProductHistory(productId, txHash);
        setProductHistory(history);
        
        toast({
          title: "Product Verified",
          description: `Found ${product.name} - ${product.status}. Verification recorded on blockchain.`,
        });
      } else {
        setSearchResult(null);
        setProductHistory([]);
        toast({
          title: "Product Not Found",
          description: "No product found with this ID or QR code",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Verification transaction failed:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to process blockchain verification",
        variant: "destructive",
      });
    } finally {
      setIsProcessingTx(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Package className="h-4 w-4" />;
      case 'assigned':
        return <Truck className="h-4 w-4" />;
      case 'sold':
        return <QrCode className="h-4 w-4" />;
      case 'verified':
        return <Shield className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'manufactured':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-green-100 text-green-800';
      case 'verified':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold">MedChain - Healthcare</span>
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
          {/* QR Scanner / Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>Verify Product</span>
              </CardTitle>
              <CardDescription>
                Enter Product ID or QR Code to verify authenticity
                <br />
                <span className="text-purple-600 font-medium">
                  Cost: {formatEthAmount(TRANSACTION_COSTS.VIEW_HISTORY)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="searchQuery">Product ID or QR Code</Label>
                  <Input
                    id="searchQuery"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Product ID or scan QR"
                    required
                    disabled={isProcessingTx}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!isConnected || isProcessingTx}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isProcessingTx ? "Verifying..." : "Verify Product"}
                </Button>
                
                {!isConnected && (
                  <p className="text-sm text-gray-500 text-center">
                    Connect MetaMask wallet to verify products
                  </p>
                )}
              </form>

              {searchResult && (
                <div className="mt-6 p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-900">Product Verified ✓</h3>
                    <Badge className={getStatusColor(searchResult.status)}>
                      {searchResult.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {searchResult.name}</p>
                    <p><strong>ID:</strong> {searchResult.id}</p>
                    <p><strong>Batch:</strong> {searchResult.batchNumber}</p>
                    <p><strong>Expires:</strong> {searchResult.expirationDate}</p>
                    <p><strong>Manufacturer:</strong> {searchResult.manufacturer}</p>
                    {searchResult.qrCode && (
                      <p><strong>QR Code:</strong> {searchResult.qrCode}</p>
                    )}
                    {searchResult.blockchainTxHash && (
                      <p className="text-blue-600 font-mono text-xs">
                        <strong>Blockchain Tx:</strong> {searchResult.blockchainTxHash.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Product Details</span>
              </CardTitle>
              <CardDescription>
                Detailed information about the searched product
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchResult ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{searchResult.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Product ID:</span>
                        <p className="font-mono text-xs break-all">{searchResult.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p>{searchResult.status}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Batch Number:</span>
                        <p>{searchResult.batchNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Expiration:</span>
                        <p>{searchResult.expirationDate}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Current Holder:</span>
                        <p>{searchResult.currentHolder}</p>
                      </div>
                      {searchResult.description && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Description:</span>
                          <p>{searchResult.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Search for a product to view details
                </p>
              )}
            </CardContent>
          </Card>

          {/* Blockchain History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Blockchain History</span>
              </CardTitle>
              <CardDescription>
                Complete transaction history on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productHistory.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {productHistory.map((transaction, index) => (
                    <div key={transaction.id} className="border rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium capitalize">
                              {transaction.type}
                            </p>
                            <span className="text-xs text-gray-500">
                              #{index + 1}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(transaction.timestamp)}
                          </p>
                          <div className="flex items-center mt-2 text-xs">
                            <User className="h-3 w-3 mr-1" />
                            <span>From: {transaction.from}</span>
                            {transaction.to && (
                              <>
                                <span className="mx-2">→</span>
                                <span>To: {transaction.to}</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            Hash: {transaction.hash}
                          </p>
                          {transaction.txHash && (
                            <p className="text-xs text-blue-600 mt-1 font-mono">
                              Blockchain: {transaction.txHash.slice(0, 20)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Search for a product to view blockchain history
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthcareDashboard;
