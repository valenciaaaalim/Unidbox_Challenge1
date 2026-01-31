import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  FileText,
  Eye,
  Check,
  X,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import DealerLayout from "@/components/layouts/DealerLayout";

/*
 * Dealer Quotations Page
 * View received quotations and accept/reject them
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

export default function DealerQuotations() {
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [acceptForm, setAcceptForm] = useState({
    dealerReference: "",
    shippingAddress: "",
    notes: "",
  });

  const { data: quotations, isLoading, refetch } = trpc.quotations.listMine.useQuery();
  
  const acceptMutation = trpc.quotations.accept.useMutation({
    onSuccess: (data) => {
      toast.success(`Quotation accepted! PO ${data.purchaseOrder.poNumber} created.`);
      setShowAcceptDialog(false);
      setSelectedQuotation(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectMutation = trpc.quotations.reject.useMutation({
    onSuccess: () => {
      toast.success("Quotation rejected");
      setSelectedQuotation(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAccept = () => {
    if (!selectedQuotation) return;
    acceptMutation.mutate({
      quotationId: selectedQuotation.id,
      dealerReference: acceptForm.dealerReference || undefined,
      shippingAddress: acceptForm.shippingAddress || undefined,
      notes: acceptForm.notes || undefined,
    });
  };

  const handleReject = (quotationId: number) => {
    if (confirm("Are you sure you want to reject this quotation?")) {
      rejectMutation.mutate({ quotationId });
    }
  };

  const pendingCount = quotations?.filter(q => q.status === 'sent').length || 0;

  return (
    <DealerLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quotations</h1>
            <p className="text-muted-foreground">
              View and respond to quotations from UnidBox
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {pendingCount} pending
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {quotations?.filter(q => q.status === 'sent').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
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
            ) : !quotations || quotations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No quotations yet</p>
                <p className="text-sm">Quotations from UnidBox will appear here</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">
                        {quotation.quotationNumber}
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedQuotation(quotation)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {quotation.status === 'sent' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  setSelectedQuotation(quotation);
                                  setShowAcceptDialog(true);
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleReject(quotation.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
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

        {/* View Quotation Dialog */}
        <Dialog open={!!selectedQuotation && !showAcceptDialog} onOpenChange={() => setSelectedQuotation(null)}>
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
                  {selectedQuotation.expiresAt && (
                    <span className="text-sm text-muted-foreground">
                      Valid until: {format(new Date(selectedQuotation.expiresAt), "MMM d, yyyy")}
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
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedQuotation.subtotal}</span>
                  </div>
                  {parseFloat(selectedQuotation.discount || "0") > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${selectedQuotation.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${selectedQuotation.total}</span>
                  </div>
                </div>

                {selectedQuotation.notes && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedQuotation.notes}</p>
                  </div>
                )}

                {selectedQuotation.terms && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Terms & Conditions</p>
                    <p className="text-sm text-muted-foreground">{selectedQuotation.terms}</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              {selectedQuotation?.status === 'sent' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedQuotation.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => setShowAcceptDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept & Create PO
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Accept Quotation Dialog */}
        <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accept Quotation</DialogTitle>
              <DialogDescription>
                Create a Purchase Order from this quotation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Your Reference Number (Optional)</Label>
                <Input
                  placeholder="e.g., PO-2024-001"
                  value={acceptForm.dealerReference}
                  onChange={(e) => setAcceptForm({ ...acceptForm, dealerReference: e.target.value })}
                />
              </div>
              <div>
                <Label>Shipping Address (Optional)</Label>
                <Textarea
                  placeholder="Enter delivery address..."
                  value={acceptForm.shippingAddress}
                  onChange={(e) => setAcceptForm({ ...acceptForm, shippingAddress: e.target.value })}
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Any special instructions..."
                  value={acceptForm.notes}
                  onChange={(e) => setAcceptForm({ ...acceptForm, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {acceptMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Accept & Create PO
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DealerLayout>
  );
}
