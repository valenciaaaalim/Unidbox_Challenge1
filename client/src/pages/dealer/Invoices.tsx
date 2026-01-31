import { useState } from "react";
import { format } from "date-fns";
import {
  Receipt,
  Eye,
  Loader2,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
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
 * Dealer Invoices Page
 * View and download invoices
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

export default function DealerInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { data: invoices, isLoading } = trpc.invoices.listMine.useQuery();

  const unpaidTotal = invoices
    ?.filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + parseFloat(inv.total), 0) || 0;

  const handleDownload = (invoice: any) => {
    // Generate simple invoice text for download
    const content = `
INVOICE
=====================================
Invoice Number: ${invoice.invoiceNumber}
Date: ${format(new Date(invoice.createdAt), "MMMM d, yyyy")}
Due Date: ${invoice.dueDate ? format(new Date(invoice.dueDate), "MMMM d, yyyy") : "N/A"}
Status: ${invoice.status.toUpperCase()}

ITEMS:
${invoice.items.map((item: any) => `- ${item.name} (${item.sku}) x${item.quantity} @ $${item.unitPrice} = $${item.total}`).join('\n')}

-------------------------------------
Subtotal: $${invoice.subtotal}
Tax: $${invoice.tax || "0.00"}
Discount: -$${invoice.discount || "0.00"}
-------------------------------------
TOTAL: $${invoice.total}
=====================================

Payment Terms: ${invoice.paymentTerms || "Net 30"}

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

  return (
    <DealerLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">
              View and download your invoices
            </p>
          </div>
          {unpaidTotal > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              ${unpaidTotal.toFixed(2)} outstanding
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {invoices?.filter(inv => inv.status === 'sent').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Pending Payment</p>
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
              <p className="text-sm text-muted-foreground">Total Invoices</p>
            </CardContent>
          </Card>
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
            ) : !invoices || invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No invoices yet</p>
                <p className="text-sm">Invoices will appear here after your orders are processed</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
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
                        <Badge className={statusColors[invoice.status]}>
                          <span className="flex items-center gap-1">
                            {statusIcons[invoice.status]}
                            {invoice.status}
                          </span>
                        </Badge>
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
    </DealerLayout>
  );
}
