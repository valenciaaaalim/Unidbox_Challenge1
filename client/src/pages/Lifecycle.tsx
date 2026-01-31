import { DashboardLayout } from "@/components/DashboardLayout";
import { ProductCareModal } from "@/components/ProductCareModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Filter,
  History,
  Package,
  RefreshCw,
  Shield,
  ShoppingCart,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MaintenanceEvent {
  id: string;
  date: string;
  type: "inspection" | "repair" | "replacement" | "firmware";
  description: string;
  cost?: number;
  provider?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  purchaseDate: string;
  purchasePrice: number;
  quantity: number;
  lifecyclePercentage: number;
  stage: "active" | "maintenance" | "approaching" | "reorder";
  nextAction: string;
  daysUntilAction: number;
  expectedLifespan: string;
  lastMaintenance?: string;
  warrantyExpiry?: string;
  warrantyStatus?: "active" | "expiring" | "expired";
  totalMaintenanceCost: number;
  maintenanceHistory: MaintenanceEvent[];
}

const products: Product[] = [
  {
    id: "1",
    name: "CAT6 Ethernet Cable 100m",
    sku: "CBL-CAT6-100",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
    purchaseDate: "Jan 15, 2026",
    purchasePrice: 89.99,
    quantity: 10,
    lifecyclePercentage: 45,
    stage: "active",
    nextAction: "Maintenance check",
    daysUntilAction: 15,
    expectedLifespan: "5-7 years",
    lastMaintenance: "Jan 20, 2026",
    warrantyExpiry: "Jan 15, 2028",
    warrantyStatus: "active",
    totalMaintenanceCost: 25.00,
    maintenanceHistory: [
      { id: "m1", date: "Jan 20, 2026", type: "inspection", description: "Initial installation check", cost: 25.00, provider: "Internal" },
    ],
  },
  {
    id: "2",
    name: "RJ45 Connectors (100 pack)",
    sku: "CON-RJ45-100",
    image: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=200&h=200&fit=crop",
    purchaseDate: "Jan 8, 2026",
    purchasePrice: 24.99,
    quantity: 5,
    lifecyclePercentage: 72,
    stage: "maintenance",
    nextAction: "Quality inspection",
    daysUntilAction: 3,
    expectedLifespan: "2-3 years",
    warrantyExpiry: "Jan 8, 2027",
    warrantyStatus: "active",
    totalMaintenanceCost: 0,
    maintenanceHistory: [],
  },
  {
    id: "3",
    name: "Insulated Work Gloves (L)",
    sku: "SAF-GLOVES-L",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop",
    purchaseDate: "Dec 20, 2025",
    purchasePrice: 18.99,
    quantity: 3,
    lifecyclePercentage: 88,
    stage: "approaching",
    nextAction: "Consider replacement",
    daysUntilAction: 7,
    expectedLifespan: "6-12 months",
    warrantyExpiry: "Dec 20, 2025",
    warrantyStatus: "expired",
    totalMaintenanceCost: 0,
    maintenanceHistory: [],
  },
  {
    id: "4",
    name: "Cable Tester Pro",
    sku: "TOOL-TESTER-01",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=200&fit=crop",
    purchaseDate: "Nov 15, 2025",
    purchasePrice: 79.99,
    quantity: 1,
    lifecyclePercentage: 96,
    stage: "reorder",
    nextAction: "Reorder now",
    daysUntilAction: 0,
    expectedLifespan: "3-5 years",
    warrantyExpiry: "Feb 15, 2026",
    warrantyStatus: "expiring",
    totalMaintenanceCost: 45.00,
    maintenanceHistory: [
      { id: "m2", date: "Dec 10, 2025", type: "repair", description: "Display calibration", cost: 45.00, provider: "TechFix Services" },
    ],
  },
  {
    id: "5",
    name: "Professional Crimping Tool",
    sku: "TOOL-CRIMP-01",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=200&fit=crop",
    purchaseDate: "Jan 10, 2026",
    purchasePrice: 45.99,
    quantity: 2,
    lifecyclePercentage: 25,
    stage: "active",
    nextAction: "No action needed",
    daysUntilAction: 45,
    expectedLifespan: "5-7 years",
    lastMaintenance: "Jan 15, 2026",
    warrantyExpiry: "Jan 10, 2029",
    warrantyStatus: "active",
    totalMaintenanceCost: 0,
    maintenanceHistory: [],
  },
  {
    id: "6",
    name: "Network Switch 24-Port",
    sku: "NET-SW24-01",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=200&fit=crop",
    purchaseDate: "Dec 1, 2025",
    purchasePrice: 684.53,
    quantity: 1,
    lifecyclePercentage: 65,
    stage: "maintenance",
    nextAction: "Firmware update",
    daysUntilAction: 5,
    expectedLifespan: "7-10 years",
    warrantyExpiry: "Dec 1, 2028",
    warrantyStatus: "active",
    totalMaintenanceCost: 0,
    maintenanceHistory: [
      { id: "m3", date: "Jan 5, 2026", type: "firmware", description: "Updated to v2.3.1", cost: 0, provider: "Self-service" },
    ],
  },
];

