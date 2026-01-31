import { motion } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Users,
  AlertTriangle,
  TrendingUp,
  Mail,
  Phone,
} from "lucide-react";
import { dealers, loyaltyTiers, adminMetrics } from "@/lib/mockData";
import { useState } from "react";

/*
 * Admin Dealers
 * Design: Premium SaaS Elegance
 * Features: Dealer management, at-risk alerts, tier overview
 */

export default function AdminDealers() {
  const [searchQuery, setSearchQuery] = useState("");

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
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      {isAtRisk && (
                        <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600">
                          Send Reminder
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
    </AdminLayout>
  );
}
