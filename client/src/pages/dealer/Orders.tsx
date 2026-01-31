import { motion } from "framer-motion";
import DealerLayout from "@/components/layouts/DealerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Download,
} from "lucide-react";
import { orders, products, currentDealer } from "@/lib/mockData";

/*
 * Dealer Orders
 * Design: Premium SaaS Elegance
 * Features: Order history with status tracking and DO download
 */

const statusConfig = {
  pending: { icon: Clock, color: "bg-amber-500", label: "Pending" },
  confirmed: { icon: CheckCircle2, color: "bg-blue-500", label: "Confirmed" },
  processing: { icon: Package, color: "bg-violet-500", label: "Processing" },
  shipped: { icon: Truck, color: "bg-primary", label: "Shipped" },
  delivered: { icon: CheckCircle2, color: "bg-emerald-500", label: "Delivered" },
};

export default function DealerOrders() {
  const dealerOrders = orders.filter((o) => o.dealerId === currentDealer.id);

  return (
    <DealerLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground mt-1">
            View and track all your orders.
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {dealerOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground">
                  Your order history will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            dealerOrders.map((order, index) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const orderProducts = order.items.map((item) => ({
                ...item,
                product: products.find((p) => p.id === item.productId)!,
              }));

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${status.color}/20 flex items-center justify-center`}>
                            <StatusIcon className={`w-5 h-5 ${status.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${status.color} text-white`}>
                            {status.label}
                          </Badge>
                          {order.deliveryOrderId && (
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="w-4 h-4" />
                              DO: {order.deliveryOrderId}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {orderProducts.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} × ${item.unitPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold">
                              ${(item.quantity * item.unitPrice).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-4 pt-4 border-t border-border">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Order Total</p>
                          <p className="text-xl font-bold">${order.subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </DealerLayout>
  );
}
