import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, Message as LLMMessage } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

// Message schema for chat
const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Chat router for AI Sales Agent
  chat: router({
    send: publicProcedure
      .input(
        z.object({
          messages: z.array(messageSchema),
        })
      )
      .mutation(async ({ input }) => {
        const { messages } = input;

        // Convert to LLM message format
        const llmMessages: LLMMessage[] = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        try {
          const response = await invokeLLM({
            messages: llmMessages,
          });

          const assistantMessage = response.choices[0]?.message;
          const content =
            typeof assistantMessage?.content === "string"
              ? assistantMessage.content
              : Array.isArray(assistantMessage?.content)
              ? assistantMessage.content
                  .filter((c): c is { type: "text"; text: string } => c.type === "text")
                  .map((c) => c.text)
                  .join("")
              : "I apologize, but I couldn't generate a response. Please try again.";

          return {
            content,
            role: "assistant" as const,
          };
        } catch (error) {
          console.error("LLM invocation error:", error);
          throw new Error("Failed to get AI response. Please try again.");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
