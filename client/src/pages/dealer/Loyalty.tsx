import { motion } from "framer-motion";
import DealerLayout from "@/components/layouts/DealerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Star,
  TrendingUp,
  Gift,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { currentDealer, loyaltyTiers } from "@/lib/mockData";

/*
 * Dealer Loyalty
 * Design: Premium SaaS Elegance
 * Features: Tier status, benefits, progress to next tier
 */

export default function DealerLoyalty() {
  const currentTier = loyaltyTiers[currentDealer.tier];
  const tiers = Object.entries(loyaltyTiers);
  const currentTierIndex = tiers.findIndex(([key]) => key === currentDealer.tier);
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

  const progressToNext = nextTier
    ? Math.min(100, (currentDealer.totalSpend / nextTier[1].minSpend) * 100)
    : 100;

  const spendToNext = nextTier
    ? Math.max(0, nextTier[1].minSpend - currentDealer.totalSpend)
    : 0;

  return (
    <DealerLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Loyalty Program</h1>
          <p className="text-muted-foreground mt-1">
            Track your tier status and unlock exclusive benefits.
          </p>
        </div>

        {/* Current Tier Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden">
            <div
              className="h-2"
              style={{ backgroundColor: currentTier.color }}
            />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${currentTier.color}20` }}
                  >
                    <Trophy
                      className="w-8 h-8"
                      style={{ color: currentTier.color }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Tier</p>
                    <h2
                      className="text-3xl font-bold"
                      style={{ color: currentTier.color }}
                    >
                      {currentTier.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Member since January 2025
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Spend</p>
                  <p className="text-3xl font-bold">
                    ${currentDealer.totalSpend.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress to Next Tier */}
              {nextTier && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Progress to {nextTier[1].name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ${spendToNext.toLocaleString()} to go
                    </span>
                  </div>
                  <Progress value={progressToNext} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Spend ${nextTier[1].minSpend.toLocaleString()} total to unlock{" "}
                    {nextTier[1].name} tier benefits
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Your {currentTier.name} Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {currentTier.benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/50"
                >
                  <CheckCircle2
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: currentTier.color }}
                  />
                  <span className="font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Tiers */}
        <div>
          <h2 className="text-xl font-bold mb-4">All Tiers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map(([key, tier], index) => {
              const isCurrentTier = key === currentDealer.tier;
              const isLocked = index > currentTierIndex;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card
                    className={`h-full ${
                      isCurrentTier ? "border-2" : ""
                    } ${isLocked ? "opacity-60" : ""}`}
                    style={{
                      borderColor: isCurrentTier ? tier.color : undefined,
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${tier.color}20` }}
                          >
                            {isLocked ? (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <Star
                                className="w-5 h-5"
                                style={{ color: tier.color }}
                              />
                            )}
                          </div>
                          <div>
                            <CardTitle
                              className="text-lg"
                              style={{ color: tier.color }}
                            >
                              {tier.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              ${tier.minSpend.toLocaleString()}+ spend
                            </p>
                          </div>
                        </div>
                        {isCurrentTier && (
                          <Badge style={{ backgroundColor: tier.color }}>
                            Current
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tier.benefits.map((benefit) => (
                          <li
                            key={benefit}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2
                              className="w-4 h-4 flex-shrink-0"
                              style={{
                                color: isLocked ? "#9CA3AF" : tier.color,
                              }}
                            />
                            <span
                              className={isLocked ? "text-muted-foreground" : ""}
                            >
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{currentDealer.orderCount}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                ${currentDealer.avgOrderValue.toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {currentDealer.tier === "platinum"
                  ? "8%"
                  : currentDealer.tier === "gold"
                  ? "5%"
                  : "0%"}
              </p>
              <p className="text-sm text-muted-foreground">Volume Rebate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: currentTier.color }}
              />
              <p className="text-2xl font-bold">{currentTier.name}</p>
              <p className="text-sm text-muted-foreground">Current Tier</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DealerLayout>
  );
}
