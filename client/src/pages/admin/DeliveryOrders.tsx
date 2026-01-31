import { useState } from "react";
import { format } from "date-fns";
import {
  Truck,
  Eye,
  Loader2,
  Search,
  Download,
  Package,
  CheckCircle,
  Clock,
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
 * Admin Delivery Orders Management Page
 * View and manage delivery orders
 */

const statusColors: Record<string, string> = {
  generated: "bg-yellow-100 text-yellow-700",
  dispatched: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  generated: <Clock className="w-4 h-4" />,
  dispatched: <Package className="w-4 h-4" />,
  in_transit: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle className="w-4 h-4" />,
};

export default function AdminDeliveryOrders() {
  const [selectedDO, setSelectedDO] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: deliveryOrders, isLoading, refetch } = trpc.deliveryOrders.listAll.useQuery();
  
  const updateStatusMutation = trpc.deliveryOrders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("DO status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (doId: number, status: string) => {
    updateStatusMutation.mutate({ 
      doId, 
      status: status as 'generated' | 'dispatched' | 'in_transit' | 'delivered'
    });
  };

  const handleDownload = (deliveryOrder: any) => {
    const content = `
=====================================
        DELIVERY ORDER
=====================================
DO Number: ${deliveryOrder.doNumber}
Date: ${format(new Date(deliveryOrder.createdAt), "MMMM d, yyyy")}
Status: ${deliveryOrder.status.toUpperCase()}
Order ID: #${deliveryOrder.orderId}
=====================================
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deliveryOrder.doNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDOs = deliveryOrders?.filter(d => 
    d.doNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Delivery Orders</h1>
            <p className="text-muted-foreground">
              Track and manage delivery orders
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {deliveryOrders?.filter(d => d.status === 'generated').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Generated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {deliveryOrders?.filter(d => d.status === 'dispatched').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Dispatched</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {deliveryOrders?.filter(d => d.status === 'in_transit').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">In Transit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {deliveryOrders?.filter(d => d.status === 'delivered').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by DO number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Delivery Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>All Delivery Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !filteredDOs || filteredDOs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No delivery orders found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DO Number</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDOs.map((deliveryOrder) => (
                    <TableRow key={deliveryOrder.id}>
                      <TableCell className="font-medium">
                        {deliveryOrder.doNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        #{deliveryOrder.orderId}
                      </TableCell>
                      <TableCell>
                        {format(new Date(deliveryOrder.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={deliveryOrder.status}
                          onValueChange={(value) => handleStatusChange(deliveryOrder.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={statusColors[deliveryOrder.status]}>
                              <span className="flex items-center gap-1">
                                {statusIcons[deliveryOrder.status]}
                                {deliveryOrder.status.replace('_', ' ')}
                              </span>
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="generated">Generated</SelectItem>
                            <SelectItem value="dispatched">Dispatched</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDO(deliveryOrder)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(deliveryOrder)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View DO Dialog */}
        <Dialog open={!!selectedDO} onOpenChange={() => setSelectedDO(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Delivery Order {selectedDO?.doNumber}</DialogTitle>
              <DialogDescription>
                Created on {selectedDO && format(new Date(selectedDO.createdAt), "MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            
            {selectedDO && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={statusColors[selectedDO.status]}>
                    <span className="flex items-center gap-1">
                      {statusIcons[selectedDO.status]}
                      {selectedDO.status.replace('_', ' ')}
                    </span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Order ID: #{selectedDO.orderId}
                  </span>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Delivery Order Details</p>
                  <p className="text-sm text-muted-foreground">DO Number: {selectedDO.doNumber}</p>
                  <p className="text-sm text-muted-foreground">Status: {selectedDO.status}</p>
                  {selectedDO.pdfUrl && (
                    <p className="text-sm text-muted-foreground">PDF Available</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedDO(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
