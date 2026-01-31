import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, Message as LLMMessage } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getProductBySku,
  getProductById,
  getAllProducts,
  createOrder,
  getOrderById,
  getOrderByNumber,
  getUserOrders,
  updateOrderStatus,
  createDeliveryOrder,
  getDeliveryOrderByOrderId,
  createChatSession,
  getChatSession,
  getUserChatSessions,
  getActiveSession,
  addChatMessage,
  getSessionMessages,
  getRecentMessages,
  updateChatSessionSummary,
} from "./db";

// Message schema for chat
const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

// Product data for AI context (mock data for demo)
const MOCK_PRODUCTS = [
  { sku: "CBL-CAT6-100", name: "CAT6 Ethernet Cable 100m", price: "89.99", stock: 150, category: "Cabling" },
  { sku: "CON-RJ45-100", name: "RJ45 Connectors 100 pack", price: "24.99", stock: 500, category: "Connectors" },
  { sku: "TLS-CRIMP-01", name: "Professional Crimping Tool", price: "45.99", stock: 75, category: "Tools" },
  { sku: "TLS-TESTER-01", name: "Cable Tester Pro", price: "79.99", stock: 5, category: "Tools" },
  { sku: "SAF-GLOVES-L", name: "Insulated Work Gloves L", price: "18.99", stock: 200, category: "Safety" },
  { sku: "SAF-GLASSES-01", name: "Safety Glasses Clear", price: "12.99", stock: 300, category: "Safety" },
  { sku: "LED-PANEL-60", name: "LED Panel Light 60x60cm", price: "65.99", stock: 80, category: "Lighting" },
  { sku: "LED-DRIVER-01", name: "LED Driver 40W", price: "22.99", stock: 120, category: "Lighting" },
  { sku: "CBL-HDMI-5M", name: "HDMI Cable 5m Premium", price: "34.99", stock: 200, category: "Cabling" },
  { sku: "SWT-8PORT", name: "8-Port Gigabit Switch", price: "89.99", stock: 45, category: "Networking" },
];

// Build product context for AI
function getProductContext(): string {
  return `
PRODUCT CATALOG:
${MOCK_PRODUCTS.map(p => `- ${p.name} (SKU: ${p.sku}) - $${p.price} - Stock: ${p.stock} units - Category: ${p.category}`).join('\n')}

CROSS-SELL RECOMMENDATIONS:
- CAT6 cables pair with: RJ45 Connectors, Crimping Tool, Cable Tester
- LED Panels pair with: LED Drivers
- Networking equipment pairs with: Ethernet cables, Cable Tester
- All installation work should include: Safety Gloves, Safety Glasses
`;
}

