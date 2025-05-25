
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Package, Plus, Truck, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ManufacturerDashboard = () => {
  const { user, logout } = useAuth();
  const { addProduct, assignProduct, products } = useBlockchain();
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

  useEffect(() => {
    if (!user || user.role !== 'manufacturer') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.batchNumber || !productForm.expirationDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const productId = addProduct({
      ...productForm,
      manufacturer: user?.email || "",
    });

    toast({
      title: "Product Added",
      description: `Product ${productId} has been added to the blockchain`,
    });

    setProductForm({
      name: "",
      description: "",
      batchNumber: "",
      expirationDate: "",
    });
  };

  const handleAssignProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignForm.productId || !assignForm.distributorEmail || !assignForm.dispatchDate) {
      toast({
        title: "Error", 
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    assignProduct(assignForm.productId, assignForm.distributorEmail, assignForm.dispatchDate);

    toast({
      title: "Product Assigned",
      description: `Product assigned to ${assignForm.distributorEmail}`,
    });

    setAssignForm({
      productId: "",
      distributorEmail: "",
      dispatchDate: "",
    });
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
                
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Add Product
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
                
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Assign Product
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
