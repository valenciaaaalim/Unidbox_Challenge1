import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    sendMessage: publicProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "messages" in val &&
          "userQuery" in val &&
          Array.isArray((val as { messages: unknown }).messages) &&
          typeof (val as { userQuery: unknown }).userQuery === "string"
        ) {
          return val as { messages: Array<{ role: string; content: string }>; userQuery: string };
        }
        throw new Error("Invalid chat input");
      })
      .mutation(async ({ input }) => {
        const { processChat } = await import("./chat");
        return processChat(input.messages as Array<{ role: "user" | "assistant"; content: string }>, input.userQuery);
      }),
    getAlternatives: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "number") return val;
        throw new Error("Invalid product ID");
      })
      .query(async ({ input }) => {
        const { findAlternativeProducts } = await import("./chat");
        return findAlternativeProducts(input);
      }),
    exportToEmail: publicProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "email" in val &&
          "messages" in val &&
          typeof (val as { email: unknown }).email === "string" &&
          Array.isArray((val as { messages: unknown }).messages)
        ) {
          return val as { email: string; messages: Array<{ role: string; content: string; timestamp: string }> };
        }
        throw new Error("Invalid export input");
      })
      .mutation(async ({ input }) => {
        // TODO: Implement actual email sending
        // For now, just return success
        console.log(`Exporting chat to ${input.email}`);
        console.log(`Messages count: ${input.messages.length}`);
        return { success: true, message: "Chat transcript will be sent to your email shortly" };
      }),
  }),

  orders: router({
    getByNumber: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "string") return val;
        throw new Error("Invalid order number");
      })
      .query(async ({ input }) => {
        const { getOrderByNumber } = await import("./db");
        return getOrderByNumber(input);
      }),
    getItems: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "number") return val;
        throw new Error("Invalid order ID");
      })
      .query(async ({ input }) => {
        const { getOrderItems } = await import("./db");
        return getOrderItems(input);
      }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      const { getAllProducts } = await import("./db");
      return getAllProducts();
    }),
    getById: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "number") return val;
        throw new Error("Invalid product ID");
      })
      .query(async ({ input }) => {
        const { getProductById } = await import("./db");
        return getProductById(input);
      }),
    search: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "string") return val;
        throw new Error("Invalid search query");
      })
      .query(async ({ input }) => {
        const { searchProducts } = await import("./db");
        return searchProducts(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
