import { type Database } from './supabase-types';

export type Role = 'user' | 'admin' | 'platform_admin';

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: Role;
  companies?: string[];
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  logoUrl: string | null;
  timezone: string;
  defaultLanguage?: string;
  adminId?: string;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'admin' | 'manager' | 'employee';
  departmentId?: string;
  address?: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
}

export interface Location {
  id: string;
  companyId: string;
  name: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  type: 'clock-in' | 'clock-out';
  status: 'completed' | 'partial' | 'late' | 'absent';
  locationId?: string;
  locationName?: string;
  address?: string;
  timestamp?: number;
}

export interface Shift {
  id: string;
  companyId: string;
  name: string;
  type: 'regular' | 'overtime' | 'flexible';
  scheduleType: 'daily' | 'weekly' | 'custom';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Leave {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'unpaid';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  durationHours?: number;
}

export interface Report {
  id: string;
  companyId: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  dateRange?: string;
  format: 'csv' | 'excel' | 'pdf';
}
