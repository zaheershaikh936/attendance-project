export type Role = 'user' | 'admin' | 'platform_admin';

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role: Role;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  adminId?: string;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: 'admin' | 'manager' | 'employee';
  departmentId?: string;
  address?: string;
}

export interface AttendanceEvent {
  id: string;
  employeeId: string;
  date: Date;
  type: 'clock-in' | 'clock-out';
  status: 'completed' | 'partial' | 'late' | 'absent';
  timestamp?: number;
}

export interface Shift {
  id: string;
  name: string;
  scheduleType: 'daily' | 'weekly' | 'custom';
  startDate: Date;
  endDate: Date;
}

export interface LeaveRequest {
  id: string;
  type: 'vacation' | 'sick' | 'personal' | 'unpaid';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  dateRange?: string;
}
