# Attendies

A global multi-tenant Workforce Management SaaS built with Next.js, Supabase, and Tailwind CSS.

## 🎯 Purpose

Attendies provides workforce management capabilities for companies of all sizes:

- **Self-service company registration**
- **Employee management and invitations**
- **Department and location management**
- **Attendance tracking (GPS, QR code)**
- **Shift scheduling**
- **Leave management**
- **Workforce reporting**
- **Cross-platform dashboards** (Admin, Employee, Platform Super Admin)

## 🚀 Quick Start

```bash
# Clone the repository
git clone <REPO_URL>

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📚 Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 15+ | Full-stack React framework with App Router |
| **Styling** | Tailwind CSS v3 | Utility-first CSS framework |
| **UI Library** | shadcn/ui | Reusable component library |
| **Icons** | Lucide React | Modern, minimal icon set |
| **Form Handling** | React Hook Form + Zod | Efficient form state management & validation |
| **Authentication** | Supabase Auth + NextAuth | Server-side auth with session persistence |
| **Database** | Supabase PostgreSQL | Real-time database with RLS |
| **State Management** | TanStack Query | React data fetching & caching |
| **Table UI** | TanStack Table | Data table component |
| **Charts** | Recharts | Data visualization |
| **Calendar** | date-fns + react-day-picker | Date and time manipulation |
| **Toasts** | Sonner | User-friendly notification system |
| **Testing** | Vitest + Playwright | Unit & E2E testing |
| **TypeScript** | Strict mode | Type-safe development |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (company)/         # Company-specific routes
│   ├── (employee)/        # Employee-specific routes
│   └── layout.tsx
├── features/              # Feature-based architecture
│   ├── auth/
│   ├── company/
│   ├── employees/
│   ├── departments/
│   ├── locations/
│   ├── attendance/
│   ├── shifts/
│   ├── leave/
│   └── reports/
├── lib/                   # Shared utilities
│   ├── auth/
│   ├── supabase/
│   └── utils/
├── types/                 # TypeScript type definitions
├── components/            # UI components
│   ├── ui/               # shadcn primitives
│   └── common/           # Shared components
└── providers/             # Global providers

supabase/
├── migrations/
└── functions/

public/                     # Static assets
tests/                      # Test files
```

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run format` | Format code with Prettier |

## 🌐 Environment Variables

Set up `.env.local` based on `.env.example`:

```bash
# Required (get from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 📝 License

MIT License © 2026 Attendies Team
