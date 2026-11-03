export type User = {
  id: string;
  email: string;
  full_name?: string;
  role: 'platform_admin' | 'company_admin' | 'employee';
  company_id?: string;
  created_at?: Date;
};

export type Company = {
  id: string;
  name: string;
  email: string;
  country: string;
  phone?: string;
  status: 'active' | 'deactivated';
  created_at?: Date;
};

export type Profile = {
  supabase_user_id: string;
  company_id: string;
  full_name: string;
  email: string;
  role: User['role'];
  updated_at?: Date;
};

export type Employee = {
  id: string;
  supabase_user_id: string;
  company_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  department_id?: string;
  location_id?: string;
  designation?: string;
  work_type: 'office' | 'remote' | 'hybrid' | 'field';
  employment_type?: string;
  joining_date?: Date;
  status: 'active' | 'inactive';
};

export type Department = {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  head_name?: string;
  status: 'active' | 'inactive';
};

export type Location = {
  id: string;
  company_id: string;
  name: string;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  geofence_radius?: number;
  status: 'active' | 'inactive';
};

export type AttendancePolicy = {
  id: string;
  company_id: string;
  grace_period_minutes: number;
  late_threshold_minutes?: number;
  max_consecutive_early_logins?: number;
  auto_approve_attendance?: boolean;
  auto_approve_leaves?: boolean;
  max_attendance_correction_days: number;
  working_hours_start?: Date;
  working_hours_end?: Date;
  created_at?: Date;
};

export type Shift = {
  id: string;
  company_id: string;
  name: string;
  start_time: Date;
  end_time: Date;
  break_duration_minutes?: number;
  grace_period_minutes?: number;
  timezone?: string;
  working_days: string[];
  is_overnight?: boolean;
  status: 'active' | 'inactive';
};

export type AttendanceSession = {
  id: string;
  employee_id: string;
  location_id?: string;
  company_id: string;
  shift_id?: string;
  clock_in_time: Date;
  clock_out_time?: Date;
  is_on_break?: boolean;
  break_start_time?: Date;
  break_end_time?: Date;
  total_minutes?: number;
  net_working_minutes?: number;
  status: 'not_started' | 'working' | 'on_break' | 'completed' | 'absent';
};

export type AttendanceEvent = {
  id: string;
  employee_id: string;
  location_id?: string;
  company_id: string;
  shift_id?: string;
  event_type: 'clock_in' | 'clock_out' | 'start_break' | 'end_break';
  timestamp: Date;
  location_lat?: number;
  location_lng?: number;
  accuracy?: number;
  source: 'gps' | 'qr_code' | 'manual' | 'auto';
};

export type CompanyMember = {
  supabase_user_id: string;
  company_id: string;
  role: User['role'];
  created_at?: Date;
};
