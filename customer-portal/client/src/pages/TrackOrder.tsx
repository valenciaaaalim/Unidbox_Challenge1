import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, Download, ArrowLeft, Phone, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";

const statusConfig = {
  placed: { label: "Order Placed", icon: CheckCircle2, color: "text-blue-500" },
  processing: { label: "Processing", icon: Clock, color: "text-yellow-500" },
  ready_to_dispatch: { label: "Ready to Dispatch", icon: Package, color: "text-orange-500" },
  in_transit: { label: "In Transit", icon: Truck, color: "text-purple-500" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-green-500" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-500" },
};

const statusOrder = ["placed", "processing", "ready_to_dispatch", "in_transit", "delivered"];

export default function TrackOrder() {
  const [, navigate] = useLocation();
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrderNumber, setSearchedOrderNumber] = useState<string | null>(null);

  // Fetch order by number
  const { data: order, isLoading, error } = trpc.orders.getByNumber.useQuery(
    searchedOrderNumber!,
    { enabled: searchedOrderNumber !== null }
  );

  // Fetch order items
  const { data: orderItems } = trpc.orders.getItems.useQuery(
    order?.id!,
    { enabled: order !== null }
  );

  const handleSearch = () => {
    if (orderNumber.trim()) {
      setSearchedOrderNumber(orderNumber.trim());
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentStatusIndex = (status: string) => {
    return statusOrder.indexOf(status);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
              <a className="text-sm font-medium text-primary">Track Order</a>
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">
        <div className="container py-12">
          {/* Search Section */}
          {!order && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
                <p className="text-lg text-muted-foreground">
                  Enter your order number to check the status and delivery details
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Order Tracking</CardTitle>
                  <CardDescription>
                    Your order number can be found in your confirmation email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., ORD-2026-0042"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={!orderNumber.trim() || isLoading}>
                      {isLoading ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Track Order
                        </>
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="text-sm text-destructive mt-2">
                      Order not found. Please check your order number and try again.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Need help?</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    +65 9456 6653
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Order Details Section */}
          {order && (
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Order Details</h1>
                  <p className="text-lg text-muted-foreground">
                    Order Number: <span className="font-semibold text-foreground">{order.orderNumber}</span>
                  </p>
                </div>
                <Button variant="outline" onClick={() => { setSearchedOrderNumber(null); setOrderNumber(""); }}>
                  <Search className="w-4 h-4 mr-2" />
                  Track Another Order
                </Button>
              </div>

              {/* Status Timeline */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>
                    Placed on {formatDate(order.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="flex justify-between items-start">
                      {statusOrder.map((status, index) => {
                        const config = statusConfig[status as keyof typeof statusConfig];
                        const Icon = config.icon;
                        const currentIndex = getCurrentStatusIndex(order.status);
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                          <div key={status} className="flex flex-col items-center flex-1 relative">
                            {/* Connecting Line */}
                            {index < statusOrder.length - 1 && (
                              <div
                                className={`absolute top-6 left-1/2 w-full h-0.5 ${
                                  isCompleted ? "bg-primary" : "bg-muted"
                                }`}
                                style={{ zIndex: 0 }}
                              />
                            )}
                            
                            {/* Icon */}
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
                                isCompleted
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            
                            {/* Label */}
                            <div className="mt-2 text-center">
                              <p className={`text-sm font-medium ${isCurrent ? "text-primary" : ""}`}>
                                {config.label}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Items Ordered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderItems?.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">{item.productName}</h4>
                            <p className="text-xs text-muted-foreground mb-1">SKU: {item.productSku}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Qty: {item.quantity}</span>
                              <span className="font-semibold">{formatPrice(item.subtotal)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>{formatPrice(order.deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatPrice(order.tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery & Customer Info */}
                <div className="space-y-8">
                  {/* Delivery Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                        <p className="text-sm font-medium">{order.deliveryAddress}</p>
                      </div>
                      {order.estimatedDeliveryDate && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                          <p className="text-sm font-medium">{formatDate(order.estimatedDeliveryDate)}</p>
                        </div>
                      )}
                      {order.courierService && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Courier Service</p>
                          <p className="text-sm font-medium">{order.courierService}</p>
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                          <p className="text-sm font-medium font-mono">{order.trackingNumber}</p>
                        </div>
                      )}
                      {order.deliveryInstructions && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Delivery Instructions</p>
                          <p className="text-sm">{order.deliveryInstructions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Name</p>
                        <p className="text-sm font-medium">{order.customerName}</p>
                      </div>
                      {order.customerEmail && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Email</p>
                          <p className="text-sm font-medium">{order.customerEmail}</p>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Phone</p>
                          <p className="text-sm font-medium">{order.customerPhone}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                        <Badge variant={order.paymentStatus === "paid" ? "secondary" : "destructive"}>
                          {order.paymentStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 UNiDBox Hardware. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
