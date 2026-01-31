import { useState } from "react";
import { format } from "date-fns";
import {
  Receipt,
  Eye,
  Plus,
  Loader2,
  Search,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
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
 * Admin Invoices Management Page
 * View and manage invoices
 */

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="w-4 h-4" />,
  sent: <Clock className="w-4 h-4" />,
  paid: <CheckCircle className="w-4 h-4" />,
  overdue: <AlertCircle className="w-4 h-4" />,
  cancelled: <FileText className="w-4 h-4" />,
};

export default function AdminInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: invoices, isLoading, refetch } = trpc.invoices.listAll.useQuery();
  
  const updateStatusMutation = trpc.invoices.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Invoice status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (invoiceId: number, status: string) => {
    updateStatusMutation.mutate({ 
      invoiceId, 
      status: status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    });
  };

  const handleDownload = (invoice: any) => {
    const content = `
=====================================
           INVOICE
=====================================
Invoice Number: ${invoice.invoiceNumber}
Date: ${format(new Date(invoice.createdAt), "MMMM d, yyyy")}
Due Date: ${invoice.dueDate ? format(new Date(invoice.dueDate), "MMMM d, yyyy") : "N/A"}
Status: ${invoice.status.toUpperCase()}

BILL TO:
Dealer #${invoice.dealerId}

ITEMS:
-------------------------------------
${invoice.items.map((item: any) => 
  `${item.name}
   SKU: ${item.sku}
   Quantity: ${item.quantity}
   Unit Price: $${item.unitPrice}
   Total: $${item.total}
`).join('\n')}
-------------------------------------
Subtotal: $${invoice.subtotal}
Tax: $${invoice.tax || "0.00"}
Discount: -$${invoice.discount || "0.00"}
-------------------------------------
TOTAL DUE: $${invoice.total}
=====================================

Payment Terms: ${invoice.paymentTerms || "Net 30"}

${invoice.notes ? `
NOTES:
${invoice.notes}
` : ''}
=====================================
Thank you for your business!
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredInvoices = invoices?.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = invoices
    ?.filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + parseFloat(inv.total), 0) || 0;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">
              Manage invoices and track payments
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-bold text-primary">${totalOutstanding.toFixed(2)}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">
                {invoices?.filter(inv => inv.status === 'draft').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Draft</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {invoices?.filter(inv => inv.status === 'sent').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {invoices?.filter(inv => inv.status === 'paid').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {invoices?.filter(inv => inv.status === 'overdue').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">
                {invoices?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !filteredInvoices || filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No invoices found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        Dealer #{invoice.dealerId}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate
                          ? format(new Date(invoice.dueDate), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${invoice.total}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={invoice.status}
                          onValueChange={(value) => handleStatusChange(invoice.id, value)}
                        >
                          <SelectTrigger className="w-28">
                            <Badge className={statusColors[invoice.status]}>
                              <span className="flex items-center gap-1">
                                {statusIcons[invoice.status]}
                                {invoice.status}
                              </span>
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(invoice)}
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

        {/* View Invoice Dialog */}
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
              <DialogDescription>
                Issued on {selectedInvoice && format(new Date(selectedInvoice.createdAt), "MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={statusColors[selectedInvoice.status]}>
                    <span className="flex items-center gap-1">
                      {statusIcons[selectedInvoice.status]}
                      {selectedInvoice.status}
                    </span>
                  </Badge>
                  {selectedInvoice.dueDate && (
                    <span className="text-sm text-muted-foreground">
                      Due: {format(new Date(selectedInvoice.dueDate), "MMM d, yyyy")}
                    </span>
                  )}
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
                    {selectedInvoice.items.map((item: any, index: number) => (
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
                    <span>${selectedInvoice.subtotal}</span>
                  </div>
                  {parseFloat(selectedInvoice.tax || "0") > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${selectedInvoice.tax}</span>
                    </div>
                  )}
                  {parseFloat(selectedInvoice.discount || "0") > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${selectedInvoice.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Due</span>
                    <span>${selectedInvoice.total}</span>
                  </div>
                </div>

                {selectedInvoice.paymentTerms && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Payment Terms</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.paymentTerms}</p>
                  </div>
                )}

                {selectedInvoice.notes && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => handleDownload(selectedInvoice)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
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
