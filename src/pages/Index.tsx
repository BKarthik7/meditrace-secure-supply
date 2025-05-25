
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Package, QrCode, Truck, Building2, Hospital } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">MedChain</h1>
            </div>
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Medical Supply Chain
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transparency is the key to trust – let's build a safer medical supply chain together.
            Track medical supplies from manufacturer to healthcare provider with blockchain technology.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Manufacturer</CardTitle>
                <CardDescription>
                  Add medical supplies with detailed information and assign to distributors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Register new medical products</li>
                  <li>• Assign products to distributors</li>
                  <li>• Track product lifecycle</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Truck className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Distributor</CardTitle>
                <CardDescription>
                  Manage assigned products and generate QR codes for healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• View assigned products</li>
                  <li>• Generate QR codes for sales</li>
                  <li>• Update product status</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Hospital className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Healthcare Provider</CardTitle>
                <CardDescription>
                  Scan QR codes to verify authenticity and view complete product history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Scan QR codes</li>
                  <li>• Verify product authenticity</li>
                  <li>• View complete blockchain history</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Key Benefits
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Blockchain Security</h4>
              <p className="text-gray-600 text-sm">Immutable transaction records ensure complete transparency</p>
            </div>
            <div className="text-center">
              <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Product Traceability</h4>
              <p className="text-gray-600 text-sm">Track every product from manufacturing to delivery</p>
            </div>
            <div className="text-center">
              <QrCode className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">QR Code Verification</h4>
              <p className="text-gray-600 text-sm">Quick and easy product authentication</p>
            </div>
            <div className="text-center">
              <Building2 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Role-Based Access</h4>
              <p className="text-gray-600 text-sm">Secure login system for different user types</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-xl font-bold">MedChain</span>
          </div>
          <p className="text-gray-400">
            Building trust through transparency in medical supply chains.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
