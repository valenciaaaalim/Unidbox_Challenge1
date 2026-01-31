import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

interface Recommendation {
  id: string;
  name: string;
  reason: string;
  price: number;
  image: string;
}

const initialCartItems: CartItem[] = [
  {
    id: "1",
    name: "CAT6 Ethernet Cable 100m",
    sku: "CBL-CAT6-100",
    price: 89.99,
    quantity: 10,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "RJ45 Connectors (100 pack)",
    sku: "CON-RJ45-100",
    price: 24.99,
    quantity: 5,
    image: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    name: "Insulated Work Gloves (L)",
    sku: "SAF-GLOVES-L",
    price: 18.99,
    quantity: 3,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=100&h=100&fit=crop",
  },
];

const recommendations: Recommendation[] = [
  {
    id: "r1",
    name: "Professional Crimping Tool",
    reason: "Frequently bought with CAT6 Ethernet Cable 100m",
    price: 45.99,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop",
  },
  {
    id: "r2",
    name: "Cable Tester Pro",
    reason: "Frequently bought with RJ45 Connectors (100 pack)",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop",
  },
  {
    id: "r3",
    name: "Safety Glasses Clear",
    reason: "Frequently bought with Insulated Work Gloves (L)",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=100&h=100&fit=crop",
  },
];

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
    toast.success("Item removed from cart");
  };

  const addRecommendation = (rec: Recommendation) => {
    const existingItem = cartItems.find((item) => item.name === rec.name);
    if (existingItem) {
      updateQuantity(existingItem.id, 1);
    } else {
      setCartItems((items) => [
        ...items,
        {
          id: rec.id,
          name: rec.name,
          sku: `SKU-${rec.id}`,
          price: rec.price,
          quantity: 1,
          image: rec.image,
        },
      ]);
    }
    toast.success(`Added ${rec.name} to cart`);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const rebate = subtotal * 0.05; // 5% Gold tier rebate
  const total = subtotal - rebate;

  const handlePlaceOrder = () => {
    toast.success("Order placed successfully! DO will be generated automatically.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">
            Review your items and proceed to checkout.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.sku}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ${item.price.toFixed(2)} / unit
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right w-24">
                      <p className="font-semibold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {cartItems.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </CardContent>
              </Card>
            )}

            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Recommendations
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Frequently bought together with your items
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 bg-card rounded-lg border border-border"
                    >
                      <img
                        src={rec.image}
                        alt={rec.name}
                        className="w-full aspect-square rounded-lg object-cover mb-3"
                      />
                      <h4 className="font-medium text-foreground text-sm line-clamp-1">
                        {rec.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {rec.reason}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-semibold text-foreground">
                          ${rec.price.toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addRecommendation(rec)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-700 border-0">Gold</Badge>
                    Rebate (5%)
                  </span>
                  <span className="font-medium">-${rebate.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-foreground">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={cartItems.length === 0}
                >
                  Place Order
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Delivery Order (DO) will be generated automatically
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
