import { useState } from "react";
import { format } from "date-fns";
import {
  FileCheck,
  Eye,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import DealerLayout from "@/components/layouts/DealerLayout";

/*
 * Dealer Purchase Orders Page
 * View and track purchase orders
 */

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  confirmed: <CheckCircle className="w-4 h-4" />,
  processing: <Package className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
};

export default function DealerPurchaseOrders() {
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const { data: purchaseOrders, isLoading } = trpc.purchaseOrders.listMine.useQuery();

  const activeCount = purchaseOrders?.filter(
    po => !['delivered', 'cancelled'].includes(po.status)
  ).length || 0;

  return (
    <DealerLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">
              Track your purchase orders and deliveries
            </p>
          </div>
          {activeCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {activeCount} active
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {purchaseOrders?.filter(po => po.status === 'pending').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {purchaseOrders?.filter(po => po.status === 'confirmed').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {purchaseOrders?.filter(po => po.status === 'processing').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">
                {purchaseOrders?.filter(po => po.status === 'shipped').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Shipped</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {purchaseOrders?.filter(po => po.status === 'delivered').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>All Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !purchaseOrders || purchaseOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No purchase orders yet</p>
                <p className="text-sm">Accept a quotation to create a purchase order</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Your Ref</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">
                        {po.poNumber}
                      </TableCell>
                      <TableCell>
                        {format(new Date(po.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {po.items.length} items
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${po.total}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {po.dealerReference || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[po.status]}>
                          <span className="flex items-center gap-1">
                            {statusIcons[po.status]}
                            {po.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPO(po)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View PO Dialog */}
        <Dialog open={!!selectedPO} onOpenChange={() => setSelectedPO(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Purchase Order {selectedPO?.poNumber}</DialogTitle>
              <DialogDescription>
                Created on {selectedPO && format(new Date(selectedPO.createdAt), "MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPO && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={statusColors[selectedPO.status]}>
                    <span className="flex items-center gap-1">
                      {statusIcons[selectedPO.status]}
                      {selectedPO.status}
                    </span>
                  </Badge>
                  {selectedPO.dealerReference && (
                    <span className="text-sm text-muted-foreground">
                      Your Ref: {selectedPO.dealerReference}
                    </span>
                  )}
                </div>

                {/* Status Timeline */}
                <div className="flex items-center justify-between py-4 border-y">
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status, index) => {
                    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                    const currentIndex = statusOrder.indexOf(selectedPO.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = status === selectedPO.status;
                    
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                          {statusIcons[status]}
                        </div>
                        <span className={`text-xs mt-1 capitalize ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                          {status}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPO.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unitPrice}</TableCell>
                        <TableCell className="text-right font-medium">${item.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedPO.subtotal}</span>
                  </div>
                  {parseFloat(selectedPO.discount || "0") > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${selectedPO.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${selectedPO.total}</span>
                  </div>
                </div>

                {selectedPO.shippingAddress && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Shipping Address</p>
                    <p className="text-sm text-muted-foreground">{selectedPO.shippingAddress}</p>
                  </div>
                )}

                {selectedPO.notes && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedPO.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DealerLayout>
  );
}
