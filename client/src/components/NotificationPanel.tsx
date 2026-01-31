import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  DollarSign,
  MessageSquare,
  Package,
  TrendingUp,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface NotificationPanelProps {
  onClose: () => void;
  isAdmin?: boolean;
}

interface Notification {
  id: string;
  type: "delivery" | "checkin" | "maintenance" | "reorder" | "eol" | "revenue" | "dealer" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const dealerNotifications: Notification[] = [
  {
    id: "1",
    type: "delivery",
    title: "Order Delivered",
    message: "Your order ORD-2026-0041 has been delivered successfully.",
    time: "2 hours ago",
    read: false,
    actionUrl: "/dealer/orders",
  },
  {
    id: "2",
    type: "reorder",
    title: "Reorder Reminder",
    message: "Based on your usage, you'll need more RJ45 Connectors soon.",
    time: "Yesterday",
    read: false,
    actionUrl: "/dealer/lifecycle",
  },
  {
    id: "3",
    type: "maintenance",
    title: "Maintenance Due",
    message: "Time to inspect your CAT6 cable runs for wear and damage.",
    time: "3 days ago",
    read: false,
    actionUrl: "/dealer/lifecycle",
  },
  {
    id: "4",
    type: "checkin",
    title: "How's it going?",
    message: "We'd love to hear how your recent purchase is working out.",
    time: "1 week ago",
    read: true,
  },
];

const adminNotifications: Notification[] = [
  {
    id: "a1",
    type: "alert",
    title: "High Priority Engagement",
    message: "Cable Connect Co has 15 products at EOL with no recent orders.",
    time: "1 hour ago",
    read: false,
    actionUrl: "/admin/engagement",
  },
  {
    id: "a2",
    type: "revenue",
    title: "Revenue Opportunity",
    message: "$4,200 potential from dealers with expiring warranties.",
    time: "3 hours ago",
    read: false,
    actionUrl: "/admin",
  },
  {
    id: "a3",
    type: "dealer",
    title: "Dealer Needs Attention",
    message: "TechPro Solutions hasn't ordered in 12 days.",
    time: "Yesterday",
    read: false,
    actionUrl: "/admin/dealers",
  },
  {
    id: "a4",
    type: "maintenance",
    title: "Fleet Health Alert",
    message: "Safety equipment category dropped below 70% healthy.",
    time: "2 days ago",
    read: true,
    actionUrl: "/admin",
  },
  {
    id: "a5",
    type: "checkin",
    title: "Weekly Report Ready",
    message: "Your lifecycle analytics report for this week is available.",
    time: "3 days ago",
    read: true,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "delivery":
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case "checkin":
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case "maintenance":
      return <Wrench className="w-5 h-5 text-amber-500" />;
    case "reorder":
      return <Package className="w-5 h-5 text-orange-500" />;
    case "eol":
      return <Clock className="w-5 h-5 text-rose-500" />;
    case "revenue":
      return <DollarSign className="w-5 h-5 text-emerald-500" />;
    case "dealer":
      return <Users className="w-5 h-5 text-blue-500" />;
    case "alert":
      return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

export function NotificationPanel({ onClose, isAdmin = false }: NotificationPanelProps) {
  const notifications = isAdmin ? adminNotifications : dealerNotifications;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const viewAllUrl = isAdmin ? "/admin" : "/dealer/notifications";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-12 w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="font-semibold text-foreground">
              {isAdmin ? "Admin Alerts" : "Notifications"}
            </span>
            {unreadCount > 0 && (
              <span className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                isAdmin 
                  ? "bg-indigo-600 text-white" 
                  : "bg-primary text-primary-foreground"
              )}>
                {unreadCount} new
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                  !notification.read && (isAdmin ? "bg-indigo-50" : "bg-primary/5")
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm",
                        !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground"
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
                          isAdmin ? "bg-indigo-600" : "bg-primary"
                        )} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/30">
          <Link href={viewAllUrl}>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full",
                isAdmin 
                  ? "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" 
                  : "text-primary hover:text-primary hover:bg-primary/10"
              )}
            >
              {isAdmin ? "View Analytics Dashboard" : "View All Notifications"}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