const getStageInfo = (stage: Product["stage"]) => {
  switch (stage) {
    case "active":
      return {
        label: "Active",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        progressColor: "bg-emerald-500",
        icon: CheckCircle,
        iconColor: "text-emerald-500",
      };
    case "maintenance":
      return {
        label: "Maintenance Due",
        color: "bg-amber-100 text-amber-700 border-amber-200",
        progressColor: "bg-amber-500",
        icon: Wrench,
        iconColor: "text-amber-500",
      };
    case "approaching":
      return {
        label: "Approaching EOL",
        color: "bg-orange-100 text-orange-700 border-orange-200",
        progressColor: "bg-orange-500",
        icon: AlertTriangle,
        iconColor: "text-orange-500",
      };
    case "reorder":
      return {
        label: "Reorder Now",
        color: "bg-rose-100 text-rose-700 border-rose-200",
        progressColor: "bg-rose-500",
        icon: RefreshCw,
        iconColor: "text-rose-500",
      };
  }
};

const getWarrantyBadge = (status?: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-100 text-emerald-700 border-0">Warranty Active</Badge>;
    case "expiring":
      return <Badge className="bg-amber-100 text-amber-700 border-0">Warranty Expiring</Badge>;
    case "expired":
      return <Badge className="bg-rose-100 text-rose-700 border-0">Warranty Expired</Badge>;
    default:
      return null;
  }
};

