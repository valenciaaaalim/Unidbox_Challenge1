# UNiDBox Customer Portal

## Overview
Customer-facing portal for Unidbox Hardware featuring an AI-powered chatbot for intelligent product ordering, order tracking, user authentication, and personalized shopping experiences.

## Features
- 🤖 AI Chat Assistant with product recommendations
- 🛍️ Product browsing with search and filtering
- 📦 Order tracking by order number
- 👤 User authentication and profile management
- 📧 Export chat conversations to email
- 📱 Responsive design with Unidbox orange branding

## Tech Stack
- React 19 + TypeScript
- tRPC 11 for type-safe APIs
- Tailwind CSS 4 + shadcn/ui
- Drizzle ORM + MySQL
- Manus OAuth integration
- LLM integration for AI chat

## Routes
- `/` - Landing page
- `/products` - Product catalog
- `/shop` - AI-powered shopping experience
- `/track-order` - Order tracking
- `/profile` - User profile (protected)
- `/orders` - Order history (protected)

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm 10+
- MySQL/TiDB database

### Installation
```bash
cd customer-portal
pnpm install
```

### Environment Variables
All environment variables are pre-configured in the Manus platform:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - Manus OAuth app ID
- `OAUTH_SERVER_URL` - OAuth backend URL
- `BUILT_IN_FORGE_API_URL` - Manus LLM API URL
- `BUILT_IN_FORGE_API_KEY` - LLM API key

### Development
```bash
pnpm dev
```

### Database Setup
```bash
# Push schema to database
pnpm db:push

# Seed sample data
node seed-data.mjs
```

### Testing
```bash
pnpm test
```

## Project Structure
```
customer-portal/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── App.tsx      # Route definitions
│   │   └── index.css    # Theme configuration
├── server/              # Backend tRPC server
│   ├── routers.ts       # API endpoints
│   ├── db.ts            # Database queries
│   └── chat.ts          # AI chat logic
├── drizzle/             # Database schema
│   └── schema.ts
└── seed-data.mjs        # Sample data seeder
```

## Integration Notes

### Database Schema
- `products` - Product catalog with inventory
- `orders` - Customer orders
- `orderItems` - Order line items
- `chatTranscripts` - Saved chat conversations
- `users` - Customer accounts (Manus OAuth)

### API Endpoints (tRPC)
- `products.*` - Product queries
- `orders.*` - Order management
- `chat.*` - AI chat and export
- `auth.*` - Authentication

## Deployment
Deployed on Manus platform at: https://unidboxai-cdny4shw.manus.space/

## License
Proprietary - Unidbox Hardware

## Contact
For integration questions or support, contact the development team.
