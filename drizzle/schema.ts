import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

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
  /** Dealer tier for loyalty program */
  dealerTier: mysqlEnum("dealerTier", ["bronze", "silver", "gold", "platinum"]).default("bronze"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table - stores product catalog
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: int("stock").default(0),
  imageUrl: text("imageUrl"),
  /** Related product SKUs for cross-sell */
  relatedSkus: json("relatedSkus").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Cart items table - stores items in user's cart
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders table - stores completed orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 64 }).notNull().unique(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  /** Order items as JSON */
  items: json("items").$type<Array<{
    productId: number;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>>().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Delivery Orders table - stores generated DOs
 */
export const deliveryOrders = mysqlTable("delivery_orders", {
  id: int("id").autoincrement().primaryKey(),
  doNumber: varchar("doNumber", { length: 64 }).notNull().unique(),
  orderId: int("orderId").notNull(),
  status: mysqlEnum("status", ["generated", "dispatched", "in_transit", "delivered"]).default("generated").notNull(),
  /** PDF URL stored in S3 */
  pdfUrl: text("pdfUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeliveryOrder = typeof deliveryOrders.$inferSelect;
export type InsertDeliveryOrder = typeof deliveryOrders.$inferInsert;

/**
 * Chat sessions table - stores conversation sessions
 */
export const chatSessions = mysqlTable("chat_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  /** Summary of conversation for context */
  summary: text("summary"),
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

/**
 * Chat messages table - stores individual messages
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  /** Metadata like product recommendations, actions taken */
  metadata: json("metadata").$type<{
    products?: Array<{ sku: string; name: string; price: string }>;
    action?: string;
    orderId?: number;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;


/**
 * Notifications table - stores messages sent between admin and dealers
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  /** Recipient user ID (dealer) */
  recipientId: int("recipientId").notNull(),
  /** Sender user ID (admin) - null for system notifications */
  senderId: int("senderId"),
  /** Notification type */
  type: mysqlEnum("type", ["reminder", "promotion", "order_update", "system"]).default("reminder").notNull(),
  /** Notification title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Notification message content */
  message: text("message").notNull(),
  /** Whether the notification has been read */
  isRead: int("isRead").default(0).notNull(),
  /** Additional metadata */
  metadata: json("metadata").$type<{
    dealerName?: string;
    dealerCompany?: string;
    daysSinceLastOrder?: number;
    suggestedProducts?: string[];
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Quotations table - price quotes sent to dealers
 * Flow: Admin/AI creates quotation → Dealer accepts → Creates PO
 */
export const quotations = mysqlTable("quotations", {
  id: int("id").autoincrement().primaryKey(),
  quotationNumber: varchar("quotationNumber", { length: 64 }).notNull().unique(),
  /** Dealer who receives the quotation */
  dealerId: int("dealerId").notNull(),
  /** Admin who created the quotation (null if AI-generated) */
  createdById: int("createdById"),
  status: mysqlEnum("status", ["draft", "sent", "accepted", "rejected", "expired"]).default("draft").notNull(),
  /** Quotation items */
  items: json("items").$type<Array<{
    productId: number;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: string;
    discount: string;
    total: string;
  }>>().notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  /** Validity period in days */
  validityDays: int("validityDays").default(30),
  expiresAt: timestamp("expiresAt"),
  notes: text("notes"),
  /** Terms and conditions */
  terms: text("terms"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;

/**
 * Purchase Orders table - formal orders from dealers
 * Flow: Dealer creates PO (from quotation or direct) → Admin processes → Creates DO
 */
export const purchaseOrders = mysqlTable("purchase_orders", {
  id: int("id").autoincrement().primaryKey(),
  poNumber: varchar("poNumber", { length: 64 }).notNull().unique(),
  /** Dealer who created the PO */
  dealerId: int("dealerId").notNull(),
  /** Reference to quotation if PO was created from one */
  quotationId: int("quotationId"),
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  /** PO items */
  items: json("items").$type<Array<{
    productId: number;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>>().notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  /** Dealer's reference number */
  dealerReference: varchar("dealerReference", { length: 100 }),
  /** Requested delivery date */
  requestedDeliveryDate: timestamp("requestedDeliveryDate"),
  /** Shipping address */
  shippingAddress: text("shippingAddress"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

/**
 * Invoices table - payment requests after delivery
 * Flow: DO delivered → Admin generates invoice → Dealer pays
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 64 }).notNull().unique(),
  /** Reference to PO */
  poId: int("poId").notNull(),
  /** Reference to DO */
  doId: int("doId"),
  /** Dealer to be invoiced */
  dealerId: int("dealerId").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  /** Invoice items (copied from PO for record) */
  items: json("items").$type<Array<{
    productId: number;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>>().notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  /** Payment terms (e.g., "Net 30") */
  paymentTerms: varchar("paymentTerms", { length: 50 }).default("Net 30"),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  /** PDF URL stored in S3 */
  pdfUrl: text("pdfUrl"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
