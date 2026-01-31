import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DealerLayout from "@/components/layouts/DealerLayout";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Bot,
  Sparkles,
  ShoppingCart,
  Package,
  TrendingUp,
  FileText,
  HelpCircle,
  CheckCircle,
  Loader2,
  History,
  Plus,
} from "lucide-react";

/*
 * Dealer Chat - AI Sales Agent Chatbot
 * Design: Premium SaaS Elegance
 * Features: AI-powered chat with Add to Cart, Order Placement, and Chat History
 */

const suggestedPrompts = [
  "What's the price for CAT6 cables?",
  "I need to restock my usual items",
  "Recommend products for a cabling project",
  "Add 5 CAT6 cables to my cart",
  "Place my order",
  "Check my order status",
];

const capabilities = [
  {
    icon: Package,
    title: "Product Info",
    description: "Pricing, specs, availability",
  },
  {
    icon: ShoppingCart,
    title: "Quick Orders",
    description: "Add to cart & checkout via chat",
  },
  {
    icon: TrendingUp,
    title: "Smart Suggestions",
    description: "AI-powered recommendations",
  },
  {
    icon: FileText,
    title: "Marketing Help",
    description: "Generate promo content",
  },
];

export default function DealerChat() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const utils = trpc.useUtils();

  // Get or create chat session
  const sessionMutation = trpc.chat.getOrCreateSession.useMutation({
    onSuccess: (session) => {
      setSessionId(session.sessionId);
    },
  });

  // Get chat sessions for history
  const { data: chatSessions } = trpc.chat.getSessions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get messages for current session
  const { data: sessionMessages } = trpc.chat.getMessages.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId && isAuthenticated }
  );

  // Load session messages when available
  useEffect(() => {
    if (sessionMessages && sessionMessages.length > 0) {
      const loadedMessages: Message[] = sessionMessages.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }));
      setMessages(loadedMessages);
    }
  }, [sessionMessages]);

  // Initialize session on mount
  useEffect(() => {
    if (isAuthenticated && !sessionId) {
      sessionMutation.mutate();
    }
  }, [isAuthenticated]);

  // Cart mutation
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: (result) => {
      toast.success(result.message, {
        icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      });
      utils.cart.get.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to add to cart: ${error.message}`);
    },
  });

  // Order mutation
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (result) => {
      toast.success(result.message, {
        icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
        duration: 5000,
      });
      utils.cart.get.invalidate();
      utils.orders.list.invalidate();
      
      // Add confirmation message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `🎉 **Order Confirmed!**\n\n**Order Number:** ${result.order.orderNumber}\n**Delivery Order:** ${result.deliveryOrder.doNumber}\n**Total:** $${result.order.total}\n\nYour order has been confirmed and the Delivery Order has been generated. You can track your order in the Orders section.`,
        },
      ]);
    },
    onError: (error) => {
      toast.error(`Failed to place order: ${error.message}`);
    },
  });

  // Get cart for order placement
  const { data: cartData } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Chat mutation
  const chatMutation = trpc.chat.send.useMutation({
    onSuccess: async (response) => {
      // Process actions from AI response
      if (response.actions && response.actions.length > 0) {
        for (const action of response.actions) {
          if (action.type === "ADD_TO_CART" && action.sku && action.quantity) {
            // Execute add to cart
            addToCartMutation.mutate({
              sku: action.sku,
              quantity: action.quantity,
            });
          } else if (action.type === "PLACE_ORDER") {
            // Check if cart has items
            if (cartData && cartData.items.length > 0) {
              createOrderMutation.mutate({});
            } else {
              toast.error("Your cart is empty. Add items before placing an order.");
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.content,
        },
      ]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error. Please try again or contact support if the issue persists.",
        },
      ]);
    },
  });

  const handleSendMessage = useCallback((content: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    
    chatMutation.mutate({
      messages: newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      sessionId: sessionId || undefined,
    });
  }, [messages, sessionId, chatMutation]);

  // Create new session
  const handleNewSession = () => {
    setMessages([]);
    setSessionId(null);
    sessionMutation.mutate();
    setShowHistory(false);
  };

  // Load a previous session
  const handleLoadSession = (id: string) => {
    setSessionId(id);
    setShowHistory(false);
  };

  const isProcessing = chatMutation.isPending || addToCartMutation.isPending || createOrderMutation.isPending;

  return (
    <DealerLayout>
      <div className="p-6 lg:p-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Chat Area */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-violet-500" />
                  </div>
                  AI Sales Agent
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your intelligent assistant for ordering, inquiries, and support.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewSession}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-200"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  Online
                </Badge>
              </div>
            </div>

            {/* Chat History Panel */}
            <AnimatePresence>
              {showHistory && chatSessions && chatSessions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Previous Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {chatSessions.map((session) => (
                          <button
                            key={session.sessionId}
                            onClick={() => handleLoadSession(session.sessionId)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              sessionId === session.sessionId
                                ? "bg-primary/10 border border-primary/20"
                                : "bg-muted/50 hover:bg-muted"
                            }`}
                          >
                            <p className="font-medium text-sm truncate">
                              {session.title || "Untitled Chat"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </p>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AIChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isProcessing}
                placeholder="Ask about products, add to cart, or place an order..."
                height="calc(100vh - 320px)"
                emptyStateMessage={`Hi ${user?.name || "there"}! I'm your AI Sales Agent. How can I help you today?`}
                suggestedPrompts={suggestedPrompts}
                className="shadow-lg"
              />
            </motion.div>

            {/* Action Status */}
            <AnimatePresence>
              {(addToCartMutation.isPending || createOrderMutation.isPending) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {addToCartMutation.isPending && "Adding to cart..."}
                  {createOrderMutation.isPending && "Processing your order..."}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Capabilities */}
          <div className="space-y-6">
            {/* Cart Summary */}
            {isAuthenticated && cartData && cartData.items.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    Your Cart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {cartData.items.length} item(s)
                      </span>
                      <span className="font-semibold">${cartData.total.toFixed(2)}</span>
                    </div>
                    {cartData.discount > 0 && (
                      <div className="flex justify-between text-xs text-emerald-600">
                        <span>Tier Discount ({cartData.tierDiscount}%)</span>
                        <span>-${cartData.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Say "place my order" to checkout
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Capabilities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  What I Can Do
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {capabilities.map((cap) => {
                  const Icon = cap.icon;
                  return (
                    <div
                      key={cap.title}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cap.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {cap.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Say "add 5 CAT6 cables to cart" to add items
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Say "place my order" to checkout
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Your chat history is saved automatically
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Agent Status */}
            <Card className="bg-gradient-to-br from-violet-500/10 to-primary/10 border-violet-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">AI Agent Active</p>
                    <p className="text-xs text-muted-foreground">
                      Powered by advanced LLM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DealerLayout>
  );
}
