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
import DealerQuotations from "./pages/dealer/Quotations";
import DealerPurchaseOrders from "./pages/dealer/PurchaseOrders";
import DealerInvoices from "./pages/dealer/Invoices";

// Admin Console Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminDealers from "./pages/admin/Dealers";
import AdminAgents from "./pages/admin/Agents";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminQuotations from "./pages/admin/Quotations";
import AdminPurchaseOrders from "./pages/admin/PurchaseOrders";
import AdminDeliveryOrders from "./pages/admin/DeliveryOrders";
import AdminInvoices from "./pages/admin/Invoices";
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
      <Route path="/dealer/quotations" component={DealerQuotations} />
      <Route path="/dealer/purchase-orders" component={DealerPurchaseOrders} />
      <Route path="/dealer/invoices" component={DealerInvoices} />
      <Route path="/dealer/orders" component={DealerOrders} />
      <Route path="/dealer/loyalty" component={DealerLoyalty} />
      <Route path="/dealer/chat" component={DealerChat} />
      
      {/* Admin Console Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/quotations" component={AdminQuotations} />
      <Route path="/admin/purchase-orders" component={AdminPurchaseOrders} />
      <Route path="/admin/delivery-orders" component={AdminDeliveryOrders} />
      <Route path="/admin/invoices" component={AdminInvoices} />
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
