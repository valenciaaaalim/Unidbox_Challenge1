// UnidBox AI Sales Agent - Mock Data
// This file contains all mock data for the hackathon prototype

// Product Categories
export const categories = [
  { id: 'cat-1', name: 'Cables & Wiring', icon: '🔌' },
  { id: 'cat-2', name: 'Connectors', icon: '🔗' },
  { id: 'cat-3', name: 'Tools', icon: '🔧' },
  { id: 'cat-4', name: 'Safety Equipment', icon: '🦺' },
  { id: 'cat-5', name: 'Lighting', icon: '💡' },
];

// Products with cross-sell associations
export const products = [
  {
    id: 'prod-001',
    sku: 'CBL-CAT6-100',
    name: 'CAT6 Ethernet Cable 100m',
    category: 'cat-1',
    price: 89.99,
    unit: 'roll',
    stock: 250,
    image: '/images/hero-dealer.png',
    description: 'High-quality CAT6 ethernet cable for professional installations.',
    crossSell: ['prod-002', 'prod-003'],
    popularWith: ['Steady Steven', 'Project Patricia'],
  },
  {
    id: 'prod-002',
    sku: 'CON-RJ45-100',
    name: 'RJ45 Connectors (100 pack)',
    category: 'cat-2',
    price: 24.99,
    unit: 'pack',
    stock: 500,
    image: '/images/predictive-cart.png',
    description: 'Gold-plated RJ45 connectors for reliable connections.',
    crossSell: ['prod-001', 'prod-004'],
    popularWith: ['Project Patricia'],
  },
  {
    id: 'prod-003',
    sku: 'TLS-CRIMP-01',
    name: 'Professional Crimping Tool',
    category: 'cat-3',
    price: 45.99,
    unit: 'piece',
    stock: 75,
    image: '/images/hero-dealer.png',
    description: 'Heavy-duty crimping tool for RJ45 and RJ11 connectors.',
    crossSell: ['prod-002', 'prod-005'],
    popularWith: ['Mobile Mike'],
  },
  {
    id: 'prod-004',
    sku: 'TLS-TESTER-01',
    name: 'Cable Tester Pro',
    category: 'cat-3',
    price: 79.99,
    unit: 'piece',
    stock: 45,
    image: '/images/hero-admin.png',
    description: 'Professional cable tester with LCD display.',
    crossSell: ['prod-001', 'prod-003'],
    popularWith: ['Project Patricia', 'Volume Victor'],
  },
  {
    id: 'prod-005',
    sku: 'SAF-GLOVES-L',
    name: 'Insulated Work Gloves (L)',
    category: 'cat-4',
    price: 18.99,
    unit: 'pair',
    stock: 200,
    image: '/images/predictive-cart.png',
    description: 'Electrical-rated insulated work gloves, size Large.',
    crossSell: ['prod-006'],
    popularWith: ['Steady Steven'],
  },
  {
    id: 'prod-006',
    sku: 'SAF-GLASSES-01',
    name: 'Safety Glasses Clear',
    category: 'cat-4',
    price: 12.99,
    unit: 'piece',
    stock: 300,
    image: '/images/hero-dealer.png',
    description: 'ANSI-rated clear safety glasses with anti-fog coating.',
    crossSell: ['prod-005'],
    popularWith: ['Steady Steven', 'Mobile Mike'],
  },
  {
    id: 'prod-007',
    sku: 'LGT-LED-PANEL',
    name: 'LED Panel Light 60x60cm',
    category: 'cat-5',
    price: 54.99,
    unit: 'piece',
    stock: 120,
    image: '/images/hero-admin.png',
    description: '40W LED panel light, 4000K neutral white.',
    crossSell: ['prod-008'],
    popularWith: ['Volume Victor'],
  },
  {
    id: 'prod-008',
    sku: 'LGT-DRIVER-40W',
    name: 'LED Driver 40W',
    category: 'cat-5',
    price: 19.99,
    unit: 'piece',
    stock: 180,
    image: '/images/predictive-cart.png',
    description: 'Constant current LED driver for panel lights.',
    crossSell: ['prod-007'],
    popularWith: ['Volume Victor', 'Project Patricia'],
  },
];

