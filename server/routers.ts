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
  getDeliveryOrderById,
  getAllDeliveryOrders,
  updateDeliveryOrderStatus,
  createChatSession,
  getChatSession,
  getUserChatSessions,
  getActiveSession,
  deactivateUserSessions,
  addChatMessage,
  getSessionMessages,
  getRecentMessages,
  updateChatSessionSummary,
  createNotification,
  getUserNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAllDealers,
  getDealerById,
  getDealerOrderStats,
  // Quotation helpers
  createQuotation,
  getQuotationById,
  getQuotationByNumber,
  getDealerQuotations,
  getAllQuotations,
  updateQuotationStatus,
  // Purchase Order helpers
  createPurchaseOrder,
  getPurchaseOrderById,
  getPurchaseOrderByNumber,
  getDealerPurchaseOrders,
  getAllPurchaseOrders,
  updatePurchaseOrderStatus,
  // Invoice helpers
  createInvoice,
  getInvoiceById,
  getInvoiceByNumber,
  getDealerInvoices,
  getAllInvoices,
  updateInvoiceStatus,
  getInvoiceByPOId,
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
6. Creating quotations for bulk orders

DEALER CONTEXT:
- Name: ${dealerName}
- Tier: ${dealerTier} (discount: ${dealerTier === 'gold' ? '5%' : dealerTier === 'platinum' ? '8%' : dealerTier === 'silver' ? '3%' : '0%'})

${getProductContext()}

RESPONSE GUIDELINES:
1. Be friendly, professional, and proactive. Address the dealer by their name: ${dealerName}
2. Always show both regular price AND discounted price for the dealer's tier
3. When recommending products, format as markdown tables with columns: Product, SKU, Unit Price, Tier Price, Notes
4. For project-based inquiries, suggest complete bundles including safety gear
5. Proactively suggest related products (cross-sell)
6. When a dealer wants to add items to cart, respond with a confirmation and include the action marker: [ACTION:ADD_TO_CART:SKU:QUANTITY]
7. When a dealer wants to place an order, confirm the items and include: [ACTION:PLACE_ORDER]
8. For order status inquiries, ask for the order number if not provided
9. Keep responses concise but informative
10. Use markdown formatting for better readability
11. IMPORTANT: When greeting or addressing the user, use their actual name "${dealerName}" - never use placeholders like #NAME# or similar
12. When a dealer requests a quotation or quote, create a detailed quotation with product breakdown and include: [ACTION:CREATE_QUOTATION]

