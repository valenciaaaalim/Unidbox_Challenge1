import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import DealerLayout from "@/components/layouts/DealerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ArrowRight,
  Package,
  CheckCircle2,
  FileText,
} from "lucide-react";
import {
  products,
  predictiveCart,
  getRecommendations,
  currentDealer,
  loyaltyTiers,
} from "@/lib/mockData";

/*
 * Dealer Cart
 * Design: Premium SaaS Elegance
 * Features: Cart management, AI upsell recommendations, checkout flow
 */

interface CartItem {
  productId: string;
  quantity: number;
}

export default function DealerCart() {
  // Initialize cart with predictive cart items
  const [cart, setCart] = useState<CartItem[]>(
    predictiveCart.suggestedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))
  );
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const tierInfo = loyaltyTiers[currentDealer.tier];
  const rebatePercent = currentDealer.tier === "platinum" ? 8 : currentDealer.tier === "gold" ? 5 : 0;

  const cartProducts = cart.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId)!,
  }));

  const recommendations = getRecommendations(cart.map((i) => i.productId)).filter(
    (rec) => !cart.some((i) => i.productId === rec.productId)
  );

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const rebate = subtotal * (rebatePercent / 100);
  const total = subtotal - rebate;

  const updateQuantity = (productId: string, delta: number) => {
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
      return prev;
    });
  };

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    toast.success("Added to cart", {
      description: products.find((p) => p.id === productId)?.name,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const placeOrder = () => {
    const newOrderId = `ORD-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setOrderId(newOrderId);
    setOrderPlaced(true);
    toast.success("Order placed successfully!", {
      description: `Order ${newOrderId} has been confirmed.`,
    });
  };

  if (orderPlaced) {
    return (
      <DealerLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-6">
              Your order <span className="font-semibold">{orderId}</span> has been placed
              successfully. A Delivery Order (DO) has been generated automatically.
            </p>
            <div className="flex flex-col gap-3">
              <Button className="gap-2">
                <FileText className="w-4 h-4" />
                Download Delivery Order
              </Button>
              <Link href="/dealer/orders">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
              <Link href="/dealer">
                <Button variant="ghost" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </DealerLayout>
    );
  }

  return (
    <DealerLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">
            Review your items and proceed to checkout.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse our catalog to find products.
                  </p>
                  <Link href="/dealer/catalog">
                    <Button>Browse Catalog</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {cartProducts.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                                <h3 className="font-semibold">{item.product.name}</h3>
                                <p className="text-sm text-primary font-medium">
                                  ${item.product.price.toFixed(2)} / {item.product.unit}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.productId, -1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-10 text-center font-semibold">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.productId, 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="font-bold text-lg">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* AI Recommendations */}
                {recommendations.length > 0 && (
                  <Card className="border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-primary/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-500" />
                        <CardTitle className="text-base">AI Recommendations</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Frequently bought together with your items
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recommendations.map((rec) => {
                        const product = products.find((p) => p.id === rec.productId)!;
                        return (
                          <div
                            key={rec.productId}
                            className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{rec.reason}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold">${product.price.toFixed(2)}</p>
                              <Button size="sm" onClick={() => addToCart(rec.productId)}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {rebatePercent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tierInfo.color }}
                      />
                      {tierInfo.name} Rebate ({rebatePercent}%)
                    </span>
                    <span className="text-emerald-500">-${rebate.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  disabled={cart.length === 0}
                  onClick={placeOrder}
                >
                  Place Order
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Delivery Order (DO) will be generated automatically
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DealerLayout>
  );
}
