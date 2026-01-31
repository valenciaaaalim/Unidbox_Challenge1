import { drizzle } from "drizzle-orm/mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const sampleProducts = [
  {
    sku: "CB-001",
    name: "Heavy Duty Cable Box - Large",
    description: "Professional cable management box for organizing multiple cables and power strips. Ideal for office and home use.",
    category: "Cable Management",
    price: 2990, // $29.90
    stockQuantity: 45,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    specifications: JSON.stringify({
      dimensions: "40cm x 15cm x 13cm",
      material: "High-quality ABS plastic",
      color: "White",
      weight: "800g",
      capacity: "Holds up to 6 power strips"
    })
  },
  {
    sku: "CB-002",
    name: "Compact Cable Organizer",
    description: "Space-saving cable organizer perfect for desks and small spaces. Keeps your workspace tidy and professional.",
    category: "Cable Management",
    price: 1590, // $15.90
    stockQuantity: 0, // Out of stock
    imageUrl: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800",
    specifications: JSON.stringify({
      dimensions: "25cm x 10cm x 8cm",
      material: "Durable plastic",
      color: "Black",
      weight: "350g",
      capacity: "Holds up to 3 power strips"
    })
  },
  {
    sku: "CT-001",
    name: "Premium Cable Ties - 100 Pack",
    description: "Professional-grade cable ties for secure cable management. Reusable and adjustable design.",
    category: "Cable Accessories",
    price: 890, // $8.90
    stockQuantity: 150,
    imageUrl: "https://images.unsplash.com/photo-1591290619762-c588f7e0f12d?w=800",
    specifications: JSON.stringify({
      quantity: "100 pieces",
      material: "Nylon",
      colors: "Assorted (Black, White, Blue)",
      length: "20cm",
      maxDiameter: "5cm"
    })
  },
  {
    sku: "CM-001",
    name: "Under Desk Cable Tray",
    description: "Spacious cable management tray that mounts under any desk. Keeps cables organized and out of sight.",
    category: "Cable Management",
    price: 3490, // $34.90
    stockQuantity: 28,
    imageUrl: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=800",
    specifications: JSON.stringify({
      dimensions: "90cm x 14cm x 10cm",
      material: "Metal mesh",
      color: "Silver",
      weight: "1.2kg",
      mounting: "Clamp or screw mount"
    })
  },
  {
    sku: "PS-001",
    name: "6-Outlet Power Strip with Surge Protection",
    description: "Premium power strip with built-in surge protection. Features 6 outlets and 2 USB ports.",
    category: "Power Solutions",
    price: 4290, // $42.90
    stockQuantity: 62,
    imageUrl: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=800",
    specifications: JSON.stringify({
      outlets: "6 AC outlets",
      usbPorts: "2 USB-A ports (2.4A each)",
      surgeProtection: "900 Joules",
      cableLength: "2 meters",
      safety: "Overload protection, fireproof casing"
    })
  },
  {
    sku: "CM-002",
    name: "Cable Sleeve - Flexible Wrap",
    description: "Flexible cable sleeve for bundling and protecting multiple cables. Easy to install and remove.",
    category: "Cable Accessories",
    price: 1290, // $12.90
    stockQuantity: 85,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    specifications: JSON.stringify({
      length: "3 meters",
      diameter: "2.5cm expandable",
      material: "Polyester braided",
      color: "Black",
      features: "Expandable, flame retardant"
    })
  },
  {
    sku: "WM-001",
    name: "Wall Mount Cable Clips - 50 Pack",
    description: "Adhesive cable clips for routing cables along walls and surfaces. No drilling required.",
    category: "Cable Accessories",
    price: 690, // $6.90
    stockQuantity: 200,
    imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800",
    specifications: JSON.stringify({
      quantity: "50 pieces",
      material: "ABS plastic with 3M adhesive",
      color: "White",
      cableSize: "Fits cables up to 8mm diameter",
      surface: "Works on smooth surfaces"
    })
  },
  {
    sku: "PS-002",
    name: "Smart Power Strip with Timer",
    description: "Intelligent power strip with programmable timer and individual outlet control. Energy-saving design.",
    category: "Power Solutions",
    price: 5990, // $59.90
    stockQuantity: 15,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    specifications: JSON.stringify({
      outlets: "4 smart outlets, 4 standard outlets",
      features: "WiFi control, timer, scheduling",
      app: "iOS and Android compatible",
      power: "Max 2500W",
      warranty: "2 years"
    })
  }
];

