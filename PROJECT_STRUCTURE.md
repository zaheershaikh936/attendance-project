# Attendies Project Structure

This document outlines the folder structure and responsibilities for each directory in the Attendius Workforce Management SaaS.

## Directory Structure Overview

```
attendance-project/
├── src/
│   ├── app/                      # Next.js App Router routes
│   │   ├── (auth)/              # Shell route: Auth-related pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (company)/           # Shell route: Company-specific pages
│   │   ├── (employee)/          # Shell route: Employee-specific pages
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── features/                 # Feature-based architecture
│   │   ├── auth/
│   │   ├── company/
│   │   ├── employees/
│   │   ├── departments/
│   │   ├── locations/
│   │   ├── attendance/
│   │   ├── shifts/
│   │   ├── leave/
│   │   └── reports/
│   │
│   ├── components/               # UI Components
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── common/               # Shared reusable components
│   │   └── layout/               # Layout components
│   │
│   ├── lib/                      # Shared utilities and clients
│   │   ├── auth/                 # Authentication functions
│   │   ├── supabase/             # Supabase client implementations
│   │   └── utils/                # General utility functions
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # Exports all type definitions
│   │
│   └── providers/                # Global React providers
│       └── layout.tsx            # Providers tree wrapper
│
├── supabase/                     # Supabase configuration
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── functions/
│       └── create_company_admin.sql
│
├── tests/                        # Test files
│   ├── unit/
│   └── e2e/
│
├── public/                        # Static assets
│
├── README.md                      # Main project documentation
├── PROJECT_STRUCTURE.md            # This file
├── TECH_STACK.md                   # Technology documentation
├── .env.example                    # Environment variables template
└── package.json                    # Node.js dependencies
```

## Directory Responsibilities

### `src/app/` - Next.js App Router

- **Purpose**: Define route pages and layouts using the Next.js App Router
- **Convention**: Shell routes use `(shell-name)/` prefix in directory names
- **Files to create**: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`

#### Route Organization:
- `(auth)/` - Authentication pages (login, register, forgot-password)
- `(company)/` - Company-specific routes for company admins
- `(employee)/` - Employee-specific routes
- `api/` - Server API routes

### `src/features/` - Feature-Based Architecture

- **Purpose**: Organize business logic by feature/module
- **Convention**: Each feature has a consistent internal structure
- **Files**:
  - `index.tsx` - Feature page component (for features with pages)
  - `api/endpoints.ts` - API endpoint definitions
  - `api/service.ts` - Typed service functions for the feature
  - `api/helper.ts` - TanStack Query hooks for the feature
  - `components/` - Feature-specific UI components
  - `hooks/` - Feature-specific custom React hooks
  - `utils/types.ts` - TypeScript type definitions for this feature
  - `utils/validation.ts` - Zod validation schemas for this feature

#### Required Features:
- **auth** - Authentication, authorization, sessions
- **company** - Company management, registration, admin operations
- **employees** - Employee CRUD, invitations, roles
- **departments** - Department organization and management
- **locations** - Work location management
- **attendance** - Clock-in/out, GPS tracking, QR codes
- **shifts** - Shift scheduling and assignment
- **leave** - Leave requests and approvals
- **reports** - Workforce analytics and reports

### `src/components/ui/` - shadcn UI Primitives

- **Purpose**: Provide consistent base UI components across the app
- **Sources**: Managed by shadcn CLI for consistency
- **Components**:
  - Button, Input, Select, Tabs
  - Card, Dialog, DropdownMenu
  - Avatar, Badge, Separator
  - ScrollArea, Sheet

### `src/components/common/` - Shared Components

- **Purpose**: Reusable components used across multiple features
- **Examples**:
  - PageHeader - Page title and description component
  - LoadingSkeleton - Consistent loading states
  - EmptyState - Empty state message
  - ErrorBoundary - Error handling wrapper

### `src/lib/` - Shared Utilities

#### `lib/auth/` - Authentication Functions

```typescript
- signIn({ email, password }) → Promise<User>
- signUp(userData) → Promise<SignupResponse>
- signOut() → Promise<void>
- getCurrentUser() → User | null
```

#### `lib/supabase/` - Supabase Integration

```typescript
- client.ts - Browser-side Supabase client
- server.ts - Server-side Supabase client
- middleware.ts - NextAuth middleware setup
- types.ts - Type definitions for database tables
```

#### `lib/utils/` - Utility Functions

```typescript
- formatDate(date: Date) → string
- formatCurrency(amount: number, currency?: string) → string
- formatDateRange(start: Date, end: Date) → string
```

### `src/types/` - TypeScript Type Definitions

- **Purpose**: Centralize all type definitions for the application
- **Files**:
  - `index.ts` - Exports all public types from features
  - Feature-specific files as needed

### `src/providers/` - Global Providers

- **Purpose**: Wrap the app with necessary React providers
- **File**: `layout.tsx` - Providers tree wrapper that wraps all children

### `src/app/layout.tsx` - Root Layout

- **Purpose**: Define the root layout for all pages
- **Responsibilities**:
  - Wrap children with appropriate providers
  - Set up metadata and theme
  - Apply global styles

## Coding Conventions

### Folders
- Use kebab-case for folder names: `src/app/(auth)/`, `src/features/auth/`

### Files
- Components: PascalCase - `LoginPage.tsx`, `Button.tsx`
- Hooks: camelCase with prefix - `useAuth.ts`, `useGetEmployees.ts.ts`
- Services: UPPER_SNAKE_CASE - `fetchEmployees.ts`, `SUPABASE_CLIENT`
- Types: descriptive names - `User.ts`, `EmployeeTableType.ts`

### Exports
- Components: named exports for reuse
- Hooks: named exports
- Types: named exports
- Default export only for index files and entry points

## Implementation Guidelines

1. **Modularity**: Each feature should be self-contained with its own API, services, and components
2. **Type Safety**: All interfaces and types should be declared in `src/types/` or feature-specific type files
3. **Validation**: Use Zod for all input validation, not React Hook Form's built-in validation
4. **State Management**: Use TanStack Query for server state management
5. **UI Components**: Keep UI components separate from business logic

## Next Steps

1. Initialize the project folder structure by creating empty directories where files will be added
2. Set up shadcn/ui component collection
3. Configure Tailwind CSS themes
4. Implement Supabase RLS policies
5. Create database schema migrations
