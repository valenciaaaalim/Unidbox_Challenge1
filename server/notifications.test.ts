import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "dealer-001",
    email: "steven@steadyelectrical.sg",
    name: "Steven Lee",
    loginMethod: "manus",
    role: "user",
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "admin-001",
    email: "admin@unidbox.com",
    name: "Admin Alice",
    loginMethod: "manus",
    role: "admin",
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("notifications", () => {
  describe("notifications.list", () => {
    it("returns an array of notifications for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("notifications.unreadCount", () => {
    it("returns a number for unread count", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.unreadCount();

      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe("notifications.sendReminder", () => {
    it("sends a reminder notification to a dealer", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.sendReminder({
        dealerId: 1,
        dealerName: "Steven Lee",
        daysSinceLastOrder: 11,
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("notification");
      expect(result.success).toBe(true);
      expect(result.notification).toHaveProperty("message");
      expect(typeof result.notification.message).toBe("string");
      expect(result.notification.message.length).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for LLM call
  });
});

describe("dealers", () => {
  describe("dealers.list", () => {
    it("returns an array from dealers list endpoint", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.dealers.list();

      // The list endpoint returns an array (may be empty if no dealers in DB)
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("dealers.get", () => {
    it("handles dealer lookup by numeric ID", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // This should not throw - it should return null for non-existent dealer
      const result = await caller.dealers.get({ dealerId: 999 });

      expect(result).toBeNull();
    });
  });
});