SPECIAL COMMANDS:
- If user says "add to cart" or "I'll take X", include [ACTION:ADD_TO_CART:SKU:QUANTITY] in your response
- If user says "place order" or "checkout" or "confirm order", include [ACTION:PLACE_ORDER] in your response
- If user asks about their cart, include [ACTION:GET_CART] in your response
- If user says "get me a quote", "create quotation", "I need a quotation for", include [ACTION:CREATE_QUOTATION] in your response along with the items in format [QUOTE_ITEMS:SKU1:QTY1,SKU2:QTY2,...]
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
          
          // Check for CREATE_QUOTATION action
          if (content.includes('[ACTION:CREATE_QUOTATION]')) {
            const quoteItemsMatch = content.match(/\[QUOTE_ITEMS:([^\]]+)\]/);
            if (quoteItemsMatch) {
              const itemsStr = quoteItemsMatch[1];
              const quoteItems = itemsStr.split(',').map(item => {
                const [sku, qty] = item.split(':');
                return { sku, quantity: parseInt(qty) };
              });
              actions.push({ type: 'CREATE_QUOTATION', quoteItems } as any);
            } else {
              actions.push({ type: 'CREATE_QUOTATION' });
            }
          }
          
          // Remove action markers from displayed content
          content = content
            .replace(/\[ACTION:ADD_TO_CART:[A-Z0-9-]+:\d+\]/g, '')
            .replace(/\[ACTION:PLACE_ORDER\]/g, '')
            .replace(/\[ACTION:GET_CART\]/g, '')
            .replace(/\[ACTION:CREATE_QUOTATION\]/g, '')
            .replace(/\[QUOTE_ITEMS:[^\]]+\]/g, '')
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
    
    // Create a brand new session (deactivates existing ones)
    createNewSession: protectedProcedure.mutation(async ({ ctx }) => {
      // Deactivate all existing active sessions for this user
      await deactivateUserSessions(ctx.user.id);
      // Create a fresh session
      const session = await createChatSession(ctx.user.id);
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

  // ============ NOTIFICATIONS ROUTER ============
  notifications: router({
    // Get all notifications for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserNotifications(ctx.user.id);
    }),
    
    // Get unread notifications
    unread: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadNotifications(ctx.user.id);
    }),
    
    // Get unread count
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadNotificationCount(ctx.user.id);
    }),
    
    // Mark notification as read
    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
    
    // Mark all notifications as read
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
    
    // Send reminder to dealer (admin only)
    sendReminder: protectedProcedure
      .input(z.object({
        dealerId: z.number(),
        dealerName: z.string(),
        dealerCompany: z.string().optional(),
        daysSinceLastOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate AI message for the reminder
        const prompt = `Generate a friendly, professional re-engagement message for a wholesale dealer who hasn't ordered in ${input.daysSinceLastOrder || 'a while'} days.

Dealer Name: ${input.dealerName}
Company: ${input.dealerCompany || 'their company'}

The message should:
1. Be warm and personal (use their name)
2. Mention we noticed they haven't ordered recently
3. Offer to help with any questions or concerns
4. Mention any new products or promotions
5. Encourage them to reach out or place an order
6. Be concise (2-3 sentences max)

Do NOT include any subject line, just the message body.`;

        let messageContent = '';
        
        try {
          const response = await invokeLLM({
            messages: [
              { role: 'system', content: 'You are a helpful assistant that writes professional business messages.' },
              { role: 'user', content: prompt },
            ],
          });
          
          const assistantMessage = response.choices[0]?.message;
          messageContent = typeof assistantMessage?.content === 'string'
            ? assistantMessage.content
            : `Hi ${input.dealerName}, we noticed it's been a while since your last order. We're here to help with any questions you might have. Feel free to reach out or browse our latest products!`;
        } catch (error) {
          console.error('Failed to generate AI message:', error);
          messageContent = `Hi ${input.dealerName}, we noticed it's been a while since your last order. We're here to help with any questions you might have. Feel free to reach out or browse our latest products!`;
        }
        
        // Create notification
        const notification = await createNotification({
          recipientId: input.dealerId,
          senderId: ctx.user.id,
          type: 'reminder',
          title: 'We miss you!',
          message: messageContent,
          metadata: {
            dealerName: input.dealerName,
            dealerCompany: input.dealerCompany,
            daysSinceLastOrder: input.daysSinceLastOrder,
          },
        });
        
        return {
          success: true,
          notification,
          message: `Reminder sent to ${input.dealerName}`,
        };
      }),
  }),

  // ============ DEALERS ROUTER (Admin) ============
  dealers: router({
    // Get all dealers
    list: protectedProcedure.query(async () => {
      const dealers = await getAllDealers();
      
      // Get order stats for each dealer
      const dealersWithStats = await Promise.all(
        dealers.map(async (dealer) => {
          const stats = await getDealerOrderStats(dealer.id);
          const daysSinceLastOrder = stats.lastOrderDate
            ? Math.floor((Date.now() - stats.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
            : null;
          
          return {
            ...dealer,
            ...stats,
            daysSinceLastOrder,
            isAtRisk: daysSinceLastOrder !== null && daysSinceLastOrder > 7,
          };
        })
      );
      
      return dealersWithStats;
    }),
    
    // Get dealer by ID with full details
    get: protectedProcedure
      .input(z.object({ dealerId: z.number() }))
      .query(async ({ input }) => {
        const dealer = await getDealerById(input.dealerId);
        if (!dealer) return null;
        
        const stats = await getDealerOrderStats(input.dealerId);
        const orders = await getUserOrders(input.dealerId);
        
        const daysSinceLastOrder = stats.lastOrderDate
          ? Math.floor((Date.now() - stats.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
          : null;
        
        return {
          ...dealer,
          ...stats,
          daysSinceLastOrder,
          isAtRisk: daysSinceLastOrder !== null && daysSinceLastOrder > 7,
          recentOrders: orders.slice(0, 10),
        };
      }),
  }),

  // ============ QUOTATIONS ROUTER ============
  quotations: router({
    // Create a new quotation (Admin)
    create: protectedProcedure
      .input(z.object({
        dealerId: z.number(),
        items: z.array(z.object({
          productId: z.number(),
          sku: z.string(),
          name: z.string(),
          quantity: z.number(),
          unitPrice: z.string(),
          discount: z.string().default("0"),
          total: z.string(),
        })),
        subtotal: z.string(),
        discount: z.string().default("0"),
        total: z.string(),
        validityDays: z.number().default(30),
        notes: z.string().optional(),
        terms: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const quotation = await createQuotation({
          dealerId: input.dealerId,
          createdById: ctx.user.id,
          items: input.items,
          subtotal: input.subtotal,
          discount: input.discount,
          total: input.total,
          validityDays: input.validityDays,
          notes: input.notes,
          terms: input.terms,
          status: 'sent',
        });
        
        // Send notification to dealer
        await createNotification({
          recipientId: input.dealerId,
          senderId: ctx.user.id,
          type: 'system',
          title: 'New Quotation Received',
          message: `You have received a new quotation ${quotation.quotationNumber} for $${input.total}. Valid for ${input.validityDays} days.`,
        });
        
        return quotation;
      }),
    
    // Get all quotations (Admin)
    listAll: protectedProcedure.query(async () => {
      return await getAllQuotations();
    }),
    
    // Get dealer's quotations
    listMine: protectedProcedure.query(async ({ ctx }) => {
      return await getDealerQuotations(ctx.user.id);
    }),
    
    // Get quotation by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getQuotationById(input.id);
      }),
    
    // Accept quotation (creates PO)
    accept: protectedProcedure
      .input(z.object({
        quotationId: z.number(),
        dealerReference: z.string().optional(),
        shippingAddress: z.string().optional(),
        requestedDeliveryDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const quotation = await getQuotationById(input.quotationId);
        if (!quotation) throw new Error('Quotation not found');
        if (quotation.dealerId !== ctx.user.id) throw new Error('Not authorized');
        if (quotation.status !== 'sent') throw new Error('Quotation cannot be accepted');
        
        // Update quotation status
        await updateQuotationStatus(input.quotationId, 'accepted');
        
        // Create Purchase Order from quotation
        const po = await createPurchaseOrder({
          dealerId: ctx.user.id,
          quotationId: input.quotationId,
          items: quotation.items.map(item => ({
            productId: item.productId,
            sku: item.sku,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
          subtotal: quotation.subtotal,
          discount: quotation.discount || "0",
          total: quotation.total,
          dealerReference: input.dealerReference,
          shippingAddress: input.shippingAddress,
          requestedDeliveryDate: input.requestedDeliveryDate,
          notes: input.notes,
        });
        
        return { quotation, purchaseOrder: po };
      }),
    
    // Reject quotation
    reject: protectedProcedure
      .input(z.object({ quotationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const quotation = await getQuotationById(input.quotationId);
        if (!quotation) throw new Error('Quotation not found');
        if (quotation.dealerId !== ctx.user.id) throw new Error('Not authorized');
        
        await updateQuotationStatus(input.quotationId, 'rejected');
        return { success: true };
      }),
  }),

  // ============ PURCHASE ORDERS ROUTER ============
  purchaseOrders: router({
    // Create a direct PO (without quotation)
    create: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.number(),
          sku: z.string(),
          name: z.string(),
          quantity: z.number(),
          unitPrice: z.string(),
          total: z.string(),
        })),
        subtotal: z.string(),
        discount: z.string().default("0"),
        total: z.string(),
        dealerReference: z.string().optional(),
        shippingAddress: z.string().optional(),
        requestedDeliveryDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const po = await createPurchaseOrder({
          dealerId: ctx.user.id,
          items: input.items,
          subtotal: input.subtotal,
          discount: input.discount,
          total: input.total,
          dealerReference: input.dealerReference,
          shippingAddress: input.shippingAddress,
          requestedDeliveryDate: input.requestedDeliveryDate,
          notes: input.notes,
        });
        
        return po;
      }),
    
    // Get all POs (Admin)
    listAll: protectedProcedure.query(async () => {
      const pos = await getAllPurchaseOrders();
      // Enrich with dealer info
      const enrichedPOs = await Promise.all(
        pos.map(async (po) => {
          const dealer = await getDealerById(po.dealerId);
          return { ...po, dealer };
        })
      );
      return enrichedPOs;
    }),
    
    // Get dealer's POs
    listMine: protectedProcedure.query(async ({ ctx }) => {
      return await getDealerPurchaseOrders(ctx.user.id);
    }),
    
    // Get PO by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const po = await getPurchaseOrderById(input.id);
        if (!po) return null;
        
        const dealer = await getDealerById(po.dealerId);
        const quotation = po.quotationId ? await getQuotationById(po.quotationId) : null;
        
        return { ...po, dealer, quotation };
      }),
    
    // Update PO status (Admin)
    updateStatus: protectedProcedure
      .input(z.object({
        poId: z.number(),
        status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
      }))
      .mutation(async ({ ctx, input }) => {
        await updatePurchaseOrderStatus(input.poId, input.status);
        
        const po = await getPurchaseOrderById(input.poId);
        if (po) {
          // Notify dealer of status change
          await createNotification({
            recipientId: po.dealerId,
            senderId: ctx.user.id,
            type: 'order_update',
            title: `PO ${po.poNumber} Status Updated`,
            message: `Your purchase order ${po.poNumber} status has been updated to: ${input.status}`,
          });
        }
        
        return { success: true };
      }),
    
    // Generate DO from PO (Admin)
    generateDO: protectedProcedure
      .input(z.object({ poId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const po = await getPurchaseOrderById(input.poId);
        if (!po) throw new Error('Purchase Order not found');
        
        // Create an order record first (for DO linkage)
        const order = await createOrder({
          userId: po.dealerId,
          items: po.items,
          subtotal: po.subtotal,
          discount: po.discount || "0",
          total: po.total,
          status: 'processing',
          notes: `Generated from PO: ${po.poNumber}`,
        });
        
        // Create DO
        const deliveryOrder = await createDeliveryOrder(order.id);
        
        // Update PO status
        await updatePurchaseOrderStatus(input.poId, 'processing');
        
        // Notify dealer
        await createNotification({
          recipientId: po.dealerId,
          senderId: ctx.user.id,
          type: 'order_update',
          title: `Delivery Order Generated`,
          message: `Delivery Order ${deliveryOrder.doNumber} has been generated for your PO ${po.poNumber}`,
        });
        
        return { order, deliveryOrder };
      }),
  }),

  // ============ DELIVERY ORDERS ROUTER ============
  deliveryOrders: router({
    // Get all DOs (Admin)
    listAll: protectedProcedure.query(async () => {
      return await getAllDeliveryOrders();
    }),
    
    // Get DO by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const deliveryOrder = await getDeliveryOrderById(input.id);
        if (!deliveryOrder) return null;
        
        const order = await getOrderById(deliveryOrder.orderId);
        return { ...deliveryOrder, order };
      }),
    
    // Update DO status (Admin)
    updateStatus: protectedProcedure
      .input(z.object({
        doId: z.number(),
        status: z.enum(['generated', 'dispatched', 'in_transit', 'delivered']),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateDeliveryOrderStatus(input.doId, input.status);
        
        const deliveryOrder = await getDeliveryOrderById(input.doId);
        if (deliveryOrder) {
          const order = await getOrderById(deliveryOrder.orderId);
          if (order) {
            // Update order status based on DO status
            if (input.status === 'delivered') {
              await updateOrderStatus(order.id, 'delivered');
            } else if (input.status === 'dispatched' || input.status === 'in_transit') {
              await updateOrderStatus(order.id, 'shipped');
            }
            
            // Notify dealer
            await createNotification({
              recipientId: order.userId,
              senderId: ctx.user.id,
              type: 'order_update',
              title: `Delivery Update: ${deliveryOrder.doNumber}`,
              message: `Your delivery ${deliveryOrder.doNumber} status: ${input.status}`,
            });
          }
        }
        
        return { success: true };
      }),
  }),

  // ============ INVOICES ROUTER ============
  invoices: router({
    // Create invoice from PO/DO (Admin)
    create: protectedProcedure
      .input(z.object({
        poId: z.number(),
        doId: z.number().optional(),
        tax: z.string().default("0"),
        paymentTerms: z.string().default("Net 30"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const po = await getPurchaseOrderById(input.poId);
        if (!po) throw new Error('Purchase Order not found');
        
        // Check if invoice already exists for this PO
        const existingInvoice = await getInvoiceByPOId(input.poId);
        if (existingInvoice) throw new Error('Invoice already exists for this PO');
        
        const taxAmount = parseFloat(input.tax);
        const subtotal = parseFloat(po.subtotal);
        const discount = parseFloat(po.discount || "0");
        const total = subtotal + taxAmount - discount;
        
        const invoice = await createInvoice({
          poId: input.poId,
          doId: input.doId,
          dealerId: po.dealerId,
          items: po.items,
          subtotal: po.subtotal,
          tax: input.tax,
          discount: po.discount || "0",
          total: total.toFixed(2),
          paymentTerms: input.paymentTerms,
          notes: input.notes,
          status: 'sent',
        });
        
        // Notify dealer
        await createNotification({
          recipientId: po.dealerId,
          senderId: ctx.user.id,
          type: 'system',
          title: 'New Invoice',
          message: `Invoice ${invoice.invoiceNumber} for $${total.toFixed(2)} has been generated. Payment due: ${input.paymentTerms}`,
        });
        
        return invoice;
      }),
    
    // Get all invoices (Admin)
    listAll: protectedProcedure.query(async () => {
      const invoicesList = await getAllInvoices();
      // Enrich with dealer info
      const enrichedInvoices = await Promise.all(
        invoicesList.map(async (inv) => {
          const dealer = await getDealerById(inv.dealerId);
          const po = await getPurchaseOrderById(inv.poId);
          return { ...inv, dealer, purchaseOrder: po };
        })
      );
      return enrichedInvoices;
    }),
    
    // Get dealer's invoices
    listMine: protectedProcedure.query(async ({ ctx }) => {
      return await getDealerInvoices(ctx.user.id);
    }),
    
    // Get invoice by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const invoice = await getInvoiceById(input.id);
        if (!invoice) return null;
        
        const dealer = await getDealerById(invoice.dealerId);
        const po = await getPurchaseOrderById(invoice.poId);
        const deliveryOrder = invoice.doId ? await getDeliveryOrderById(invoice.doId) : null;
        
        return { ...invoice, dealer, purchaseOrder: po, deliveryOrder };
      }),
    
    // Update invoice status (Admin)
    updateStatus: protectedProcedure
      .input(z.object({
        invoiceId: z.number(),
        status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateInvoiceStatus(input.invoiceId, input.status);
        
        const invoice = await getInvoiceById(input.invoiceId);
        if (invoice && input.status === 'paid') {
          // Notify dealer of payment confirmation
          await createNotification({
            recipientId: invoice.dealerId,
            senderId: ctx.user.id,
            type: 'system',
            title: 'Payment Confirmed',
            message: `Payment for invoice ${invoice.invoiceNumber} has been confirmed. Thank you!`,
          });
        }
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
