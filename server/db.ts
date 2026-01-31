import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  products, Product, InsertProduct,
  cartItems, CartItem, InsertCartItem,
  orders, Order, InsertOrder,
  deliveryOrders, DeliveryOrder, InsertDeliveryOrder,
  chatSessions, ChatSession, InsertChatSession,
  chatMessages, ChatMessage, InsertChatMessage
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ PRODUCT HELPERS ============

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(products);
}

export async function upsertProduct(product: InsertProduct): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(products).values(product).onDuplicateKeyUpdate({
    set: {
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      relatedSkus: product.relatedSkus,
    },
  });
}

// ============ CART HELPERS ============

export async function getCartItems(userId: number): Promise<(CartItem & { product?: Product })[]> {
  const db = await getDb();
  if (!db) return [];
  
  const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  
  // Fetch product details for each item
  const itemsWithProducts = await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.productId);
      return { ...item, product };
    })
  );
  
  return itemsWithProducts;
}

export async function addToCart(userId: number, productId: number, quantity: number = 1): Promise<CartItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if item already exists in cart
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);
  
  if (existing.length > 0) {
    // Update quantity
    const newQuantity = existing[0].quantity + quantity;
    await db.update(cartItems)
      .set({ quantity: newQuantity })
      .where(eq(cartItems.id, existing[0].id));
    return { ...existing[0], quantity: newQuantity };
  } else {
    // Insert new item
    const result = await db.insert(cartItems).values({
      userId,
      productId,
      quantity,
    });
    const insertId = result[0].insertId;
    const newItem = await db.select().from(cartItems).where(eq(cartItems.id, insertId)).limit(1);
    return newItem[0];
  }
}

export async function updateCartItemQuantity(itemId: number, quantity: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
  }
}

export async function removeFromCart(itemId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
}

export async function clearCart(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ============ ORDER HELPERS ============

export async function createOrder(order: Omit<InsertOrder, 'orderNumber'>): Promise<Order> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const orderNumber = `ORD-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
  
  const result = await db.insert(orders).values({
    ...order,
    orderNumber,
  });
  
  const insertId = result[0].insertId;
  const newOrder = await db.select().from(orders).where(eq(orders.id, insertId)).limit(1);
  return newOrder[0];
}

export async function getOrderById(id: number): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: Order['status']): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
}

// ============ DELIVERY ORDER HELPERS ============

export async function createDeliveryOrder(orderId: number, pdfUrl?: string): Promise<DeliveryOrder> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const doNumber = `DO-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
  
  const result = await db.insert(deliveryOrders).values({
    doNumber,
    orderId,
    pdfUrl,
  });
  
  const insertId = result[0].insertId;
  const newDO = await db.select().from(deliveryOrders).where(eq(deliveryOrders.id, insertId)).limit(1);
  return newDO[0];
}

export async function getDeliveryOrderByOrderId(orderId: number): Promise<DeliveryOrder | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(deliveryOrders).where(eq(deliveryOrders.orderId, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ CHAT SESSION HELPERS ============

export async function createChatSession(userId: number, title?: string): Promise<ChatSession> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const sessionId = nanoid(16);
  
  const result = await db.insert(chatSessions).values({
    sessionId,
    userId,
    title: title || `Chat ${new Date().toLocaleDateString()}`,
  });
  
  const insertId = result[0].insertId;
  const newSession = await db.select().from(chatSessions).where(eq(chatSessions.id, insertId)).limit(1);
  return newSession[0];
}

export async function getChatSession(sessionId: string): Promise<ChatSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserChatSessions(userId: number): Promise<ChatSession[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy(desc(chatSessions.updatedAt));
}

export async function getActiveSession(userId: number): Promise<ChatSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(chatSessions)
    .where(and(eq(chatSessions.userId, userId), eq(chatSessions.isActive, 1)))
    .orderBy(desc(chatSessions.updatedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateChatSessionSummary(sessionId: string, summary: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(chatSessions).set({ summary }).where(eq(chatSessions.sessionId, sessionId));
}

export async function deactivateUserSessions(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(chatSessions)
    .set({ isActive: 0 })
    .where(and(eq(chatSessions.userId, userId), eq(chatSessions.isActive, 1)));
}

// ============ CHAT MESSAGE HELPERS ============

export async function addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(chatMessages).values(message);
  
  const insertId = result[0].insertId;
  const newMessage = await db.select().from(chatMessages).where(eq(chatMessages.id, insertId)).limit(1);
  
  // Update session's updatedAt
  await db.update(chatSessions)
    .set({ updatedAt: new Date() })
    .where(eq(chatSessions.sessionId, message.sessionId));
  
  return newMessage[0];
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
}

export async function getRecentMessages(sessionId: string, limit: number = 20): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) return [];
  
  const messages = await db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
  
  // Return in chronological order
  return messages.reverse();
}


// ============ NOTIFICATION HELPERS ============

import { notifications, Notification, InsertNotification } from "../drizzle/schema";

export async function createNotification(notification: InsertNotification): Promise<Notification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(notification);
  
  const insertId = result[0].insertId;
  const newNotification = await db.select().from(notifications).where(eq(notifications.id, insertId)).limit(1);
  return newNotification[0];
}

