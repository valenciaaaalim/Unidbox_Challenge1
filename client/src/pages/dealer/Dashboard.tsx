import { Link } from "wouter";
import { motion } from "framer-motion";
import DealerLayout from "@/components/layouts/DealerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  dealers,
  predictiveCart,
  products,
  orders,
  loyaltyTiers,
} from "@/lib/mockData";

/*
 * Dealer Dashboard
 * Design: Premium SaaS Elegance
 * Key Feature: Predictive Cart (AI-generated reorder suggestion)
 */

export default function DealerDashboard() {
  const { user, isAuthenticated } = useAuth();
  
  // Use real logged-in user data, fallback to first mock dealer for demo stats
  const mockDealer = dealers[0]; // For demo stats like orderCount, totalSpend
  const userName = user?.name || mockDealer.name;
  const userTier = (user?.dealerTier || mockDealer.tier) as keyof typeof loyaltyTiers;
  const tierInfo = loyaltyTiers[userTier];
  const recentOrders = orders.filter((o) => o.dealerId === mockDealer.id).slice(0, 3);
  const suggestedProducts = predictiveCart.suggestedItems.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId)!,
  }));

  const totalSuggested = suggestedProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <DealerLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Good morning, {userName.split(" ")[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your orders today.
            </p>
          </div>
          <Link href="/dealer/catalog">
            <Button className="gap-2">
              <Package className="w-4 h-4" />
              Browse Catalog
            </Button>
          </Link>
        </div>

        {/* Predictive Cart - AI Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-primary/5 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center animate-pulse-glow">
                    <Sparkles className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Predictive Cart</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {predictiveCart.prediction.message}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-violet-500/20 text-violet-600">
                  {Math.round(predictiveCart.prediction.confidence * 100)}% confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestedProducts.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-background border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.quantity} × ${item.product.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Suggested Total</p>
                  <p className="text-2xl font-bold">${totalSuggested.toFixed(2)}</p>
                </div>
                <Link href="/dealer/cart">
                  <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700">
                    <ShoppingCart className="w-5 h-5" />
                    Add All to Cart
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{mockDealer.orderCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spend</p>
                  <p className="text-2xl font-bold">${mockDealer.totalSpend.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">${mockDealer.avgOrderValue.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${tierInfo.color}20` }}
                >
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loyalty Tier</p>
                  <p className="text-2xl font-bold" style={{ color: tierInfo.color }}>
                    {tierInfo.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/dealer/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                      {order.status === "delivered" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.subtotal.toFixed(2)}</p>
                    <Badge
                      variant={order.status === "delivered" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DealerLayout>
  );
}
