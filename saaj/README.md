# SAAJ by MF — Luxury Pakistani Fashion E-Commerce

> *Modernity in Heritage* — a full-stack e-commerce platform for SAAJ by MF.

## Tech Stack

- **Frontend:** React 18 + Vite, Wouter, TanStack Query, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Express 5, Node.js (TypeScript via `tsx`)
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Session-based (`express-session` + `connect-pg-simple`), bcrypt password hashing
- **Uploads:** Multer (stored under `public/uploads/`)

## Project Structure

```
.
├── client/                # React frontend (Vite)
│   └── src/
│       ├── components/    # Shared UI components (incl. shadcn/ui)
│       ├── hooks/         # Custom React hooks (use-online-status, use-toast, …)
│       ├── lib/           # constants, queryClient, auth/cart context, utils
│       ├── pages/         # Route pages (public + /admin/*)
│       ├── App.tsx
│       └── main.tsx
├── server/                # Express API
│   ├── index.ts           # Entry point
│   ├── routes.ts          # All HTTP routes
│   ├── storage.ts         # Data access layer (IStorage interface)
│   ├── db.ts              # Drizzle client
│   ├── auth.ts            # Session + password helpers
│   └── seed.ts            # Seed script (npm run db:seed)
├── shared/
│   └── schema.ts          # Drizzle tables + Zod insert schemas (single source of truth)
├── public/                # Static assets served by Express (incl. /uploads)
├── attached_assets/       # Brand/hero imagery referenced via @assets alias
├── script/
│   └── build.ts           # Production build (vite + esbuild → dist/)
├── drizzle.config.ts
├── tailwind.config.ts
├── vite.config.ts
└── package.json           # Single root package.json — no monorepo
```

Path aliases (vite + tsconfig): `@/*` → `client/src/*`, `@shared/*` → `shared/*`, `@assets/*` → `attached_assets/*`.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** — copy `.env.example` to `.env` and fill in:
   ```
   DATABASE_URL=postgres://user:pass@host:5432/dbname
   SESSION_SECRET=change-me-to-a-long-random-string
   PORT=5000
   NODE_ENV=development
   ```

3. **Push schema & seed**
   ```bash
   npm run db:push     # Sync shared/schema.ts → database
   npm run db:seed     # Populate collections, products, default admin
   ```

4. **Run dev server** (frontend + backend on the same port)
   ```bash
   npm run dev
   ```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Express + Vite in dev mode |
| `npm run build` | Build frontend to `dist/public` and bundle server to `dist/index.cjs` |
| `npm start` | Run production server from `dist/` |
| `npm run check` | TypeScript type-check |
| `npm run db:push` | Push Drizzle schema to the database |
| `npm run db:seed` | Seed initial data (collections, products, admin) |

## Default Admin

After seeding, sign in at `/login` with:
- **Email:** `admin@saajbymf.com`
- **Password:** `admin123` *(change immediately in Admin → Settings → Account)*

## Database

All SAAJ tables are prefixed `saaj_` (e.g. `saaj_products`, `saaj_collections`, `saaj_orders`, `saaj_users`, `saaj_settings`, `saaj_cart_items`) so the schema can safely share a database with other apps. The `banners` table is unprefixed.

## Admin Panel

`/admin` provides full control over:
- Products, collections (both with multi-image galleries)
- Hero/homepage banners
- Orders & customers
- Settings — branding (logo, favicon, theme color), social links, WhatsApp number, payment gateway toggles (Card, COD, Bank Transfer, JazzCash, EasyPaisa), shipping rules, page content, and admin account.

## Connection Awareness

The app includes an `useOnlineStatus` hook and a global `ConnectionStatus` banner that automatically detects offline state and unreachable backend, with a retry control.

## Deployment

Standard Node deployment:
```bash
npm run build
NODE_ENV=production npm start
```

Behind nginx + PM2 with PostgreSQL on the host. Configure `DATABASE_URL` and `SESSION_SECRET` in the production environment.

## License

MIT
