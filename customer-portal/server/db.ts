import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

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

// Product queries
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  const { products } = await import("../drizzle/schema");
  return db.select().from(products);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { products } = await import("../drizzle/schema");
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsBySku(sku: string) {
  const db = await getDb();
  if (!db) return undefined;
  const { products } = await import("../drizzle/schema");
  const result = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  const { products } = await import("../drizzle/schema");
  return db.select().from(products).where(eq(products.category, category));
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) return [];
  const { products } = await import("../drizzle/schema");
  const { like, or } = await import("drizzle-orm");
  const searchPattern = `%${query}%`;
  return db.select().from(products).where(
    or(
      like(products.name, searchPattern),
      like(products.description, searchPattern),
      like(products.sku, searchPattern)
    )
  );
}

// Order queries
export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const { orders } = await import("../drizzle/schema");
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  const { orderItems } = await import("../drizzle/schema");
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrder(order: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { orders } = await import("../drizzle/schema");
  const result = await db.insert(orders).values(order);
  return result;
}

export async function createOrderItem(item: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { orderItems } = await import("../drizzle/schema");
  const result = await db.insert(orderItems).values(item);
  return result;
}

// Chat transcript queries
export async function saveChatTranscript(transcript: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { chatTranscripts } = await import("../drizzle/schema");
  const result = await db.insert(chatTranscripts).values(transcript);
  return result;
}

export async function getChatTranscriptBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const { chatTranscripts } = await import("../drizzle/schema");
  const result = await db.select().from(chatTranscripts).where(eq(chatTranscripts.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
