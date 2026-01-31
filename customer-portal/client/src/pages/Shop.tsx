import { useState } from "react";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Shop() {
  const [, navigate] = useLocation();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Fetch all products
  const { data: products, isLoading } = trpc.products.list.useQuery();

  // Fetch selected product details
  const { data: selectedProduct } = trpc.products.getById.useQuery(
    selectedProductId!,
    { enabled: selectedProductId !== null }
  );

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
  };

  const handleNavigateToDashboard = () => {
    navigate("/track-order");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">UNiDBox</h1>
                <p className="text-xs text-muted-foreground">Home Solutions</p>
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/">
              <a className="text-sm font-medium hover:text-primary transition-colors">Home</a>
            </Link>
            <Link href="/products">
              <a className="text-sm font-medium hover:text-primary transition-colors">Products</a>
            </Link>
            <Link href="/track-order">
              <a className="text-sm font-medium hover:text-primary transition-colors">Track Order</a>
            </Link>
          </nav>
        </div>
      </header>

      {/* Split View: Product Browsing (70%) + Chat Widget (30%) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Product Browsing/Details */}
        <div className="flex-1 overflow-auto">
          <div className="container py-8">
            {selectedProduct ? (
              /* Product Detail View */
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProductId(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </Button>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Product Images */}
                  <div>
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                      {selectedProduct.imageUrl ? (
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-48 h-48 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {selectedProduct.category}
                    </Badge>
                    <h1 className="text-4xl font-bold mb-4">{selectedProduct.name}</h1>
                    <div className="text-3xl font-bold text-primary mb-4">
                      {formatPrice(selectedProduct.price)}
                    </div>
                    
                    {/* Stock Status */}
                    <div className="mb-6">
                      {selectedProduct.stockQuantity > 0 ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">In Stock</Badge>
                          <span className="text-sm text-muted-foreground">
                            {selectedProduct.stockQuantity} units available
                          </span>
                        </div>
                      ) : (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{selectedProduct.description}</p>
                    </div>

                    {/* Specifications */}
                    {selectedProduct.specifications && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2">Specifications</h3>
                        <Card>
                          <CardContent className="pt-6">
                            <dl className="space-y-2">
                              {Object.entries(JSON.parse(selectedProduct.specifications)).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <dt className="text-muted-foreground">{key}:</dt>
                                  <dd className="font-medium">{String(value)}</dd>
                                </div>
                              ))}
                            </dl>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Product Details</h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">SKU:</dt>
                          <dd className="font-medium">{selectedProduct.sku}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <Button size="lg" className="flex-1" disabled={selectedProduct.stockQuantity === 0}>
                        Add to Cart
                      </Button>
                      <Button size="lg" variant="outline">
                        Contact Us
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Product Grid View */
              <div>
                <h1 className="text-4xl font-bold mb-2">Browse Products</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Click on any product to view details, or use the chat assistant for personalized recommendations
                </p>

                {isLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="aspect-square bg-muted" />
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                          <div className="h-3 bg-muted rounded w-full" />
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : products && products.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <Card
                        key={product.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-24 h-24 text-muted-foreground/30" />
                            </div>
                          )}
                          {product.stockQuantity === 0 && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="destructive">Out of Stock</Badge>
                            </div>
                          )}
                        </div>
                        <CardHeader className="flex-1">
                          <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
                          <Badge variant="outline" className="w-fit text-xs mb-2">
                            {product.category}
                          </Badge>
                          <CardDescription className="line-clamp-2">
                            {product.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(product.price)}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-24 h-24 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No products available</h3>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Widget (Fixed 30% width) */}
        <div className="hidden lg:block">
          <ChatWidget
            onProductClick={handleProductClick}
            onNavigateToDashboard={handleNavigateToDashboard}
          />
        </div>
      </div>

      {/* Mobile Chat Button */}
      <div className="lg:hidden">
        <ChatWidget
          onProductClick={handleProductClick}
          onNavigateToDashboard={handleNavigateToDashboard}
        />
      </div>
    </div>
  );
}
