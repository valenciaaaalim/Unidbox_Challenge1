import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Landing & Auth
import Home from "./pages/Home";

// Dealer Portal Pages
import DealerDashboard from "./pages/dealer/Dashboard";
import DealerCatalog from "./pages/dealer/Catalog";
import DealerCart from "./pages/dealer/Cart";
import DealerOrders from "./pages/dealer/Orders";
import DealerLoyalty from "./pages/dealer/Loyalty";
import DealerChat from "./pages/dealer/Chat";

// Admin Console Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminDealers from "./pages/admin/Dealers";
import AdminAgents from "./pages/admin/Agents";
import AdminAnalytics from "./pages/admin/Analytics";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      {/* Landing Page */}
      <Route path="/" component={Home} />
      
      {/* Dealer Portal Routes */}
      <Route path="/dealer" component={DealerDashboard} />
      <Route path="/dealer/catalog" component={DealerCatalog} />
      <Route path="/dealer/cart" component={DealerCart} />
      <Route path="/dealer/orders" component={DealerOrders} />
      <Route path="/dealer/loyalty" component={DealerLoyalty} />
      <Route path="/dealer/chat" component={DealerChat} />
      
      {/* Admin Console Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/dealers" component={AdminDealers} />
      <Route path="/admin/agents" component={AdminAgents} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
