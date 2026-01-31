import { motion } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Users,
  AlertTriangle,
  Mail,
  Phone,
  X,
  ShoppingCart,
  DollarSign,
  Calendar,
  TrendingUp,
  Package,
  Send,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { dealers, loyaltyTiers, adminMetrics, orders } from "@/lib/mockData";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/*
 * Admin Dealers
 * Design: Premium SaaS Elegance
 * Features: Dealer management, at-risk alerts, tier overview, View Details modal, Send Reminder
 */

interface DealerDetailsModalProps {
  dealer: typeof dealers[0] | null;
  isOpen: boolean;
  onClose: () => void;
}

function DealerDetailsModal({ dealer, isOpen, onClose }: DealerDetailsModalProps) {
  if (!dealer) return null;
  
  const tierInfo = loyaltyTiers[dealer.tier];
  const dealerOrders = orders.filter(o => o.dealerId === dealer.id);
  const isAtRisk = adminMetrics.atRiskDealers.some(r => r.dealerId === dealer.id);
  const riskInfo = adminMetrics.atRiskDealers.find(r => r.dealerId === dealer.id);
  
  // Calculate order trend (mock data)
  const lastMonthOrders = dealerOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return orderDate >= lastMonth;
  }).length;
  
  // Get discount percentage based on tier
  const tierDiscount = dealer.tier === 'platinum' ? 8 : dealer.tier === 'gold' ? 5 : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback
                className="text-white font-semibold text-lg"
                style={{ backgroundColor: tierInfo.color }}
              >
                {dealer.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span>{dealer.name}</span>
                <Badge
                  className="text-white text-xs"
                  style={{ backgroundColor: tierInfo.color }}
                >
                  {tierInfo.name}
                </Badge>
                {isAtRisk && (
                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    At Risk
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal">{dealer.company}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* At-Risk Warning */}
          {isAtRisk && riskInfo && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700">At-Risk Dealer</p>
                <p className="text-sm text-amber-600">
                  Last order was {riskInfo.daysSinceLastOrder} days ago. Consider sending a reminder to re-engage.
                </p>
              </div>
            </div>
          )}
          
          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{dealer.email}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="font-medium">{dealer.phone}</p>
              </div>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <ShoppingCart className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{dealer.orderCount}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
              <div className="bg-green-500/5 rounded-lg p-3 text-center">
                <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold">${(dealer.totalSpend / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Total Spend</p>
              </div>
              <div className="bg-violet-500/5 rounded-lg p-3 text-center">
                <Package className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                <p className="text-xl font-bold">${dealer.avgOrderValue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Avg Order</p>
              </div>
              <div className="bg-blue-500/5 rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{lastMonthOrders}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </div>
          
          {/* Loyalty Tier Progress */}
          <div>
            <h3 className="font-semibold mb-3">Loyalty Tier Progress</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Current Tier: <span className="font-semibold" style={{ color: tierInfo.color }}>{tierInfo.name}</span></span>
                <span className="text-sm text-muted-foreground">{tierDiscount}% discount</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min((dealer.totalSpend / 300000) * 100, 100)}%`,
                    backgroundColor: tierInfo.color 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {dealer.tier === 'platinum' 
                  ? 'Maximum tier reached!' 
                  : `$${((dealer.tier === 'gold' ? 250000 : dealer.tier === 'silver' ? 100000 : 50000) - dealer.totalSpend).toLocaleString()} more to next tier`
                }
              </p>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Recent Orders
            </h3>
            {dealerOrders.length > 0 ? (
              <div className="space-y-2">
                {dealerOrders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.subtotal.toLocaleString()}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          order.status === 'delivered' ? 'border-green-500 text-green-600' :
                          order.status === 'shipped' ? 'border-blue-500 text-blue-600' :
                          order.status === 'processing' ? 'border-amber-500 text-amber-600' :
                          'border-gray-500 text-gray-600'
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDealers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDealer, setSelectedDealer] = useState<typeof dealers[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [sentReminders, setSentReminders] = useState<Set<string>>(new Set());

  const sendReminderMutation = trpc.notifications.sendReminder.useMutation({
    onSuccess: (data, variables) => {
      toast.success(data.message);
      setSentReminders(prev => {
        const newSet = new Set(prev);
        newSet.add(variables.dealerId.toString());
        return newSet;
      });
      setSendingReminderId(null);
    },
    onError: (error) => {
      toast.error(`Failed to send reminder: ${error.message}`);
      setSendingReminderId(null);
    },
  });

  const handleSendReminder = (dealer: typeof dealers[0]) => {
    const riskInfo = adminMetrics.atRiskDealers.find(r => r.dealerId === dealer.id);
    setSendingReminderId(dealer.id);
    
    // Extract numeric part from dealer ID (e.g., 'dealer-001' -> 1)
    const numericId = parseInt(dealer.id.replace(/\D/g, ''), 10) || 1;
    
    sendReminderMutation.mutate({
      dealerId: numericId,
      dealerName: dealer.name,
      dealerCompany: dealer.company,
      daysSinceLastOrder: riskInfo?.daysSinceLastOrder,
    });
  };

  const filteredDealers = dealers.filter(
    (dealer) =>
      dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const atRiskIds = adminMetrics.atRiskDealers.map((r) => r.dealerId);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dealer Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all registered dealers.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search dealers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dealers.length}</p>
                <p className="text-sm text-muted-foreground">Total Dealers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${loyaltyTiers.platinum.color}20` }}
              >
                <span className="text-lg">💎</span>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dealers.filter((d) => d.tier === "platinum").length}
                </p>
                <p className="text-sm text-muted-foreground">Platinum</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${loyaltyTiers.gold.color}20` }}
              >
                <span className="text-lg">🥇</span>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dealers.filter((d) => d.tier === "gold").length}
                </p>
                <p className="text-sm text-muted-foreground">Gold</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adminMetrics.atRiskDealers.length}</p>
                <p className="text-sm text-muted-foreground">At-Risk</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dealers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDealers.map((dealer, index) => {
            const tierInfo = loyaltyTiers[dealer.tier];
            const isAtRisk = atRiskIds.includes(dealer.id);
            const riskInfo = adminMetrics.atRiskDealers.find(
              (r) => r.dealerId === dealer.id
            );
            const isSending = sendingReminderId === dealer.id;
            const hasSent = sentReminders.has(dealer.id);

            return (
              <motion.div
                key={dealer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`h-full ${
                    isAtRisk ? "border-2 border-amber-500/50" : ""
                  }`}
                >
                  {isAtRisk && (
                    <div className="bg-amber-500/10 px-4 py-2 flex items-center gap-2 border-b border-amber-500/20">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-600 font-medium">
                        {riskInfo?.daysSinceLastOrder} days since last order
                      </span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback
                          className="text-white font-semibold"
                          style={{ backgroundColor: tierInfo.color }}
                        >
                          {dealer.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{dealer.name}</h3>
                          <Badge
                            className="text-white text-xs"
                            style={{ backgroundColor: tierInfo.color }}
                          >
                            {tierInfo.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {dealer.company}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{dealer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{dealer.phone}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold">{dealer.orderCount}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          ${(dealer.totalSpend / 1000).toFixed(0)}k
                        </p>
                        <p className="text-xs text-muted-foreground">Spend</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">${dealer.avgOrderValue.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">AOV</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedDealer(dealer);
                          setIsDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      {isAtRisk && (
                        <Button 
                          size="sm" 
                          className={`flex-1 ${hasSent ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'}`}
                          onClick={() => handleSendReminder(dealer)}
                          disabled={isSending || hasSent}
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : hasSent ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Sent
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-1" />
                              Send Reminder
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Dealer Details Modal */}
      <DealerDetailsModal 
        dealer={selectedDealer}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedDealer(null);
        }}
      />
    </AdminLayout>
  );
}
