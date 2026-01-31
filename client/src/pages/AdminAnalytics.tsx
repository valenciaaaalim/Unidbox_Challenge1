import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Mail,
  Package,
  Phone,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock data for analytics
const lifecycleDistribution = [
  { name: "Active", value: 156, color: "#10b981" },
  { name: "Maintenance Due", value: 42, color: "#f59e0b" },
  { name: "Approaching EOL", value: 28, color: "#f97316" },
  { name: "Reorder Now", value: 18, color: "#ef4444" },
];

const lifecycleTrend = [
  { month: "Aug", active: 120, maintenance: 30, approaching: 15, reorder: 8 },
  { month: "Sep", active: 135, maintenance: 35, approaching: 18, reorder: 10 },
  { month: "Oct", active: 142, maintenance: 38, approaching: 22, reorder: 12 },
  { month: "Nov", active: 148, maintenance: 40, approaching: 25, reorder: 15 },
  { month: "Dec", active: 152, maintenance: 42, approaching: 26, reorder: 16 },
  { month: "Jan", active: 156, maintenance: 42, approaching: 28, reorder: 18 },
];

const revenueProjection = [
  { period: "Next 30 Days", reorder: 12500, maintenance: 3200, total: 15700 },
  { period: "Next 60 Days", reorder: 28400, maintenance: 6800, total: 35200 },
  { period: "Next 90 Days", reorder: 45600, maintenance: 11200, total: 56800 },
];

const productHealthData = [
  { category: "Cables", healthy: 85, warning: 10, critical: 5 },
  { category: "Connectors", healthy: 72, warning: 18, critical: 10 },
  { category: "Tools", healthy: 68, warning: 22, critical: 10 },
  { category: "Safety", healthy: 55, warning: 30, critical: 15 },
  { category: "Networking", healthy: 78, warning: 15, critical: 7 },
];

const dealerEngagement = [
  { id: "D001", name: "ABC Electronics", products: 45, atRisk: 8, revenue: 12500, lastOrder: "2 days ago", status: "active" },
  { id: "D002", name: "TechPro Solutions", products: 38, atRisk: 12, revenue: 8900, lastOrder: "5 days ago", status: "warning" },
  { id: "D003", name: "Network Masters", products: 52, atRisk: 3, revenue: 18200, lastOrder: "1 day ago", status: "active" },
  { id: "D004", name: "Cable Connect Co", products: 28, atRisk: 15, revenue: 6400, lastOrder: "12 days ago", status: "critical" },
  { id: "D005", name: "SafetyFirst Inc", products: 35, atRisk: 6, revenue: 9800, lastOrder: "3 days ago", status: "active" },
];

const engagementQueue = [
  {
    id: "E001",
    dealer: "Cable Connect Co",
    reason: "15 products approaching EOL, no recent orders",
    priority: "high",
    potentialRevenue: 4200,
    suggestedAction: "Call to discuss bulk replacement order",
    daysOverdue: 5,
  },
  {
    id: "E002",
    dealer: "TechPro Solutions",
    reason: "12 products need maintenance, warranty expiring",
    priority: "high",
    potentialRevenue: 2800,
    suggestedAction: "Send maintenance reminder email",
    daysOverdue: 3,
  },
  {
    id: "E003",
    dealer: "SafetyFirst Inc",
    reason: "Safety equipment lifecycle at 80%+",
    priority: "medium",
    potentialRevenue: 1500,
    suggestedAction: "Schedule check-in call",
    daysOverdue: 0,
  },
  {
    id: "E004",
    dealer: "Network Masters",
    reason: "High-value switch approaching firmware EOL",
    priority: "medium",
    potentialRevenue: 3200,
    suggestedAction: "Offer upgrade consultation",
    daysOverdue: 0,
  },
];

