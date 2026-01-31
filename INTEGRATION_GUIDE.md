# UnidBox Lifecycle Management Feature - Integration Guide

## 1. Feature Branch URL

**Deployed Manus Site URL:** `https://unidbox-lifecycle-xxxxx.manus.space` (after publishing)

**Development Preview URL:** `https://3000-iqfd0d5o1kmcpqjbext7v-e688775a.sg1.manus.computer`

**Checkpoint Version:** `886d04fb`

---

## 2. Feature Name & Description

### Feature Name: **Lifecycle Management Module**

### Description:
A comprehensive post-sales lifecycle tracking system that helps dealers manage their purchased products throughout their entire lifecycle, while providing admins with analytics to identify revenue opportunities and proactively engage dealers.

**Key Capabilities:**
- **Product Lifecycle Tracking**: Visual progress bars showing product lifecycle stages (Active → Maintenance → Approaching EOL → Reorder)
- **Product Care Guides**: Storage tips, maintenance schedules, and troubleshooting guides
- **Timeline View**: Product journey from purchase through maintenance milestones
- **Cost Analysis**: Total Cost of Ownership (TCO) breakdown with projections
- **Maintenance History**: Track and log maintenance activities
- **One-Click Reorder**: Quick reorder functionality when products reach EOL
- **Admin Analytics Dashboard**: Lifecycle distribution, revenue opportunities, dealer engagement queue

---

## 3. New Routes/Pages Added

| Route | Page Component | Description |
|-------|----------------|-------------|
| `/dealer/lifecycle` | `Lifecycle.tsx` | My Products page - dealers view and manage their purchased products |
| `/dealer/notifications` | `Notifications.tsx` | Full notification history page |
| `/admin` | `AdminAnalytics.tsx` | Admin analytics dashboard with lifecycle insights |
| `/admin/lifecycle` | `AdminAnalytics.tsx` | Admin lifecycle insights (same component, different nav context) |
| `/admin/dealers` | `AdminAnalytics.tsx` | Dealer management view |
| `/admin/engagement` | `AdminAnalytics.tsx` | Proactive engagement queue |
| `/admin/settings` | `AdminAnalytics.tsx` | Admin settings |

---

## 4. Modified Existing Pages

### Dashboard.tsx
- **Added**: "AI Predictive Cart" section showing reorder suggestions based on purchase patterns
- **Added**: Quick stats cards for lifecycle status

### DashboardLayout.tsx
- **Added**: "My Products" navigation item with "New" badge
- **Added**: "Switch to Admin View" button for portal switching
- **Added**: Support for `isAdmin` prop to render admin-specific sidebar
- **Modified**: Notification bell to support admin notifications

### NotificationPanel.tsx
- **Added**: Support for `isAdmin` prop
- **Added**: Admin-specific notification types (revenue, dealer, alert)
- **Added**: Different notification content for admin vs dealer views

---

## 5. New Components Created

### Core Feature Components

| Component | Path | Description |
|-----------|------|-------------|
| `Lifecycle.tsx` | `client/src/pages/Lifecycle.tsx` | Main "My Products" page with product grid, filtering, and detailed modals |
| `AdminAnalytics.tsx` | `client/src/pages/AdminAnalytics.tsx` | Admin dashboard with charts, engagement queue, and dealer analytics |
| `ProductCareModal.tsx` | `client/src/components/ProductCareModal.tsx` | Modal with storage tips, maintenance schedules, troubleshooting |
| `NotificationPanel.tsx` | `client/src/components/NotificationPanel.tsx` | Dropdown notification panel (enhanced) |
| `Notifications.tsx` | `client/src/pages/Notifications.tsx` | Full notifications page |

### Key UI Elements in Lifecycle.tsx

1. **Status Filter Cards**: Clickable cards to filter by Active/Maintenance/Approaching EOL/Reorder
2. **Product Cards**: Visual cards with product image, lifecycle progress bar, warranty status
3. **Product Details Dialog**: 4-tab modal (Overview, Timeline, Maintenance, Cost Analysis)
4. **TCO Summary Bar**: Shows Total Investment, Maintenance Spent, Total TCO
5. **Bulk Selection**: Checkbox selection for bulk reorder

### Key UI Elements in AdminAnalytics.tsx

1. **KPI Cards**: Total Products, Fleet Health Score, Attention Required, Projected Revenue, Active Dealers
2. **Lifecycle Distribution Chart**: Pie chart with product stage breakdown
3. **Lifecycle Trend Chart**: Stacked area chart showing 6-month trends
4. **Proactive Engagement Queue**: Priority-ranked dealer list with action buttons
5. **Revenue Opportunities Tab**: 30/60/90-day projections, at-risk revenue
6. **Dealer Engagement Tab**: Table with dealer lifecycle summary
7. **Product Health Tab**: Category health bar chart, compliance rates

---

## 6. Dependencies

### External Dependencies (already in package.json)
- `recharts` - For charts in AdminAnalytics
- `@radix-ui/react-checkbox` - For product selection
- `@radix-ui/react-tabs` - For tabbed interfaces
- `@radix-ui/react-dialog` - For modals
- `@radix-ui/react-progress` - For lifecycle progress bars

### Feature Dependencies
- **Depends on**: Order history data (to populate purchased products)
- **Depends on**: Product catalog data (for product details, images)
- **Other features may depend on**: Notification system (for lifecycle alerts)

---

## 7. Data/State Requirements

### Data Models Required