// Product Detail Modal Component
function ProductDetailModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const stageInfo = getStageInfo(product.stage);
  const StageIcon = stageInfo.icon;
  const totalCost = (product.purchasePrice * product.quantity) + product.totalMaintenanceCost;

  const timelineEvents = [
    { date: product.purchaseDate, type: "purchase", label: "Purchased", icon: ShoppingCart, color: "bg-blue-500" },
    ...product.maintenanceHistory.map(m => ({
      date: m.date,
      type: m.type,
      label: m.description,
      icon: m.type === "repair" ? Wrench : m.type === "firmware" ? RefreshCw : CheckCircle,
      color: m.type === "repair" ? "bg-amber-500" : "bg-emerald-500",
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
          <div>
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="text-sm text-muted-foreground font-normal">{product.sku}</p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", 
                    stageInfo.color.split(" ")[0])}>
                    <StageIcon className={cn("w-5 h-5", stageInfo.iconColor)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <p className="font-semibold">{stageInfo.label}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lifecycle Progress</span>
                    <span className="font-medium">{product.lifecyclePercentage}%</span>
                  </div>
                  <Progress value={product.lifecyclePercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Action</p>
                    <p className="font-semibold">{product.nextAction}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {product.daysUntilAction === 0 
                    ? "Action required now" 
                    : `Due in ${product.daysUntilAction} days`}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Purchase Date</span>
                </div>
                <p className="font-semibold">{product.purchaseDate}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Quantity</span>
                </div>
                <p className="font-semibold">{product.quantity} units</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  {getWarrantyBadge(product.warrantyStatus)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Expires: {product.warrantyExpiry}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Product Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => {
                    const EventIcon = event.icon;
                    return (
                      <div key={index} className="relative flex gap-4 pl-10">
                        <div className={cn(
                          "absolute left-2 w-5 h-5 rounded-full flex items-center justify-center",
                          event.color
                        )}>
                          <EventIcon className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground">{event.label}</p>
                            <span className="text-sm text-muted-foreground">{event.date}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Future events */}
                  <div className="relative flex gap-4 pl-10 opacity-50">
                    <div className="absolute left-2 w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-muted-foreground">{product.nextAction}</p>
                      <span className="text-sm text-muted-foreground">
                        Projected: {product.daysUntilAction} days from now
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.maintenanceHistory.length > 0 ? (
                <div className="space-y-3">
                  {product.maintenanceHistory.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          event.type === "repair" ? "bg-amber-100" : 
                          event.type === "firmware" ? "bg-blue-100" : "bg-emerald-100"
                        )}>
                          {event.type === "repair" ? (
                            <Wrench className="w-4 h-4 text-amber-600" />
                          ) : event.type === "firmware" ? (
                            <RefreshCw className="w-4 h-4 text-blue-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{event.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.date} • {event.provider}
                          </p>
                        </div>
                      </div>
                      {event.cost !== undefined && event.cost > 0 && (
                        <span className="font-medium text-foreground">
                          ${event.cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No maintenance records yet</p>
                  <Button variant="outline" className="mt-4">
                    Log Maintenance Activity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="costs" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Total Cost of Ownership
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Purchase Cost</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${(product.purchasePrice * product.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Maintenance Cost</p>
                    <p className="text-2xl font-bold text-amber-600">
                      ${product.totalMaintenanceCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total TCO</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ${totalCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Cost per Unit</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${(totalCost / product.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Projected Replacement Cost</span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  ${(product.purchasePrice * product.quantity * 1.05).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on 5% annual price increase
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Monthly Cost Average</span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  ${(totalCost / 12).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on expected lifespan
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
        <Button className="gap-2">
          <ShoppingCart className="w-4 h-4" />
          Reorder Product
        </Button>
      </div>
    </DialogContent>
  );
}

export default function Lifecycle() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const filteredProducts = products.filter((product) => {
    if (filter === "all") return true;
    return product.stage === filter;
  });

  const stageCounts = {
    active: products.filter((p) => p.stage === "active").length,
    maintenance: products.filter((p) => p.stage === "maintenance").length,
    approaching: products.filter((p) => p.stage === "approaching").length,
    reorder: products.filter((p) => p.stage === "reorder").length,
  };

  // Calculate totals for cost summary
  const totalPurchaseCost = products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);
  const totalMaintenanceCost = products.reduce((sum, p) => sum + p.totalMaintenanceCost, 0);
  const totalTCO = totalPurchaseCost + totalMaintenanceCost;

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleBulkReorder = () => {
    toast.success(`Added ${selectedProducts.length} products to cart for reorder`);
    setSelectedProducts([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Products</h1>
            <p className="text-muted-foreground mt-1">
              Track your purchased products and manage their lifecycle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedProducts.length > 0 && (
              <Button onClick={handleBulkReorder} className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                Reorder Selected ({selectedProducts.length})
              </Button>
            )}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance Due</SelectItem>
                <SelectItem value="approaching">Approaching EOL</SelectItem>
                <SelectItem value="reorder">Reorder Now</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cost Summary Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Investment</p>
                    <p className="text-xl font-bold text-blue-700">${totalPurchaseCost.toFixed(2)}</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-xs text-muted-foreground">Maintenance Spent</p>
                  <p className="text-xl font-bold text-amber-600">${totalMaintenanceCost.toFixed(2)}</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-xs text-muted-foreground">Total TCO</p>
                  <p className="text-xl font-bold text-emerald-600">${totalTCO.toFixed(2)}</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2 bg-white">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lifecycle Overview Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "active" && "ring-2 ring-emerald-500"
            )}
            onClick={() => setFilter(filter === "active" ? "all" : "active")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold text-emerald-600">{stageCounts.active}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "maintenance" && "ring-2 ring-amber-500"
            )}
            onClick={() => setFilter(filter === "maintenance" ? "all" : "maintenance")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance Due</p>
                  <p className="text-3xl font-bold text-amber-600">{stageCounts.maintenance}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "approaching" && "ring-2 ring-orange-500"
            )}
            onClick={() => setFilter(filter === "approaching" ? "all" : "approaching")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approaching EOL</p>
                  <p className="text-3xl font-bold text-orange-600">{stageCounts.approaching}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "reorder" && "ring-2 ring-rose-500"
            )}
            onClick={() => setFilter(filter === "reorder" ? "all" : "reorder")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reorder Now</p>
                  <p className="text-3xl font-bold text-rose-600">{stageCounts.reorder}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const stageInfo = getStageInfo(product.stage);
              const StageIcon = stageInfo.icon;
              return (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="relative">
                    <div className="absolute top-3 left-3 z-10">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white"
                      />
                    </div>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                    <Badge
                      className={cn(
                        "absolute top-3 right-3 border",
                        stageInfo.color
                      )}
                    >
                      <StageIcon className="w-3 h-3 mr-1" />
                      {stageInfo.label}
                    </Badge>
                  </div>
                  <CardContent className="p-4" onClick={() => setDetailProduct(product)}>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {product.purchaseDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          Qty: {product.quantity}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Lifecycle</span>
                          <span className="font-medium">{product.lifecyclePercentage}%</span>
                        </div>
                        <Progress
                          value={product.lifecyclePercentage}
                          className={cn("h-2", `[&>div]:${stageInfo.progressColor}`)}
                        />
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className={cn("w-4 h-4", stageInfo.iconColor)} />
                        <span className="text-muted-foreground">
                          {product.nextAction}
                          {product.daysUntilAction > 0 && ` in ${product.daysUntilAction} days`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        {getWarrantyBadge(product.warrantyStatus)}
                        <Button variant="ghost" size="sm" className="gap-1 text-primary">
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <Dialog open={!!detailProduct} onOpenChange={() => setDetailProduct(null)}>
        {detailProduct && (
          <ProductDetailModal 
            product={detailProduct} 
            onClose={() => setDetailProduct(null)} 
          />
        )}
      </Dialog>

      {/* Product Care Modal */}
      {selectedProduct && (
        <ProductCareModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </DashboardLayout>
  );
}
