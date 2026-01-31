import { motion } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Sparkles,
  TrendingUp,
  Users,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";
import { agentActivityLog, adminMetrics } from "@/lib/mockData";

/*
 * Admin Agents
 * Design: Premium SaaS Elegance
 * Features: AI agent monitoring, activity log, performance metrics
 */

const agents = [
  {
    id: "reorder",
    name: "Reorder Prediction Agent",
    description: "Anticipates dealer restocking needs and sends pre-filled carts",
    icon: Sparkles,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    status: "active",
    actionsToday: 12,
    successRate: 89,
  },
  {
    id: "upsell",
    name: "Upsell/Cross-Sell Agent",
    description: "Identifies revenue opportunities and suggests related products",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    status: "active",
    actionsToday: 45,
    successRate: 23,
  },
  {
    id: "loyalty",
    name: "Loyalty Progression Agent",
    description: "Tracks tier advancement and sends milestone notifications",
    icon: Users,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    status: "active",
    actionsToday: 3,
    successRate: 100,
  },
  {
    id: "monitoring",
    name: "Order Monitoring Agent",
    description: "Watches for issues and alerts admin of anomalies",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    status: "active",
    actionsToday: 8,
    successRate: 95,
  },
  {
    id: "revenue",
    name: "Revenue Optimization Agent",
    description: "Identifies at-risk dealers and flags inactive accounts",
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    status: "active",
    actionsToday: 5,
    successRate: 100,
  },
  {
    id: "content",
    name: "Content Generation Agent",
    description: "Creates marketing materials and social posts on demand",
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
    status: "active",
    actionsToday: 7,
    successRate: 100,
  },
];

const agentTypeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  reorder: { icon: Sparkles, color: "text-violet-500", bg: "bg-violet-500/10" },
  upsell: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  loyalty: { icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  monitoring: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  content: { icon: FileText, color: "text-primary", bg: "bg-primary/10" },
};

export default function AdminAgents() {
  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">AI Agents</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage autonomous AI agents.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-600">
              {agents.length} agents active
            </span>
          </div>
        </div>

        {/* Agent Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => {
            const Icon = agent.icon;

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl ${agent.bg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${agent.color}`} />
                      </div>
                      <Badge
                        variant="outline"
                        className="border-emerald-500 text-emerald-600"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                        Active
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {agent.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-bold">{agent.actionsToday}</p>
                        <p className="text-xs text-muted-foreground">Actions Today</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-bold">{agent.successRate}%</p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-violet-500" />
              Recent Agent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agentActivityLog.map((activity, index) => {
                const config = agentTypeConfig[activity.agentType] || agentTypeConfig.content;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{activity.action}</p>
                        {activity.status === "success" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.target}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Overall AI Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-primary/10">
                <p className="text-4xl font-bold text-violet-500">
                  {Math.round(adminMetrics.aiPerformance.predictiveCartAccuracy * 100)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Predictive Accuracy
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-primary/10">
                <p className="text-4xl font-bold text-emerald-500">
                  {Math.round(adminMetrics.aiPerformance.recommendationAcceptRate * 100)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Recommendation Accept
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-primary/10">
                <p className="text-4xl font-bold text-amber-500">
                  +{Math.round(adminMetrics.aiPerformance.avgAovIncrease * 100)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  AOV Increase
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-primary/10">
                <p className="text-4xl font-bold text-blue-500">
                  {agents.reduce((sum, a) => sum + a.actionsToday, 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Actions Today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
