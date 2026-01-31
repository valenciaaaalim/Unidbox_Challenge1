import { useState } from "react";
import { motion } from "framer-motion";
import DealerLayout from "@/components/layouts/DealerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Sparkles,
  Filter,
} from "lucide-react";
import { products, categories, getRecommendations } from "@/lib/mockData";

/*
 * Dealer Catalog
 * Design: Premium SaaS Elegance
 * Features: Product grid, search, AI recommendations on add-to-cart
 */

interface CartItem {
  productId: string;
  quantity: number;
}

export default function DealerCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showRecommendation, setShowRecommendation] = useState<string | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const updateCart = (productId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + delta);
        if (newQty === 0) {
          return prev.filter((i) => i.productId !== productId);
        }
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: newQty } : i
        );
      }
      if (delta > 0) {
        // Show AI recommendation when adding to cart
        const recommendations = getRecommendations([productId]);
        if (recommendations.length > 0) {
          setShowRecommendation(recommendations[0].productId);
          setTimeout(() => setShowRecommendation(null), 5000);
        }
        return [...prev, { productId, quantity: delta }];
      }
      return prev;
    });

    if (delta > 0) {
      toast.success("Added to cart", {
        description: products.find((p) => p.id === productId)?.name,
      });
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <DealerLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Product Catalog</h1>
            <p className="text-muted-foreground mt-1">
              Browse our full range of products with AI-powered recommendations.
            </p>
          </div>
          {cartItemCount > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Button className="gap-2" size="lg">
                <ShoppingCart className="w-5 h-5" />
                Cart ({cartItemCount}) - ${cartTotal.toFixed(2)}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="whitespace-nowrap"
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Recommendation Toast */}
        {showRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 max-w-sm"
          >
            <Card className="border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-primary/10 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">AI Recommendation</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Frequently bought together:
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {products.find((p) => p.id === showRecommendation)?.name}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          updateCart(showRecommendation, 1);
                          setShowRecommendation(null);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => {
            const quantity = getCartQuantity(product.id);
            const category = categories.find((c) => c.id === product.category);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full card-hover overflow-hidden">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 left-3" variant="secondary">
                      {category?.icon} {category?.name}
                    </Badge>
                    {product.stock < 50 && (
                      <Badge className="absolute top-3 right-3 bg-amber-500">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.sku}</p>
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-primary">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">per {product.unit}</p>
                      </div>
                      {quantity === 0 ? (
                        <Button
                          onClick={() => updateCart(product.id, 1)}
                          className="gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateCart(product.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{quantity}</span>
                          <Button
                            size="icon"
                            onClick={() => updateCart(product.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </DealerLayout>
  );
}
