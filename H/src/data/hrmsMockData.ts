// ============================================================================
// VRM Enterprise HRM — Production Master Initial Data Repository
// Master Super Admin (CEO) profile & system structural templates
// Transactional records initialized to empty arrays for real data entry
// ============================================================================

import {
  Employee,
  AttendanceRecord,
  FaceLog,
  AttendanceAuditLog,
  LeaveRequest,
  Shift,
  ShiftRequest,
  DepartmentItem,
  PayrollRecord,
  AssetItem,
  Expense,
  JobOpening,
  Candidate,
  NotificationItem,
  TaskItem,
  PerformanceScore
} from '../types/hrms';

// ----------------------------------------------------------------------------
// 1. EMPLOYEES ROSTER (Master Super Admin CEO Account)
// ----------------------------------------------------------------------------
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-000',
    employeeId: 'EMP-000',
    firstName: 'Velmurugan',
    lastName: '',
    email: 'ceo@vrmstructures.com',
    phone: '+91 98765 43210',
    dob: '1975-06-15',
    gender: 'Male',
    address: 'VRM Towers, No. 42, Grand Northern Trunk Road, Madhavaram, Chennai',
    department: 'Management',
    designation: 'CEO',
    reportingManagerId: '',
    reportingManagerName: 'Board of Directors',
    joiningDate: '2018-01-01',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 250000,
    allowances: { hra: 60000, transport: 15000, medical: 10000, special: 25000 },
    bankDetails: { bankName: 'HDFC Bank', accountNumber: '****1001', ifscCode: 'HDFC0001234', branch: 'Madhavaram' },
    attendanceMethod: 'Exempt',
    gpsAllowed: false,
    faceRegistered: false,
    workShift: 'Shift 1 (09:00 AM - 06:00 PM)',
    documents: [],
    authUserId: 'usr-000',
    password: 'Password@123',
    mustChangePassword: false,
    accountStatus: 'ACTIVE',
    credentialEmailStatus: 'SENT',
    credentialEmailSentAt: '2026-01-01T09:00:00.000Z',
    lastLoginAt: '16 Sep 2026, 08:50 AM'
  }
];

// ----------------------------------------------------------------------------
// 2. SHIFTS & ASSIGNMENTS (Master Standard Company Shifts)
// ----------------------------------------------------------------------------
export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'SH-01',
    shiftName: 'Shift 1 (09:00 AM - 06:00 PM)',
    startTime: '09:00',
    endTime: '18:00',
    breakDurationMins: 45,
    workingHours: 8.25,
    gracePeriodMins: 15,
    assignedEmployeeCount: 0,
    color: '#0E7490',
    assignments: []
  },
  {
    id: 'SH-02',
    shiftName: 'Shift 2 (09:30 AM - 06:30 PM)',
    startTime: '09:30',
    endTime: '18:30',
    breakDurationMins: 45,
    workingHours: 8.25,
    gracePeriodMins: 15,
    assignedEmployeeCount: 0,
    color: '#2563EB',
    assignments: []
  },
  {
    id: 'SH-03',
    shiftName: 'Shift 3 (10:00 AM - 07:00 PM)',
    startTime: '10:00',
    endTime: '19:00',
    breakDurationMins: 45,
    workingHours: 8.25,
    gracePeriodMins: 15,
    assignedEmployeeCount: 0,
    color: '#F59E0B',
    assignments: []
  }
];

export const INITIAL_SHIFT_REQUESTS: ShiftRequest[] = [];

// ----------------------------------------------------------------------------
// 3. DEPARTMENTS (8 Standard Enterprise Departments)
// ----------------------------------------------------------------------------
export const INITIAL_DEPTS: DepartmentItem[] = [
  { id: 'DEP-HR', name: 'HR', code: 'HR', headName: '', headId: '', employeeCount: 0, budget: 800000 },
  { id: 'DEP-SL', name: 'Sales', code: 'SL', headName: '', headId: '', employeeCount: 0, budget: 1200000 },
  { id: 'DEP-AC', name: 'Accounts', code: 'AC', headName: '', headId: '', employeeCount: 0, budget: 600000 },
  { id: 'DEP-PR', name: 'Procurement', code: 'PR', headName: '', headId: '', employeeCount: 0, budget: 750000 },
  { id: 'DEP-DP', name: 'Dispatch', code: 'DP', headName: '', headId: '', employeeCount: 0, budget: 650000 },
  { id: 'DEP-DS', name: 'Design', code: 'DS', headName: '', headId: '', employeeCount: 0, budget: 900000 },
  { id: 'DEP-FN', name: 'Finance', code: 'FN', headName: '', headId: '', employeeCount: 0, budget: 850000 },
  { id: 'DEP-TS', name: 'Technical Support', code: 'TS', headName: '', headId: '', employeeCount: 0, budget: 700000 }
];

// ----------------------------------------------------------------------------
// 4. ATTENDANCE & BIOMETRIC LOGS (Clean Slate)
// ----------------------------------------------------------------------------
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_FACE_LOGS: FaceLog[] = [];
export const INITIAL_ATTENDANCE_AUDIT_LOGS: AttendanceAuditLog[] = [];

// ----------------------------------------------------------------------------
// 5. LEAVES & TIME OFF (Clean Slate)
// ----------------------------------------------------------------------------
export const INITIAL_LEAVES: LeaveRequest[] = [];

// ----------------------------------------------------------------------------
// 6. PAYROLL DISBURSEMENTS (Clean Slate)
// ----------------------------------------------------------------------------
export const INITIAL_PAYROLL: PayrollRecord[] = [];

// ----------------------------------------------------------------------------
// 7. ASSET MANAGEMENT (Clean Slate)
// ----------------------------------------------------------------------------
export const INITIAL_ASSETS: AssetItem[] = [];

// ----------------------------------------------------------------------------
// 8. EXPENSES & CLAIMS (Clean Slate)
// ----------------------------------------------------------------------------
export const INITIAL_EXPENSES: Expense[] = [];

// ----------------------------------------------------------------------------
// 9. RECRUITMENT — JOBS & CANDIDATES (Clean Slate)
// ----------------------------------------------------------------------------
export const INITIAL_JOBS: JobOpening[] = [];
export const INITIAL_CANDIDATES: Candidate[] = [];

// ----------------------------------------------------------------------------
// 10. SYSTEM NOTIFICATIONS (Clean Slate)
// ----------------------------------------------------------------------------
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

// ----------------------------------------------------------------------------
// 11. TASKS & GOALS (Clean Slate)
// ----------------------------------------------------------------------------
export const INITIAL_TASKS: TaskItem[] = [];

// ----------------------------------------------------------------------------
// 12. PERFORMANCE EVALUATIONS (Clean Slate)
// ----------------------------------------------------------------------------
export const INITIAL_PERFORMANCE: PerformanceScore[] = [];
