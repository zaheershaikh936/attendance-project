# Global Workforce Management SaaS - MVP Architecture & Implementation Plan

## Project Overview

A multi-tenant Workforce Management platform enabling companies to manage employees, attendance, shifts, leave requests, and workforce reports using Next.js + Supabase stack.

---

## Table of Contents

1. [Architecture Design](#architecture-design)
2. [Database Schema](#database-schema)
3. [Security Model](#security-model)
4. [API Contracts](#api-contracts)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Technical Risks & Decisions](#technical-risks--decisions)

---

## Architecture Design

### Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend Backend | Next.js 14 + TypeScript |
| UI Framework | Tailwind CSS + shadcn/ui |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Email-based) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Validation | Zod |

### Architecture Patterns

#### 1. **Multi-Tenant Isolation**

- Each company has a `company_id` UUID scoped to their tenant
- Row Level Security (RLS) policies enforce tenant isolation at database level
- Company administrators can only access records with `company_id = current_user.company_id`
- Platform admin has separate, elevated access via role-based policies

#### 2. **Server Actions First**

- All mutations use Next.js Server Actions for type safety
- Input validation via Zod occurs before execution
- Attendance and business logic enforced server-side
- No client-side trust for critical operations

#### 3. **Session Management**

- Employee clock-in/out uses atomic database transactions
- Prevents race conditions through optimistic concurrency control
- Database constraints prevent duplicate active sessions
- Server timestamps are authoritative; client only provides human-readable times

---

## Database Schema

### Core Entities

```sql
-- Companies (Tenants)
companies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,
  country       text NOT NULL,
  phone         text,
  status        text DEFAULT 'active', -- active, deactivated
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
)

-- Company Members (Platform Admins + Company Admins)
company_members (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id uuid REFERENCES auth.users(id),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  role             text NOT NULL -- platform_admin, company_admin, employee
)

-- Profiles (Company-admin specific metadata)
profiles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id uuid REFERENCES auth.users(id) UNIQUE,
  company_id       uuid REFERENCES companies(id),
  full_name        text NOT NULL,
  email            text NOT NULL,
  role             text NOT NULL -- platform_admin, company_admin
)

-- Employees
employees (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id uuid REFERENCES auth.users(id),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  employee_code    text UNIQUE NOT NULL,
  full_name        text NOT NULL,
  email            text NOT NULL UNIQUE,
  phone            text,
  department_id     uuid REFERENCES departments(id),
  location_id       uuid REFERENCES locations(id),
  designation       text,
  work_type         text, -- office, remote, hybrid, field
  employment_type   text,
  joining_date      date,
  status           text DEFAULT 'active' -- active, inactive
)

-- Departments
departments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  name             text NOT NULL,
  description      text,
  head_name        text,
  status           text DEFAULT 'active'
)

-- Work Locations
locations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  name             text NOT NULL,
  address          text,
  description      text,
  latitude         float,
  longitude        float,
  geofence_radius  integer, -- meters
  status           text DEFAULT 'active' -- active, inactive
)

-- Attendance Policies (Company Settings)
attendance_policies (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  grace_period_minutes integer DEFAULT 15,
  late_threshold_minutes integer,
  max_consecutive_early_logins integer DEFAULT 3,
  auto_approve_attendance boolean DEFAULT false,
  auto_approve_leaves boolean DEFAULT false,
  max_attendance_correction_days integer DEFAULT 70,
  working_hours_start time,
  working_hours_end   time,
  created_at        timestamptz DEFAULT now()
)

-- Shifts
shifts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  name             text NOT NULL,
  start_time       time WITHOUT TIME ZONE,
  end_time         time WITHOUT TIME ZONE,
  break_duration_minutes integer,
  grace_period_minutes integer,
  timezone         text DEFAULT 'UTC',
  working_days     text[] -- ['mon', 'tue', 'wed', 'thu', 'fri'],
  is_overnight      boolean DEFAULT false,
  status           text DEFAULT 'active' -- active, inactive
)

-- Employee Shift Assignments
employee_shifts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      uuid REFERENCES employees(id) NOT NULL,
  shift_id         uuid REFERENCES shifts(id) NOT NULL,
  effective_date   date,
  end_date         date,
  status           text DEFAULT 'active' -- active, inactive
)

-- Attendance Sessions (Active Work Periods)
attendance_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      uuid REFERENCES employees(id) NOT NULL,
  location_id      uuid REFERENCES locations(id),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  shift_id         uuid REFERENCES shifts(id),
  clock_in_time    timestamptz NOT NULL,
  clock_out_time   timestamptz,
  is_on_break      boolean DEFAULT false,
  break_start_time timestamptz,
  break_end_time   timestamptz,
  total_minutes integer,
  net_working_minutes integer,
  status           text PRIMARY CHECK (status IN ('not_started', 'working', 'on_break', 'completed', 'absent')),
  created_at       timestamptz DEFAULT now()
)

-- Attendance Events (Historical Records - Immutable)
attendance_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      uuid REFERENCES employees(id) NOT NULL,
  location_id      uuid REFERENCES locations(id),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  shift_id         uuid REFERENCES shifts(id),
  event_type       text NOT NULL -- clock_in, clock_out, start_break, end_break, absent
, timestamp        timestamptz NOT NULL,
  location_lat     float,
  location_lng     float,
  accuracy         integer,
  source           text, -- gps, qr_code, manual, auto
  metadata         jsonb DEFAULT '{}',
  created_at       timestamptz DEFAULT now()
)

-- Attendance Corrections (Editable Requests)
attendance_corrections (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      uuid REFERENCES employees(id) NOT NULL,
  company_id       uuid REFERENCES companies(id) NOT NULL,
  event_type       text, -- clock_in, clock_out
  original_time    timestamptz,
  corrected_time    timestamptz,
  correction_date   date, -- Date in which correction is valid
  reason            text,
  status           text DEFAULT 'pending' -- pending, approved, rejected, cancelled
)

-- QR Codes
qr_codes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  location_id      uuid REFERENCES locations(id),
  shift_id         uuid REFERENCES shifts(id),
  token_hash       text UNIQUE NOT NULL, -- HMAC-SHA256 of token payload
  created_at       timestamptz DEFAULT now(),
  expires_at       timestamptz NOT NULL,
  status           text DEFAULT 'active' -- active, used, expired
)

-- Leave Types
leave_types (
  id               uuid PRIMARY KEY DEFAULT gen_random_annual_uuid(),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  name             text NOT NULL,
  description      text,
  max_days         integer DEFAULT 12,
  requires_approval boolean DEFAULT false
)

-- Leave Balances
leave_balances (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      uuid REFERENCES employees(id) NOT NULL,
  leave_type_id    uuid REFERENCES leave_types(id),
  used_days         integer DEFAULT 0,
  remaining_days    integer,
  created_at       timestamptz DEFAULT now()
)

-- Leave Requests
leave_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      uuid REFERENCES employees(id) NOT NULL,
  company_id       uuid REFERENCES companies(id) NOT NULL,
  leave_type_id    uuid REFERENCES leave_types(id),
  start_date       date NOT NULL,
  end_date         date NOT NULL,
  reason           text,
  status           text DEFAULT 'pending' -- pending, approved, rejected, cancelled
)

-- Holidays
holidays (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       uuid REFERENCES companies(id) NOT NULL,
  name             text NOT NULL,
  date             date NOT NULL,
  is_recurring     boolean DEFAULT false, -- true for annual holidays
  year             integer
)

-- Notifications
notifications (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id),
  type             text NOT NULL, -- attendance, shift, leave, system
  company_id       uuid REFERENCES companies(id),
  title            text NOT NULL,
  message          text NOT NULL,
  is_read          boolean DEFAULT false,
  created_at       timestamptz DEFAULT now()
)

-- Audit Logs
audit_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id),
  company_id       uuid REFERENCES companies(id),
  action           text NOT NULL -- register_company, clock_in, approve_leave, etc.
, target_type      text,
  target_id        text,
  details          jsonb DEFAULT '{}',
  ip_address       text,
  created_at       timestamptz DEFAULT now()
)
```

### RLS Policies Strategy

#### Table: `companies`
```sql
POLICY "company_admins can view all" ON companies
  FOR SELECT
  TO (SELECT 'company_admin' FROM auth.policy("roles", role))
  USING (false); -- Simplified for MVP

-- In practice, use LATERAL join with auth.policy() to check user's company
```

#### Table: `profiles`
```sql
POLICY "Profiles are row secure" ON profiles
  FOR ALL
  TO (SELECT 'company_admin' FROM auth.policy("roles", role))
  USING (upd_id = supabase_user_id);
```

#### Table: `employees`
```sql
-- Company admins can manage their company's employees
POLICY "Company admins can manage employees" ON employees
  FOR ALL
  TO (SELECT 'company_admin' FROM auth.policy("roles", role))
  USING (company_id = supabase_user_id);

-- Employees can only view their own records
POLICY "Employees can view their own" ON employees
  FOR SELECT
  TO public
  USING (supabase_user_id = current_user);

-- Employees can update their own profiles
POLICY "Employees can update own" ON employees
  FOR UPDATE
  TO public
  USING (supabase_user_id = current_user);
```

#### Table: `attendance_sessions`
```sql
-- Only company admins and active sessions can modify
POLICY "Company admins manage attendance" ON attendance_sessions
  FOR ALL
  TO (SELECT 'company_admin' FROM auth.policy("roles", role))
  USING (company_id = supabase_user_id);

-- Employees can only start new sessions
POLICY "Employees start sessions" ON attendance_sessions
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM attendance_sessions
      WHERE employee_id = current_setting('user.id')::uuid
        AND status = 'not_started'
    )
  );
```

#### Table: `attendance_events`
```sql
-- Company admins can manage; employees can only view their own
POLICY "Company admins manage events" ON attendance_events
  FOR ALL
  TO (SELECT 'company_admin' FROM auth.policy("roles", role))
  USING (company_id = supabase_user_id);

POLICY "Employees view own events" ON attendance_events
  FOR SELECT
  TO public
  USING (company_id = current_setting('user.company_id')::uuid OR
      employee_id = current_setting('user.id')::uuid);
```

---

## API Contracts

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/v1/auth/register-company | Register new company | No |
| POST | /api/v1/auth/invite-employee | Invite employee by email | Company Admin |
| POST | /api/v1/auth/accept-invitation | Accept invitation | No |
| GET | /api/v1/auth/me | Get current user profile | Yes |

### Company Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | /api/v1/company | Yes (Company Admin) | Get company info |
| PATCH | /api/v1/company | Yes (Company Admin) | Update company settings |
| DELETE | /api/v1/company/* | Yes (Platform Admin) | Deactivate company |

### Employee Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | /api/v1/employees | Yes | List employees (role-based filtering) |
| POST | /api/v1/employees | No | Create employee record |
| PATCH | /api/v1/employees/:id | Yes | Update employee details |
| DELETE | /api/v1/employees/* | Yes (Admin) | Deactivate employee |

### Attendance Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | /api/v1/attendance/clock-in | No | Record clock-in with GPS |
| POST | /api/v1/attendance/clock-out | No | Record clock-out |
| POST | /api/v1/attendance/break-start | No | Start break (requires active session) |
| POST | /api/v1/attendance/break-end | No | End break |
| GET | /api/v1/attendance/current | No | Get current status |
| GET | /api/v1/attendance/history | Yes | Get personal history |
| GET | /api/v1/attendance/today | No | Get today's attendance |

### QR Code Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | /api/v1/qr/generate | Yes (Company Admin) | Generate temporary QR code |
| POST | /api/v1/qr/validate | No | Validate QR token & record attendance |

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Objective:** Establish infrastructure and tenant isolation

Tasks:
- [ ] Initialize Next.js project with TypeScript + Tailwind
- [ ] Configure Supabase (auth, database, RLS)
- [ ] Set up environment variables schema
- [ ] Create database migrations
- [ ] Implement authentication system
- [ ] Build company registration flow
- [ ] Implement RLS policies for all tables
- [ ] Create shared utilities and validation schemas

Deliverables:
- Working Next.js project with Supabase integration
- Protected routes (auth & company admin)
- Secure database schema
- Platform admin dashboard skeleton

### Phase 2: Company Management (Weeks 3-4)

**Objective:** Enable companies to manage their workforce

Tasks:
- [ ] Build company dashboard UI
- [ ] Implement employee management CRUD operations
- [ ] Create invitation system for employees
- [ ] Build department management
- [ ] Implement work location management
- [ ] Configure attendance policies
- [ ] Add filtering and search features

Deliverables:
- Company admin panel fully functional
- Employee directory with search/filter
- Department and location management

### Phase 3: Attendance Engine (Weeks 5-7)

**Objective:** Core attendance tracking functionality

Tasks:
- [ ] Design attendance session state machine
- [ ] Implement clock-in/out with server-side validation
- [ ] Build break management system
- [ ] Implement working time calculations (with breaks subtracted)
- [ ] Create admin attendance dashboard
- [ ] Add date range filtering and reports
- [ ] Implement correction request flow

Deliverables:
- Full attendance lifecycle implementation
- Admin dashboard with real-time updates
- Historical tracking with corrections

### Phase 4: Attendance Verification (Weeks 8-9)

**Objective:** Multi-mode attendance verification

Tasks:
- [ ] Implement browser-based GPS capture
- [ ] Build geofencing logic with radius validation
- [ ] Design dynamic QR code generation and validation
- [ ] Implement duplicate/replay prevention using tokens
- [ ] Add location accuracy display

Deliverables:
- GPS attendance integration
- Dynamic QR system with expiration
- Geofence validation

### Phase 5: Workforce Management (Weeks 10-12)

**Objective:** Complete shift and leave management

Tasks:
- [ ] Build shift creation and scheduling
- [ ] Implement employee-shift assignment
- [ ] Create leave type configuration
- [ ] Build leave request workflow with approval
- [ ] Add notification system
- [ ] Implement attendance correction requests

Deliverables:
- Shift scheduling system
- Leave management with approvals
- Correction request flow

### Phase 6: Reporting & Release (Weeks 13-14)

**Objective:** Finalize and deploy MVP

Tasks:
- [ ] Build all report types (daily/weekly/monthly/employee/overtime)
- [ ] Implement export functionality (CSV/Excel/PDF)
- [ ] Security testing and penetration testing
- [ ] Cross-tenant data isolation verification
- [ ] Responsive testing across devices
- [ ] Documentation and deployment setup

Deliverables:
- Complete report suite with exports
- Production-ready codebase
- Deployment to Vercel/Supabase

---

## Technical Risks & Decisions

### Risk 1: Race Conditions in Attendance

**Problem:** Multiple employees attempting to clock-in simultaneously

**Mitigation:**
- Database-level constraints on `active_session_count per employee`
- Optimistic concurrency control (`clock_in_time = ?`)
- Queue system for duplicate handling

---

### Risk 2: Timezone Handling

**Problem:** Complex timezone conversions across global operations

**Strategy:**
- Store all timestamps in UTC
- Use shift timezone for local time calculations
- `date-fns/tz` library for timezone-aware operations
- Always include timezone in metadata JSONB column

---

### Risk 3: Security - Tenant Isolation

**Problem:** Cross-tenant data leakage through API errors or policy bypass

**Mitigation:**
- Server-side enforcement of tenant filtering
- Never expose `serviceRoleKey` in client code
- Database function layer for critical operations
- Comprehensive test suite with multi-tenant scenarios

---

### Risk 4: QR Replay Attack

**Problem:** QR tokens captured and reused at different times

**Mitigation:**
- Generate HMAC-signed tokens with company secret
- Require server-side validation before recording attendance
- Token hash stored in `qr_codes` table for comparison
- Immediate invalidation on first use (via RLS triggers)

---

### Risk 5: Attendance Correction Fraud

**Problem:** Employees submitting false corrections to alter historical records

**Strategy:**
- Time window limits per correction request
- Mandatory admin review before approval
- Audit log tracking all corrections
- Original events remain immutable; only corrections are editable

---

### Decision: Database Design Choices

1. **UUIDs over Integers:** Primary keys use UUID for multi-tenancy friendliness
2. **Timestamp vs DateTime:** Use `timestamptz` everywhere for proper timezone awareness
3. **Separation of Concerns:** Keep `attendance_sessions` (live) separate from `attendance_events` (historical)
4. **Server-Authoritative Times:** Store `clock_in_time` on server, client only provides human-readable input

---

## Next Steps

1. Review and approve this architecture plan
2. Begin Phase 1 implementation:
   - Set up Next.js + TypeScript + Tailwind
   - Configure Supabase project (auth, database)
   - Create database migrations
   - Build authentication system

3. Define any architectural adjustments before coding begins
