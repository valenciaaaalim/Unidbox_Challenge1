import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Bot,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sparkles,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { adminMetrics, orders } from "@/lib/mockData";

/*
 * AdminLayout - Sidebar navigation for Admin Console
 * Design: Premium SaaS Elegance with real-time indicators
 */

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/orders", label: "Orders", icon: ClipboardList, badge: orders.length },
  { path: "/admin/dealers", label: "Dealers", icon: Users, alert: adminMetrics.atRiskDealers.length > 0 },
  { path: "/admin/agents", label: "AI Agents", icon: Bot },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                <p className="text-xs text-muted-foreground">Admin Console</p>
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
                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant={isActive ? "secondary" : "default"} className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* AI Status */}
        <div className="p-4 border-t border-border">
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-primary/10 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium">AI Agents Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">6 agents running</span>
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                AA
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Admin Alice</p>
              <span className="text-xs text-muted-foreground">Operations Manager</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            </Button>
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
              <span className="font-bold">UnidBox Admin</span>
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
                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
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
