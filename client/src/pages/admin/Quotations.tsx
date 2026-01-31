import { useState } from "react";
import { format } from "date-fns";
import {
  FileText,
  Eye,
  Plus,
  Loader2,
  Search,
  Check,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
 * Admin Quotations Management Page
 * Create and manage quotations for dealers
 */

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-yellow-100 text-yellow-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="w-4 h-4" />,
  sent: <Clock className="w-4 h-4" />,
  accepted: <Check className="w-4 h-4" />,
  rejected: <X className="w-4 h-4" />,
  expired: <AlertCircle className="w-4 h-4" />,
};

// Mock products for quotation creation
const PRODUCTS = [
  { id: 1, sku: "CBL-CAT6-100", name: "CAT6 Ethernet Cable 100m", price: "89.99" },
  { id: 2, sku: "CON-RJ45-100", name: "RJ45 Connectors 100 pack", price: "24.99" },
  { id: 3, sku: "TLS-CRIMP-01", name: "Professional Crimping Tool", price: "45.99" },
  { id: 4, sku: "TLS-TESTER-01", name: "Cable Tester Pro", price: "79.99" },
  { id: 5, sku: "SAF-GLOVES-L", name: "Insulated Work Gloves L", price: "18.99" },
  { id: 6, sku: "LED-PANEL-60", name: "LED Panel Light 60x60cm", price: "65.99" },
  { id: 7, sku: "LED-DRIVER-01", name: "LED Driver 40W", price: "22.99" },
  { id: 8, sku: "CBL-HDMI-5M", name: "HDMI Cable 5m Premium", price: "34.99" },
  { id: 9, sku: "SWT-8PORT", name: "8-Port Gigabit Switch", price: "89.99" },
];

interface QuotationItem {
  productId: number;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: string;
  discount: string;
  total: string;
}

export default function AdminQuotations() {
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Create quotation form state
  const [selectedDealer, setSelectedDealer] = useState<string>("");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [validityDays, setValidityDays] = useState(30);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 30 days of invoice date.");

  const { data: quotations, isLoading, refetch } = trpc.quotations.listAll.useQuery();
  const { data: dealers } = trpc.dealers.list.useQuery();
  
  const createMutation = trpc.quotations.create.useMutation({
    onSuccess: () => {
      toast.success("Quotation created and sent to dealer");
      setShowCreateDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setSelectedDealer("");
    setItems([]);
    setValidityDays(30);
    setNotes("");
  };

  const addItem = (product: typeof PRODUCTS[0]) => {
    const existingIndex = items.findIndex(i => i.sku === product.sku);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      newItems[existingIndex].total = (
        parseFloat(newItems[existingIndex].unitPrice) * newItems[existingIndex].quantity
      ).toFixed(2);
      setItems(newItems);
    } else {
      setItems([...items, {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity: 1,
        unitPrice: product.price,
        discount: "0",
        total: product.price,
      }]);
    }
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      const newItems = [...items];
      newItems[index].quantity = quantity;
      newItems[index].total = (parseFloat(newItems[index].unitPrice) * quantity).toFixed(2);
      setItems(newItems);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const discount = 0; // Could implement tier-based discount
    const total = subtotal - discount;
    return { subtotal: subtotal.toFixed(2), discount: discount.toFixed(2), total: total.toFixed(2) };
  };

  const handleCreate = () => {
    if (!selectedDealer) {
      toast.error("Please select a dealer");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const totals = calculateTotals();
    createMutation.mutate({
      dealerId: parseInt(selectedDealer),
      items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
      validityDays,
      notes: notes || undefined,
      terms: terms || undefined,
    });
  };

  const filteredQuotations = quotations?.filter(q => 
    q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quotations</h1>
            <p className="text-muted-foreground">
              Create and manage quotations for dealers
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Quotation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">
                {quotations?.filter(q => q.status === 'draft').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Draft</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {quotations?.filter(q => q.status === 'sent').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {quotations?.filter(q => q.status === 'accepted').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {quotations?.filter(q => q.status === 'rejected').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {quotations?.filter(q => q.status === 'expired').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Expired</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quotations List */}
        <Card>
          <CardHeader>
            <CardTitle>All Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !filteredQuotations || filteredQuotations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No quotations found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation #</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quotation) => {
                    const dealer = dealers?.find(d => d.id === quotation.dealerId);
                    return (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium">
                          {quotation.quotationNumber}
                        </TableCell>
                        <TableCell>
                          {dealer?.name || `Dealer #${quotation.dealerId}`}
                        </TableCell>
                        <TableCell>
                          {format(new Date(quotation.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {quotation.items.length} items
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${quotation.total}
                        </TableCell>
                        <TableCell>
                          {quotation.expiresAt
                            ? format(new Date(quotation.expiresAt), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[quotation.status]}>
                            <span className="flex items-center gap-1">
                              {statusIcons[quotation.status]}
                              {quotation.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedQuotation(quotation)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Quotation Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quotation</DialogTitle>
              <DialogDescription>
                Create a quotation and send it to a dealer
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Dealer Selection */}
              <div>
                <Label>Select Dealer</Label>
                <Select value={selectedDealer} onValueChange={setSelectedDealer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a dealer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dealers?.map(dealer => (
                      <SelectItem key={dealer.id} value={dealer.id.toString()}>
                        {dealer.name || dealer.email || `Dealer #${dealer.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Selection */}
              <div>
                <Label>Add Products</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {PRODUCTS.map(product => (
                    <Button
                      key={product.id}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => addItem(product)}
                    >
                      <div>
                        <div className="font-medium text-xs">{product.name}</div>
                        <div className="text-xs text-muted-foreground">${product.price}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Items */}
              {items.length > 0 && (
                <div>
                  <Label>Quotation Items</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">${item.unitPrice}</TableCell>
                          <TableCell className="text-right font-medium">${item.total}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="border-t mt-4 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${calculateTotals().subtotal}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${calculateTotals().total}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Validity */}
              <div>
                <Label>Validity (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                  className="w-32"
                />
              </div>

              {/* Notes */}
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes for the dealer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Terms */}
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Create & Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Quotation Dialog */}
        <Dialog open={!!selectedQuotation} onOpenChange={() => setSelectedQuotation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Quotation {selectedQuotation?.quotationNumber}</DialogTitle>
              <DialogDescription>
                Created on {selectedQuotation && format(new Date(selectedQuotation.createdAt), "MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            
            {selectedQuotation && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={statusColors[selectedQuotation.status]}>
                    {selectedQuotation.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Dealer ID: {selectedQuotation.dealerId}
                  </span>
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
                    {selectedQuotation.items.map((item: any, index: number) => (
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
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${selectedQuotation.total}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
