import { useState } from "react";
import { motion } from "framer-motion";
import DealerLayout from "@/components/layouts/DealerLayout";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Bot,
  Sparkles,
  ShoppingCart,
  Package,
  TrendingUp,
  FileText,
  HelpCircle,
} from "lucide-react";

/*
 * Dealer Chat - AI Sales Agent Chatbot
 * Design: Premium SaaS Elegance
 * Features: AI-powered chat for product inquiries, orders, and support
 */

const SYSTEM_PROMPT = `You are UnidBox AI Sales Agent, a helpful and knowledgeable assistant for wholesale dealers. You help dealers with:

1. **Product Inquiries**: Answer questions about products, pricing, specifications, and availability
2. **Order Assistance**: Help place orders, suggest quantities, and recommend related products
3. **Order Status**: Check on existing orders and delivery status
4. **Recommendations**: Suggest products based on purchase history and current needs
5. **Marketing Support**: Generate social media posts and promotional content for products

Available Products (use this for pricing/availability questions):
- CAT6 Ethernet Cable 100m (CBL-CAT6-100): $89.99/roll - In Stock
- RJ45 Connectors 100 pack (CON-RJ45-100): $24.99/pack - In Stock
- Professional Crimping Tool (TLS-CRIMP-01): $45.99/piece - In Stock
- Cable Tester Pro (TLS-TESTER-01): $79.99/piece - Low Stock (5 left)
- Insulated Work Gloves L (SAF-GLOVES-L): $18.99/pair - In Stock
- Safety Glasses Clear (SAF-GLASSES-01): $12.99/piece - In Stock
- LED Panel Light 60x60cm (LGT-LED-PANEL): $54.99/piece - In Stock
- LED Driver 40W (LGT-DRIVER-40W): $19.99/piece - In Stock

Cross-sell recommendations:
- CAT6 cables → RJ45 connectors, crimping tool, cable tester
- LED panels → LED drivers (always recommend together)
- Tools → Safety gloves and glasses

Current dealer: Steven Lim (Gold Tier - 5% volume rebate)
Recent orders: ORD-2026-0041 (Delivered), ORD-2026-0038 (Delivered)

Be friendly, professional, and proactive in suggesting relevant products. Always mention applicable discounts for Gold tier dealers. When helping with orders, confirm quantities and calculate totals.`;

const suggestedPrompts = [
  "What's the price for CAT6 cables?",
  "I need to restock my usual items",
  "Recommend products for a cabling project",
  "Check my order status",
  "Generate a social post for LED panels",
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
    description: "Place orders conversationally",
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
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: SYSTEM_PROMPT },
  ]);

  const chatMutation = trpc.chat.send.useMutation({
    onSuccess: (response) => {
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

  const handleSendMessage = (content: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    chatMutation.mutate({ messages: newMessages });
  };

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
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-200"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                Online
              </Badge>
            </div>

            {/* Chat Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AIChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={chatMutation.isPending}
                placeholder="Ask about products, place orders, or get recommendations..."
                height="calc(100vh - 280px)"
                emptyStateMessage="Hi Steven! I'm your AI Sales Agent. How can I help you today?"
                suggestedPrompts={suggestedPrompts}
                className="shadow-lg"
              />
            </motion.div>
          </div>

          {/* Sidebar - Capabilities */}
          <div className="space-y-6">
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
                    Ask "restock my usual items" for quick reorders
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Mention project type for tailored recommendations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Request marketing content for any product
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
