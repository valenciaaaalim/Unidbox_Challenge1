import { motion } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  Eye,
} from "lucide-react";
import { orders, dealers, products } from "@/lib/mockData";
import { useState } from "react";

/*
 * Admin Orders
 * Design: Premium SaaS Elegance
 * Features: Order management, status tracking, DO generation
 */

const statusConfig = {
  pending: { icon: Clock, color: "bg-amber-500", label: "Pending" },
  confirmed: { icon: CheckCircle2, color: "bg-blue-500", label: "Confirmed" },
  processing: { icon: Package, color: "bg-violet-500", label: "Processing" },
  shipped: { icon: Truck, color: "bg-primary", label: "Shipped" },
  delivered: { icon: CheckCircle2, color: "bg-emerald-500", label: "Delivered" },
};

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((order) => {
    const dealer = dealers.find((d) => d.id === order.dealerId);
    return (
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer?.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all dealer orders.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Dealer</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Items</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => {
                    const dealer = dealers.find((d) => d.id === order.dealerId);
                    const status = statusConfig[order.status];
                    const StatusIcon = status.icon;

                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="p-4">
                          <span className="font-medium">{order.id}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{dealer?.name}</p>
                            <p className="text-sm text-muted-foreground">{dealer?.company}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-muted-foreground">
                            {order.items.length} items
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">${order.subtotal.toFixed(2)}</span>
                        </td>
                        <td className="p-4">
                          <Badge className={`${status.color} text-white gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.deliveryOrderId && (
                              <Button variant="ghost" size="icon">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">
                {orders.filter((o) => o.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-violet-500">
                {orders.filter((o) => o.status === "processing").length}
              </p>
              <p className="text-sm text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {orders.filter((o) => o.status === "shipped").length}
              </p>
              <p className="text-sm text-muted-foreground">Shipped</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {orders.filter((o) => o.status === "delivered").length}
              </p>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
