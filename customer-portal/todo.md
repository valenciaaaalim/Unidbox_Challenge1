# Unidbox Customer Portal - TODO

## Database & Backend
- [x] Create products table with inventory tracking
- [x] Create orders table with status tracking
- [x] Create order items table for order details
- [x] Create chat transcripts table for export functionality
- [x] Add tRPC procedures for product queries
- [x] Add tRPC procedures for order tracking
- [x] Add tRPC procedures for chat export to email
- [x] Implement AI chat backend with LLM integration
- [x] Add inventory checking logic
- [x] Add alternative product suggestion logic

## Landing Page
- [x] Design hero section with Unidbox branding
- [x] Implement product categories showcase
- [x] Add navigation header with logo and links
- [x] Add footer with company information
- [x] Apply Unidbox orange theme (#FF8C42)
- [x] Add link to order tracking page

## AI Chat Widget
- [x] Create floating chat button (bottom-right, orange circular)
- [x] Implement expand/collapse animation
- [x] Build docked chat panel (30% width, right side)
- [x] Design chat message interface (user/AI bubbles)
- [x] Add text input with send button
- [x] Implement typing indicator
- [x] Add timestamp display for messages
- [x] Create chat header with title and controls

## Interactive Product Cards
- [x] Design product card component for chat
- [x] Add product image, name, price, specs
- [x] Implement click handler to update left panel
- [x] Add smooth transition animation
- [x] Sync left panel with chat interactions

## Suggested Action Buttons
- [x] Create action button component
- [ ] Implement "Wait for restock" action
- [ ] Implement "Purchase alternative" action
- [ ] Implement "Add to cart" action
- [ ] Implement "View similar products" action
- [x] Add context-aware button display logic

## Export Chat to Email
- [x] Add "Export to Email" button in chat header
- [x] Create email input modal
- [x] Implement chat transcript formatting
- [x] Add email sending functionality
- [x] Show confirmation message after sending

## Dashboard Navigation
- [x] Add "View My Orders" button in chat interface
- [x] Implement navigation to order tracking page
- [x] Add dashboard icon
- [x] Add tooltip on hover

## Product Browsing (Left Panel 70%)
- [x] Create product grid layout
- [x] Implement product categories filter
- [x] Add search functionality
- [x] Design product card for grid view
- [ ] Add pagination or infinite scroll

## Product Detail View
- [x] Create product detail page layout
- [ ] Add image gallery with zoom
- [x] Display detailed specifications
- [x] Show pricing and stock availability
- [x] Add "Add to Cart" button
- [ ] Display related products section
- [x] Add breadcrumb navigation
- [ ] Add "Back to Chat" floating button

## Order Tracking Page
- [x] Create order search interface
- [x] Implement search by order number
- [x] Design order status timeline
- [x] Display order header (number, date, status)
- [x] Show customer information
- [x] Display delivery address
- [x] Create items ordered table/cards
- [x] Show order summary (subtotal, fees, total)
- [x] Display delivery information
- [x] Add action buttons (contact support, download invoice, reorder)

## Split-View Layout
- [x] Implement 70/30 split layout
- [x] Make layout responsive for mobile/tablet
- [x] Add collapsible chat panel for smaller screens
- [x] Ensure synchronization between panels

## Real-time Inventory
- [x] Implement inventory status checking
- [x] Add out-of-stock detection
- [x] Create alternative product suggestion algorithm
- [x] Display stock availability in product cards
- [x] Update chat responses based on inventory

## Styling & Theme
- [ ] Set up Unidbox orange color palette
- [ ] Configure typography
- [ ] Add hover states and transitions
- [ ] Implement responsive design
- [ ] Add loading states and skeletons
- [ ] Ensure accessibility (WCAG AA)

## Testing & Deployment
- [ ] Test chat widget functionality
- [ ] Test product browsing and detail views
- [ ] Test order tracking search
- [ ] Test email export feature
- [ ] Test inventory checking logic
- [ ] Test responsive design on mobile/tablet
- [ ] Create project checkpoint

## Bug Fixes - Round 2
- [x] Add chat widget to Home page (currently only on Shop page)
- [x] Fix suggested action buttons to send prompts and continue conversation
- [x] Fix "Show Cable Management" button functionality

## Authentication System
- [x] Add Login/Signup button to header navigation
- [x] Integrate Manus OAuth for authentication
- [x] Create user profile page with account details
- [x] Add logout functionality
- [x] Display user name/avatar when logged in
- [x] Show personalized greeting in chat for logged-in users
- [x] Add order history for authenticated users
- [ ] Add saved addresses for faster checkout
- [x] Implement "My Account" dropdown menu
- [ ] Add protected routes for authenticated features

## Bug Fixes - Round 3
- [x] Fix chat widget layout to stay within screen boundaries
- [x] Ensure chat is fully visible and doesn't overflow
- [x] Fix chat positioning on different screen sizes
