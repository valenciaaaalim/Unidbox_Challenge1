import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { NotificationPanel } from "./NotificationPanel";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

const dealerNavigation = [
  { name: "Dashboard", href: "/dealer", icon: LayoutDashboard },
  { name: "AI Agent", href: "/dealer/chat", icon: MessageSquare },
  { name: "Catalog", href: "/dealer/catalog", icon: Search },
  { name: "Cart", href: "/dealer/cart", icon: ShoppingCart },
  { name: "Orders", href: "/dealer/orders", icon: Truck },
  { name: "My Products", href: "/dealer/lifecycle", icon: Package, badge: "New" },
  { name: "Loyalty", href: "/dealer/loyalty", icon: Star },
];

const adminNavigation = [
  { name: "Analytics", href: "/admin", icon: BarChart3 },
  { name: "Lifecycle Insights", href: "/admin/lifecycle", icon: Package },
  { name: "Dealers", href: "/admin/dealers", icon: Users },
  { name: "Engagement Queue", href: "/admin/engagement", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function DashboardLayout({ children, isAdmin = false }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navigation = isAdmin ? adminNavigation : dealerNavigation;
  const baseHref = isAdmin ? "/admin" : "/dealer";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Customer Portal Style */}
      <aside className={cn(
        "w-60 border-r border-border flex flex-col fixed h-screen",
        isAdmin ? "bg-slate-900" : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}>
        {/* Logo - Matching Customer Portal */}
        <div className={cn(
          "h-16 flex items-center px-4 border-b",
          isAdmin ? "border-slate-700" : "border-border"
        )}>
          <Link href={baseHref} className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isAdmin ? "bg-indigo-600" : "bg-primary"
            )}>
              <span className="text-primary-foreground font-bold text-lg">U</span>
            </div>
            <div>
              <h1 className={cn(
                "font-bold text-xl",
                isAdmin ? "text-white" : "text-foreground"
              )}>UNiDBox</h1>
              <p className={cn(
                "text-xs",
                isAdmin ? "text-slate-400" : "text-muted-foreground"
              )}>
                {isAdmin ? "Admin Portal" : "Dealer Portal"}
              </p>
            </div>
          </Link>
        </div>

        {/* Portal Switcher */}
        <div className={cn(
          "px-4 py-3 border-b",
          isAdmin ? "border-slate-700" : "border-border"
        )}>
          <Link href={isAdmin ? "/dealer" : "/admin"}>
            <Button 
              variant="outline" 
              className={cn(
                "w-full justify-start gap-2",
                isAdmin 
                  ? "border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white" 
                  : "hover:bg-primary/10 hover:text-primary hover:border-primary"
              )}
            >
              {isAdmin ? (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Switch to Dealer View
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  Switch to Admin View
                </>
              )}
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== baseHref && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? isAdmin 
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-primary text-primary-foreground shadow-sm"
                      : isAdmin
                        ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive ? "" : isAdmin ? "" : "text-muted-foreground"
                  )} />
                  {item.name}
                  {"badge" in item && (item as { badge?: string }).badge && (
                    <Badge variant="secondary" className="ml-auto text-xs bg-primary/10 text-primary border-0">
                      {(item as { badge?: string }).badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className={cn(
          "p-4 border-t",
          isAdmin ? "border-slate-700" : "border-border"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                isAdmin ? "hover:bg-slate-800" : "hover:bg-accent"
              )}>
                <Avatar className="w-9 h-9 border">
                  <AvatarFallback className={cn(
                    "font-medium text-sm",
                    isAdmin ? "bg-indigo-600 text-white" : "bg-primary text-primary-foreground"
                  )}>
                    {isAdmin ? "AD" : "SL"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate leading-none",
                    isAdmin ? "text-white" : "text-foreground"
                  )}>
                    {isAdmin ? "Admin User" : "Steven Lim"}
                  </p>
                  <p className={cn(
                    "text-xs truncate mt-1.5 flex items-center gap-1",
                    isAdmin ? "text-indigo-400" : "text-primary"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isAdmin ? "bg-indigo-400" : "bg-primary"
                    )} />
                    {isAdmin ? "Administrator" : "Gold Tier"}
                  </p>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4",
                  isAdmin ? "text-slate-400" : "text-muted-foreground"
                )} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Notification Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60">
        {/* Top Header - Customer Portal Style */}
        <header className={cn(
          "h-16 border-b sticky top-0 z-40 flex items-center justify-between px-6",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        )}>
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              {navigation.find((n) => 
                location === n.href || (n.href !== baseHref && location.startsWith(n.href))
              )?.name || (isAdmin ? "Analytics" : "Dashboard")}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10"
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {isAdmin ? "5" : "3"}
                </span>
              </Button>
              
              {notificationOpen && (
                <NotificationPanel onClose={() => setNotificationOpen(false)} isAdmin={isAdmin} />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
