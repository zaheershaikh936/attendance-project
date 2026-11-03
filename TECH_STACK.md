# Attendies Technology Stack

This document describes all technologies and dependencies used in the Attendius Workforce Management SaaS project.

## Installed Packages

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **next** | ^15.0.0 | Full-stack React framework, App Router |
| **react** | ^19.0.0 | JavaScript library for building user interfaces |
| **react-dom** | ^19.0.0 | DOM rendering and event handling |
| **tailwindcss** | ^3.4.0 | Utility-first CSS framework |
| **typescript** | ^5.6.0 | Static type checking |
| **@types/react** | ^19.0.0 | TypeScript definitions for React |

### UI & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| **tailwindcss** | ^3.4.0 | CSS framework with utility classes |
| **postcss** | ^8.4.0 | CSS transformation pipeline |
| **autoprefixer** | ^10.4.0 | Auto-update vendor prefixes |

### UI Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| **lucide-react** | ^0.400.0 | Modern, minimal icon library |
| **tailwind-merge** | ^2.3.0 | Merge Tailwind classes with higher priority |
| **tailwindcss-animate** | ^1.0.7 | Add animation utilities to Tailwind CSS |

### Authentication & Authorization

| Package | Version | Purpose |
|---------|---------|---------|
| **@supabase/supabase-js** | ^2.45.0 | Supabase JavaScript client |
| **@supabase/ssr** | ^0.12.7 | Supabase SSR utilities |
| **next-auth** | ^4.26.0 | Next.js authentication with multiple providers |
| **next-auth/providers/google** | - | Google OAuth support |

### Form Handling & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| **react-hook-form** | ^7.53.2 | Efficient form state management |
| **zod** | ^3.23.0 | TypeScript-first schema-based validation |
| **@hookform/resolvers** | ^3.9.0 | Combine form and validation libraries |

### Data Fetching & State Management

| Package | Version | Purpose |
|---------|---------|---------|
| **@tanstack/react-query** | ^5.6.1 | React data fetching with caching |

### UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| **react-day-picker** | ^9.5.0 | Calendar and date picker component |
| **date-fns** | ^4.0.0 | Date helper functions |
| **sonner** | ^1.7.0 | User-friendly toast notifications |

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| **vitest** | ^2.1.6 | Unit test framework with Vite support |
| **@testing-library/react** | ^16.0.0 | React testing utilities |
| **playwright** | ^1.47.2 | End-to-end browser automation |

## Technology Usage Guidelines

### Next.js App Router

- Use the App Router exclusively for route definitions
- Server Components by default; add `"use client"` only when required
- Implement server actions where appropriate for mutations
- Keep page components simple and feature-specific

### Supabase Integration

1. **Browser Client** (`src/lib/supabase/client.ts`):
   - Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Fetch data from database and Supabase Storage
   - Subscribe to Realtime channels for live updates
   - Handle file uploads/download

2. **Server Client** (`src/lib/supabase/server.ts`):
   - Use `SUPABASE_SERVICE_ROLE_KEY` (never in browser)
   - Perform authenticated operations
   - Update records, mutations, business logic
   - Implement server-side authorization checks

3. **Middleware** (`src/lib/supabase/middleware.ts`):
   - Enforce session requirements for routes
   - Protect API routes with authentication
   - Handle rate limiting and CORS

### TanStack Query Configuration

```typescript
{
  defaultStatus: 'loading',
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
    },
  },
}
```

### Zod Validation

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### Date Handling

- Use `date-fns` for local date operations (formatting, arithmetic)
- Use `date-fns-tz` for timezone-aware date operations
- Always use UTC for timestamps in the database
- Display dates in user's local timezone using timezone-aware functions

## Security Considerations

1. **Never expose service role key** in browser code
2. **Always validate server-side**, regardless of client-side validation
3. **Use Supabase RLS (Row Level Security)** for tenant isolation
4. **Implement proper authentication sessions** with secure cookies
5. **Rate limit sensitive operations** like attendance clock-in

## Development Workflow

1. Install dependencies: `npm install`
2. Configure environment variables: Copy `.env.example` to `.env.local`
3. Run development server: `npm run dev`
4. Type-check code: `npm run typecheck`
5. Lint code: `npm run lint`
6. Format code: `npm run format`

## Build Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "moduleResolution": "bundler"
  },
  "module": "ESNext",
  "target": "ES2024"
}
```

## Key Dependencies Chain

- Next.js → React 19
- shadcn/ui → Tailwind CSS v3
- Authentication → Supabase + NextAuth
- Forms → React Hook Form + Zod
- Charts → Recharts (optional, for future features)
- Calendar → date-fns + react-day-picker
