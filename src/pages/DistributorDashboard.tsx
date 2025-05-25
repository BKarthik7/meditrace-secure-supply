
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Package, QrCode, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DistributorDashboard = () => {
  const { user, logout } = useAuth();
  const { products, sellProduct } = useBlockchain();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sellForm, setSellForm] = useState({
    productId: "",
    healthcareProvider: "",
  });

  useEffect(() => {
    if (!user || user.role !== 'distributor') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSellProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sellForm.productId || !sellForm.healthcareProvider) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const qrCode = sellProduct(sellForm.productId, sellForm.healthcareProvider);

    toast({
      title: "Product Sold",
      description: `QR Code generated: ${qrCode}`,
    });

    setSellForm({
      productId: "",
      healthcareProvider: "",
    });
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
                  />
                </div>
                
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Generate QR & Sell
                </Button>
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
