import { useState } from "react";
import { format } from "date-fns";
import {
  FileCheck,
  Eye,
  Loader2,
  Search,
  Truck,
  Package,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminLayout from "@/components/layouts/AdminLayout";

/*
 * Admin Purchase Orders Management Page
 * View POs, update status, generate DOs
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

export default function AdminPurchaseOrders() {
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: purchaseOrders, isLoading, refetch } = trpc.purchaseOrders.listAll.useQuery();
  
  const updateStatusMutation = trpc.purchaseOrders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("PO status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generateDOMutation = trpc.purchaseOrders.generateDO.useMutation({
    onSuccess: (data) => {
      toast.success(`Delivery Order ${data.deliveryOrder.doNumber} generated`);
      setSelectedPO(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (poId: number, status: string) => {
    updateStatusMutation.mutate({ 
      poId, 
      status: status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' 
    });
  };

  const handleGenerateDO = (poId: number) => {
    if (confirm("Generate a Delivery Order for this PO?")) {
      generateDOMutation.mutate({ poId });
    }
  };

  const filteredPOs = purchaseOrders?.filter(po => 
    po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.dealer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">
              Manage purchase orders and generate delivery orders
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">
                {purchaseOrders?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by PO number or dealer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
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
            ) : !filteredPOs || filteredPOs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No purchase orders found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">
                        {po.poNumber}
                      </TableCell>
                      <TableCell>
                        {po.dealer?.name || `Dealer #${po.dealerId}`}
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
                      <TableCell>
                        <Select
                          value={po.status}
                          onValueChange={(value) => handleStatusChange(po.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={statusColors[po.status]}>
                              <span className="flex items-center gap-1">
                                {statusIcons[po.status]}
                                {po.status}
                              </span>
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPO(po)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {po.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateDO(po.id)}
                              disabled={generateDOMutation.isPending}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Generate DO
                            </Button>
                          )}
                        </div>
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
                  <span className="text-sm text-muted-foreground">
                    Dealer: {selectedPO.dealer?.name || `#${selectedPO.dealerId}`}
                  </span>
                </div>

                {selectedPO.dealerReference && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Dealer Reference:</span>{" "}
                    <span className="font-medium">{selectedPO.dealerReference}</span>
                  </div>
                )}

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

            <DialogFooter>
              {selectedPO?.status === 'confirmed' && (
                <Button
                  onClick={() => handleGenerateDO(selectedPO.id)}
                  disabled={generateDOMutation.isPending}
                >
                  {generateDOMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Truck className="w-4 h-4 mr-2" />
                  )}
                  Generate Delivery Order
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
