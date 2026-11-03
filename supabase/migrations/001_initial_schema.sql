-- Attendies Workforce Management Schema - Initial Migration
-- Generated: 2026-11-03

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS attendance_events CASCADE;
DROP TABLE IF EXISTS leaves CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Create enum types for status
CREATE TYPE attendance_status AS ENUM ('clock-in', 'clock-out', 'completed', 'absent', 'late');

CREATE TYPE employee_role AS ENUM ('admin', 'manager', 'employee');

CREATE TYPE company_role AS ENUM ('user', 'admin', 'platform_admin');

-- Companies table - Multi-tenant isolation foundation
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email TEXT,
  logo_url TEXT,
  timezone TIMETZ DEFAULT 'America/Los_Angeles',
  default_language TEXT DEFAULT 'en-US',
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for companies (tenant isolation)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create function to set company scope in session
CREATE OR REPLACE FUNCTION set_session_companies(companies_to_set text[]) RETURNS void AS $$
BEGIN
    UPDATE auth.sessions SET metadata = jsonb_set(metadata, '{companies', to_jsonb(companies_to_set))
        WHERE activity_type = 'web';
RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  role employee_role NOT NULL DEFAULT 'employee',
  name VARCHAR(255) NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status boolean DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for employees (tenant isolation)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create function to filter employees by company
CREATE OR REPLACE FUNCTION set_employees_visibility() RETURNS trigger AS $$
BEGIN
    -- Only users from the same company can see their company's employees
    IF new.company_id = auth.session_roles?.companies->>any('array'::text)::UUID
    THEN
      RETURN new;
    END IF;
    ELSE
      return null;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Locations table (work addresses/geofences)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  region VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'US',
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  timezone TIMETZ,
  is_active boolean DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for locations (tenant isolation)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Shifts table
CREATE TYPE shift_schedule_type AS ENUM ('daily', 'weekly', 'custom');

CREATE TYPE shift_type AS ENUM ('regular', 'overtime', 'flexible');

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  schedule_type shift_schedule_type DEFAULT 'weekly',
  start_time TIMETZ,
  end_time TIMETZ,
  type_ shift_type DEFAULT 'regular',
  active boolean DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for shifts (tenant isolation)
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Attendance events table (GPS/QR clock-in/out tracking)
CREATE TYPE attendance_type AS ENUM ('clock-in', 'clock-out');

CREATE TABLE attendance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type_ attendance_type NOT NULL,
  status attendance_status NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  address TEXT,
  qr_code_hash TEXT,
  device_type VARCHAR(50),
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for attendance_events (tenant isolation)
ALTER TABLE attendance_events ENABLE ROW LEVEL SECURITY;

-- Create function to filter attendance by company
CREATE OR REPLACE FUNCTION set_attendance_visibility() RETURNS trigger AS $$
BEGIN
    IF new.employee_id = (SELECT id FROM employees WHERE company_id = auth.session_roles?.companies->>any('array'::text) LIMIT 1)
    THEN
      RETURN new;
    END IF;
    return null;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leaves table
CREATE TYPE leave_type AS ENUM ('vacation', 'sick', 'personal', 'unpaid');

CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  type_ leave_type NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  duration_hours NUMERIC(5,2),
  status leave_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for leaves (tenant isolation)
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- Create function to filter leaves by company
CREATE OR REPLACE FUNCTION set_leaves_visibility() RETURNS trigger AS $$
BEGIN
    IF new.employee_id = (SELECT id FROM employees WHERE company_id = auth.session_roles?.companies->>any('array'::text) LIMIT 1)
    THEN
      RETURN new;
    END IF;
    return null;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dashboard metrics table (for admin dashboard)
CREATE TYPE metric_type AS ENUM ('total_attendances', 'present_rate', 'late_count', 'absent_count');

CREATE TABLE dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  metric metric_type NOT NULL,
  date_range text,
  value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance optimization
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_departments_company ON departments(company_id);
CREATE INDEX idx_locations_company ON locations(company_id);
CREATE INDEX idx_shifts_company ON shifts(company_id);
CREATE INDEX idx_attendance_employee ON attendance_events(employee_id, date);
CREATE INDEX idx_leaves_employee ON leaves(employee_id);

-- Create policies for tenant isolation

-- Company admin can access all company data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname LIKE 'companies_select') THEN
    CREATE POLICY 'allow_company_admin_select' ON companies
      FOR SELECT TO 'authenticated'
      USING (auth.session_roles?.company_id::text = companies.id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname LIKE 'companies_insert') THEN
    CREATE POLICY 'allow_company_admin_insert' ON companies
      FOR INSERT TO 'authenticated'
      WITH CHECK (auth.session_roles?.company_id::text = NEW.company_id);
  END IF;
END $$;

-- Employee can only access own company's data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname LIKE 'employees_select') THEN
    CREATE POLICY 'allow_employees_select' ON employees
      FOR SELECT TO 'authenticated'
      USING ((company_id = auth.uid())::bool OR EXISTS (SELECT 1 FROM departments d WHERE d.id = auth.session_roles?.department_id) AND employee_id = uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname LIKE 'employees_insert') THEN
    CREATE POLICY 'allow_employees_insert' ON employees
      FOR INSERT TO 'authenticated'
      WITH CHECK ((company_id = auth.uid())::bool OR EXISTS (SELECT 1 FROM departments d WHERE d.id = auth.session_roles?.department_id));
  END IF;
END $$;

-- Employee can only see their own attendance
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname LIKE 'attendance_select') THEN
    CREATE POLICY 'allow_attendance_select' ON attendance_events
      FOR SELECT TO 'authenticated'
      USING (employee_id IN (SELECT id FROM employees WHERE company_id = auth.uid()));
  END IF;
END $$;

-- Employee can only see their own leaves
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname LIKE 'leaves_select') THEN
    CREATE POLICY 'allow_leaves_select' ON leaves
      FOR SELECT TO 'authenticated'
      USING (employee_id = auth.uid());
  END IF;
END $$;

-- Function to handle company registration
CREATE OR REPLACE FUNCTION handle_company_registration() RETURNS TRIGGER AS $$
BEGIN
    -- Insert company if it's a new registration
    INSERT INTO companies (id, name, slug, admin_id)
    VALUES (new.id, new.name, new.slug, auth.uid())
    ON CONFLICT (id) DO NOTHING;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update employee roles on company join/leave
CREATE OR REPLACE FUNCTION handle_employee_role_change() RETURNS TRIGGER AS $$
BEGIN
    UPDATE employees SET role = COALESCE(
        CASE
            WHEN NEW.role = 'admin' THEN 'admin'
            WHEN NEW.role = 'manager' THEN 'manager'
            ELSE 'employee'
        END,
        OLD.role
    ) WHERE id = OLD.id;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for clarity
COMMENT ON TABLE companies IS 'Multi-tenant company data for workforce management';
COMMENT ON TABLE employees IS 'Employee records with role-based access control';
COMMENT ON TABLE attendance_events IS 'GPS/QR timestamped attendance tracking';
COMMENT ON TABLE shifts IS 'Work shift scheduling information';
COMMENT ON TABLE leaves IS 'Leave request and approval tracking';

-- Grant permissions
GRANT ALL PRIVILEGES ON FUNCTIONS set_session_companies, set_employees_visibility, set_attendance_visibility, handle_company_registration TO "authenticated";
GRANT ALL PRIVILEGES ON FUNCTIONS handle_employee_role_change TO "authenticated";