// Dealer Personas
export type DealerTier = 'silver' | 'gold' | 'platinum';

export interface Dealer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  tier: DealerTier;
  totalSpend: number;
  orderCount: number;
  avgOrderValue: number;
  lastOrderDate: string;
  reorderCycle: number; // days
  avatar: string;
  persona: string;
}

export const dealers: Dealer[] = [
  {
    id: 'dealer-001',
    name: 'Steven Lim',
    company: 'Steady Electrical Supplies',
    email: 'steven@steadyelectrical.com',
    phone: '+65 9123 4567',
    tier: 'gold',
    totalSpend: 45680,
    orderCount: 48,
    avgOrderValue: 951.67,
    lastOrderDate: '2026-01-15',
    reorderCycle: 14,
    avatar: 'SL',
    persona: 'Steady Steven',
  },
  {
    id: 'dealer-002',
    name: 'Patricia Tan',
    company: 'Project Pro Solutions',
    email: 'patricia@projectpro.sg',
    phone: '+65 9234 5678',
    tier: 'platinum',
    totalSpend: 128450,
    orderCount: 85,
    avgOrderValue: 1511.18,
    lastOrderDate: '2026-01-28',
    reorderCycle: 7,
    avatar: 'PT',
    persona: 'Project Patricia',
  },
  {
    id: 'dealer-003',
    name: 'Mike Chen',
    company: 'Mobile Tech Services',
    email: 'mike@mobiletech.sg',
    phone: '+65 9345 6789',
    tier: 'silver',
    totalSpend: 12340,
    orderCount: 22,
    avgOrderValue: 560.91,
    lastOrderDate: '2026-01-20',
    reorderCycle: 21,
    avatar: 'MC',
    persona: 'Mobile Mike',
  },
  {
    id: 'dealer-004',
    name: 'Victor Wong',
    company: 'Volume Wholesale Pte Ltd',
    email: 'victor@volumewholesale.com',
    phone: '+65 9456 7890',
    tier: 'platinum',
    totalSpend: 285000,
    orderCount: 120,
    avgOrderValue: 2375.00,
    lastOrderDate: '2026-01-30',
    reorderCycle: 5,
    avatar: 'VW',
    persona: 'Volume Victor',
  },
];

// Current logged-in dealer (for demo)
export const currentDealer = dealers[0]; // Steven Lim

// Orders
export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  dealerId: string;
  items: OrderItem[];
  subtotal: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  deliveryOrderId?: string;
}

export const orders: Order[] = [
  {
    id: 'ORD-2026-0041',
    dealerId: 'dealer-001',
    items: [
      { productId: 'prod-001', quantity: 10, unitPrice: 89.99 },
      { productId: 'prod-002', quantity: 5, unitPrice: 24.99 },
    ],
    subtotal: 1024.85,
    status: 'delivered',
    createdAt: '2026-01-15T10:30:00Z',
    deliveryOrderId: 'DO-2026-0041',
  },
  {
    id: 'ORD-2026-0042',
    dealerId: 'dealer-002',
    items: [
      { productId: 'prod-007', quantity: 20, unitPrice: 54.99 },
      { productId: 'prod-008', quantity: 20, unitPrice: 19.99 },
    ],
    subtotal: 1499.60,
    status: 'shipped',
    createdAt: '2026-01-28T14:15:00Z',
    deliveryOrderId: 'DO-2026-0042',
  },
  {
    id: 'ORD-2026-0043',
    dealerId: 'dealer-004',
    items: [
      { productId: 'prod-001', quantity: 50, unitPrice: 89.99 },
      { productId: 'prod-002', quantity: 30, unitPrice: 24.99 },
    ],
    subtotal: 5249.20,
    status: 'processing',
    createdAt: '2026-01-30T09:00:00Z',
  },
];

