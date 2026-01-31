import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCircle,
  Clock,
  MessageSquare,
  Package,
  Settings,
  Wrench,
} from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  type: "delivery" | "checkin" | "maintenance" | "reorder" | "eol";
  title: string;
  message: string;
  time: string;
  date: string;
  read: boolean;
  actionUrl?: string;
}

const allNotifications: Notification[] = [
  {
    id: "1",
    type: "delivery",
    title: "Order Delivered",
    message: "Your order ORD-2026-0041 has been delivered successfully. All 15 items have been received at your registered address.",
    time: "2 hours ago",
    date: "Today",
    read: false,
    actionUrl: "/dealer/orders",
  },
  {
    id: "2",
    type: "reorder",
    title: "Reorder Reminder",
    message: "Based on your usage patterns, you'll likely need more RJ45 Connectors (100 pack) within the next 3 days. Would you like to reorder?",
    time: "Yesterday",
    date: "Yesterday",
    read: false,
    actionUrl: "/dealer/lifecycle",
  },
  {
    id: "3",
    type: "maintenance",
    title: "Maintenance Due",
    message: "It's time to inspect your CAT6 cable runs for wear and damage. Regular maintenance helps extend product lifespan.",
    time: "3 days ago",
    date: "Jan 28, 2026",
    read: false,
    actionUrl: "/dealer/lifecycle",
  },
  {
    id: "4",
    type: "checkin",
    title: "How's it going?",
    message: "We'd love to hear how your recent purchase of Network Switch 24-Port is working out. Your feedback helps us serve you better.",
    time: "1 week ago",
    date: "Jan 24, 2026",
    read: true,
  },
  {
    id: "5",
    type: "delivery",
    title: "Order Shipped",
    message: "Your order ORD-2026-0038 has been shipped and is on its way. Expected delivery: January 10, 2026.",
    time: "2 weeks ago",
    date: "Jan 17, 2026",
    read: true,
  },
  {
    id: "6",
    type: "eol",
    title: "Product End of Life Notice",
    message: "Your Cable Tester Pro is approaching end of life. Consider ordering a replacement to avoid workflow disruptions.",
    time: "2 weeks ago",
    date: "Jan 15, 2026",
    read: true,
    actionUrl: "/dealer/lifecycle",
  },
  {
    id: "7",
    type: "maintenance",
    title: "Firmware Update Available",
    message: "A new firmware update is available for your Network Switch 24-Port. Update to version 2.4.1 for improved performance.",
    time: "3 weeks ago",
    date: "Jan 10, 2026",
    read: true,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "delivery":
      return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100" };
    case "checkin":
      return { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-100" };
    case "maintenance":
      return { icon: Wrench, color: "text-amber-500", bg: "bg-amber-100" };
    case "reorder":
      return { icon: Package, color: "text-orange-500", bg: "bg-orange-100" };
    case "eol":
      return { icon: Clock, color: "text-rose-500", bg: "bg-rose-100" };
    default:
      return { icon: Bell, color: "text-muted-foreground", bg: "bg-muted" };
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(allNotifications);
  const [filter, setFilter] = useState("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = notification.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated on your orders, products, and maintenance reminders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "all" && "ring-2 ring-primary"
            )}
            onClick={() => setFilter("all")}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
                  <p className="text-xs text-muted-foreground">All</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "unread" && "ring-2 ring-primary"
            )}
            onClick={() => setFilter("unread")}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "delivery" && "ring-2 ring-emerald-500"
            )}
            onClick={() => setFilter("delivery")}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {notifications.filter((n) => n.type === "delivery").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "maintenance" && "ring-2 ring-amber-500"
            )}
            onClick={() => setFilter("maintenance")}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {notifications.filter((n) => n.type === "maintenance").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "reorder" && "ring-2 ring-orange-500"
            )}
            onClick={() => setFilter("reorder")}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {notifications.filter((n) => n.type === "reorder" || n.type === "eol").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Lifecycle</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardContent className="p-0">
            {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
              <div key={date}>
                <div className="px-4 py-2 bg-muted/50 border-b border-border">
                  <p className="text-sm font-medium text-muted-foreground">{date}</p>
                </div>
                <div className="divide-y divide-border">
                  {dateNotifications.map((notification) => {
                    const iconInfo = getNotificationIcon(notification.type);
                    const IconComponent = iconInfo.icon;
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                          !notification.read && "bg-primary/5"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-4">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", iconInfo.bg)}>
                            <IconComponent className={cn("w-5 h-5", iconInfo.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={cn(
                                  "text-sm",
                                  !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground"
                                )}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
