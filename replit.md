# Grocery Tracker

## Overview

Grocery Tracker is an offline-first mobile application built with Expo/React Native that helps users track grocery spending against deposited credit with a local shopkeeper. Users deposit lump sum amounts, make daily purchases, and the app tracks balances, spending history, and analytics. The app uses Indian currency formatting (₹) by default and supports both light and dark modes.

The project has a dual architecture: a React Native frontend (primary) that works offline using AsyncStorage, and an Express backend server that currently serves as a landing page / API scaffold but is not actively used for core data operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo/React Native)

- **Framework**: Expo SDK 54 with expo-router for file-based routing
- **Navigation**: Tab-based layout with 4 tabs (Home, Analytics, Items, Settings) plus modal screens for adding purchases, deposits, and items
- **State Management**: React Context (`lib/context.tsx`) wrapping the entire app, providing all data and operations to child components
- **Data Fetching Layer**: TanStack React Query is installed and configured (`lib/query-client.ts`) but the app primarily operates offline using local storage
- **Styling**: StyleSheet-based with a custom color system (`constants/colors.ts`) supporting light and dark themes
- **Fonts**: Inter font family (400, 500, 600, 700 weights) via `@expo-google-fonts/inter`
- **Animations**: react-native-reanimated for entry animations (FadeInDown)
- **Haptic Feedback**: expo-haptics for touch feedback on native platforms

### Data Storage (Offline-First)

- **Primary Storage**: AsyncStorage (`@react-native-async-storage/async-storage`) for all app data
- **Data Layer**: `lib/storage.ts` handles all CRUD operations with keys prefixed `@grocery_`
- **Data Models**:
  - `Deposit`: id, amount, date, note
  - `Purchase`: id, itemName, price, quantity, totalPrice, date
  - `CommonItem`: id, name, defaultPrice (frequently purchased items for quick entry)
  - `AppSettings`: darkMode, currency, monthlyBudget
- **ID Generation**: Uses `expo-crypto` (randomUUID) for generating unique identifiers

### Backend (Express Server)

- **Framework**: Express 5 running on Node.js
- **Purpose**: Currently a scaffold — serves a landing page and has CORS configured for Replit domains
- **Database Schema**: Drizzle ORM with PostgreSQL configured (`shared/schema.ts`) but only has a `users` table — not used by the app's core features
- **Storage**: In-memory storage (`server/storage.ts`) with a `MemStorage` class for users
- **Routes**: Empty route scaffold in `server/routes.ts` — all routes should be prefixed with `/api`
- **Build**: Server compiles via esbuild to `server_dist/`

### Key Architectural Decisions

1. **Offline-first with AsyncStorage over server-backed DB**: The app stores all grocery data locally on the device, making it work without network connectivity. The tradeoff is no cross-device sync, but it matches the use case of a single user tracking personal spending.

2. **React Context over Zustand/Redux**: All state is managed through a single AppContext provider. This keeps things simple but could become a performance concern if the app grows significantly.

3. **File-based routing with expo-router**: Routes are defined by file structure under `app/`. Tabs live in `app/(tabs)/` and modal screens are at the root level (`add-purchase.tsx`, `add-deposit.tsx`, `add-item.tsx`).

4. **Drizzle schema exists but is disconnected from the app**: The `shared/schema.ts` defines a users table with Drizzle ORM targeting PostgreSQL, but the app doesn't use it. This is scaffolding for potential future server-side features.

### Project Structure

```
app/                    # Expo Router pages
  (tabs)/               # Tab navigation screens
    index.tsx           # Home - balance card, today's purchases, quick actions
    analytics.tsx       # Spending charts and monthly breakdown
    items.tsx           # Common items management
    settings.tsx        # App settings (theme, budget, data management)
  add-purchase.tsx      # Modal: log a new purchase
  add-deposit.tsx       # Modal: add money deposit
  add-item.tsx          # Modal: add a common item
components/             # Shared UI components
constants/              # Theme colors
lib/                    # Core logic
  context.tsx           # App-wide React Context provider
  storage.ts            # AsyncStorage data layer
  query-client.ts       # TanStack Query config (for API calls)
server/                 # Express backend
  index.ts              # Server entry point
  routes.ts             # API route registration
  storage.ts            # In-memory storage
shared/                 # Shared between client and server
  schema.ts             # Drizzle ORM schema (PostgreSQL)
migrations/             # Drizzle migration output directory
```

### Running the App

- **Development (Expo)**: `npm run expo:dev` — starts Expo dev server
- **Development (Server)**: `npm run server:dev` — starts Express with tsx
- **Production Server**: `npm run server:prod` — runs compiled server
- **Database Migrations**: `npm run db:push` — pushes Drizzle schema to PostgreSQL

## External Dependencies

- **PostgreSQL**: Configured via `DATABASE_URL` environment variable for Drizzle ORM. Required for `db:push` but not for the app's current offline functionality
- **AsyncStorage**: Primary data persistence on device — no external service needed
- **Expo Services**: Standard Expo build and development toolchain
- **No external APIs**: The app is fully self-contained with no third-party API integrations for core features
- **Key npm packages**: expo (SDK 54), expo-router, react-native-reanimated, @tanstack/react-query, drizzle-orm, express 5, pg