// Predictive Cart for Steven (based on order history)
export const predictiveCart = {
  dealerId: 'dealer-001',
  prediction: {
    confidence: 0.92,
    nextOrderDate: '2026-01-31',
    message: "Based on your 14-day reorder cycle, you're likely due for a restock!",
  },
  suggestedItems: [
    { productId: 'prod-001', quantity: 10, reason: 'You order this every 2 weeks' },
    { productId: 'prod-002', quantity: 5, reason: 'Usually ordered with CAT6 cables' },
    { productId: 'prod-005', quantity: 3, reason: 'Running low based on usage pattern' },
  ],
};

// AI Recommendations (Cross-sell/Upsell)
export interface Recommendation {
  productId: string;
  reason: string;
  confidence: number;
  potentialRevenue: number;
}

export const getRecommendations = (cartItems: string[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  cartItems.forEach(itemId => {
    const product = products.find(p => p.id === itemId);
    if (product) {
      product.crossSell.forEach(crossSellId => {
        if (!cartItems.includes(crossSellId)) {
          const crossSellProduct = products.find(p => p.id === crossSellId);
          if (crossSellProduct) {
            recommendations.push({
              productId: crossSellId,
              reason: `Frequently bought with ${product.name}`,
              confidence: 0.85,
              potentialRevenue: crossSellProduct.price,
            });
          }
        }
      });
    }
  });
  
  return recommendations.slice(0, 3); // Return top 3 recommendations
};

// Loyalty Tiers
export const loyaltyTiers = {
  silver: {
    name: 'Silver',
    minSpend: 0,
    benefits: ['Standard pricing', 'Email support'],
    color: '#9CA3AF',
  },
  gold: {
    name: 'Gold',
    minSpend: 25000,
    benefits: ['5% volume rebate', 'Priority fulfillment', 'Phone support'],
    color: '#F59E0B',
  },
  platinum: {
    name: 'Platinum',
    minSpend: 100000,
    benefits: ['8% volume rebate', 'Same-day delivery', 'Dedicated account manager', 'Exclusive products'],
    color: '#8B5CF6',
  },
};

// Admin Dashboard Metrics
export const adminMetrics = {
  today: {
    orders: 12,
    revenue: 15420.50,
    avgOrderValue: 1285.04,
    aiRecommendationsAccepted: 8,
  },
  week: {
    orders: 67,
    revenue: 89340.00,
    avgOrderValue: 1333.43,
    aiRecommendationsAccepted: 42,
  },
  month: {
    orders: 245,
    revenue: 342500.00,
    avgOrderValue: 1398.00,
    aiRecommendationsAccepted: 156,
  },
  aiPerformance: {
    predictiveCartAccuracy: 0.89,
    recommendationAcceptRate: 0.23,
    avgAovIncrease: 0.12,
  },
  atRiskDealers: [
    { dealerId: 'dealer-003', daysSinceLastOrder: 11, usualCycle: 7 },
  ],
};

// Agent Activity Log
export interface AgentAction {
  id: string;
  agentType: 'reorder' | 'upsell' | 'loyalty' | 'monitoring' | 'content';
  action: string;
  target: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export const agentActivityLog: AgentAction[] = [
  {
    id: 'act-001',
    agentType: 'reorder',
    action: 'Sent predictive cart notification',
    target: 'Steven Lim (Steady Electrical)',
    timestamp: '2026-01-31T08:00:00Z',
    status: 'success',
  },
  {
    id: 'act-002',
    agentType: 'upsell',
    action: 'Generated cross-sell recommendation',
    target: 'Patricia Tan (Project Pro)',
    timestamp: '2026-01-31T07:45:00Z',
    status: 'success',
  },
  {
    id: 'act-003',
    agentType: 'loyalty',
    action: 'Tier upgrade notification sent',
    target: 'Mike Chen → Gold tier',
    timestamp: '2026-01-30T16:30:00Z',
    status: 'pending',
  },
  {
    id: 'act-004',
    agentType: 'monitoring',
    action: 'At-risk dealer alert triggered',
    target: 'Mike Chen (11 days since last order)',
    timestamp: '2026-01-31T06:00:00Z',
    status: 'success',
  },
  {
    id: 'act-005',
    agentType: 'content',
    action: 'Marketing content generated',
    target: 'LED Panel Light promotion',
    timestamp: '2026-01-30T14:00:00Z',
    status: 'success',
  },
];
