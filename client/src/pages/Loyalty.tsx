import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Award,
  CheckCircle,
  Gift,
  Phone,
  ShoppingCart,
  Star,
  TrendingUp,
  Trophy,
  Truck,
  User,
  Zap,
} from "lucide-react";

const tiers = [
  {
    name: "Silver",
    threshold: "$0+",
    benefits: ["Standard pricing", "Email support"],
    icon: Award,
    color: "text-slate-500",
    bgColor: "bg-slate-100",
  },
  {
    name: "Gold",
    threshold: "$25,000+",
    benefits: ["5% volume rebate", "Priority fulfillment", "Phone support"],
    icon: Trophy,
    color: "text-amber-500",
    bgColor: "bg-amber-100",
    current: true,
  },
  {
    name: "Platinum",
    threshold: "$100,000+",
    benefits: [
      "8% volume rebate",
      "Same-day delivery",
      "Dedicated account manager",
      "Exclusive products",
    ],
    icon: Star,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
];

const currentBenefits = [
  { icon: Gift, label: "5% volume rebate" },
  { icon: Truck, label: "Priority fulfillment" },
  { icon: Phone, label: "Phone support" },
];

export default function Loyalty() {
  const currentSpend = 45680;
  const nextTierThreshold = 100000;
  const progress = (currentSpend / nextTierThreshold) * 100;
  const remaining = nextTierThreshold - currentSpend;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Loyalty Program</h1>
          <p className="text-muted-foreground mt-1">
            Track your tier status and unlock exclusive benefits.
          </p>
        </div>

        {/* Current Status Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-700">Current Tier</p>
                  <h2 className="text-3xl font-bold text-amber-800">Gold</h2>
                  <p className="text-sm text-amber-600 mt-1">Member since January 2025</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-amber-700">Total Spend</p>
                <p className="text-3xl font-bold text-amber-800">
                  ${currentSpend.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-700">Progress to Platinum</span>
                <span className="text-sm text-amber-600">
                  ${remaining.toLocaleString()} to go
                </span>
              </div>
              <Progress value={progress} className="h-3 bg-amber-200" />
              <p className="text-xs text-amber-600 mt-2">
                Spend ${nextTierThreshold.toLocaleString()} total to unlock Platinum tier benefits
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              Your Gold Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {currentBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="font-medium text-amber-800">{benefit.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Tiers */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">All Tiers</h3>
          <div className="grid grid-cols-3 gap-4">
            {tiers.map((tier) => {
              const TierIcon = tier.icon;
              return (
                <Card
                  key={tier.name}
                  className={cn(
                    "relative overflow-hidden",
                    tier.current && "ring-2 ring-amber-400"
                  )}
                >
                  {tier.current && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-amber-500 text-white border-0">Current</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", tier.bgColor)}>
                        <TierIcon className={cn("w-6 h-6", tier.color)} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tier.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tier.threshold} spend</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className={cn("w-4 h-4", tier.color)} />
                          <span className="text-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">48</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold text-foreground">$952</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volume Rebate</p>
                  <p className="text-2xl font-bold text-foreground">5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Tier</p>
                  <p className="text-2xl font-bold text-amber-600">Gold</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
