import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Lifecycle from "./pages/Lifecycle";
import Orders from "./pages/Orders";
import Loyalty from "./pages/Loyalty";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import AdminAnalytics from "./pages/AdminAnalytics";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dealer" />
      </Route>
      {/* Dealer Routes */}
      <Route path="/dealer" component={Dashboard} />
      <Route path="/dealer/lifecycle" component={Lifecycle} />
      <Route path="/dealer/orders" component={Orders} />
      <Route path="/dealer/loyalty" component={Loyalty} />
      <Route path="/dealer/catalog" component={Catalog} />
      <Route path="/dealer/cart" component={Cart} />
      <Route path="/dealer/chat" component={Chat} />
      <Route path="/dealer/notifications" component={Notifications} />
      {/* Admin Routes */}
      <Route path="/admin" component={AdminAnalytics} />
      <Route path="/admin/lifecycle" component={AdminAnalytics} />
      <Route path="/admin/dealers" component={AdminAnalytics} />
      <Route path="/admin/engagement" component={AdminAnalytics} />
      <Route path="/admin/settings" component={AdminAnalytics} />
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
