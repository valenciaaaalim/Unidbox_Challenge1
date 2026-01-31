import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Package,
  RefreshCw,
  Shield,
  Thermometer,
  Wrench,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  purchaseDate: string;
  quantity: number;
  lifecyclePercentage: number;
  stage: "active" | "maintenance" | "approaching" | "reorder";
  nextAction: string;
  daysUntilAction: number;
  expectedLifespan: string;
  lastMaintenance?: string;
}

interface ProductCareModalProps {
  product: Product;
  onClose: () => void;
}

const careGuides: Record<string, {
  storage: string[];
  maintenance: { task: string; frequency: string; description: string }[];
  troubleshooting: { issue: string; solution: string }[];
}> = {
  "CBL-CAT6-100": {
    storage: [
      "Store in a cool, dry place away from direct sunlight",
      "Avoid sharp bends or kinks that can damage internal wiring",
      "Keep away from heat sources and chemicals",
      "Store on cable reels to prevent tangling",
    ],
    maintenance: [
      { task: "Visual Inspection", frequency: "Monthly", description: "Check for visible damage, kinks, or wear on the cable jacket" },
      { task: "Connection Test", frequency: "Quarterly", description: "Verify signal integrity using a cable tester" },
      { task: "Full Performance Test", frequency: "Yearly", description: "Complete end-to-end performance assessment" },
    ],
    troubleshooting: [
      { issue: "Intermittent connection", solution: "Check connector crimps and re-terminate if necessary" },
      { issue: "Slow network speeds", solution: "Test cable with a certified tester, replace if failed" },
      { issue: "No connection", solution: "Verify both ends are properly connected, check for cable breaks" },
    ],
  },
  default: {
    storage: [
      "Store in original packaging when not in use",
      "Keep in a clean, dry environment",
      "Avoid extreme temperatures",
      "Protect from physical damage",
    ],
    maintenance: [
      { task: "Visual Inspection", frequency: "Monthly", description: "Check for visible damage or wear" },
      { task: "Functional Test", frequency: "Quarterly", description: "Verify product is working correctly" },
      { task: "Deep Clean", frequency: "As needed", description: "Clean according to manufacturer guidelines" },
    ],
    troubleshooting: [
      { issue: "Not working as expected", solution: "Refer to product manual or contact support" },
      { issue: "Physical damage", solution: "Assess damage and consider replacement if severe" },
    ],
  },
};

const getStageInfo = (stage: Product["stage"]) => {
  switch (stage) {
    case "active":
      return {
        label: "Active",
        color: "bg-emerald-100 text-emerald-700",
        icon: CheckCircle,
      };
    case "maintenance":
      return {
        label: "Maintenance Due",
        color: "bg-amber-100 text-amber-700",
        icon: Wrench,
      };
    case "approaching":
      return {
        label: "Approaching EOL",
        color: "bg-orange-100 text-orange-700",
        icon: AlertTriangle,
      };
    case "reorder":
      return {
        label: "Reorder Now",
        color: "bg-rose-100 text-rose-700",
        icon: RefreshCw,
      };
  }
};

export function ProductCareModal({ product, onClose }: ProductCareModalProps) {
  const guide = careGuides[product.sku] || careGuides.default;
  const stageInfo = getStageInfo(product.stage);
  const StageIcon = stageInfo.icon;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <DialogTitle className="text-xl">{product.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{product.sku}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={cn("border-0", stageInfo.color)}>
                  <StageIcon className="w-3 h-3 mr-1" />
                  {stageInfo.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {product.lifecyclePercentage}% lifecycle
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Product Info */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Purchased</p>
              <p className="font-medium">{product.purchaseDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">{product.quantity} units</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Expected Lifespan</p>
              <p className="font-medium">{product.expectedLifespan}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Last Maintenance</p>
              <p className="font-medium">{product.lastMaintenance || "Not recorded"}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="storage" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="storage" className="gap-2">
              <Thermometer className="w-4 h-4" />
              Storage Tips
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <Wrench className="w-4 h-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="gap-2">
              <Shield className="w-4 h-4" />
              Troubleshooting
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="storage" className="mt-0 space-y-3">
              {guide.storage.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm text-foreground">{tip}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="maintenance" className="mt-0 space-y-3">
              {guide.maintenance.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{item.task}</h4>
                    <Badge variant="outline" className="text-xs">
                      {item.frequency}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="troubleshooting" className="mt-0 space-y-3">
              {guide.troubleshooting.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">{item.issue}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.solution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download Full Guide
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              Log Maintenance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
