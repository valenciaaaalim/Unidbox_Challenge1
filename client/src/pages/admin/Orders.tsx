import { motion } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
  DollarSign,
} from "lucide-react";
import { orders, dealers, products, Order, loyaltyTiers } from "@/lib/mockData";
import { useState } from "react";
import { toast } from "sonner";

/*
 * Admin Orders
 * Design: Premium SaaS Elegance
 * Features: Order management, status tracking, DO generation, View Details modal
 */

const statusConfig = {
  pending: { icon: Clock, color: "bg-amber-500", label: "Pending" },
  confirmed: { icon: CheckCircle2, color: "bg-blue-500", label: "Confirmed" },
  processing: { icon: Package, color: "bg-violet-500", label: "Processing" },
  shipped: { icon: Truck, color: "bg-primary", label: "Shipped" },
  delivered: { icon: CheckCircle2, color: "bg-emerald-500", label: "Delivered" },
};

const statusTimeline = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const dealer = dealers.find((d) => d.id === order.dealerId);
    return (
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer?.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleDownloadDO = async (order: Order) => {
    if (!order.deliveryOrderId) {
      toast.error("No Delivery Order available for this order");
      return;
    }

    setIsDownloading(order.id);
    
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const dealer = dealers.find(d => d.id === order.dealerId);
    const tierDiscount = dealer?.tier === 'platinum' ? 0.08 : dealer?.tier === 'gold' ? 0.05 : 0;
    
    // Generate DO content as a downloadable text file (simulating PDF)
    const doContent = generateDOContent(order, dealer, tierDiscount);
    
    // Create and download the file
    const blob = new Blob([doContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.deliveryOrderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsDownloading(null);
    toast.success(`Downloaded ${order.deliveryOrderId}`);
  };

  const generateDOContent = (order: Order, dealer: any, tierDiscount: number) => {
    const orderItems = order.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        name: product?.name || 'Unknown Product',
        sku: product?.sku || 'N/A',
      };
    });

    const subtotal = order.subtotal;
    const discount = subtotal * tierDiscount;
    const total = subtotal - discount;

    return `
================================================================================
                              DELIVERY ORDER
================================================================================

DO Number:        ${order.deliveryOrderId}
Order Number:     ${order.id}
Date:             ${new Date(order.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
Status:           ${statusConfig[order.status].label}

--------------------------------------------------------------------------------
                              SHIP TO
--------------------------------------------------------------------------------

Company:          ${dealer?.company || 'N/A'}
Contact:          ${dealer?.name || 'N/A'}
Email:            ${dealer?.email || 'N/A'}
Phone:            ${dealer?.phone || 'N/A'}
Tier:             ${dealer?.tier?.toUpperCase() || 'SILVER'}

--------------------------------------------------------------------------------
                              ORDER ITEMS
--------------------------------------------------------------------------------

${orderItems.map((item, index) => 
  `${(index + 1).toString().padStart(2, '0')}. ${item.name}
     SKU: ${item.sku}
     Quantity: ${item.quantity} | Unit Price: $${item.unitPrice.toFixed(2)} | Total: $${(item.quantity * item.unitPrice).toFixed(2)}`
).join('\n\n')}

--------------------------------------------------------------------------------
                              SUMMARY
--------------------------------------------------------------------------------

Subtotal:                                                    $${subtotal.toFixed(2)}
${tierDiscount > 0 ? `Tier Discount (${(tierDiscount * 100).toFixed(0)}%):                                         -$${discount.toFixed(2)}` : ''}
--------------------------------------------------------------------------------
TOTAL:                                                       $${total.toFixed(2)}

--------------------------------------------------------------------------------
                              DELIVERY CONFIRMATION
--------------------------------------------------------------------------------

Received By: _________________________    Date: _______________

Signature:   _________________________

--------------------------------------------------------------------------------
                              NOTES
--------------------------------------------------------------------------------

• Please inspect all items upon delivery
• Report any damages within 24 hours
• Thank you for your business!

================================================================================
                         UnidBox Wholesale Pte Ltd
                    AI-Powered Wholesale Commerce Platform
================================================================================
`;
  };

  const getSelectedOrderDetails = () => {
    if (!selectedOrder) return null;
    
    const dealer = dealers.find(d => d.id === selectedOrder.dealerId);
    const tierDiscount = dealer?.tier === 'platinum' ? 0.08 : dealer?.tier === 'gold' ? 0.05 : 0;
    const discount = selectedOrder.subtotal * tierDiscount;
    const total = selectedOrder.subtotal - discount;
    
    const orderItems = selectedOrder.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        name: product?.name || 'Unknown Product',
        sku: product?.sku || 'N/A',
      };
    });

    const currentStatusIndex = statusTimeline.indexOf(selectedOrder.status);

    return { dealer, tierDiscount, discount, total, orderItems, currentStatusIndex };
  };

  const details = getSelectedOrderDetails();

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
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewOrder(order)}
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.deliveryOrderId && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDownloadDO(order)}
                                disabled={isDownloading === order.id}
                                title="Download Delivery Order"
                              >
                                {isDownloading === order.id ? (
                                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
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

      {/* View Order Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Order Details
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && details && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-xl font-bold">{selectedOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Delivery Order</p>
                  <p className="text-lg font-semibold text-primary">
                    {selectedOrder.deliveryOrderId || 'Not Generated'}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="font-semibold mb-3">Order Status</h3>
                <div className="flex items-center justify-between">
                  {statusTimeline.map((status, index) => {
                    const config = statusConfig[status as keyof typeof statusConfig];
                    const StatusIcon = config.icon;
                    const isCompleted = index <= details.currentStatusIndex;
                    const isCurrent = index === details.currentStatusIndex;

                    return (
                      <div key={status} className="flex flex-col items-center flex-1">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${isCompleted ? config.color : 'bg-muted'}
                          ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                        `}>
                          <StatusIcon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <p className={`text-xs mt-2 ${isCurrent ? 'font-semibold' : 'text-muted-foreground'}`}>
                          {config.label}
                        </p>
                        {index < statusTimeline.length - 1 && (
                          <div className={`absolute h-0.5 w-full ${isCompleted ? 'bg-primary' : 'bg-muted'}`} 
                               style={{ left: '50%', top: '20px', width: 'calc(100% - 40px)', marginLeft: '20px' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Dealer Information */}
              <div>
                <h3 className="font-semibold mb-3">Dealer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{details.dealer?.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">{details.dealer?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{details.dealer?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{details.dealer?.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge 
                    className="text-white"
                    style={{ backgroundColor: loyaltyTiers[details.dealer?.tier || 'silver'].color }}
                  >
                    {loyaltyTiers[details.dealer?.tier || 'silver'].name} Tier
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {details.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Pricing Summary */}
              <div>
                <h3 className="font-semibold mb-3">Pricing Summary</h3>
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {details.tierDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Tier Discount ({(details.tierDiscount * 100).toFixed(0)}%)</span>
                      <span>-${details.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${details.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Order placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>

              {/* Actions */}
              {selectedOrder.deliveryOrderId && (
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleDownloadDO(selectedOrder)}
                    disabled={isDownloading === selectedOrder.id}
                    className="flex-1"
                  >
                    {isDownloading === selectedOrder.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Delivery Order
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
