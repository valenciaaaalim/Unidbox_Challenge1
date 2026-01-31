import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ShoppingCart,
  TrendingUp,
  Bot,
  Trophy,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

/*
 * Home - Landing Page
 * Design: Premium SaaS Elegance
 * Purpose: Entry point with role selection (Dealer vs Admin)
 */

const features = [
  {
    icon: Bot,
    title: "AI-Powered Ordering",
    description: "Intelligent recommendations and predictive reordering based on your purchase history.",
  },
  {
    icon: Zap,
    title: "60-Second Orders",
    description: "Place orders in under a minute with our streamlined mobile-first interface.",
  },
  {
    icon: TrendingUp,
    title: "Smart Upselling",
    description: "Never miss essential items with AI-driven cross-sell suggestions.",
  },
  {
    icon: Trophy,
    title: "Loyalty Rewards",
    description: "Earn rebates and unlock exclusive benefits as you grow with us.",
  },
];

const stats = [
  { value: "70%", label: "Faster Processing" },
  { value: "10%", label: "Higher AOV" },
  { value: "200+", label: "Active Dealers" },
  { value: "24/7", label: "AI Availability" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">UnidBox</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dealer">
              <Button variant="ghost">Dealer Portal</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline">Admin Console</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-600 text-sm font-medium mb-6">
                <Bot className="w-4 h-4" />
                AI-Powered Wholesale Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Your AI Sales Agent for{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                  Smarter Wholesale
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Transform your wholesale ordering experience with intelligent recommendations, 
                predictive reordering, and automated fulfillment. Built for dealers who value 
                speed and efficiency.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/dealer">
                  <Button size="lg" className="gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Enter Dealer Portal
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Shield className="w-5 h-5" />
                    Admin Console
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-3xl blur-3xl" />
              <img
                src="/images/hero-dealer.png"
                alt="AI-Powered Wholesale Commerce"
                className="relative rounded-2xl shadow-2xl w-full"
              />
              {/* Floating AI Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">AI Agent Active</p>
                    <p className="text-xs text-muted-foreground">Analyzing patterns...</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-extrabold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Intelligent Features for Modern Dealers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI agents work around the clock to optimize your ordering experience, 
              increase your margins, and save you time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full card-hover border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-violet-600 p-12 md:p-16">
            <div className="absolute inset-0 bg-[url('/images/ai-agent.png')] bg-right bg-no-repeat bg-contain opacity-20" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Ordering?
              </h2>
              <p className="text-white/80 mb-8">
                Join 200+ dealers who have already upgraded to AI-powered wholesale ordering. 
                Experience faster processing, smarter recommendations, and better margins.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/dealer">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Clock className="w-5 h-5" />
                    Start Ordering Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">UnidBox AI Sales Agent</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Hackathon Prototype • AI For All Challenge 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
