import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Package, Calendar, DollarSign, User } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Orders() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please login to view your order history
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
              <User className="w-4 h-4 mr-2" />
              Login to Continue
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sample order data - in production this would come from the database
  const sampleOrders = [
    {
      id: 1,
      orderNumber: "ORD-2026-0042",
      date: "2026-01-28",
      status: "Delivered",
      total: 15680,
      items: 3,
    },
    {
      id: 2,
      orderNumber: "ORD-2026-0038",
      date: "2026-01-20",
      status: "Delivered",
      total: 8950,
      items: 2,
    },
    {
      id: 3,
      orderNumber: "ORD-2026-0029",
      date: "2026-01-10",
      status: "Delivered",
      total: 12340,
      items: 4,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "default";
      case "processing":
        return "secondary";
      case "shipped":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="font-semibold text-lg">My Orders</h1>
          </div>
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">UNiDBox</h1>
                <p className="text-xs text-muted-foreground">Home Solutions</p>
              </div>
            </div>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Order History</h2>
          <p className="text-muted-foreground">
            View and track all your orders in one place
          </p>
        </div>

        {sampleOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start shopping to see your orders here
              </p>
              <Button onClick={() => setLocation("/shop")}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sampleOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1">
                        {order.orderNumber}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {order.items} items
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${(order.total / 100).toFixed(2)}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/track-order?order=${order.orderNumber}`)}
                    >
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm">
                      Reorder
                    </Button>
                    <Button variant="ghost" size="sm">
                      Download Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              We're here to assist you with your orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setLocation("/track-order")}>
                Track an Order
              </Button>
              <Button variant="outline" onClick={() => setLocation("/shop")}>
                Chat with AI Assistant
              </Button>
            </div>
            <div className="text-sm text-muted-foreground text-center pt-4 border-t">
              <p>
                For order inquiries, contact us at{" "}
                <a href="tel:+6594566653" className="text-primary hover:underline">
                  +65 9456 6653
                </a>{" "}
                or{" "}
                <a href="mailto:info@unidbox.com" className="text-primary hover:underline">
                  info@unidbox.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
