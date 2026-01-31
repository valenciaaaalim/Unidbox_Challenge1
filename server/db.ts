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
