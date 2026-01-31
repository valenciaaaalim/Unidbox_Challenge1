import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("products router", () => {
  it("should list all products", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    
    // Check first product structure
    const firstProduct = products[0];
    expect(firstProduct).toHaveProperty("id");
    expect(firstProduct).toHaveProperty("sku");
    expect(firstProduct).toHaveProperty("name");
    expect(firstProduct).toHaveProperty("price");
    expect(firstProduct).toHaveProperty("stockQuantity");
  });

  it("should get product by ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.getById(1);

    expect(product).toBeDefined();
    expect(product?.id).toBe(1);
    expect(product?.name).toBeDefined();
    expect(product?.sku).toBeDefined();
  });

  it("should return undefined for non-existent product ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.getById(99999);

    expect(product).toBeUndefined();
  });

  it("should search products by name", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.products.search("cable");

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    
    // Check that results contain the search term
    const hasSearchTerm = results.some(p => 
      p.name.toLowerCase().includes("cable") ||
      p.description?.toLowerCase().includes("cable")
    );
    expect(hasSearchTerm).toBe(true);
  });

  it("should return empty array for non-matching search", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.products.search("nonexistentproduct12345");

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});

describe("orders router", () => {
  it("should get order by order number", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const order = await caller.orders.getByNumber("ORD-2026-0042");

    expect(order).toBeDefined();
    expect(order?.orderNumber).toBe("ORD-2026-0042");
    expect(order?.customerName).toBeDefined();
    expect(order?.status).toBeDefined();
    expect(order?.total).toBeGreaterThan(0);
  });

  it("should return undefined for non-existent order number", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const order = await caller.orders.getByNumber("ORD-9999-9999");

    expect(order).toBeUndefined();
  });

  it("should get order items for an order", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get an order
    const order = await caller.orders.getByNumber("ORD-2026-0042");
    expect(order).toBeDefined();

    // Then get its items
    const items = await caller.orders.getItems(order!.id);

    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    
    // Check first item structure
    const firstItem = items[0];
    expect(firstItem).toHaveProperty("productName");
    expect(firstItem).toHaveProperty("productSku");
    expect(firstItem).toHaveProperty("quantity");
    expect(firstItem).toHaveProperty("unitPrice");
    expect(firstItem).toHaveProperty("subtotal");
  });

  it("should return empty array for order with no items", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const items = await caller.orders.getItems(99999);

    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBe(0);
  });
});