const monthlyRevenueData = [
  { month: "Aug", actual: 42000, projected: 45000 },
  { month: "Sep", actual: 48000, projected: 47000 },
  { month: "Oct", actual: 51000, projected: 50000 },
  { month: "Nov", actual: 55000, projected: 54000 },
  { month: "Dec", actual: 62000, projected: 58000 },
  { month: "Jan", actual: 58000, projected: 60000 },
  { month: "Feb", actual: null, projected: 65000 },
  { month: "Mar", actual: null, projected: 68000 },
];

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30days");

  const totalProducts = lifecycleDistribution.reduce((sum, item) => sum + item.value, 0);
  const healthyPercentage = Math.round((lifecycleDistribution[0].value / totalProducts) * 100);

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lifecycle Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Monitor dealer product lifecycles and identify revenue opportunities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products Tracked</p>
                  <p className="text-3xl font-bold text-foreground">{totalProducts}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600">+12% from last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fleet Health Score</p>
                  <p className="text-3xl font-bold text-emerald-600">{healthyPercentage}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600">+3% improvement</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attention Required</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {lifecycleDistribution[1].value + lifecycleDistribution[2].value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowDown className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600">-5 from last week</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projected Revenue (30d)</p>
                  <p className="text-3xl font-bold text-foreground">$15.7K</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600">From lifecycle events</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Dealers</p>
                  <p className="text-3xl font-bold text-foreground">24</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-muted-foreground">3 need attention</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Opportunities</TabsTrigger>
            <TabsTrigger value="engagement">Dealer Engagement</TabsTrigger>
            <TabsTrigger value="products">Product Health</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Lifecycle Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lifecycle Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={lifecycleDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {lifecycleDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {lifecycleDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                        <span className="text-sm font-medium ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lifecycle Trend Chart */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Lifecycle Trend (6 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lifecycleTrend}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="active"
                          stackId="1"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                          name="Active"
                        />
                        <Area
                          type="monotone"
                          dataKey="maintenance"
                          stackId="1"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.6}
                          name="Maintenance"
                        />
                        <Area
                          type="monotone"
                          dataKey="approaching"
                          stackId="1"
                          stroke="#f97316"
                          fill="#f97316"
                          fillOpacity={0.6}
                          name="Approaching EOL"
                        />
                        <Area
                          type="monotone"
                          dataKey="reorder"
                          stackId="1"
                          stroke="#ef4444"
                          fill="#ef4444"
                          fillOpacity={0.6}
                          name="Reorder"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Proactive Engagement Queue */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Proactive Engagement Queue
                  </CardTitle>
                  <Badge className="bg-amber-100 text-amber-700 border-0">
                    {engagementQueue.length} dealers need attention
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {engagementQueue.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border",
                        item.priority === "high"
                          ? "bg-rose-50 border-rose-200"
                          : "bg-amber-50 border-amber-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            item.priority === "high" ? "bg-rose-100" : "bg-amber-100"
                          )}
                        >
                          {item.priority === "high" ? (
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{item.dealer}</p>
                            <Badge
                              className={cn(
                                "border-0 text-xs",
                                item.priority === "high"
                                  ? "bg-rose-200 text-rose-700"
                                  : "bg-amber-200 text-amber-700"
                              )}
                            >
                              {item.priority} priority
                            </Badge>
                            {item.daysOverdue > 0 && (
                              <Badge variant="outline" className="text-xs text-rose-600 border-rose-300">
                                {item.daysOverdue} days overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                          <p className="text-sm text-foreground mt-1">
                            <span className="font-medium">Suggested:</span> {item.suggestedAction}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Potential Revenue</p>
                          <p className="text-lg font-bold text-emerald-600">
                            ${item.potentialRevenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Mail className="w-4 h-4" />
                            Email
                          </Button>
                          <Button size="sm" className="gap-1">
                            <Phone className="w-4 h-4" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Opportunities Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {revenueProjection.map((item) => (
                <Card key={item.period}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{item.period}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      ${item.total.toLocaleString()}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-blue-500" />
                          Reorder Revenue
                        </span>
                        <span className="font-medium">${item.reorder.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-amber-500" />
                          Maintenance Revenue
                        </span>
                        <span className="font-medium">${item.maintenance.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Trend & Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenueData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ fill: "#2563eb" }}
                        name="Actual Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="projected"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#10b981" }}
                        name="Projected Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* At-Risk Revenue */}
            <Card className="bg-rose-50 border-rose-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="w-5 h-5" />
                  At-Risk Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-rose-600">Dealers with EOL products not reordering</p>
                    <p className="text-3xl font-bold text-rose-700 mt-1">$8,400</p>
                    <p className="text-sm text-muted-foreground mt-1">4 dealers affected</p>
                  </div>
                  <div>
                    <p className="text-sm text-rose-600">Overdue maintenance (potential churn)</p>
                    <p className="text-3xl font-bold text-rose-700 mt-1">$3,200</p>
                    <p className="text-sm text-muted-foreground mt-1">2 dealers at risk</p>
                  </div>
                  <div>
                    <p className="text-sm text-rose-600">Warranty expiring (upgrade opportunity)</p>
                    <p className="text-3xl font-bold text-rose-700 mt-1">$5,600</p>
                    <p className="text-sm text-muted-foreground mt-1">6 dealers eligible</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dealer Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dealer Lifecycle Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Dealer</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Products</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">At Risk</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue (30d)</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Order</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealerEngagement.map((dealer) => (
                        <tr key={dealer.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-foreground">{dealer.name}</p>
                              <p className="text-xs text-muted-foreground">{dealer.id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{dealer.products}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={cn(
                                "border-0",
                                dealer.atRisk > 10
                                  ? "bg-rose-100 text-rose-700"
                                  : dealer.atRisk > 5
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              )}
                            >
                              {dealer.atRisk} products
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">${dealer.revenue.toLocaleString()}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">{dealer.lastOrder}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={cn(
                                "border-0",
                                dealer.status === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : dealer.status === "warning"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-rose-100 text-rose-700"
                              )}
                            >
                              {dealer.status === "active" ? "Active" : dealer.status === "warning" ? "Needs Attention" : "Critical"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" className="gap-1">
                              View Details
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Health Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Health by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productHealthData} layout="vertical">
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="category" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="healthy" stackId="a" fill="#10b981" name="Healthy" />
                      <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Warning" />
                      <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Products Needing Attention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Insulated Work Gloves", category: "Safety", count: 45, urgency: "high" },
                      { name: "RJ45 Connectors", category: "Connectors", count: 38, urgency: "high" },
                      { name: "Cable Tester Pro", category: "Tools", count: 28, urgency: "medium" },
                      { name: "CAT6 Ethernet Cable", category: "Cables", count: 22, urgency: "medium" },
                    ].map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={cn(
                              "border-0",
                              product.urgency === "high"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                            )}
                          >
                            {product.count} units
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Maintenance Compliance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: "Networking Equipment", rate: 92 },
                      { category: "Tools", rate: 78 },
                      { category: "Cables", rate: 85 },
                      { category: "Safety Equipment", rate: 65 },
                      { category: "Connectors", rate: 72 },
                    ].map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.category}</span>
                          <span
                            className={cn(
                              "font-medium",
                              item.rate >= 80
                                ? "text-emerald-600"
                                : item.rate >= 70
                                ? "text-amber-600"
                                : "text-rose-600"
                            )}
                          >
                            {item.rate}%
                          </span>
                        </div>
                        <Progress
                          value={item.rate}
                          className={cn(
                            "h-2",
                            item.rate >= 80
                              ? "[&>div]:bg-emerald-500"
                              : item.rate >= 70
                              ? "[&>div]:bg-amber-500"
                              : "[&>div]:bg-rose-500"
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
