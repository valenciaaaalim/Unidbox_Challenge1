import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, Package, Send, ShoppingCart, User } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  products?: {
    name: string;
    sku: string;
    price: number;
    image: string;
  }[];
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello Steven! 👋 I'm your UnidBox AI assistant. How can I help you today? I can help you find products, check stock availability, place orders, or answer questions about your account.",
    timestamp: "10:00 AM",
  },
  {
    id: "2",
    role: "user",
    content: "I need some ethernet cables for a new installation project",
    timestamp: "10:01 AM",
  },
  {
    id: "3",
    role: "assistant",
    content: "Great! I'd recommend our CAT6 Ethernet Cable for most installations. Here are some options based on your past orders:",
    timestamp: "10:01 AM",
    products: [
      {
        name: "CAT6 Ethernet Cable 100m",
        sku: "CBL-CAT6-100",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
      },
      {
        name: "CAT6 Ethernet Cable 50m",
        sku: "CBL-CAT6-50",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
      },
    ],
  },
  {
    id: "4",
    role: "user",
    content: "I'll take 10 of the 100m cables",
    timestamp: "10:02 AM",
  },
  {
    id: "5",
    role: "assistant",
    content: "Perfect! I've added 10x CAT6 Ethernet Cable 100m to your cart. Based on your order history, you usually also need RJ45 connectors with these cables. Would you like me to add those as well? You typically order 5 packs of 100 connectors.",
    timestamp: "10:02 AM",
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand. Let me help you with that. Based on your request, I can provide recommendations or process your order. Is there anything specific you'd like me to do?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)] flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">UnidBox AI Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Always here to help with your orders
            </p>
          </div>
          <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-0">
            Online
          </Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback
                    className={cn(
                      message.role === "assistant"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[70%] space-y-2",
                    message.role === "user" && "items-end"
                  )}
                >
                  <Card
                    className={cn(
                      message.role === "assistant"
                        ? "bg-muted/50"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm">{message.content}</p>
                    </CardContent>
                  </Card>

                  {/* Product Cards */}
                  {message.products && (
                    <div className="space-y-2">
                      {message.products.map((product) => (
                        <Card key={product.sku} className="overflow-hidden">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm text-foreground">
                                  {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {product.sku}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-foreground">
                                  ${product.price.toFixed(2)}
                                </p>
                                <Button size="sm" variant="outline" className="mt-1">
                                  <ShoppingCart className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <p
                    className={cn(
                      "text-xs text-muted-foreground",
                      message.role === "user" && "text-right"
                    )}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="pt-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!inputValue.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Package className="w-3 h-3 mr-1" />
              Check Stock
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <ShoppingCart className="w-3 h-3 mr-1" />
              View Cart
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
