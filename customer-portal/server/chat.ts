import { invokeLLM } from "./_core/llm";
import type { Message as LLMMessage } from "./_core/llm";
import { getAllProducts, getProductById } from "./db";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ProductRecommendation {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
  sku: string;
  reason: string;
}

interface SuggestedAction {
  id: string;
  label: string;
  action: string;
  variant?: "default" | "secondary" | "outline";
  metadata?: Record<string, unknown>;
}

interface ChatResponse {
  message: string;
  products?: ProductRecommendation[];
  suggestedActions?: SuggestedAction[];
}

const SYSTEM_PROMPT = `You are a helpful AI assistant for UNiDBox Hardware, a wholesale hardware and home essentials supplier in Singapore.

Your role is to:
1. Help customers find the right products for their needs
2. Provide accurate product information including pricing and availability
3. Suggest alternatives when products are out of stock
4. Answer questions about orders, delivery, and company policies
5. Be friendly, professional, and concise

When recommending products:
- Always check stock availability
- Suggest alternatives if items are out of stock
- Explain why a product is a good fit for the customer's needs
- Provide clear pricing information

Available product categories:
- Cable Management (cable boxes, trays, organizers)
- Power Solutions (power strips, surge protectors)
- Cable Accessories (ties, clips, sleeves)

Company information:
- Contact: +65 9456 6653
- Email: info@unidbox.com
- Location: 469 MacPherson Rd, Singapore
- Hours: Mon-Fri 9am-6pm, Sat 9am-3pm, Sun Closed

Format your responses in a conversational, helpful tone. When suggesting products, mention their key features and benefits.`;

export async function processChat(
  messages: ChatMessage[],
  userQuery: string
): Promise<ChatResponse> {
  // Get all products for context
  const products = await getAllProducts();
  
  // Build product catalog context
  const productContext = products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    price: `$${(p.price / 100).toFixed(2)}`,
    stockQuantity: p.stockQuantity,
    description: p.description,
    inStock: p.stockQuantity > 0
  }));

  // Prepare LLM messages
  const llmMessages: LLMMessage[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT + `\n\nCurrent Product Catalog:\n${JSON.stringify(productContext, null, 2)}`
    },
    ...messages.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content
    })),
    {
      role: "user",
      content: userQuery
    }
  ];

  // Call LLM with structured output for product recommendations
  const response = await invokeLLM({
    messages: llmMessages,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "chat_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The assistant's response message to the user"
            },
            recommendedProductIds: {
              type: "array",
              description: "Array of product IDs to recommend (max 3)",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  reason: { type: "string" }
                },
                required: ["id", "reason"],
                additionalProperties: false
              }
            },
            suggestedActions: {
              type: "array",
              description: "Array of suggested actions for the user",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  action: { type: "string" },
                  variant: { 
                    type: "string",
                    enum: ["default", "secondary", "outline"]
                  }
                },
                required: ["label", "action"],
                additionalProperties: false
              }
            }
          },
          required: ["message", "recommendedProductIds", "suggestedActions"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from LLM");
  }

  const contentString = typeof content === "string" ? content : JSON.stringify(content);
  const parsed = JSON.parse(contentString);

  // Fetch recommended products with details
  const recommendedProducts: ProductRecommendation[] = [];
  if (parsed.recommendedProductIds && Array.isArray(parsed.recommendedProductIds)) {
    for (const rec of parsed.recommendedProductIds.slice(0, 3)) {
      const product = await getProductById(rec.id);
      if (product) {
        recommendedProducts.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl || undefined,
          stockQuantity: product.stockQuantity,
          sku: product.sku,
          reason: rec.reason
        });
      }
    }
  }

  // Build suggested actions
  const suggestedActions: SuggestedAction[] = [];
  if (parsed.suggestedActions && Array.isArray(parsed.suggestedActions)) {
    parsed.suggestedActions.forEach((action: { label: string; action: string; variant?: string }, index: number) => {
      suggestedActions.push({
        id: `action-${index}`,
        label: action.label,
        action: action.action,
        variant: (action.variant as "default" | "secondary" | "outline") || "outline"
      });
    });
  }

  // Add context-aware actions based on product availability
  if (recommendedProducts.length > 0) {
    const hasOutOfStock = recommendedProducts.some(p => p.stockQuantity === 0);
    const hasInStock = recommendedProducts.some(p => p.stockQuantity > 0);

    if (hasInStock && suggestedActions.length < 3) {
      suggestedActions.push({
        id: "action-add-to-cart",
        label: "Add to Cart",
        action: "add_to_cart",
        variant: "default"
      });
    }

    if (hasOutOfStock && suggestedActions.length < 3) {
      suggestedActions.push({
        id: "action-notify-restock",
        label: "Notify When Back in Stock",
        action: "notify_restock",
        variant: "outline"
      });
    }
  }

  return {
    message: parsed.message,
    products: recommendedProducts.length > 0 ? recommendedProducts : undefined,
    suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined
  };
}

export async function findAlternativeProducts(productId: number): Promise<ProductRecommendation[]> {
  const product = await getProductById(productId);
  if (!product) {
    return [];
  }

  const allProducts = await getAllProducts();
  
  // Find products in the same category that are in stock
  const alternatives = allProducts
    .filter(p => 
      p.id !== productId &&
      p.category === product.category &&
      p.stockQuantity > 0
    )
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl || undefined,
      stockQuantity: p.stockQuantity,
      sku: p.sku,
      reason: `Alternative ${product.category} product with similar features`
    }));

  return alternatives;
}
