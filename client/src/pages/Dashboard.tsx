import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";

const predictiveCartItems = [
  {
    id: "1",
    name: "CAT6 Ethernet Cable 100m",
    sku: "CBL-CAT6-100",
    reason: "You order this every 2 weeks",
    quantity: 10,
    price: 89.99,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "RJ45 Connectors (100 pack)",
    sku: "CON-RJ45-100",
    reason: "Usually ordered with CAT6 cables",
    quantity: 5,
    price: 24.99,
    image: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    name: "Insulated Work Gloves (L)",
    sku: "SAF-GLOVES-L",
    reason: "Running low based on usage pattern",
    quantity: 3,
    price: 18.99,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=100&h=100&fit=crop",
  },
];

const recentOrders = [
  {
    id: "ORD-2026-0041",
    date: "1/15/2026",
    total: 1024.85,
    status: "Delivered",
  },
  {
    id: "ORD-2026-0038",
    date: "1/8/2026",
    total: 856.50,
    status: "Delivered",
  },
];

const lifecycleAlerts = [
  {
    product: "CAT6 Ethernet Cable",
    status: "maintenance",
    message: "Maintenance check due in 5 days",
  },
  {
    product: "RJ45 Connectors",
    status: "reorder",
    message: "Predicted reorder: 3 days",
  },
];

export default function Dashboard() {
  const suggestedTotal = predictiveCartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Good morning, Steven! 👋
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

        {/* AI Predictive Cart */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Predictive Cart</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Based on your 14-day reorder cycle, you're likely due for a restock!
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">
                92% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictiveCartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-card rounded-lg border border-border"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                    <p className="font-semibold text-foreground">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Suggested Total</p>
                <p className="text-2xl font-bold text-foreground">
                  ${suggestedTotal.toFixed(2)}
                </p>
              </div>
              <Button className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                Add All to Cart
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">48</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spend</p>
                  <p className="text-2xl font-bold text-foreground">$45,680</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold text-foreground">$952</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loyalty Tier</p>
                  <p className="text-2xl font-bold text-amber-600">Gold</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Link href="/dealer/orders">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${order.total.toFixed(2)}
                      </p>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lifecycle Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Lifecycle Alerts</CardTitle>
              <Link href="/dealer/lifecycle">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lifecycleAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">{alert.product}</p>
                      <Badge
                        variant="secondary"
                        className={
                          alert.status === "maintenance"
                            ? "bg-amber-100 text-amber-700 border-0"
                            : "bg-orange-100 text-orange-700 border-0"
                        }
                      >
                        {alert.status === "maintenance" ? "Maintenance Due" : "Reorder Soon"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <Progress
                      value={alert.status === "maintenance" ? 70 : 85}
                      className="h-2 mt-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
