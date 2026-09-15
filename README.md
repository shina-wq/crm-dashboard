# CRM Customer Intelligence Dashboard

A customer intelligence dashboard built on DummyJSON data — segments, purchase history, product analytics.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui (Radix) · TanStack Query · React Router · Recharts

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | Type-check only |
| `npm run lint` | Lint |
| `npm run test` | Run test suite |
| `npm run preview` | Preview production build |

## Environment Variables

Copy `.env.example` to `.env`:

VITE_API_BASE_URL=https://dummyjson.com

## Project Structure

```
src/
components/        # shared + ui (shadcn) components
features/          # feature modules (auth, dashboard, customers, products)
pages/             # route-level page components
services/          # API client, data layer
types/             # domain + API types
hooks/             # shared hooks
lib/               # utilities
```