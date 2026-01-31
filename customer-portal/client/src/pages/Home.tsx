import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { Package, Zap, TrendingUp, Award, Search, MessageCircle, User, LogOut, ShoppingBag } from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleProductClick = (productId: number) => {
    setLocation(`/shop?product=${productId}`);
  };

  const handleNavigateToDashboard = () => {
    setLocation("/track-order");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">U</span>
            </div>
            <div>
              <h1 className="font-bold text-xl">UNiDBox</h1>
              <p className="text-xs text-muted-foreground">Home Solutions</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/">
              <a className="text-sm font-medium hover:text-primary transition-colors">Home</a>
            </Link>
            <Link href="/products">
              <a className="text-sm font-medium hover:text-primary transition-colors">Products</a>
            </Link>
            <Link href="/track-order">
              <a className="text-sm font-medium hover:text-primary transition-colors">Track Order</a>
            </Link>
            <Link href="/shop">
              <Button size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat Now
              </Button>
            </Link>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user?.name || "Account"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/orders")}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await logoutMutation.mutateAsync();
                      window.location.reload();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" variant="outline" onClick={() => window.location.href = getLoginUrl()}>
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
                AI-Powered Ordering
              </div>
              <h1 className="text-5xl font-bold tracking-tight mb-6">
                Your One-Stop Solution for{" "}
                <span className="text-primary">Hardware & Home Essentials</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Experience intelligent ordering with our AI assistant. Get instant quotes, 
                product recommendations, and real-time inventory updates—all in one conversation.
              </p>
              <div className="flex gap-4">
                <Link href="/shop">
                  <Button size="lg" className="text-base">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Ordering Now
                  </Button>
                </Link>
                <Link href="/track-order">
                  <Button size="lg" variant="outline" className="text-base">
                    <Search className="w-5 h-5 mr-2" />
                    Track My Order
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Package className="w-64 h-64 text-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5+</div>
              <div className="text-sm text-muted-foreground">Outlets Across Singapore</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Products Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">AI Assistant</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">Fast</div>
              <div className="text-sm text-muted-foreground">Delivery Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose UNiDBox?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of hardware shopping with our intelligent ordering platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Chat</CardTitle>
                <CardDescription>
                  Get instant product recommendations and quotes through our intelligent chat assistant
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Real-Time Inventory</CardTitle>
                <CardDescription>
                  Check stock availability instantly and get notified when products are back in stock
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Smart Suggestions</CardTitle>
                <CardDescription>
                  Receive personalized product alternatives when items are out of stock
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Quality Assured</CardTitle>
                <CardDescription>
                  Trusted brands and quality products from 3M, Makita, Yale, and more
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-lg text-muted-foreground">
              Browse our extensive range of hardware and home essentials
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/products?category=Cable Management">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Cable Management</CardTitle>
                  <CardDescription>
                    Organize your workspace with our cable boxes, trays, and accessories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Browse Products →
                  </Button>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products?category=Power Solutions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Power Solutions</CardTitle>
                  <CardDescription>
                    Power strips, surge protectors, and smart power management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Browse Products →
                  </Button>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products?category=Cable Accessories">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Cable Accessories</CardTitle>
                  <CardDescription>
                    Cable ties, clips, sleeves, and other essential accessories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Browse Products →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Chat with our AI assistant now and experience the future of hardware ordering
          </p>
          <Link href="/shop">
            <Button size="lg" variant="secondary" className="text-base">
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Chatting Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">U</span>
                </div>
                <div>
                  <h3 className="font-bold">UNiDBox</h3>
                  <p className="text-xs text-muted-foreground">Home Solutions</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your one-stop solution for hardware & home essentials
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/"><a className="hover:text-primary">Home</a></Link></li>
                <li><Link href="/products"><a className="hover:text-primary">Products</a></Link></li>
                <li><Link href="/track-order"><a className="hover:text-primary">Track Order</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>+65 9456 6653</li>
                <li>info@unidbox.com</li>
                <li>469 MacPherson Rd, Singapore</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Business Hours</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Monday - Friday: 9am - 6pm</li>
                <li>Saturday: 9am - 3pm</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2026 UNiDBox Hardware. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget 
        onProductClick={handleProductClick}
        onNavigateToDashboard={handleNavigateToDashboard}
      />
    </div>
  );
}
