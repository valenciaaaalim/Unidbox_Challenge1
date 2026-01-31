import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Download,
  Package,
  Truck,
} from "lucide-react";

interface Order {
  id: string;
  date: string;
  status: "delivered" | "shipped" | "processing";
  total: number;
  doNumber: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

const orders: Order[] = [
  {
    id: "ORD-2026-0041",
    date: "January 15, 2026 at 06:30 PM",
    status: "delivered",
    total: 1024.85,
    doNumber: "DO-2026-0041",
    items: [
      { name: "CAT6 Ethernet Cable 100m", quantity: 10, price: 89.99 },
      { name: "RJ45 Connectors (100 pack)", quantity: 5, price: 24.99 },
    ],
  },
  {
    id: "ORD-2026-0038",
    date: "January 8, 2026 at 02:15 PM",
    status: "delivered",
    total: 856.50,
    doNumber: "DO-2026-0038",
    items: [
      { name: "Professional Crimping Tool", quantity: 2, price: 45.99 },
      { name: "Cable Tester Pro", quantity: 1, price: 79.99 },
      { name: "Network Switch 24-Port", quantity: 1, price: 684.53 },
    ],
  },
  {
    id: "ORD-2026-0035",
    date: "January 2, 2026 at 10:00 AM",
    status: "delivered",
    total: 567.80,
    doNumber: "DO-2026-0035",
    items: [
      { name: "Insulated Work Gloves (L)", quantity: 10, price: 18.99 },
      { name: "Safety Glasses Clear", quantity: 15, price: 12.99 },
      { name: "Cable Ties (1000 pack)", quantity: 3, price: 29.99 },
    ],
  },
];

const getStatusInfo = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return {
        label: "Delivered",
        color: "bg-emerald-100 text-emerald-700",
        icon: CheckCircle,
      };
    case "shipped":
      return {
        label: "Shipped",
        color: "bg-blue-100 text-blue-700",
        icon: Truck,
      };
    case "processing":
      return {
        label: "Processing",
        color: "bg-amber-100 text-amber-700",
        icon: Package,
      };
  }
};

export default function Orders() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order History</h1>
          <p className="text-muted-foreground mt-1">
            View and track all your orders.
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`border-0 ${statusInfo.color}`}>
                        {statusInfo.label}
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        DO: {order.doNumber}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-muted-foreground" />
                          <span className="text-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-sm text-muted-foreground">
                            {item.quantity} × ${item.price.toFixed(2)}
                          </span>
                          <span className="font-medium text-foreground w-24 text-right">
                            ${(item.quantity * item.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4 pt-4 border-t border-border">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Order Total</p>
                      <p className="text-xl font-bold text-foreground">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
