import { motion } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Bot,
} from "lucide-react";
import { adminMetrics, dealers, orders } from "@/lib/mockData";

/*
 * Admin Analytics
 * Design: Premium SaaS Elegance
 * Features: Revenue analytics, order trends, AI impact metrics
 */

export default function AdminAnalytics() {
  const totalRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const avgOrderValue = totalRevenue / orders.length;

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Revenue insights, order trends, and AI performance metrics.
          </p>
        </div>

        {/* Time Period Tabs */}
        <Tabs defaultValue="month" className="space-y-6">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Revenue"
                value={`$${adminMetrics.today.revenue.toLocaleString()}`}
                icon={DollarSign}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
                change="+8%"
              />
              <MetricCard
                title="Orders"
                value={adminMetrics.today.orders.toString()}
                icon={ShoppingCart}
                color="text-primary"
                bg="bg-primary/10"
                change="+15%"
              />
              <MetricCard
                title="Avg Order Value"
                value={`$${adminMetrics.today.avgOrderValue.toFixed(0)}`}
                icon={TrendingUp}
                color="text-amber-500"
                bg="bg-amber-500/10"
                change="+5%"
              />
              <MetricCard
                title="AI Recommendations"
                value={adminMetrics.today.aiRecommendationsAccepted.toString()}
                icon={Bot}
                color="text-violet-500"
                bg="bg-violet-500/10"
                change="+12%"
              />
            </div>
          </TabsContent>

          <TabsContent value="week" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Revenue"
                value={`$${adminMetrics.week.revenue.toLocaleString()}`}
                icon={DollarSign}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
                change="+12%"
              />
              <MetricCard
                title="Orders"
                value={adminMetrics.week.orders.toString()}
                icon={ShoppingCart}
                color="text-primary"
                bg="bg-primary/10"
                change="+18%"
              />
              <MetricCard
                title="Avg Order Value"
                value={`$${adminMetrics.week.avgOrderValue.toFixed(0)}`}
                icon={TrendingUp}
                color="text-amber-500"
                bg="bg-amber-500/10"
                change="+7%"
              />
              <MetricCard
                title="AI Recommendations"
                value={adminMetrics.week.aiRecommendationsAccepted.toString()}
                icon={Bot}
                color="text-violet-500"
                bg="bg-violet-500/10"
                change="+22%"
              />
            </div>
          </TabsContent>

          <TabsContent value="month" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Revenue"
                value={`$${adminMetrics.month.revenue.toLocaleString()}`}
                icon={DollarSign}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
                change="+24%"
              />
              <MetricCard
                title="Orders"
                value={adminMetrics.month.orders.toString()}
                icon={ShoppingCart}
                color="text-primary"
                bg="bg-primary/10"
                change="+31%"
              />
              <MetricCard
                title="Avg Order Value"
                value={`$${adminMetrics.month.avgOrderValue.toFixed(0)}`}
                icon={TrendingUp}
                color="text-amber-500"
                bg="bg-amber-500/10"
                change="+10%"
              />
              <MetricCard
                title="AI Recommendations"
                value={adminMetrics.month.aiRecommendationsAccepted.toString()}
                icon={Bot}
                color="text-violet-500"
                bg="bg-violet-500/10"
                change="+45%"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                {[65, 45, 78, 52, 89, 67, 95].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-lg"
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground px-4">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Orders by Dealer Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TierBar
                  tier="Platinum"
                  color="bg-violet-500"
                  percentage={55}
                  count={135}
                />
                <TierBar
                  tier="Gold"
                  color="bg-amber-500"
                  percentage={30}
                  count={74}
                />
                <TierBar
                  tier="Silver"
                  color="bg-gray-400"
                  percentage={15}
                  count={36}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Impact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-violet-500" />
              AI Business Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-primary/10 text-center">
                <p className="text-5xl font-bold text-violet-500">
                  ${Math.round(totalRevenue * 0.12).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Additional Revenue from AI Upsells
                </p>
                <p className="text-xs text-violet-500 mt-1">
                  +12% AOV increase attributed to AI
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-primary/10 text-center">
                <p className="text-5xl font-bold text-emerald-500">70%</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Reduction in Order Processing Time
                </p>
                <p className="text-xs text-emerald-500 mt-1">
                  From 2-3 days to same-day
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-primary/10 text-center">
                <p className="text-5xl font-bold text-amber-500">89%</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Predictive Cart Accuracy
                </p>
                <p className="text-xs text-amber-500 mt-1">
                  Dealers confirm suggested orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Dealers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Dealers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dealers
                .sort((a, b) => b.totalSpend - a.totalSpend)
                .slice(0, 5)
                .map((dealer, index) => (
                  <div
                    key={dealer.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{dealer.name}</p>
                        <p className="text-sm text-muted-foreground">{dealer.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${dealer.totalSpend.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dealer.orderCount} orders
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
  change,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  bg: string;
  change: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
          </div>
          <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {change} vs last period
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TierBar({
  tier,
  color,
  percentage,
  count,
}: {
  tier: string;
  color: string;
  percentage: number;
  count: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{tier}</span>
        <span className="text-sm text-muted-foreground">{count} orders</span>
      </div>
      <div className="h-4 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}
