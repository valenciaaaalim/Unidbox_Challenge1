import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  MessageCircle, 
  X, 
  Send, 
  Download, 
  LayoutDashboard,
  Loader2,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  productCards?: ProductCard[];
  suggestedActions?: SuggestedAction[];
}

interface ProductCard {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
  sku: string;
  reason?: string;
}

interface SuggestedAction {
  id: string;
  label: string;
  action: string;
  variant?: "default" | "secondary" | "outline";
  metadata?: Record<string, unknown>;
}

interface ChatWidgetProps {
  onProductClick?: (productId: number) => void;
  onNavigateToDashboard?: () => void;
}

export function ChatWidget({ onProductClick, onNavigateToDashboard }: ChatWidgetProps) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Personalized greeting based on authentication status
  const getInitialGreeting = () => {
    if (isAuthenticated && user?.name) {
      return `Hello ${user.name}! Welcome back to UNiDBox. I'm your AI assistant and I'm here to help you find the perfect products. How can I assist you today?`;
    }
    return "Hello! I'm your UNiDBox AI assistant. How can I help you today? I can help you find products, check inventory, and place orders.";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: getInitialGreeting(),
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const exportMutation = trpc.chat.exportToEmail.useMutation();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await sendMessageMutation.mutateAsync({
        messages: chatHistory,
        userQuery: inputValue
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        productCards: response.products?.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          stockQuantity: p.stockQuantity,
          sku: p.sku,
          reason: p.reason
        })),
        suggestedActions: response.suggestedActions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team at +65 9456 6653.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExportToEmail = async () => {
    if (!exportEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const result = await exportMutation.mutateAsync({
        email: exportEmail,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString()
        }))
      });

      toast.success(result.message);
      setShowExportDialog(false);
      setExportEmail("");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export chat. Please try again.");
    }
  };

  const handleActionClick = async (action: SuggestedAction) => {
    // Send the action label as a new message to continue the conversation
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: action.label,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await sendMessageMutation.mutateAsync({
        messages: chatHistory,
        userQuery: action.label
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        productCards: response.products?.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          stockQuantity: p.stockQuantity,
          sku: p.sku,
          reason: p.reason
        })),
        suggestedActions: response.suggestedActions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <>
      <Card className="fixed right-0 top-0 h-[100vh] w-full md:w-[400px] lg:w-[30%] flex flex-col shadow-2xl z-50 rounded-none border-l overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">UNiDBox Assistant</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setShowExportDialog(true)}
              title="Export chat to email"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={onNavigateToDashboard}
              title="View my orders"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-2",
                  message.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {/* Product Cards */}
                {message.productCards && message.productCards.length > 0 && (
                  <div className="w-full space-y-2">
                    {message.productCards.map((product) => (
                      <Card
                        key={product.id}
                        className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onProductClick?.(product.id)}
                      >
                        <div className="flex gap-3">
                          <div className="w-20 h-20 bg-muted rounded flex-shrink-0 overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                              {product.name}
                            </h4>
                            {product.reason && (
                              <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                                {product.reason}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mb-1">
                              SKU: {product.sku}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(product.price)}
                              </span>
                              {product.stockQuantity > 0 ? (
                                <Badge variant="secondary" className="text-xs">
                                  In Stock
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Suggested Actions */}
                {message.suggestedActions && message.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.suggestedActions.map((action) => (
                      <Button
                        key={action.id}
                        variant={action.variant || "outline"}
                        size="sm"
                        onClick={() => handleActionClick(action)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI is typing...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask me anything about products..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1"
              disabled={isTyping}
            />
            <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </Card>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Chat to Email</DialogTitle>
            <DialogDescription>
              Enter your email address to receive a copy of this conversation
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="email" className="mb-2 block">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={exportEmail}
              onChange={(e) => setExportEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportToEmail} disabled={exportMutation.isPending}>
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