export async function getUserNotifications(userId: number): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(notifications)
    .where(eq(notifications.recipientId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotifications(userId: number): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(notifications)
    .where(and(eq(notifications.recipientId, userId), eq(notifications.isRead, 0)))
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(notifications)
    .where(and(eq(notifications.recipientId, userId), eq(notifications.isRead, 0)));
  
  return result.length;
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(notifications)
    .set({ isRead: 1, readAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(notifications)
    .set({ isRead: 1, readAt: new Date() })
    .where(and(eq(notifications.recipientId, userId), eq(notifications.isRead, 0)));
}

export async function getAllDealers(): Promise<Array<{
  id: number;
  name: string | null;
  email: string | null;
  dealerTier: string | null;
  lastSignedIn: Date;
  createdAt: Date;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    dealerTier: users.dealerTier,
    lastSignedIn: users.lastSignedIn,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.role, 'user'));
}

export async function getDealerById(dealerId: number): Promise<{
  id: number;
  name: string | null;
  email: string | null;
  dealerTier: string | null;
  lastSignedIn: Date;
  createdAt: Date;
} | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    dealerTier: users.dealerTier,
    lastSignedIn: users.lastSignedIn,
    createdAt: users.createdAt,
  }).from(users).where(and(eq(users.id, dealerId), eq(users.role, 'user'))).limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getDealerOrderStats(dealerId: number): Promise<{
  totalOrders: number;
  totalSpend: number;
  avgOrderValue: number;
  lastOrderDate: Date | null;
}> {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalSpend: 0, avgOrderValue: 0, lastOrderDate: null };
  
  const dealerOrders = await db.select().from(orders)
    .where(eq(orders.userId, dealerId))
    .orderBy(desc(orders.createdAt));
  
  const totalOrders = dealerOrders.length;
  const totalSpend = dealerOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;
  const lastOrderDate = dealerOrders.length > 0 ? dealerOrders[0].createdAt : null;
  
  return { totalOrders, totalSpend, avgOrderValue, lastOrderDate };
}


// ============ QUOTATION HELPERS ============

import { 
  quotations, Quotation, InsertQuotation,
  purchaseOrders, PurchaseOrder, InsertPurchaseOrder,
  invoices, Invoice, InsertInvoice
} from "../drizzle/schema";

export async function createQuotation(quotation: Omit<InsertQuotation, 'quotationNumber'>): Promise<Quotation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const quotationNumber = `QT-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (quotation.validityDays || 30));
  
  const result = await db.insert(quotations).values({
    ...quotation,
    quotationNumber,
    expiresAt,
  });
  
  const insertId = result[0].insertId;
  const newQuotation = await db.select().from(quotations).where(eq(quotations.id, insertId)).limit(1);
  return newQuotation[0];
}

export async function getQuotationById(id: number): Promise<Quotation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(quotations).where(eq(quotations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuotationByNumber(quotationNumber: string): Promise<Quotation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(quotations).where(eq(quotations.quotationNumber, quotationNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDealerQuotations(dealerId: number): Promise<Quotation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(quotations)
    .where(eq(quotations.dealerId, dealerId))
    .orderBy(desc(quotations.createdAt));
}

export async function getAllQuotations(): Promise<Quotation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(quotations).orderBy(desc(quotations.createdAt));
}

export async function updateQuotationStatus(quotationId: number, status: Quotation['status']): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(quotations).set({ status }).where(eq(quotations.id, quotationId));
}

// ============ PURCHASE ORDER HELPERS ============

export async function createPurchaseOrder(po: Omit<InsertPurchaseOrder, 'poNumber'>): Promise<PurchaseOrder> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const poNumber = `PO-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
  
  const result = await db.insert(purchaseOrders).values({
    ...po,
    poNumber,
  });
  
  const insertId = result[0].insertId;
  const newPO = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, insertId)).limit(1);
  return newPO[0];
}

export async function getPurchaseOrderById(id: number): Promise<PurchaseOrder | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPurchaseOrderByNumber(poNumber: string): Promise<PurchaseOrder | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(purchaseOrders).where(eq(purchaseOrders.poNumber, poNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDealerPurchaseOrders(dealerId: number): Promise<PurchaseOrder[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(purchaseOrders)
    .where(eq(purchaseOrders.dealerId, dealerId))
    .orderBy(desc(purchaseOrders.createdAt));
}

export async function getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
}

export async function updatePurchaseOrderStatus(poId: number, status: PurchaseOrder['status']): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(purchaseOrders).set({ status }).where(eq(purchaseOrders.id, poId));
}

// ============ INVOICE HELPERS ============

export async function createInvoice(invoice: Omit<InsertInvoice, 'invoiceNumber'>): Promise<Invoice> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const invoiceNumber = `INV-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // Net 30 default
  
  const result = await db.insert(invoices).values({
    ...invoice,
    invoiceNumber,
    dueDate,
  });
  
  const insertId = result[0].insertId;
  const newInvoice = await db.select().from(invoices).where(eq(invoices.id, insertId)).limit(1);
  return newInvoice[0];
}

export async function getInvoiceById(id: number): Promise<Invoice | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDealerInvoices(dealerId: number): Promise<Invoice[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(invoices)
    .where(eq(invoices.dealerId, dealerId))
    .orderBy(desc(invoices.createdAt));
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function updateInvoiceStatus(invoiceId: number, status: Invoice['status']): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const updates: Partial<Invoice> = { status };
  if (status === 'paid') {
    updates.paidAt = new Date();
  }
  
  await db.update(invoices).set(updates).where(eq(invoices.id, invoiceId));
}

export async function getInvoiceByPOId(poId: number): Promise<Invoice | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(invoices).where(eq(invoices.poId, poId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ DELIVERY ORDER EXTENDED HELPERS ============

export async function getDeliveryOrderById(id: number): Promise<DeliveryOrder | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(deliveryOrders).where(eq(deliveryOrders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllDeliveryOrders(): Promise<DeliveryOrder[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(deliveryOrders).orderBy(desc(deliveryOrders.createdAt));
}

export async function updateDeliveryOrderStatus(doId: number, status: DeliveryOrder['status']): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(deliveryOrders).set({ status }).where(eq(deliveryOrders.id, doId));
}
