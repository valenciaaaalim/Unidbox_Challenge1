# UnidBox AI Sales Agent - TODO

## Core Features (Existing)
- [x] Landing Page with hero section
- [x] Dealer Portal Dashboard with Predictive Cart
- [x] Product Catalog with category filtering
- [x] Shopping Cart with AI recommendations
- [x] Order History page
- [x] Loyalty Program page with tier progression
- [x] Admin Dashboard with real-time metrics
- [x] Admin Orders management
- [x] Admin Dealers management with at-risk alerts
- [x] Admin AI Agents monitoring
- [x] Admin Analytics with revenue insights

## Full-Stack Upgrade
- [x] Upgrade to full-stack with backend capabilities
- [x] Push database schema
- [x] Resolve Home.tsx conflict (keep existing landing page)

## AI Chatbot Feature
- [x] Create AI chatbot component for Dealer Portal
- [x] Implement backend tRPC routes for chat
- [x] Integrate LLM for intelligent responses
- [x] Add product inquiry handling
- [x] Add availability/pricing checks
- [x] Add AI recommendations in chat
- [x] Add quick reorder functionality
- [x] Add order status checking
- [x] Add marketing content generation

## Testing & Polish
- [x] Write vitest tests for chat functionality
- [x] Test complete user flow
- [ ] Polish UI and fix any issues

## New Features - Phase 2

### Add to Cart from Chat
- [x] Create cart database table
- [x] Add cart tRPC routes (add, remove, get)
- [x] Update AI to include "Add to Cart" buttons in responses
- [x] Create CartContext for state management
- [x] Wire up Add to Cart buttons in chat

### Order Placement via Chat
- [x] Create orders database table
- [x] Create delivery_orders database table
- [x] Add order tRPC routes (create, get, list)
- [x] Implement DO PDF generation
- [x] Update AI to handle order placement commands
- [x] Add order confirmation flow in chat

### Chat History Persistence
- [x] Create chat_sessions database table
- [x] Create chat_messages database table
- [x] Add chat history tRPC routes (save, load, list)
- [x] Update Chat page to load/save history
- [x] Add conversation resume functionality