// System prompt for AI Sales Agent
function getSystemPrompt(dealerName: string, dealerTier: string): string {
  return `You are the UnidBox AI Sales Agent, an intelligent assistant for wholesale dealers. You help dealers with:
1. Product inquiries (pricing, availability, specifications)
2. Placing orders and managing their cart
3. Providing smart product recommendations
4. Checking order status
5. Generating marketing content for their products

DEALER CONTEXT:
- Name: ${dealerName}
- Tier: ${dealerTier} (discount: ${dealerTier === 'gold' ? '5%' : dealerTier === 'platinum' ? '8%' : dealerTier === 'silver' ? '3%' : '0%'})

${getProductContext()}

RESPONSE GUIDELINES:
1. Be friendly, professional, and proactive
2. Always show both regular price AND discounted price for the dealer's tier
3. When recommending products, format as markdown tables with columns: Product, SKU, Unit Price, Tier Price, Notes
4. For project-based inquiries, suggest complete bundles including safety gear
5. Proactively suggest related products (cross-sell)
6. When a dealer wants to add items to cart, respond with a confirmation and include the action marker: [ACTION:ADD_TO_CART:SKU:QUANTITY]
7. When a dealer wants to place an order, confirm the items and include: [ACTION:PLACE_ORDER]
8. For order status inquiries, ask for the order number if not provided
9. Keep responses concise but informative
10. Use markdown formatting for better readability

SPECIAL COMMANDS:
- If user says "add to cart" or "I'll take X", include [ACTION:ADD_TO_CART:SKU:QUANTITY] in your response
- If user says "place order" or "checkout" or "confirm order", include [ACTION:PLACE_ORDER] in your response
- If user asks about their cart, include [ACTION:GET_CART] in your response
`;
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ PRODUCTS ROUTER ============
  products: router({
    list: publicProcedure.query(async () => {
      // Return mock products for demo
      return MOCK_PRODUCTS.map((p, index) => ({
        id: index + 1,
        ...p,
        description: `High-quality ${p.name} for professional use.`,
        imageUrl: null,
        relatedSkus: [],
      }));
    }),
    
    getBySku: publicProcedure
      .input(z.object({ sku: z.string() }))
      .query(async ({ input }) => {
        const product = MOCK_PRODUCTS.find(p => p.sku === input.sku);
        if (!product) return null;
        return {
          id: MOCK_PRODUCTS.indexOf(product) + 1,
          ...product,
          description: `High-quality ${product.name} for professional use.`,
          imageUrl: null,
          relatedSkus: [],
        };
      }),
  }),

  // ============ CART ROUTER ============
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const items = await getCartItems(ctx.user.id);
      
      // Calculate totals
      let subtotal = 0;
      const cartWithProducts = items.map(item => {
        const mockProduct = MOCK_PRODUCTS.find(p => p.sku === item.product?.sku);
        const price = mockProduct ? parseFloat(mockProduct.price) : 0;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;
        
        return {
          ...item,
          unitPrice: price,
          itemTotal,
        };
      });
      
      // Apply tier discount
      const tierDiscount = ctx.user.dealerTier === 'gold' ? 0.05 : 
                          ctx.user.dealerTier === 'platinum' ? 0.08 : 
                          ctx.user.dealerTier === 'silver' ? 0.03 : 0;
      const discount = subtotal * tierDiscount;
      const total = subtotal - discount;
      
      return {
        items: cartWithProducts,
        subtotal,
        discount,
        total,
        tierDiscount: tierDiscount * 100,
      };
    }),
    
    add: protectedProcedure
      .input(z.object({
        sku: z.string(),
        quantity: z.number().min(1).default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Find product by SKU
        const mockProduct = MOCK_PRODUCTS.find(p => p.sku === input.sku);
        if (!mockProduct) {
          throw new Error(`Product with SKU ${input.sku} not found`);
        }
        
        const productId = MOCK_PRODUCTS.indexOf(mockProduct) + 1;
        const cartItem = await addToCart(ctx.user.id, productId, input.quantity);
        
        return {
          success: true,
          item: cartItem,
          product: mockProduct,
          message: `Added ${input.quantity}x ${mockProduct.name} to cart`,
        };
      }),
    
    updateQuantity: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        quantity: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        await updateCartItemQuantity(input.itemId, input.quantity);
        return { success: true };
      }),
    
    remove: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input }) => {
        await removeFromCart(input.itemId);
        return { success: true };
      }),
    
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ============ ORDERS ROUTER ============
  orders: router({
    create: protectedProcedure
      .input(z.object({
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get cart items
        const cartItems = await getCartItems(ctx.user.id);
        if (cartItems.length === 0) {
          throw new Error("Cart is empty");
        }
        
        // Build order items
        let subtotal = 0;
        const orderItems = cartItems.map(item => {
          const mockProduct = MOCK_PRODUCTS.find(p => p.sku === item.product?.sku);
          const price = mockProduct ? parseFloat(mockProduct.price) : 0;
          const itemTotal = price * item.quantity;
          subtotal += itemTotal;
          
          return {
            productId: item.productId,
            sku: mockProduct?.sku || '',
            name: mockProduct?.name || '',
            quantity: item.quantity,
            unitPrice: price.toFixed(2),
            total: itemTotal.toFixed(2),
          };
        });
        
        // Calculate discount
        const tierDiscount = ctx.user.dealerTier === 'gold' ? 0.05 : 
                            ctx.user.dealerTier === 'platinum' ? 0.08 : 
                            ctx.user.dealerTier === 'silver' ? 0.03 : 0;
        const discount = subtotal * tierDiscount;
        const total = subtotal - discount;
        
        // Create order
        const order = await createOrder({
          userId: ctx.user.id,
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          total: total.toFixed(2),
          items: orderItems,
          notes: input.notes,
          status: 'confirmed',
        });
        
        // Create delivery order
        const deliveryOrder = await createDeliveryOrder(order.id);
        
        // Clear cart
        await clearCart(ctx.user.id);
        
        return {
          order,
          deliveryOrder,
          message: `Order ${order.orderNumber} confirmed! Delivery Order ${deliveryOrder.doNumber} has been generated.`,
        };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserOrders(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrderByNumber(input.orderNumber);
        if (!order) return null;
        
        const deliveryOrder = await getDeliveryOrderByOrderId(order.id);
        return { order, deliveryOrder };
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.id);
        if (!order) return null;
        
        const deliveryOrder = await getDeliveryOrderByOrderId(order.id);
        return { order, deliveryOrder };
      }),
  }),

  // ============ CHAT ROUTER ============
  chat: router({
    // Send a message and get AI response
    send: publicProcedure
      .input(z.object({
        messages: z.array(messageSchema),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { messages, sessionId } = input;
        
        // Get dealer context
        const dealerName = ctx.user?.name || "Dealer";
        const dealerTier = ctx.user?.dealerTier || "bronze";
        
        // Build LLM messages with system prompt
        const systemPrompt = getSystemPrompt(dealerName, dealerTier);
        const llmMessages: LLMMessage[] = [
          { role: "system", content: systemPrompt },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ];

        try {
          const response = await invokeLLM({ messages: llmMessages });

          const assistantMessage = response.choices[0]?.message;
          let content =
            typeof assistantMessage?.content === "string"
              ? assistantMessage.content
              : Array.isArray(assistantMessage?.content)
              ? assistantMessage.content
                  .filter((c): c is { type: "text"; text: string } => c.type === "text")
                  .map((c) => c.text)
                  .join("")
              : "I apologize, but I couldn't generate a response. Please try again.";

          // Parse actions from response
          const actions: Array<{ type: string; sku?: string; quantity?: number }> = [];
          
          // Check for ADD_TO_CART action
          const addToCartRegex = /\[ACTION:ADD_TO_CART:([A-Z0-9-]+):(\d+)\]/g;
          let match;
          while ((match = addToCartRegex.exec(content)) !== null) {
            actions.push({
              type: 'ADD_TO_CART',
              sku: match[1],
              quantity: parseInt(match[2]),
            });
          }
          
          // Check for PLACE_ORDER action
          if (content.includes('[ACTION:PLACE_ORDER]')) {
            actions.push({ type: 'PLACE_ORDER' });
          }
          
          // Check for GET_CART action
          if (content.includes('[ACTION:GET_CART]')) {
            actions.push({ type: 'GET_CART' });
          }
          
          // Remove action markers from displayed content
          content = content
            .replace(/\[ACTION:ADD_TO_CART:[A-Z0-9-]+:\d+\]/g, '')
            .replace(/\[ACTION:PLACE_ORDER\]/g, '')
            .replace(/\[ACTION:GET_CART\]/g, '')
            .trim();

          // Save messages to database if session exists and user is authenticated
          if (sessionId && ctx.user) {
            // Save user message
            const lastUserMessage = messages.filter(m => m.role === 'user').pop();
            if (lastUserMessage) {
              await addChatMessage({
                sessionId,
                role: 'user',
                content: lastUserMessage.content,
              });
            }
            
            // Save assistant message
            await addChatMessage({
              sessionId,
              role: 'assistant',
              content,
              metadata: actions.length > 0 ? { action: actions[0].type } : undefined,
            });
          }

          return {
            content,
            role: "assistant" as const,
            actions,
          };
        } catch (error) {
          console.error("LLM invocation error:", error);
          throw new Error("Failed to get AI response. Please try again.");
        }
      }),
    
    // Create a new chat session
    createSession: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const session = await createChatSession(ctx.user.id, input.title);
        return session;
      }),
    
    // Get all sessions for current user
    getSessions: protectedProcedure.query(async ({ ctx }) => {
      return await getUserChatSessions(ctx.user.id);
    }),
    
    // Get active session or create one
    getOrCreateSession: protectedProcedure.mutation(async ({ ctx }) => {
      let session = await getActiveSession(ctx.user.id);
      if (!session) {
        session = await createChatSession(ctx.user.id);
      }
      return session;
    }),
    
    // Get messages for a session
    getMessages: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return await getSessionMessages(input.sessionId);
      }),
    
    // Get recent messages for context
    getRecentMessages: protectedProcedure
      .input(z.object({ 
        sessionId: z.string(),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return await getRecentMessages(input.sessionId, input.limit);
      }),
    
    // Update session summary
    updateSummary: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        summary: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateChatSessionSummary(input.sessionId, input.summary);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
