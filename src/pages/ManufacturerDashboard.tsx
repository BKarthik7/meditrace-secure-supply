
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Package, Plus, Truck, LogOut, Wallet, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { useMetaMask } from "@/contexts/MetaMaskContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { TRANSACTION_COSTS, formatEthAmount, getTransactionDescription } from "@/utils/transactionCosts";

const ManufacturerDashboard = () => {
  const { user, logout } = useAuth();
  const { addProduct, assignProduct, products } = useBlockchain();
  const { account, isConnected, balance, connectWallet, sendTransaction, isMetaMaskInstalled } = useMetaMask();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    batchNumber: "",
    expirationDate: "",
  });

  const [assignForm, setAssignForm] = useState({
    productId: "",
    distributorEmail: "",
    dispatchDate: "",
  });

  const [isProcessingTx, setIsProcessingTx] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'manufacturer') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.batchNumber || !productForm.expirationDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your MetaMask wallet to add products to the blockchain",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(balance) < parseFloat(TRANSACTION_COSTS.ADD_PRODUCT)) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${formatEthAmount(TRANSACTION_COSTS.ADD_PRODUCT)} to add a product`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessingTx(true);

    try {
      // Send blockchain transaction
      const txHash = await sendTransaction(
        account!, // to self for record keeping
        TRANSACTION_COSTS.ADD_PRODUCT,
        `0x${Buffer.from(JSON.stringify({
          action: 'ADD_PRODUCT',
          product: productForm,
          timestamp: new Date().toISOString()
        })).toString('hex')}`
      );

      const productId = addProduct({
        ...productForm,
        manufacturer: user?.email || "",
      }, txHash);

      toast({
        title: "Product Added to Blockchain",
        description: `Product ${productId} has been recorded on the blockchain. Transaction: ${txHash.substring(0, 10)}...`,
      });

      setProductForm({
        name: "",
        description: "",
        batchNumber: "",
        expirationDate: "",
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to add product to blockchain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingTx(false);
    }
  };

  const handleAssignProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignForm.productId || !assignForm.distributorEmail || !assignForm.dispatchDate) {
      toast({
        title: "Error", 
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your MetaMask wallet to assign products",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(balance) < parseFloat(TRANSACTION_COSTS.ASSIGN_PRODUCT)) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${formatEthAmount(TRANSACTION_COSTS.ASSIGN_PRODUCT)} to assign a product`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessingTx(true);

    try {
      const txHash = await sendTransaction(
        account!,
        TRANSACTION_COSTS.ASSIGN_PRODUCT,
        `0x${Buffer.from(JSON.stringify({
          action: 'ASSIGN_PRODUCT',
          productId: assignForm.productId,
          distributor: assignForm.distributorEmail,
          dispatchDate: assignForm.dispatchDate,
          timestamp: new Date().toISOString()
        })).toString('hex')}`
      );

      assignProduct(assignForm.productId, assignForm.distributorEmail, assignForm.dispatchDate, txHash);

      toast({
        title: "Product Assigned",
        description: `Product assigned to ${assignForm.distributorEmail}. Blockchain TX: ${txHash.substring(0, 10)}...`,
      });

      setAssignForm({
        productId: "",
        distributorEmail: "",
        dispatchDate: "",
      });
    } catch (error) {
      console.error('Assignment transaction failed:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to assign product on blockchain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingTx(false);
    }
  };

  const myProducts = products.filter(product => product.manufacturer === user?.email);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">MedChain - Manufacturer</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* MetaMask Status */}
              {!isMetaMaskInstalled ? (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Install MetaMask</span>
                </div>
              ) : !isConnected ? (
                <Button onClick={connectWallet} variant="outline" size="sm">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center space-x-2 text-green-600">
                  <Wallet className="h-4 w-4" />
                  <div className="text-sm">
                    <div>{account?.substring(0, 6)}...{account?.substring(38)}</div>
                    <div>{balance} ETH</div>
                  </div>
                </div>
              )}
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
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
          {/* Add Product Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New Product</span>
              </CardTitle>
              <CardDescription>
                Register a new medical supply on the blockchain
                <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                  Cost: {formatEthAmount(TRANSACTION_COSTS.ADD_PRODUCT)}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g., Surgical Mask"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="batchNumber">Batch Number *</Label>
                  <Input
                    id="batchNumber"
                    value={productForm.batchNumber}
                    onChange={(e) => setProductForm(prev => ({...prev, batchNumber: e.target.value}))}
                    placeholder="e.g., BT-2024-001"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="expirationDate">Expiration Date *</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={productForm.expirationDate}
                    onChange={(e) => setProductForm(prev => ({...prev, expirationDate: e.target.value}))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({...prev, description: e.target.value}))}
                    placeholder="Product details and specifications"
                    rows={3}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!isConnected || isProcessingTx}
                >
                  {isProcessingTx ? "Processing Transaction..." : "Add Product to Blockchain"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Assign Product Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Assign to Distributor</span>
              </CardTitle>
              <CardDescription>
                Assign products to distributors for sale
                <div className="mt-2 text-xs bg-yellow-50 p-2 rounded">
                  Cost: {formatEthAmount(TRANSACTION_COSTS.ASSIGN_PRODUCT)}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssignProduct} className="space-y-4">
                <div>
                  <Label htmlFor="productId">Product ID</Label>
                  <Input
                    id="productId"
                    value={assignForm.productId}
                    onChange={(e) => setAssignForm(prev => ({...prev, productId: e.target.value}))}
                    placeholder="Enter product ID"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="distributorEmail">Distributor Email</Label>
                  <Input
                    id="distributorEmail"
                    type="email"
                    value={assignForm.distributorEmail}
                    onChange={(e) => setAssignForm(prev => ({...prev, distributorEmail: e.target.value}))}
                    placeholder="distributor@company.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="dispatchDate">Dispatch Date</Label>
                  <Input
                    id="dispatchDate"
                    type="date"
                    value={assignForm.dispatchDate}
                    onChange={(e) => setAssignForm(prev => ({...prev, dispatchDate: e.target.value}))}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!isConnected || isProcessingTx}
                >
                  {isProcessingTx ? "Processing Transaction..." : "Assign Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Product List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>My Products</span>
              </CardTitle>
              <CardDescription>
                Products you have manufactured ({myProducts.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {myProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No products yet</p>
                ) : (
                  myProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.status === 'manufactured' ? 'bg-blue-100 text-blue-800' :
                          product.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">ID: {product.id}</p>
                      <p className="text-xs text-gray-600">Batch: {product.batchNumber}</p>
                      <p className="text-xs text-gray-600">Expires: {product.expirationDate}</p>
                      {product.blockchainTxHash && (
                        <p className="text-xs text-green-600">
                          Blockchain TX: {product.blockchainTxHash.substring(0, 10)}...
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

export default ManufacturerDashboard;
