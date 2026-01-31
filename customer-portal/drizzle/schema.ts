import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Product catalog table
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  price: int("price").notNull(), // Store in cents
  stockQuantity: int("stockQuantity").default(0).notNull(),
  imageUrl: text("imageUrl"),
  specifications: text("specifications"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Orders table
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 64 }).notNull().unique(),
  userId: int("userId").references(() => users.id),
  customerName: text("customerName").notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 32 }),
  deliveryAddress: text("deliveryAddress").notNull(),
  status: mysqlEnum("status", ["placed", "processing", "ready_to_dispatch", "in_transit", "delivered", "cancelled"]).default("placed").notNull(),
  subtotal: int("subtotal").notNull(), // Store in cents
  deliveryFee: int("deliveryFee").default(0).notNull(),
  tax: int("tax").default(0).notNull(),
  total: int("total").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed"]).default("pending").notNull(),
  estimatedDeliveryDate: timestamp("estimatedDeliveryDate"),
  courierService: varchar("courierService", { length: 128 }),
  trackingNumber: varchar("trackingNumber", { length: 128 }),
  deliveryInstructions: text("deliveryInstructions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").references(() => orders.id).notNull(),
  productId: int("productId").references(() => products.id).notNull(),
  productName: text("productName").notNull(),
  productSku: varchar("productSku", { length: 64 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(), // Store in cents
  subtotal: int("subtotal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Chat transcripts table for export functionality
 */
export const chatTranscripts = mysqlTable("chatTranscripts", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  userId: int("userId").references(() => users.id),
  messages: text("messages").notNull(), // JSON string of message array
  exportedToEmail: varchar("exportedToEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatTranscript = typeof chatTranscripts.$inferSelect;
export type InsertChatTranscript = typeof chatTranscripts.$inferInsert;