```typescript
// Product Lifecycle Item
interface LifecycleProduct {
  id: string;
  name: string;
  sku: string;
  image: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  lifecyclePercentage: number;
  stage: "active" | "maintenance" | "approaching" | "reorder";
  nextAction: string;
  daysUntilAction: number;
  expectedLifespan: string;
  lastMaintenance?: string;
  warrantyStatus: "active" | "expiring" | "expired";
  warrantyExpiry: string;
  maintenanceCost: number;
}

// Maintenance History Entry
interface MaintenanceEntry {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  performedBy: string;
}

// Notification
interface Notification {
  id: string;
  type: "delivery" | "checkin" | "maintenance" | "reorder" | "eol" | "revenue" | "dealer" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

// Dealer Engagement (Admin)
interface DealerEngagement {
  id: string;
  name: string;
  products: number;
  atRisk: number;
  revenue: number;
  lastOrder: string;
  status: "active" | "warning" | "critical";
}
```

### API Endpoints Needed (for backend integration)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dealer/products` | GET | Get dealer's purchased products with lifecycle data |
| `/api/dealer/products/:id/maintenance` | GET | Get maintenance history for a product |
| `/api/dealer/products/:id/maintenance` | POST | Log new maintenance activity |
| `/api/notifications` | GET | Get user notifications |
| `/api/notifications/:id/read` | PATCH | Mark notification as read |
| `/api/admin/lifecycle/stats` | GET | Get lifecycle distribution stats |
| `/api/admin/dealers/engagement` | GET | Get dealer engagement data |
| `/api/admin/revenue/projections` | GET | Get revenue projections |

### State Management
- Currently uses local React state with mock data
- Ready for integration with API calls via `useEffect` or React Query

---

## 8. Integration Notes

### Critical Integration Points

1. **Navigation Integration**
   - Add "My Products" to the dealer sidebar navigation
   - Add admin routes if admin portal is separate
   - Ensure "Switch to Admin/Dealer View" button works with your auth system

2. **Data Integration**
   - Replace mock data in `Lifecycle.tsx` with API calls
   - Connect lifecycle calculations to actual order history
   - Implement real notification system

3. **Styling Consistency**
   - Uses Tailwind CSS with custom CSS variables
   - Primary color: Blue (#2563eb)
   - Admin sidebar: Dark slate (#0f172a)
   - Ensure CSS variables in `index.css` are merged

4. **Component Reuse**
   - `DashboardLayout` supports both dealer and admin modes via `isAdmin` prop
   - `NotificationPanel` supports both modes via `isAdmin` prop

### Files to Merge

**Priority 1 - Core Feature Files:**
```
client/src/pages/Lifecycle.tsx          # Main feature page
client/src/pages/AdminAnalytics.tsx     # Admin dashboard
client/src/pages/Notifications.tsx      # Notifications page
client/src/components/ProductCareModal.tsx
```

**Priority 2 - Modified Shared Components:**
```
client/src/components/DashboardLayout.tsx  # Enhanced with admin support
client/src/components/NotificationPanel.tsx # Enhanced with admin notifications
client/src/App.tsx                         # Route definitions
```

**Priority 3 - Styles:**
```
client/src/index.css                    # CSS variables (merge carefully)
```

### Potential Conflicts
- `DashboardLayout.tsx` - May conflict if other features modified navigation
- `App.tsx` - Route definitions need to be merged
- `index.css` - CSS variables should be reviewed for conflicts

---

## 9. Source Code Location

### Project Directory Structure

```
/home/ubuntu/unidbox-lifecycle/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx      # ⭐ Modified - Admin support added
│   │   │   ├── NotificationPanel.tsx    # ⭐ Modified - Admin notifications
│   │   │   ├── ProductCareModal.tsx     # ⭐ New - Product care guides
│   │   │   └── ui/                      # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Lifecycle.tsx            # ⭐ New - Main feature page
│   │   │   ├── AdminAnalytics.tsx       # ⭐ New - Admin dashboard
│   │   │   ├── Notifications.tsx        # ⭐ New - Notifications page
│   │   │   ├── Dashboard.tsx            # Modified - AI Predictive Cart
│   │   │   ├── Cart.tsx
│   │   │   ├── Catalog.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── Orders.tsx
│   │   │   └── Loyalty.tsx
│   │   ├── App.tsx                      # ⭐ Modified - New routes
│   │   ├── index.css                    # ⭐ Modified - CSS variables
│   │   └── main.tsx
│   └── index.html
├── server/
│   └── index.ts
├── package.json
└── INTEGRATION_GUIDE.md                 # This file
```

### Key Files Summary

| File | Status | Lines | Description |
|------|--------|-------|-------------|
| `Lifecycle.tsx` | NEW | ~850 | My Products page with full lifecycle management |
| `AdminAnalytics.tsx` | NEW | ~650 | Admin analytics dashboard |
| `ProductCareModal.tsx` | NEW | ~270 | Product care modal component |
| `Notifications.tsx` | NEW | ~200 | Full notifications page |
| `DashboardLayout.tsx` | MODIFIED | ~260 | Added admin mode support |
| `NotificationPanel.tsx` | MODIFIED | ~200 | Added admin notifications |
| `App.tsx` | MODIFIED | ~55 | Added new routes |

---

## 10. Testing Checklist

Before integration, verify:

- [ ] `/dealer/lifecycle` page loads correctly
- [ ] Product cards display with correct lifecycle stages
- [ ] Product details modal opens with all 4 tabs working
- [ ] Status filter cards filter products correctly
- [ ] Notification bell shows unread count
- [ ] Notification panel opens and displays notifications
- [ ] `/admin` page loads with analytics dashboard
- [ ] Charts render correctly (Lifecycle Distribution, Trend)
- [ ] Engagement queue displays with Email/Call buttons
- [ ] "Switch to Admin/Dealer View" navigation works
- [ ] Mobile responsiveness is maintained

---

## Contact

For questions about this feature integration, refer to the checkpoint version `886d04fb` or the development preview URL.
