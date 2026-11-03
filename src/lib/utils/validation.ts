import { z } from 'zod';

// ==================== FORM VALIDATION SCHEMAS ====================

/**
 * Auth Form Schemas
 */

export const authFormSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA0-9])/, {
      message: 'Password must contain uppercase, lowercase, number, and special character',
    }),
});

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerFormSchema = authFormSchema.partial();

/**
 * Company Form Schemas
 */

export const companyFormSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  logoUrl: z.string().url().optional(),
});

export const companyUpdateFormSchema = companyFormSchema.partial();

/**
 * Employee Form Schemas
 */

export const employeeFormSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'employee']).default('employee'),
  departmentId: z.string().nullable(),
});

export const employeeUpdateFormSchema = employeeFormSchema.partial();

/**
 * Department Form Schemas
 */

export const departmentFormSchema = z.object({
  name: z.string().min(2).max(50),
});

export const departmentUpdateFormSchema = departmentFormSchema.partial();

/**
 * Location Form Schemas
 */

export const locationFormSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('US'),
  timezone: z.string().optional(),
});

export const locationUpdateFormSchema = locationFormSchema.partial();

/**
 * Attendance Form Schemas
 */

export const attendanceFormSchema = z.object({
  date: z.date(),
  type: z.enum(['clock-in', 'clock-out']),
  status: z.enum(['completed', 'partial', 'late', 'absent']),
});

export const correctionFormSchema = z.object({
  originalEventId: z.string().uuid(),
  correctedEventDate: z.date(),
  reason: z.string().max(500),
});

/**
 * Leave Form Schemas
 */

export const leaveRequestFormSchema = z.object({
  type: z.enum(['vacation', 'sick', 'personal', 'unpaid']),
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().max(500).optional(),
});

/**
 * Shift Form Schemas
 */

export const shiftFormSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['regular', 'overtime', 'flexible']),
  scheduleType: z.enum(['daily', 'weekly', 'custom']),
  startDate: z.date(),
  endDate: z.date(),
});

export const shiftUpdateFormSchema = shiftFormSchema.partial();

/**
 * Report Filter Form Schemas
 */

export const reportFilterFormSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annual']),
  companyIds: z.array(z.string()).optional(),
  employeeIds: z.array(z.string()).optional(),
});

/**
 * =================================== ====================
 */

// ==================== TYPE DEFINITIONS ====================

export const AttendanceType = {
  CLOCK_IN: 'clock-in' as const,
  CLOCK_OUT: 'clock-out' as const,
} as const;

export const AttendanceStatus = {
  COMPLETED: 'completed' as const,
  PARTIAL: 'partial' as const,
  LATE: 'late' as const,
  ABSENT: 'absent' as const,
} as const;

export const LeaveType = {
  VACATION: 'vacation' as const,
  SICK: 'sick' as const,
  PERSONAL: 'personal' as const,
  UNPAID: 'unpaid' as const,
} as const;

export const EmployeeRole = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  EMPLOYEE: 'employee' as const,
} as const;

/**
 * =================================== ====================
 */