const sampleOrders = [
  {
    orderNumber: "ORD-2026-0042",
    customerName: "Sarah Tan",
    customerEmail: "sarah.tan@example.com",
    customerPhone: "+65 9123 4567",
    deliveryAddress: "123 Orchard Road, #05-67, Singapore 238858",
    status: "ready_to_dispatch",
    subtotal: 7870,
    deliveryFee: 500,
    tax: 590,
    total: 8960,
    paymentStatus: "paid",
    estimatedDeliveryDate: new Date("2026-02-05"),
    courierService: "SingPost",
    trackingNumber: "SP123456789SG",
    deliveryInstructions: "Please call before delivery"
  },
  {
    orderNumber: "ORD-2026-0043",
    customerName: "John Lim",
    customerEmail: "john.lim@example.com",
    customerPhone: "+65 8765 4321",
    deliveryAddress: "456 Clementi Avenue 3, #12-34, Singapore 129876",
    status: "processing",
    subtotal: 12470,
    deliveryFee: 500,
    tax: 920,
    total: 13890,
    paymentStatus: "paid",
    estimatedDeliveryDate: new Date("2026-02-08"),
    courierService: "NinjaVan",
    deliveryInstructions: "Leave at door if no one is home"
  }
];

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Insert products
    console.log("📦 Inserting products...");
    const { products } = await import("./drizzle/schema.js");
    
    for (const product of sampleProducts) {
      await db.insert(products).values(product);
      console.log(`  ✓ Added: ${product.name}`);
    }

    // Insert orders
    console.log("\\n📋 Inserting orders...");
    const { orders, orderItems } = await import("./drizzle/schema.js");
    
    for (const order of sampleOrders) {
      const result = await db.insert(orders).values(order);
      const orderId = Number(result[0].insertId);
      console.log(`  ✓ Added order: ${order.orderNumber}`);

      // Add order items for first order
      if (order.orderNumber === "ORD-2026-0042") {
        await db.insert(orderItems).values([
          {
            orderId,
            productId: 1,
            productName: "Heavy Duty Cable Box - Large",
            productSku: "CB-001",
            quantity: 2,
            unitPrice: 2990,
            subtotal: 5980
          },
          {
            orderId,
            productId: 3,
            productName: "Premium Cable Ties - 100 Pack",
            productSku: "CT-001",
            quantity: 1,
            unitPrice: 890,
            subtotal: 890
          },
          {
            orderId,
            productId: 7,
            productName: "Wall Mount Cable Clips - 50 Pack",
            productSku: "WM-001",
            quantity: 1,
            unitPrice: 690,
            subtotal: 690
          }
        ]);
      }

      // Add order items for second order
      if (order.orderNumber === "ORD-2026-0043") {
        await db.insert(orderItems).values([
          {
            orderId,
            productId: 4,
            productName: "Under Desk Cable Tray",
            productSku: "CM-001",
            quantity: 2,
            unitPrice: 3490,
            subtotal: 6980
          },
          {
            orderId,
            productId: 5,
            productName: "6-Outlet Power Strip with Surge Protection",
            productSku: "PS-001",
            quantity: 1,
            unitPrice: 4290,
            subtotal: 4290
          },
          {
            orderId,
            productId: 6,
            productName: "Cable Sleeve - Flexible Wrap",
            productSku: "CM-002",
            quantity: 1,
            unitPrice: 1290,
            subtotal: 1290
          }
        ]);
      }
    }

    console.log("\\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
