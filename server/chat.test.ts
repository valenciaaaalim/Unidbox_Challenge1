import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    id: "test-id",
    created: Date.now(),
    model: "test-model",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "Hello! I'm the AI Sales Agent. How can I help you today?",
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150,
    },
  }),
}));

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("chat.send", () => {
  it("returns an assistant response for valid messages", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.send({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello!" },
      ],
    });

    expect(result).toBeDefined();
    expect(result.role).toBe("assistant");
    expect(result.content).toBe(
      "Hello! I'm the AI Sales Agent. How can I help you today?"
    );
  });

  it("handles empty user messages array", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.send({
      messages: [{ role: "system", content: "You are a helpful assistant." }],
    });

    expect(result).toBeDefined();
    expect(result.role).toBe("assistant");
  });

  it("accepts messages with different roles", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.send({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What products do you have?" },
        { role: "assistant", content: "We have many products!" },
        { role: "user", content: "Tell me more about CAT6 cables." },
      ],
    });

    expect(result).toBeDefined();
    expect(result.role).toBe("assistant");
    expect(typeof result.content).toBe("string");
  });
});
