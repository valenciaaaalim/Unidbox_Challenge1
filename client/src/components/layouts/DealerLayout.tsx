import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Trophy,
  LogOut,
  Menu,
  X,
  Sparkles,
  Bot,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { currentDealer, loyaltyTiers } from "@/lib/mockData";

/*
 * DealerLayout - Sidebar navigation for Dealer Portal
 * Design: Premium SaaS Elegance with glassmorphism accents
 */

const navItems = [
  { path: "/dealer", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dealer/chat", label: "AI Agent", icon: Bot, highlight: true },
  { path: "/dealer/catalog", label: "Catalog", icon: Package },
  { path: "/dealer/cart", label: "Cart", icon: ShoppingCart },
  { path: "/dealer/orders", label: "Orders", icon: ClipboardList },
  { path: "/dealer/loyalty", label: "Loyalty", icon: Trophy },
];

interface DealerLayoutProps {
  children: React.ReactNode;
}

export default function DealerLayout({ children }: DealerLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tierInfo = loyaltyTiers[currentDealer.tier];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">UnidBox</h1>
                <p className="text-xs text-muted-foreground">Dealer Portal</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {currentDealer.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{currentDealer.name}</p>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tierInfo.color }}
                />
                <span className="text-xs text-muted-foreground">{tierInfo.name} Tier</span>
              </div>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" className="w-full mt-2 justify-start text-muted-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">UnidBox</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-card border-b border-border p-4 space-y-1"
          >
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:overflow-auto">
        <div className="lg:hidden h-16" /> {/* Mobile header spacer */}
        {children}
      </main>
    </div>
  );
}
