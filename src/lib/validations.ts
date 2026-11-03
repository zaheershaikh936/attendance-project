import { z } from 'zod';

export const authSchemas = {
  // Company Registration
  registerCompany: z.object({
    name: z.string().min(1, 'Company name is required').max(100),
    email: z.string().email('Invalid email address'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional(),
    admin_name: z.string().min(1, 'Admin name is required'),
    admin_email: z.string().email('Invalid admin email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  acceptInvitation: z.object({
    token: z.string(),
  }),

  // Company Management
  updateCompany: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(['active', 'deactivated']).optional(),
  }),

  // Employee Management
  createEmployee: z.object({
    supabase_user_id: z.string(),
    employee_code: z.string().min(1, 'Employee code is required'),
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    department_id: z.string().optional(),
    location_id: z.string().optional(),
    designation: z.string().optional(),
    work_type: z.enum(['office', 'remote', 'hybrid', 'field']).default('office'),
    employment_type: z.string().optional(),
    joining_date: z.date().optional(),
  }),

  inviteEmployee: z.object({
    email: z.string().email('Invalid email address'),
    employee_code: z.string().optional(),
  }),

  // Attendance Session
  startAttendanceSession: z.object({}),

  // Location Management
  createLocation: z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    geofence_radius: z.number().optional(),
  }),

  // Shift Management
  createShift: z.object({
    name: z.string().min(1, 'Name is required'),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    break_duration_minutes: z.number().optional(),
    timezone: z.string().optional(),
    working_days: z.array(z.string()).optional(),
  }),
};

export const attendanceSchemas = {
  clockIn: authSchemas.registerCompany,
  clockOut: authSchemas.registerCompany,
  startBreak: authSchemas.registerCompany,
  endBreak: authSchemas.registerCompany,
};
