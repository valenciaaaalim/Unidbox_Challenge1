import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock the database functions
vi.mock("./db", () => ({
  getCartItems: vi.fn().mockResolvedValue([]),
  addToCart: vi.fn().mockResolvedValue({ id: 1, userId: 1, productId: 1, quantity: 5 }),
  updateCartItemQuantity: vi.fn().mockResolvedValue(undefined),
  removeFromCart: vi.fn().mockResolvedValue(undefined),
  clearCart: vi.fn().mockResolvedValue(undefined),
  getProductBySku: vi.fn().mockResolvedValue(null),
  getProductById: vi.fn().mockResolvedValue(null),
  getAllProducts: vi.fn().mockResolvedValue([]),
  createOrder: vi.fn().mockResolvedValue({
    id: 1,
    orderNumber: "ORD-2026-TEST123",
    userId: 1,
    status: "confirmed",
    subtotal: "89.99",
    discount: "4.50",
    total: "85.49",
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getOrderById: vi.fn().mockResolvedValue(null),
  getOrderByNumber: vi.fn().mockResolvedValue(null),
  getUserOrders: vi.fn().mockResolvedValue([]),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  createDeliveryOrder: vi.fn().mockResolvedValue({
    id: 1,
    doNumber: "DO-2026-TEST123",
    orderId: 1,
    status: "generated",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getDeliveryOrderByOrderId: vi.fn().mockResolvedValue(null),
  createChatSession: vi.fn().mockResolvedValue({
    id: 1,
    sessionId: "test-session-123",
    userId: 1,
    title: "Test Chat",
    isActive: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getChatSession: vi.fn().mockResolvedValue(null),
  getUserChatSessions: vi.fn().mockResolvedValue([]),
  getActiveSession: vi.fn().mockResolvedValue(null),
  addChatMessage: vi.fn().mockResolvedValue({
    id: 1,
    sessionId: "test-session-123",
    role: "user",
    content: "Hello",
    createdAt: new Date(),
  }),
  getSessionMessages: vi.fn().mockResolvedValue([]),
  getRecentMessages: vi.fn().mockResolvedValue([]),
  updateChatSessionSummary: vi.fn().mockResolvedValue(undefined),
}));

function createAuthContext(): { ctx: TrpcContext; clearedCookies: { name: string; options: Record<string, unknown> }[] } {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-dealer-123",
    email: "steven@dealer.com",
    name: "Steven Lim",
    loginMethod: "manus",
    role: "user",
    dealerTier: "gold",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Products Router", () => {
  it("lists all products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty("sku");
    expect(products[0]).toHaveProperty("name");
    expect(products[0]).toHaveProperty("price");
  });

  it("gets product by SKU", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.getBySku({ sku: "CBL-CAT6-100" });

    expect(product).toBeDefined();
    expect(product?.name).toBe("CAT6 Ethernet Cable 100m");
    expect(product?.price).toBe("89.99");
  });

  it("returns null for non-existent SKU", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.getBySku({ sku: "NON-EXISTENT" });

    expect(product).toBeNull();
  });
});

describe("Cart Router", () => {
  it("adds item to cart", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.add({
      sku: "CBL-CAT6-100",
      quantity: 5,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Added 5x");
    expect(result.product.sku).toBe("CBL-CAT6-100");
  });

  it("throws error for non-existent product", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.cart.add({
        sku: "NON-EXISTENT",
        quantity: 1,
      })
    ).rejects.toThrow("Product with SKU NON-EXISTENT not found");
  });

  it("gets cart with tier discount applied", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const cart = await caller.cart.get();

    expect(cart).toBeDefined();
    expect(cart.tierDiscount).toBe(5); // Gold tier = 5%
    expect(Array.isArray(cart.items)).toBe(true);
  });

  it("clears cart successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.clear();

    expect(result.success).toBe(true);
  });
});

describe("Chat Router", () => {
  it("creates a new chat session", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const session = await caller.chat.createSession({ title: "Test Chat" });

    expect(session).toBeDefined();
    expect(session.sessionId).toBe("test-session-123");
    expect(session.title).toBe("Test Chat");
  });

  it("gets or creates session for user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const session = await caller.chat.getOrCreateSession();

    expect(session).toBeDefined();
    expect(session.sessionId).toBeDefined();
  });

  it("gets user chat sessions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const sessions = await caller.chat.getSessions();

    expect(Array.isArray(sessions)).toBe(true);
  });

  it("gets messages for a session", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const messages = await caller.chat.getMessages({ sessionId: "test-session-123" });

    expect(Array.isArray(messages)).toBe(true);
  });
});

describe("Orders Router", () => {
  it("lists user orders", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.list();

    expect(Array.isArray(orders)).toBe(true);
  });

  it("gets order by number", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.get({ orderNumber: "ORD-2026-TEST123" });

    // Will be null since we're mocking
    expect(result).toBeNull();
  });
});
