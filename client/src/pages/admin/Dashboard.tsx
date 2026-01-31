import { Link } from "wouter";
import { motion } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Bot,
  ArrowRight,
  DollarSign,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { adminMetrics, agentActivityLog, dealers } from "@/lib/mockData";

/*
 * Admin Dashboard
 * Design: Premium SaaS Elegance
 * Features: Real-time metrics, AI agent activity, at-risk dealer alerts
 */

const agentTypeConfig = {
  reorder: { icon: Sparkles, color: "text-violet-500", bg: "bg-violet-500/10" },
  upsell: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  loyalty: { icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  monitoring: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  content: { icon: Bot, color: "text-primary", bg: "bg-primary/10" },
};

export default function AdminDashboard() {
  const recentActivity = agentActivityLog.slice(0, 5);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Real-time overview of orders, dealers, and AI agent performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Live data</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Orders</p>
                    <p className="text-3xl font-bold">{adminMetrics.today.orders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15% from yesterday
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    <p className="text-3xl font-bold">
                      ${adminMetrics.today.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
                <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +8% from yesterday
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Dealers</p>
                    <p className="text-3xl font-bold">{dealers.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {adminMetrics.atRiskDealers.length} at-risk
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Recommendations</p>
                    <p className="text-3xl font-bold">
                      {adminMetrics.today.aiRecommendationsAccepted}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-violet-500" />
                  </div>
                </div>
                <p className="text-xs text-violet-500 mt-2">
                  {Math.round(adminMetrics.aiPerformance.recommendationAcceptRate * 100)}% acceptance rate
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* AI Agent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-violet-500" />
                AI Agent Activity
              </CardTitle>
              <Link href="/admin/agents">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => {
                  const config = agentTypeConfig[activity.agentType];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.target}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {activity.status === "success" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* At-Risk Dealers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                At-Risk Dealers
              </CardTitle>
              <Link href="/admin/dealers">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {adminMetrics.atRiskDealers.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-medium">All dealers are active!</p>
                  <p className="text-sm text-muted-foreground">
                    No at-risk dealers detected.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminMetrics.atRiskDealers.map((risk) => {
                    const dealer = dealers.find((d) => d.id === risk.dealerId);
                    if (!dealer) return null;

                    return (
                      <div
                        key={risk.dealerId}
                        className="flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium">{dealer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {dealer.company}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-amber-500 text-amber-600">
                            {risk.daysSinceLastOrder} days inactive
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Usual cycle: {risk.usualCycle} days
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              AI Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-primary/10">
                <p className="text-4xl font-bold text-violet-500">
                  {Math.round(adminMetrics.aiPerformance.predictiveCartAccuracy * 100)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Predictive Cart Accuracy
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-primary/10">
                <p className="text-4xl font-bold text-emerald-500">
                  {Math.round(adminMetrics.aiPerformance.recommendationAcceptRate * 100)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Recommendation Accept Rate
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-primary/10">
                <p className="text-4xl font-bold text-amber-500">
                  +{Math.round(adminMetrics.aiPerformance.avgAovIncrease * 100)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Avg AOV Increase
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
