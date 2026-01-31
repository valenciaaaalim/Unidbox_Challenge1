import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { User, Mail, Calendar, ShoppingBag, ArrowLeft, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please login to view your profile and order history
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
              <User className="w-4 h-4 mr-2" />
              Login to Continue
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-semibold text-lg">My Account</h1>
          </div>
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">UNiDBox</h1>
                <p className="text-xs text-muted-foreground">Home Solutions</p>
              </div>
            </div>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{user?.name || "User"}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
                <Badge variant="secondary" className="mt-2">
                  Loyal Customer
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setLocation("/profile")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setLocation("/orders")}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  My Orders
                </Button>
                <Separator />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal details and account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Full Name</span>
                    </div>
                    <p className="font-medium">{user?.name || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </div>
                    <p className="font-medium">{user?.email || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Member Since</span>
                    </div>
                    <p className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Last Login</span>
                    </div>
                    <p className="font-medium">
                      {user?.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account and orders</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/orders")}>
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">View Orders</div>
                    <div className="text-xs text-muted-foreground">Track your purchases</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/track-order")}>
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Track Order</div>
                    <div className="text-xs text-muted-foreground">Search by order number</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/shop")}>
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Start Shopping</div>
                    <div className="text-xs text-muted-foreground">Browse products with AI</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/products")}>
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">All Products</div>
                    <div className="text-xs text-muted-foreground">View full catalog</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Loyalty Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Benefits</CardTitle>
                <CardDescription>Exclusive perks for loyal customers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="font-medium">Priority Support</p>
                      <p className="text-sm text-muted-foreground">Get faster responses from our support team</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="font-medium">Order History</p>
                      <p className="text-sm text-muted-foreground">Access all your past orders and reorder easily</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="font-medium">Personalized Recommendations</p>
                      <p className="text-sm text-muted-foreground">AI assistant learns your preferences over time</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="font-medium">Saved Addresses</p>
                      <p className="text-sm text-muted-foreground">Checkout faster with saved delivery addresses</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
