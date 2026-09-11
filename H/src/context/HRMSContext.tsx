import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Role,
  ModuleName,
  PermissionAction,
  PermissionMatrix,
  User,
  Employee,
  AttendanceRecord,
  AttendanceAuditLog,
  FaceLog,
  LeaveRequest,
  Shift,
  ShiftRequest,
  TaskItem,
  PerformanceScore,
  JobOpening,
  Candidate,
  Expense,
  NotificationItem,
  PayrollRecord,
  DepartmentItem,
  BranchItem,
  DesignationItem,
  ApprovalWorkflowFormat,
  WorkflowConfig,
  GeofenceConfig,
  AssetItem,
  TaskItemEnhanced,
  TaskAssignee,
  TaskAssigneeStatus,
  TaskCompletionEvidence,
  TaskAttachment,
  TaskMasterItem,
  MOMMeeting,
  TaskEscalationRule,
  TaskPerformanceWeights,
  TaskAuditLog,
  TaskTimelineEvent,
  computeTaskOverallStatusAndProgress,
  calculateEmployeeTaskMetrics,
  SettingsSubTab,
  LeavePolicyItem,
  HolidayItem,
  AttendancePolicyItem,
  WeeklyScheduleItem,
  PolicyDocumentItem,
  GlobalAttendanceConfig,
  BusinessProfileSettings,
  GradeItem,
  EmploymentTypeItem,
  EmployeeCategoryItem,
  CustomFieldItem,
  DocumentTypeItem,
  EmployeeConfigSettings,
  ApprovalWorkflowItem,
  NotificationTriggerConfig,
  GeneralSystemConfig,
  IntegrationsConfig,
  LoanRecord,
  LoanRepaymentInstallment,
  LoanManualRepayment,
  LoanAuditLogEntry,
  LoanRequestStatus,
  AdvanceSalaryRequest,
  SandwichLeavePolicy,
  SandwichAuditLog,
  SandwichCalculationResult,
  SandwichCondition,
  SandwichPayType,
  HROverrideDetails,
  SandwichCalculationDayDetail
} from '../types/hrms';
import { initialSandwichPolicies, initialSandwichAuditLogs } from '../data/sandwichPolicyInitialData';
import { calculateSandwichLeave } from '../services/sandwichLeaveEngine';
import {
  CompanyInfo,
  CompanyBranch,
  OrganizationStructure,
  AttendancePolicy,
  AttendanceCorrectionRequest,
  MasterLeavePolicy,
  PayrollSettingsConfig,
  RewardPolicy,
  EmployeeRewardRecord,
  PolicyAuditLog,
  LoanPolicy
} from '../types/settings';
import {
  INITIAL_COMPANY_INFO,
  INITIAL_COMPANY_BRANCHES,
  INITIAL_ORG_STRUCTURE,
  DEFAULT_MASTER_ATTENDANCE_POLICIES,
  INITIAL_ATTENDANCE_CORRECTIONS,
  DEFAULT_MASTER_LEAVE_POLICIES,
  INITIAL_PAYROLL_CONFIG,
  INITIAL_REWARD_POLICIES,
  INITIAL_EMPLOYEE_REWARDS,
  INITIAL_POLICY_AUDIT_LOGS
} from '../data/settingsInitialData';
import { DEFAULT_LOAN_POLICIES, INITIAL_LOAN_RECORDS } from '../data/loanInitialData';
import { calculateEmployeePayroll } from '../services/policyEngine';
import { payrollApi } from '../services/payrollApi';
import {
  INITIAL_ENHANCED_TASKS,
  INITIAL_MOM_MEETINGS,
  INITIAL_TASK_MASTERS,
  INITIAL_ESCALATION_RULES,
  INITIAL_TASK_WEIGHTS
} from './taskInitialData';
import { toNum } from '../utils/numbers';
import {
  MissedPunchRequest,
  OvertimeRequest,
  DepartmentOtPolicy,
  EmployeeOtPolicy,
  AttendanceGlobalSettings,
  OvertimePolicy,
  AttendancePolicyConfig,
  ShiftModel
} from '../types/attendanceEnterprise';
import {
  INITIAL_MISSED_PUNCH_REQUESTS,
  INITIAL_OVERTIME_REQUESTS,
  INITIAL_DEPARTMENT_OT_POLICIES,
  INITIAL_EMPLOYEE_OT_POLICIES,
  INITIAL_ATTENDANCE_GLOBAL_SETTINGS,
  INITIAL_OVERTIME_POLICY,
  INITIAL_ATTENDANCE_POLICY_CONFIG
} from '../data/attendanceEnterpriseInitialData';
import {
  calculateAttendanceHoursAndStatus,
  resolveEmployeeOtEligibility,
  calculateOtSalaryAmount,
  calculateAttendanceSalaryImpact,
  aggregateMonthlyAttendanceSummary
} from '../services/attendanceCalculationEngine';

export const calculateDistanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

const INITIAL_GEOFENCE_CONFIG: GeofenceConfig = {
  enabled: true,
  officeName: 'VRM Structures India Pvt Ltd',
  centerLat: 13.151968,
  centerLng: 80.2086053,
  radiusMeters: 200,
  enforceStrictly: true
};

// Default RBAC Permission Matrix for remaining 5 roles
const DEFAULT_PERMISSIONS: PermissionMatrix = {
  'Super Admin': {
    dashboard: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    employees: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    face_attendance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    attendance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    gps_geofence: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    leaves: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    shifts: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    performance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    tasks: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    recruitment: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    finance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    notifications: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    payroll: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    advance_salary: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    reports: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    organization: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    assets: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    settings: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
  },
  'CEO': {
    dashboard: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    employees: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    face_attendance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    attendance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    gps_geofence: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    leaves: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    shifts: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    performance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    tasks: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    recruitment: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    finance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    notifications: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    payroll: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    advance_salary: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    reports: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    organization: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    assets: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    settings: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
  },
  'HR Manager': {
    dashboard: ['view', 'export'],
    employees: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    face_attendance: ['view', 'create', 'edit', 'export'],
    attendance: ['view', 'create', 'edit', 'approve', 'export'],
    gps_geofence: ['view', 'create', 'edit', 'approve', 'export'],
    leaves: ['view', 'create', 'edit', 'approve', 'export'],
    shifts: ['view', 'create', 'edit', 'approve', 'export'],
    performance: ['view', 'create', 'edit', 'approve', 'export'],
    tasks: ['view', 'create', 'edit', 'export'],
    recruitment: ['view', 'create', 'edit', 'approve', 'export'],
    finance: ['view', 'create', 'export'],
    notifications: ['view', 'create'],
    payroll: ['view', 'create', 'edit', 'approve', 'export'],
    advance_salary: ['view', 'create', 'edit', 'approve', 'export'],
    reports: ['view', 'export'],
    organization: ['view', 'edit'],
    assets: ['view', 'create', 'edit', 'export'],
    settings: ['view'],
  },
  'HR Admin': {
    dashboard: ['view', 'export'],
    employees: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    face_attendance: ['view', 'create', 'edit', 'export'],
    attendance: ['view', 'create', 'edit', 'approve', 'export'],
    gps_geofence: ['view', 'create', 'edit', 'approve', 'export'],
    leaves: ['view', 'create', 'edit', 'approve', 'export'],
    shifts: ['view', 'create', 'edit', 'approve', 'export'],
    performance: ['view', 'create', 'edit', 'export'],
    tasks: ['view', 'create', 'edit'],
    recruitment: ['view', 'create', 'edit', 'approve'],
    finance: ['view', 'create', 'edit', 'approve', 'export'],
    notifications: ['view', 'create'],
    payroll: ['view', 'create', 'edit', 'approve', 'export'],
    advance_salary: ['view', 'create', 'edit', 'approve', 'export'],
    reports: ['view', 'export'],
    organization: ['view', 'create', 'edit', 'export'],
    assets: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    settings: ['view', 'edit'],
  },
  'Department Manager': {
    dashboard: ['view'],
    employees: ['view'],
    face_attendance: ['view'],
    attendance: ['view', 'approve'],
    gps_geofence: [],
    leaves: ['view', 'approve'],
    shifts: ['view', 'approve'],
    performance: ['view', 'edit'],
    tasks: ['view', 'create', 'edit', 'delete'],
    recruitment: ['view'],
    finance: ['view', 'approve'],
    notifications: ['view'],
    payroll: [],
    advance_salary: ['view', 'create'],
    reports: ['view'],
    organization: ['view'],
    assets: ['view'],
    settings: ['view'],
  },
  'Employee': {
    dashboard: ['view'],
    employees: [],
    face_attendance: ['view', 'create'],
    attendance: ['view'],
    gps_geofence: [],
    leaves: ['view', 'create'],
    shifts: ['view', 'create'],
    performance: ['view'],
    tasks: ['view', 'edit'],
    recruitment: ['view', 'create'], // Referral
    finance: ['view', 'create'],
    notifications: ['view'],
    payroll: ['view'], // Payslip only
    advance_salary: ['view', 'create'],
    reports: [],
    organization: ['view'],
    assets: ['view'],
    settings: ['view'],
  },
  'Finance Manager': {
    dashboard: ['view'],
    employees: ['view'],
    face_attendance: ['view'],
    attendance: ['view'],
    gps_geofence: [],
    leaves: ['view'],
    shifts: ['view'],
    performance: ['view'],
    tasks: ['view'],
    recruitment: [],
    finance: ['view', 'create', 'edit', 'approve', 'export'],
    notifications: ['view', 'create'],
    payroll: ['view', 'create', 'edit', 'approve', 'export'],
    advance_salary: ['view', 'create', 'edit', 'approve', 'export'],
    reports: ['view', 'export'],
    organization: ['view'],
    assets: ['view', 'export'],
    settings: ['view'],
  },
  'Task Creator': {
    dashboard: ['view'],
    employees: ['view'],
    face_attendance: ['view'],
    attendance: ['view'],
    gps_geofence: [],
    leaves: ['view'],
    shifts: ['view'],
    performance: ['view'],
    tasks: ['view', 'create', 'edit', 'export'],
    recruitment: ['view'],
    finance: ['view'],
    notifications: ['view'],
    payroll: [],
    advance_salary: ['view'],
    reports: ['view'],
    organization: ['view'],
    assets: ['view'],
    settings: ['view'],
  },
  'Assignee': {
    dashboard: ['view'],
    employees: [],
    face_attendance: ['view', 'create'],
    attendance: ['view'],
    gps_geofence: [],
    leaves: ['view', 'create'],
    shifts: ['view'],
    performance: ['view'],
    tasks: ['view', 'edit'],
    recruitment: ['view'],
    finance: ['view'],
    notifications: ['view'],
    payroll: ['view'],
    advance_salary: ['view', 'create'],
    reports: [],
    organization: ['view'],
    assets: ['view'],
    settings: ['view'],
  },
  'Responsible Person': {
    dashboard: ['view'],
    employees: ['view'],
    face_attendance: ['view'],
    attendance: ['view'],
    gps_geofence: [],
    leaves: ['view'],
    shifts: ['view'],
    performance: ['view'],
    tasks: ['view', 'create', 'edit', 'approve', 'export'],
    recruitment: ['view'],
    finance: ['view'],
    notifications: ['view'],
    payroll: [],
    advance_salary: ['view'],
    reports: ['view'],
    organization: ['view'],
    assets: ['view'],
    settings: ['view'],
  },
  'Department Head': {
    dashboard: ['view', 'export'],
    employees: ['view'],
    face_attendance: ['view'],
    attendance: ['view', 'approve'],
    gps_geofence: [],
    leaves: ['view', 'approve'],
    shifts: ['view', 'approve'],
    performance: ['view', 'edit', 'export'],
    tasks: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    recruitment: ['view'],
    finance: ['view', 'approve'],
    notifications: ['view', 'create'],
    payroll: ['view'],
    advance_salary: ['view', 'approve'],
    reports: ['view', 'export'],
    organization: ['view'],
    assets: ['view'],
    settings: ['view'],
  },
  'Manager': {
    dashboard: ['view'],
    employees: ['view'],
    face_attendance: ['view'],
    attendance: ['view', 'approve'],
    gps_geofence: [],
    leaves: ['view', 'approve'],
    shifts: ['view', 'approve'],
    performance: ['view', 'edit'],
    tasks: ['view', 'create', 'edit', 'approve', 'export'],
    recruitment: ['view'],
    finance: ['view', 'approve'],
    notifications: ['view'],
    payroll: [],
    advance_salary: ['view', 'approve'],
    reports: ['view'],
    organization: ['view'],
    assets: ['view'],
    settings: [],
  },
  'Management': {
    dashboard: ['view', 'export'],
    employees: ['view', 'export'],
    face_attendance: ['view'],
    attendance: ['view', 'export'],
    gps_geofence: ['view'],
    leaves: ['view', 'export'],
    shifts: ['view'],
    performance: ['view', 'export'],
    tasks: ['view', 'export'],
    recruitment: ['view', 'export'],
    finance: ['view', 'export'],
    notifications: ['view'],
    payroll: ['view', 'export'],
    advance_salary: ['view', 'approve', 'export'],
    reports: ['view', 'export'],
    organization: ['view', 'export'],
    assets: ['view', 'export'],
    settings: ['view'],
  },
  'ERP Administrator': {
    dashboard: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    employees: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    face_attendance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    attendance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    gps_geofence: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    leaves: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    shifts: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    performance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    tasks: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    recruitment: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    finance: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    notifications: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    payroll: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    advance_salary: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    reports: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    organization: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    assets: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    settings: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
  }
};

// Initial Mock Data Sets
const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-000',
    employeeId: 'EMP-000',
    firstName: 'Velmurugan',
    lastName: '',
    email: 'ceo@vrmstructures.com',
    phone: '+91 98765 43210',
    dob: '1975-06-15',
    gender: 'Male',
    address: 'Corporate HQ, VRM Structures, Chennai',
    department: 'HR',
    designation: 'CEO',
    reportingManagerId: '',
    reportingManagerName: 'Board of Directors',
    joiningDate: '2018-01-01',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 250000,
    allowances: { hra: 60000, transport: 15000, medical: 10000, special: 25000 },
    bankDetails: { bankName: 'HDFC Bank', accountNumber: '****1001', ifscCode: 'HDFC0001234', branch: 'Anna Nagar' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    facePhotoUrl: '',
    documents: []
  },
  {
    id: 'EMP-001',
    employeeId: 'EMP-001',
    firstName: 'Pavithra',
    lastName: '',
    email: 'hr@vrmstructures.com',
    phone: '+91 98765 12345',
    dob: '1992-04-12',
    gender: 'Female',
    address: 'VRM Structures, Chennai',
    department: 'HR',
    designation: 'HR Manager',
    reportingManagerId: 'EMP-000',
    reportingManagerName: 'Velmurugan',
    joiningDate: '2020-03-15',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 85000,
    allowances: { hra: 25000, transport: 6000, medical: 4000, special: 10000 },
    bankDetails: { bankName: 'ICICI Bank', accountNumber: '****6789', ifscCode: 'ICIC00912', branch: 'Chennai Main' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    facePhotoUrl: '',
    documents: [
      { name: 'Offer_Letter.pdf', type: 'PDF', url: '#', uploadDate: '2020-03-10' },
      { name: 'ID_Proof_Aadhaar.pdf', type: 'PDF', url: '#', uploadDate: '2020-03-10' }
    ]
  },
  {
    id: 'EMP-002',
    employeeId: 'EMP-002',
    firstName: 'Ramesh',
    lastName: 'Kumar',
    email: 'ramesh.ph@vrmstructures.com',
    phone: '+91 98765 22002',
    dob: '1985-11-22',
    gender: 'Male',
    address: 'Industrial Estate, Chennai',
    department: 'Dispatch',
    designation: 'Dispatch Head',
    reportingManagerId: 'EMP-000',
    reportingManagerName: 'Velmurugan',
    joiningDate: '2019-01-10',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 95000,
    allowances: { hra: 28000, transport: 7000, medical: 5000, special: 12000 },
    bankDetails: { bankName: 'State Bank of India', accountNumber: '****4321', ifscCode: 'SBIN00123', branch: 'Ambattur' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-003',
    employeeId: 'EMP-003',
    firstName: 'Suresh',
    lastName: 'Patel',
    email: 'suresh.dh@vrmstructures.com',
    phone: '+91 98765 33003',
    dob: '1987-08-14',
    gender: 'Male',
    address: 'Logistics Park, Chennai',
    department: 'Dispatch',
    designation: 'Logistics Coordinator',
    reportingManagerId: 'EMP-002',
    reportingManagerName: 'Ramesh Kumar',
    joiningDate: '2020-06-01',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 82000,
    allowances: { hra: 24000, transport: 6000, medical: 4000, special: 10000 },
    bankDetails: { bankName: 'Canara Bank', accountNumber: '****9876', ifscCode: 'CNRB00876', branch: 'Guindy' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-004',
    employeeId: 'EMP-004',
    firstName: 'Karthik',
    lastName: 'Rajan',
    email: 'karthik.fs@vrmstructures.com',
    phone: '+91 98765 44004',
    dob: '1990-02-17',
    gender: 'Male',
    address: 'Factory Road, Chennai',
    department: 'Procurement',
    designation: 'Procurement Head',
    reportingManagerId: 'EMP-000',
    reportingManagerName: 'Velmurugan',
    joiningDate: '2021-02-15',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 65000,
    allowances: { hra: 18000, transport: 5000, medical: 3000, special: 8000 },
    bankDetails: { bankName: 'Axis Bank', accountNumber: '****1122', ifscCode: 'UTIB00345', branch: 'Chennai' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-005',
    employeeId: 'EMP-005',
    firstName: 'Murugan',
    lastName: 'S',
    email: 'murugan.fe@vrmstructures.com',
    phone: '+91 98765 55005',
    dob: '1995-07-20',
    gender: 'Male',
    address: 'Works Colony, Chennai',
    department: 'Procurement',
    designation: 'Purchase Executive',
    reportingManagerId: 'EMP-004',
    reportingManagerName: 'Karthik Rajan',
    joiningDate: '2022-04-01',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 38000,
    allowances: { hra: 10000, transport: 3000, medical: 2000, special: 4000 },
    bankDetails: { bankName: 'Indian Bank', accountNumber: '****5566', ifscCode: 'IDIB00112', branch: 'Chromepet' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-006',
    employeeId: 'EMP-006',
    firstName: 'Anand',
    lastName: 'Sharma',
    email: 'anand.pr@vrmstructures.com',
    phone: '+91 98765 66006',
    dob: '1986-09-12',
    gender: 'Male',
    address: 'Supply Chain Enclave, Chennai',
    department: 'Procurement',
    designation: 'Vendor Coordinator',
    reportingManagerId: 'EMP-004',
    reportingManagerName: 'Karthik Rajan',
    joiningDate: '2019-11-01',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 88000,
    allowances: { hra: 26000, transport: 6000, medical: 4000, special: 11000 },
    bankDetails: { bankName: 'HDFC Bank', accountNumber: '****7788', ifscCode: 'HDFC0008899', branch: 'T Nagar' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-007',
    employeeId: 'EMP-007',
    firstName: 'Priya',
    lastName: 'Natarajan',
    email: 'priya.ah@vrmstructures.com',
    phone: '+91 98765 77007',
    dob: '1989-12-05',
    gender: 'Female',
    address: 'Finance Plaza, Chennai',
    department: 'Accounts',
    designation: 'Accounts Head',
    reportingManagerId: 'EMP-000',
    reportingManagerName: 'Velmurugan',
    joiningDate: '2020-01-15',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 92000,
    allowances: { hra: 27000, transport: 7000, medical: 4000, special: 12000 },
    bankDetails: { bankName: 'ICICI Bank', accountNumber: '****2233', ifscCode: 'ICIC00124', branch: 'Mylapore' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-008',
    employeeId: 'EMP-008',
    firstName: 'Rajesh',
    lastName: 'Kannan',
    email: 'rajesh.sh@vrmstructures.com',
    phone: '+91 98765 88008',
    dob: '1984-03-30',
    gender: 'Male',
    address: 'Mount Road, Chennai',
    department: 'Sales',
    designation: 'Sales Head',
    reportingManagerId: 'EMP-000',
    reportingManagerName: 'Velmurugan',
    joiningDate: '2019-05-10',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 96000,
    allowances: { hra: 28000, transport: 8000, medical: 5000, special: 15000 },
    bankDetails: { bankName: 'Kotak Mahindra Bank', accountNumber: '****4455', ifscCode: 'KKBK00012', branch: 'Nungambakkam' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-009',
    employeeId: 'EMP-009',
    firstName: 'Dinesh',
    lastName: 'Kumar',
    email: 'dinesh.se@vrmstructures.com',
    phone: '+91 98765 99009',
    dob: '1996-05-18',
    gender: 'Male',
    address: 'Velachery, Chennai',
    department: 'Sales',
    designation: 'Sales Executive',
    reportingManagerId: 'EMP-008',
    reportingManagerName: 'Rajesh Kannan',
    joiningDate: '2023-03-01',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 45000,
    allowances: { hra: 14000, transport: 4000, medical: 2500, special: 6000 },
    bankDetails: { bankName: 'Axis Bank', accountNumber: '****6677', ifscCode: 'UTIB00889', branch: 'Velachery' },
    attendanceMethod: 'GPS Location',
    gpsAllowed: true,
    faceRegistered: false,
    documents: []
  },
  {
    id: 'EMP-010',
    employeeId: 'EMP-010',
    firstName: 'Swetha',
    lastName: 'Sundar',
    email: 'swetha.de@vrmstructures.com',
    phone: '+91 98765 10010',
    dob: '1993-10-15',
    gender: 'Female',
    address: 'Design Hub, Chennai',
    department: 'Design',
    designation: 'Design Executive',
    reportingManagerId: 'EMP-000',
    reportingManagerName: 'Velmurugan',
    joiningDate: '2021-08-01',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 68000,
    allowances: { hra: 20000, transport: 5000, medical: 3500, special: 8500 },
    bankDetails: { bankName: 'State Bank of India', accountNumber: '****8899', ifscCode: 'SBIN00456', branch: 'Adyar' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-011',
    employeeId: 'EMP-011',
    firstName: 'Vignesh',
    lastName: 'W',
    email: 'vignesh.ts@vrmstructures.com',
    phone: '+91 98765 11011',
    dob: '1994-06-25',
    gender: 'Male',
    address: 'IT Corridor, OMR, Chennai',
    department: 'Technical Support',
    designation: 'Support Engineer',
    reportingManagerId: 'EMP-013',
    reportingManagerName: 'Arvind Babu',
    joiningDate: '2022-01-10',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 52000,
    allowances: { hra: 16000, transport: 4500, medical: 3000, special: 7000 },
    bankDetails: { bankName: 'HDFC Bank', accountNumber: '****1234', ifscCode: 'HDFC0004567', branch: 'OMR' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-012',
    employeeId: 'EMP-012',
    firstName: 'Deepa',
    lastName: 'Lakshmi',
    email: 'deepa.bi@vrmstructures.com',
    phone: '+91 98765 12012',
    dob: '1991-01-18',
    gender: 'Female',
    address: 'Commercial Complex, Chennai',
    department: 'Finance',
    designation: 'Finance Manager',
    reportingManagerId: 'EMP-000',
    reportingManagerName: 'Velmurugan',
    joiningDate: '2021-05-15',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 58000,
    allowances: { hra: 17000, transport: 4500, medical: 3000, special: 7500 },
    bankDetails: { bankName: 'Canara Bank', accountNumber: '****3456', ifscCode: 'CNRB00345', branch: 'Chennai' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-013',
    employeeId: 'EMP-013',
    firstName: 'Arvind',
    lastName: 'Babu',
    email: 'arvind.ta@vrmstructures.com',
    phone: '+91 98765 13013',
    dob: '1988-04-09',
    gender: 'Male',
    address: 'Systems Wing, Chennai',
    department: 'Technical Support',
    designation: 'Technical Support Lead',
    reportingManagerId: 'EMP-000',
    reportingManagerName: 'Velmurugan',
    joiningDate: '2019-08-01',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 85000,
    allowances: { hra: 25000, transport: 6000, medical: 4000, special: 10000 },
    bankDetails: { bankName: 'ICICI Bank', accountNumber: '****5678', ifscCode: 'ICIC00789', branch: 'Anna Salai' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-014',
    employeeId: 'EMP-014',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'robert.chen@vrmstructures.com',
    phone: '+91 98765 14014',
    dob: '1989-08-24',
    gender: 'Male',
    address: 'Engineering Annex, VRM Structures, Chennai',
    department: 'Design',
    designation: 'Senior Structural Engineer',
    reportingManagerId: 'EMP-000',
    reportingManagerName: 'Velmurugan',
    joiningDate: '2020-07-15',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 92000,
    allowances: { hra: 28000, transport: 7000, medical: 4000, special: 12000 },
    bankDetails: { bankName: 'Standard Chartered', accountNumber: '****8899', ifscCode: 'SCBL00123', branch: 'Chennai' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-015',
    employeeId: 'EMP-015',
    firstName: 'Anita',
    lastName: 'Sharma',
    email: 'anita.sharma@vrmstructures.com',
    phone: '+91 98765 15015',
    dob: '1993-10-14',
    gender: 'Female',
    address: 'HR Block, VRM Structures, Chennai',
    department: 'HR',
    designation: 'HR Executive',
    reportingManagerId: 'EMP-001',
    reportingManagerName: 'Pavithra',
    joiningDate: '2021-09-01',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 62000,
    allowances: { hra: 18000, transport: 4500, medical: 3000, special: 8500 },
    bankDetails: { bankName: 'HDFC Bank', accountNumber: '****6677', ifscCode: 'HDFC0003456', branch: 'Chennai' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-016',
    employeeId: 'EMP-016',
    firstName: 'Kavitha',
    lastName: 'R',
    email: 'kavitha.r@vrmstructures.com',
    phone: '+91 98765 16016',
    dob: '1995-03-22',
    gender: 'Female',
    address: 'Quality Wing, VRM Structures, Chennai',
    department: 'Accounts',
    designation: 'Senior Accountant',
    reportingManagerId: 'EMP-007',
    reportingManagerName: 'Priya Natarajan',
    joiningDate: '2022-03-15',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 55000,
    allowances: { hra: 16000, transport: 4000, medical: 3000, special: 7000 },
    bankDetails: { bankName: 'ICICI Bank', accountNumber: '****7788', ifscCode: 'ICIC0004567', branch: 'Chennai' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-050',
    employeeId: 'EMP-050',
    firstName: 'JAYASURYA',
    lastName: 'V',
    email: 'jayasurya.v@vrmstructures.com',
    phone: '+91 98765 50050',
    dob: '1996-08-14',
    gender: 'Male',
    address: 'Engineering Division, VRM Structures, Chennai',
    department: 'Engineering',
    designation: 'Site Engineer',
    reportingManagerId: 'EMP-000',
    reportingManagerName: 'Velmurugan',
    joiningDate: '2023-01-10',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 62000,
    allowances: { hra: 18000, transport: 5000, medical: 3500, special: 8500 },
    bankDetails: { bankName: 'HDFC Bank', accountNumber: '****5050', ifscCode: 'HDFC0001234', branch: 'Chennai' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  },
  {
    id: 'EMP-051',
    employeeId: 'EMP-051',
    firstName: 'PURUSHOTHAMAN',
    lastName: 'M',
    email: 'purushothaman.m@vrmstructures.com',
    phone: '+91 98765 51051',
    dob: '1993-11-20',
    gender: 'Male',
    address: 'Fabrication Plant, VRM Structures, Chennai',
    department: 'Production',
    designation: 'Fabrication Specialist',
    reportingManagerId: 'EMP-002',
    reportingManagerName: 'Ramesh Kumar',
    joiningDate: '2022-06-01',
    employmentType: 'Full-Time',
    status: 'Active',
    avatar: '',
    basicSalary: 58000,
    allowances: { hra: 17000, transport: 4500, medical: 3000, special: 7500 },
    bankDetails: { bankName: 'SBI Bank', accountNumber: '****5151', ifscCode: 'SBIN0001234', branch: 'Chennai' },
    attendanceMethod: 'Face Scan',
    gpsAllowed: true,
    faceRegistered: true,
    documents: []
  }
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-201',
    employeeId: 'EMP-050',
    employeeName: 'JAYASURYA V',
    department: 'Engineering',
    date: '2026-09-08',
    checkIn: '09:59 AM',
    checkOut: '06:35 PM',
    workingHours: 8.6,
    otHours: 0.58,
    status: 'Present',
    lateStatus: 'On Time',
    location: { lat: 13.151968, lng: 80.198900, address: 'VRM HQ, Chennai', inGeofence: true },
    faceVerified: true,
    method: 'Face Recognition'
  },
  {
    id: 'ATT-202',
    employeeId: 'EMP-050',
    employeeName: 'JAYASURYA V',
    department: 'Engineering',
    date: '2026-09-07',
    checkIn: '09:48 AM',
    checkOut: '06:47 PM',
    workingHours: 8.98,
    otHours: 0.98,
    status: 'Present',
    lateStatus: 'On Time',
    location: { lat: 13.151968, lng: 80.198900, address: 'VRM HQ, Chennai', inGeofence: true },
    faceVerified: true,
    method: 'Face Recognition'
  },
  {
    id: 'ATT-203',
    employeeId: 'EMP-051',
    employeeName: 'PURUSHOTHAMAN M',
    department: 'Production',
    date: '2026-09-08',
    checkIn: '09:30 AM',
    checkOut: '07:15 PM',
    workingHours: 9.75,
    otHours: 0.75,
    status: 'Present',
    lateStatus: 'On Time',
    location: { lat: 13.151968, lng: 80.198900, address: 'Fabrication Plant, Chennai', inGeofence: true },
    faceVerified: true,
    method: 'Face Recognition'
  },
  {
    id: 'ATT-204',
    employeeId: 'EMP-051',
    employeeName: 'PURUSHOTHAMAN M',
    department: 'Production',
    date: '2026-09-07',
    checkIn: '09:25 AM',
    checkOut: '06:30 PM',
    workingHours: 9.08,
    status: 'Present',
    lateStatus: 'On Time',
    location: { lat: 13.151968, lng: 80.198900, address: 'Fabrication Plant, Chennai', inGeofence: true },
    faceVerified: true,
    method: 'Face Recognition'
  },
  {
    id: 'ATT-101',
    employeeId: 'EMP-001',
    employeeName: 'Pavithra',
    department: 'Human Resources',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:52 AM',
    checkOut: null,
    workingHours: 7.5,
    status: 'Present',
    lateStatus: 'On Time',
    location: { lat: 13.151968, lng: 80.198900, address: 'VRM HQ, Chennai', inGeofence: true },
    faceVerified: true,
    method: 'Face Recognition'
  },
  {
    id: 'ATT-102',
    employeeId: 'EMP-002',
    employeeName: 'Ramesh Kumar',
    department: 'Production Head',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:05 AM',
    checkOut: null,
    workingHours: 7.2,
    status: 'Late',
    lateStatus: 'Late (<30m)',
    location: { lat: 13.151968, lng: 80.198900, address: 'Production Block', inGeofence: true },
    faceVerified: true,
    method: 'Face Recognition'
  },
  {
    id: 'ATT-103',
    employeeId: 'EMP-005',
    employeeName: 'Murugan S',
    department: 'Floor Employee',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00 AM',
    checkOut: null,
    workingHours: 7.3,
    status: 'Present',
    lateStatus: 'On Time',
    location: { lat: 13.151968, lng: 80.198900, address: 'Shop Floor 1', inGeofence: true },
    faceVerified: true,
    method: 'Face Recognition'
  },
  {
    id: 'ATT-104',
    employeeId: 'EMP-007',
    employeeName: 'Priya Natarajan',
    department: 'Accounts Head',
    date: new Date().toISOString().split('T')[0],
    checkIn: null,
    checkOut: null,
    workingHours: 0,
    status: 'On Leave',
    lateStatus: 'N/A',
    location: { lat: 13.151968, lng: 80.198900, address: 'N/A', inGeofence: false },
    faceVerified: false,
    method: 'System Auto'
  },
  {
    id: 'ATT-105',
    employeeId: 'EMP-009',
    employeeName: 'Dinesh Kumar',
    department: 'Sales Executive',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:45 AM',
    checkOut: null,
    workingHours: 7.6,
    status: 'Present',
    lateStatus: 'On Time',
    location: { lat: 13.151968, lng: 80.198900, address: 'Sales Wing', inGeofence: true },
    faceVerified: true,
    method: 'Face Recognition'
  }
];

const INITIAL_FACE_LOGS: FaceLog[] = [
  {
    id: 'FL-001',
    employeeId: 'EMP-001',
    employeeName: 'Pavithra',
    timestamp: '2026-08-29 08:52:14',
    type: 'Check-In',
    status: 'Success',
    photoUrl: '',
    confidenceScore: 98.4
  },
  {
    id: 'FL-002',
    employeeId: 'EMP-002',
    employeeName: 'Ramesh Kumar',
    timestamp: '2026-08-29 09:05:02',
    type: 'Check-In',
    status: 'Success',
    photoUrl: '',
    confidenceScore: 96.1
  }
];

export const INITIAL_ATTENDANCE_AUDIT_LOGS: AttendanceAuditLog[] = [
  {
    id: 'AUD-101',
    attendanceId: 'ATT-101',
    employeeId: 'EMP-001',
    employeeName: 'Pavithra',
    date: '2026-09-08',
    fieldChanged: 'Check-Out',
    oldValue: 'Missing Punch',
    newValue: '06:18 PM',
    reason: 'Employee forgot checkout at main gate terminal',
    changedBy: 'Velmurugan (CEO)',
    timestamp: '2026-09-08 18:30:15'
  },
  {
    id: 'AUD-102',
    attendanceId: 'ATT-102',
    employeeId: 'EMP-002',
    employeeName: 'Ramesh Kumar',
    date: '2026-09-07',
    fieldChanged: 'Status & OT',
    oldValue: 'Present (8.0 hrs, OT: 0 hrs)',
    newValue: 'Present (9.5 hrs, Approved OT: 1.5 hrs)',
    reason: 'Client emergency deployment support verified',
    changedBy: 'Pavithra (HR Manager)',
    timestamp: '2026-09-07 19:10:00'
  }
];

const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'LR-201',
    employeeId: 'EMP-007',
    employeeName: 'Priya Natarajan',
    department: 'Accounts Head',
    leaveType: 'Casual Leave',
    startDate: '2026-08-29',
    endDate: '2026-08-30',
    daysCount: 2,
    reason: 'Family event and travel',
    status: 'Approved',
    appliedDate: '2026-08-25',
    approvedBy: 'Pavithra'
  },
  {
    id: 'LR-202',
    employeeId: 'EMP-005',
    employeeName: 'Murugan S',
    department: 'Floor Employee',
    leaveType: 'Sick Leave',
    startDate: '2026-09-02',
    endDate: '2026-09-03',
    daysCount: 2,
    reason: 'Medical checkup appointment',
    status: 'Pending',
    appliedDate: '2026-08-28'
  },
  {
    id: 'LR-203',
    employeeId: 'EMP-014',
    employeeName: 'Robert Chen',
    department: 'Engineering & Design',
    leaveType: 'Casual Leave',
    startDate: '2026-09-01',
    endDate: '2026-09-03',
    daysCount: 3,
    reason: 'Family visit and personal work',
    status: 'Approved',
    appliedDate: '2026-08-27',
    approvedBy: 'Pavithra'
  },
  {
    id: 'LR-204',
    employeeId: 'EMP-015',
    employeeName: 'Anita Sharma',
    department: 'Human Resources',
    leaveType: 'Paid Leave',
    startDate: '2026-09-05',
    endDate: '2026-09-07',
    daysCount: 3,
    reason: 'Attending family wedding ceremony',
    status: 'Pending',
    appliedDate: '2026-09-02'
  },
  {
    id: 'LR-205',
    employeeId: 'EMP-016',
    employeeName: 'Kavitha R',
    department: 'Quality Assurance',
    leaveType: 'Casual Leave',
    startDate: '2026-09-06',
    endDate: '2026-09-06',
    daysCount: 1,
    reason: 'Personal home maintenance work',
    status: 'Pending',
    appliedDate: '2026-09-03'
  },
  {
    id: 'LR-195',
    employeeId: 'EMP-015',
    employeeName: 'Anita Sharma',
    department: 'Human Resources',
    leaveType: 'Sick Leave',
    startDate: '2026-07-14',
    endDate: '2026-07-15',
    daysCount: 2,
    reason: 'Viral fever & doctor consultation',
    status: 'Approved',
    appliedDate: '2026-07-12',
    approvedBy: 'Pavithra'
  },
  {
    id: 'LR-182',
    employeeId: 'EMP-015',
    employeeName: 'Anita Sharma',
    department: 'Human Resources',
    leaveType: 'Casual Leave',
    startDate: '2026-05-20',
    endDate: '2026-05-21',
    daysCount: 2,
    reason: 'Personal family travel',
    status: 'Approved',
    appliedDate: '2026-05-18',
    approvedBy: 'Pavithra'
  },
  {
    id: 'LR-196',
    employeeId: 'EMP-016',
    employeeName: 'Kavitha R',
    department: 'Quality Assurance',
    leaveType: 'Casual Leave',
    startDate: '2026-08-10',
    endDate: '2026-08-11',
    daysCount: 2,
    reason: 'Attending relative wedding',
    status: 'Approved',
    appliedDate: '2026-08-07',
    approvedBy: 'Pavithra'
  },
  {
    id: 'LR-180',
    employeeId: 'EMP-016',
    employeeName: 'Kavitha R',
    department: 'Quality Assurance',
    leaveType: 'Sick Leave',
    startDate: '2026-06-16',
    endDate: '2026-06-17',
    daysCount: 2,
    reason: 'Migraine and medical rest',
    status: 'Approved',
    appliedDate: '2026-06-15',
    approvedBy: 'Pavithra'
  }
];

const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'SH-01',
    shiftName: 'General Morning Shift',
    startTime: '09:00',
    endTime: '18:00',
    breakDurationMins: 60,
    workingHours: 8,
    gracePeriodMins: 15,
    assignedEmployeeCount: 5,
    assignments: ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005'].map((empId, idx) => ({
      id: `ASN-SH1-${idx + 1}`,
      shiftId: 'SH-01',
      employeeId: empId,
      effectiveFrom: '2026-01-01',
      status: 'ACTIVE' as const,
      assignedById: 'EMP-001',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    })),
    color: '#155DFC'
  },
  {
    id: 'SH-02',
    shiftName: 'Evening Shift',
    startTime: '16:00',
    endTime: '01:00',
    breakDurationMins: 60,
    workingHours: 8,
    gracePeriodMins: 15,
    assignedEmployeeCount: 0,
    assignments: [],
    color: '#8b5cf6'
  },
  {
    id: 'SH-03',
    shiftName: 'Night Operations Shift',
    startTime: '00:00',
    endTime: '09:00',
    breakDurationMins: 60,
    workingHours: 8,
    gracePeriodMins: 10,
    assignedEmployeeCount: 0,
    assignments: [],
    color: '#f59e0b'
  }
];

const INITIAL_LEAVE_POLICIES: LeavePolicyItem[] = [
  {
    id: 'lp1',
    name: 'Casual Leave (CL)',
    code: 'CL',
    quotaDays: 12,
    monthlyAccrual: '1 Day / Month',
    carryForward: 'No',
    color: '#0E7490',
    status: 'Active',
    description: 'For personal, emergency, or unexpected short-term absences.'
  },
  {
    id: 'lp2',
    name: 'Sick / Medical Leave (SL)',
    code: 'SL',
    quotaDays: 12,
    monthlyAccrual: '1 Day / Month',
    carryForward: 'Max 10 Days',
    color: '#2563EB',
    status: 'Active',
    description: 'For personal illness, medical emergencies, or treatment appointments.'
  },
  {
    id: 'lp3',
    name: 'Earned / Privilege Leave (EL)',
    code: 'EL',
    quotaDays: 15,
    monthlyAccrual: '1.25 Days / Month',
    carryForward: 'Max 30 Days',
    color: '#16A34A',
    status: 'Active',
    description: 'Annual statutory paid vacation and planned personal leaves.'
  },
  {
    id: 'lp4',
    name: 'Maternity & Paternity Leave',
    code: 'ML',
    quotaDays: 182,
    monthlyAccrual: 'Lump Sum',
    carryForward: 'N/A',
    color: '#DB2777',
    status: 'Active',
    description: '26 Weeks for maternity or 15 days paternity leave as per statutory guidelines.'
  },
  {
    id: 'lp5',
    name: 'Compensatory Off (Comp-Off)',
    code: 'CO',
    quotaDays: 6,
    monthlyAccrual: 'Earned upon holiday work',
    carryForward: '60 Days Validity',
    color: '#7C3AED',
    status: 'Active',
    description: 'Compensatory day-off credited when working on Sundays or statutory holidays.'
  }
];

const INITIAL_HOLIDAYS: HolidayItem[] = [
  { id: 'hp1', name: 'Pongal & Makar Sankranti', date: '2026-01-14', daysCount: 3, type: 'State Specific', applicableLocation: 'Tamil Nadu Sites' },
  { id: 'hp2', name: 'Republic Day', date: '2026-01-26', daysCount: 1, type: 'Compulsory', applicableLocation: 'All India' },
  { id: 'hp3', name: 'Tamil New Year & Good Friday', date: '2026-04-14', daysCount: 1, type: 'Mandatory', applicableLocation: 'Tamil Nadu & Corporate' },
  { id: 'hp4', name: 'May Day (International Workers Day)', date: '2026-05-01', daysCount: 1, type: 'Mandatory', applicableLocation: 'All Sites & Yards' },
  { id: 'hp5', name: 'Independence Day', date: '2026-08-15', daysCount: 1, type: 'Compulsory', applicableLocation: 'All India' },
  { id: 'hp6', name: 'Ayudha Pooja & Vijayadasami', date: '2026-10-19', daysCount: 2, type: 'Festival', applicableLocation: 'Factory & Fabrication Sites' },
  { id: 'hp7', name: 'Deepavali / Diwali Corporate Break', date: '2026-11-08', daysCount: 2, type: 'Festival', applicableLocation: 'Company Wide' },
  { id: 'hp8', name: 'Christmas Day', date: '2026-12-25', daysCount: 1, type: 'Mandatory', applicableLocation: 'Company Wide' }
];

const INITIAL_ATTENDANCE_POLICIES: AttendancePolicyItem[] = [
  { id: 'ap1', name: 'HQ Corporate Staff (Face Scan & Web)', mode: 'Selfie & AI Face Scan', status: 'Active', description: 'Dual verification through AI face recognition on arrival' },
  { id: 'ap2', name: 'Madhavaram Site Engineers (Geofence GPS)', mode: 'Geofenced Mobile', status: 'Active', description: 'GPS coordinates checked within 200m radius of industrial yard' },
  { id: 'ap3', name: 'Guindy Plant & Yard Crew (Biometric)', mode: 'Biometric Fingerprint', status: 'Active', description: 'Hardware terminal biometric sensor integrated with local controller' },
  { id: 'ap4', name: 'Field Project Supervisors (GPS Track)', mode: 'Location Telemetry', status: 'Active', description: 'Location telemetry and real-time site punch verification' },
  { id: 'ap5', name: 'Fabrication Night Shift (Strict Punch)', mode: 'Face Scan + Punch Out', status: 'Active', description: 'Both punch-in and punch-out mandatory with biometric validation' },
  { id: 'ap6', name: 'Remote & External Consultants (Manual)', mode: 'Manual Web Punch', status: 'Active', description: 'Browser portal web punch with IP address logging' }
];

const INITIAL_WEEKLY_SCHEDULES: WeeklyScheduleItem[] = [
  { id: 'wp1', name: '6-Day Site & Production Schedule (Mon - Sat)', workingDays: 'Mon, Tue, Wed, Thu, Fri, Sat', offDays: 'Sunday', isDefault: true },
  { id: 'wp2', name: '5-Day Corporate Office Schedule (Mon - Fri)', workingDays: 'Mon, Tue, Wed, Thu, Fri', offDays: 'Saturday, Sunday', isDefault: false },
  { id: 'wp3', name: 'Alternate Saturday Off Schedule (1st & 3rd Working)', workingDays: 'Mon - Fri + 1st/3rd Sat', offDays: 'Sunday + 2nd/4th Sat', isDefault: false },
  { id: 'wp4', name: 'Continuous 24/7 Shift Rotation', workingDays: 'Rotational 6 Days', offDays: 'Rolling 1 Day', isDefault: false }
];

const INITIAL_GLOBAL_ATTENDANCE_CONFIG: GlobalAttendanceConfig = {
  trackInOutTime: true,
  noAttendanceWithoutPunchOut: true,
  allowMultiplePunches: false,
  lateGraceMinutes: 15,
  maxLateEntriesPerMonth: 3,
  latePenaltyDeduction: '0.5 Day Leave after 3 Late Marks',
  trackEarlyOut: true,
  earlyOutGraceMinutes: 15,
  trackBreaks: true,
  maxBreakMinutes: 60,
  autoPunchOutAfterHours: 12,
  enableAutoApproval: true,
  autoApproveDays: 3,
  enableOvertime: true,
  normalOtMultiplier: 1.5,
  holidayOtMultiplier: 2.0,
  minOtTriggerMinutes: 30,
  maxOtHoursPerMonth: 50,
  requireOtPreApproval: true,
  autoCreditOtToPayroll: true,
  compOffMinHoursHalfDay: 4,
  compOffMinHoursFullDay: 8,
  compOffValidityDays: 60,
  compOffMaxAccrualPerMonth: 3,
  compOffRequireManagerApproval: true,
  compOffAllowEncashment: false
};

const INITIAL_POLICY_DOCUMENTS: PolicyDocumentItem[] = [
  { id: 'p1', title: 'VRM Corporate Code of Conduct & Ethics', category: 'Corporate Governance', version: 'v3.2', updated: 'Jan 2026', status: 'Active', description: 'Core principles of professional behavior, anti-bribery, conflict of interest, and corporate ethics.' },
  { id: 'p2', title: 'POSH (Prevention of Sexual Harassment) Policy', category: 'Legal Compliance', version: 'v2.0', updated: 'Dec 2025', status: 'Active', description: 'Internal Complaints Committee guidelines and zero-tolerance policy against workplace harassment.' },
  { id: 'p3', title: 'Construction Site Safety & EHS Norms', category: 'Health & Safety', version: 'v4.1', updated: 'Feb 2026', status: 'Active', description: 'PPE regulations, heavy machinery protocols, site fall protection, and accident reporting.' },
  { id: 'p4', title: 'Employee Travel & TA/DA Reimbursement Policy', category: 'Finance & HR', version: 'v2.4', updated: 'Jan 2026', status: 'Active', description: 'Mileage rates per km, daily food allowances, lodging caps, and expense reconciliation rules.' }
];

const INITIAL_BUSINESS_SETTINGS: BusinessProfileSettings = {
  logoUrl: '/logo.png',
  logoStatus: 'Added',
  businessName: 'VRM Structures India Private Limited',
  businessCode: 'VRM001',
  email: 'contact@vrmstructures.com',
  phone: '+91 44 2553 7890',
  type: 'Private Limited Company',
  address: 'VRM Towers, No. 42, Grand Northern Trunk Road, Madhavaram Industrial Corridor, Chennai, Tamil Nadu, 600060, India',
  gstin: '33AABCV1234F1Z8',
  pan: 'AABCV1234F',
  cin: 'U45200TN2018PTC123456',
  employeeCodeGeneration: 'Auto',
  employeeCodePrefix: 'EMP',
  employeeCodeSample: 'EMP-001',
  administrator: 'Velmurugan (Super Admin)',
  currency: 'INR - ₹ (India)',
  currencySymbol: '₹',
  currencyCode: 'INR',
  timeZone: 'Indian Standard Time (IST) (UTC+05:30)',
  category: 'Civil Infrastructure & Pre-Engineered Buildings',
  bankName: 'HDFC Bank Limited',
  bankAccountNo: '50200084729104',
  bankIfsc: 'HDFC0001234',
  bankBranch: 'Madhavaram Branch, Chennai',
  emailConfig: 'SMTP Configured (Office 365)',
  smtpHost: 'smtp.office365.com',
  smtpPort: '587',
  smtpUser: 'hr-noreply@vrmstructures.com',
  activeEntity: 'VRM Structures (Madhavaram HQ)'
};


const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'TSK-501',
    title: 'Q3 Accounts Audit Preparation',
    description: 'Compile tax withholding certificates and variance expense logs for annual auditor review.',
    assignedEmployeeId: 'EMP-007',
    assignedEmployeeName: 'Priya Natarajan',
    assignedBy: 'Pavithra',
    department: 'Accounts Head',
    priority: 'Urgent',
    dueDate: '2026-08-31',
    status: 'In Progress',
    createdAt: '2026-08-24'
  },
  {
    id: 'TSK-502',
    title: 'Shop Floor Safety Audit & Machine Checks',
    description: 'Perform safety review on assembly floor machines and ensure ISO standards compliance.',
    assignedEmployeeId: 'EMP-002',
    assignedEmployeeName: 'Ramesh Kumar',
    assignedBy: 'Pavithra',
    department: 'Production Head',
    priority: 'High',
    dueDate: '2026-09-05',
    status: 'In Progress',
    createdAt: '2026-08-26'
  },
  {
    id: 'TSK-503',
    title: 'Dispatch Logistics Route Optimization',
    description: 'Plan interstate shipping routes and dispatch scheduling for pending structural steel orders.',
    assignedEmployeeId: 'EMP-003',
    assignedEmployeeName: 'Suresh Patel',
    assignedBy: 'Pavithra',
    department: 'Dispatch Head',
    priority: 'Medium',
    dueDate: '2026-09-10',
    status: 'To Do',
    createdAt: '2026-08-28'
  }
];

const INITIAL_PERFORMANCE: PerformanceScore[] = [
  {
    id: 'PERF-01',
    employeeId: 'EMP-001',
    employeeName: 'Pavithra',
    department: 'Human Resources',
    designation: 'HR Manager',
    overallScore: 95,
    taskCompletionRate: 98,
    attendanceScore: 99,
    goalAchievement: 94,
    managerRating: 4.9,
    avatar: '',
    monthlyHistory: [
      { month: 'Apr', score: 92 }, { month: 'May', score: 94 }, { month: 'Jun', score: 93 },
      { month: 'Jul', score: 96 }, { month: 'Aug', score: 95 }
    ]
  },
  {
    id: 'PERF-02',
    employeeId: 'EMP-002',
    employeeName: 'Ramesh Kumar',
    department: 'Production Head',
    designation: 'Production Head',
    overallScore: 91,
    taskCompletionRate: 93,
    attendanceScore: 95,
    goalAchievement: 90,
    managerRating: 4.8,
    avatar: '',
    monthlyHistory: [
      { month: 'Apr', score: 87 }, { month: 'May', score: 89 }, { month: 'Jun', score: 88 },
      { month: 'Jul', score: 90 }, { month: 'Aug', score: 91 }
    ]
  }
];

const INITIAL_JOBS: JobOpening[] = [
  {
    id: 'JOB-01',
    title: 'Senior Production Engineer',
    department: 'Production Head',
    location: 'Chennai HQ (Onsite)',
    type: 'Full-Time',
    experience: '5+ Years',
    positions: 3,
    status: 'Active',
    postedDate: '2026-08-15',
    salaryRange: '₹8L - ₹12L',
    description: 'Looking for an experienced Production Engineer to supervise fabrication lines and shop floor quality.',
    applicantsCount: 18
  },
  {
    id: 'JOB-02',
    title: 'Senior Dispatch Coordinator',
    department: 'Dispatch Head',
    location: 'Chennai HQ',
    type: 'Full-Time',
    experience: '3+ Years',
    positions: 1,
    status: 'Active',
    postedDate: '2026-08-20',
    salaryRange: '₹5L - ₹7L',
    description: 'Coordinate freight transit, invoice reconciliations, and dispatch timing across India.',
    applicantsCount: 12
  }
];

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'CND-101',
    jobId: 'JOB-01',
    jobTitle: 'Senior Production Engineer',
    name: 'Manoj Selvan',
    email: 'manoj.s@gmail.com',
    phone: '+91 99988 77665',
    stage: 'Interview',
    appliedDate: '2026-08-18',
    referrerEmployeeId: 'EMP-005',
    referrerName: 'Murugan (Employee)',
    referralStatus: 'Accepted',
    referralReviewedBy: 'Pavithra (HR)',
    referralReviewedDate: '2026-08-20',
    rating: 5,
    notes: 'Strong knowledge of CNC machining, fabrication processes, and floor management.'
  },
  {
    id: 'CND-102',
    jobId: 'JOB-01',
    jobTitle: 'Production Technician',
    name: 'Karthik Raja',
    email: 'karthik.r@gmail.com',
    phone: '+91 98401 23456',
    stage: 'Applied',
    appliedDate: '2026-09-05',
    referrerEmployeeId: 'EMP-005',
    referrerName: 'Murugan (Employee)',
    referralStatus: 'Pending',
    rating: 5,
    notes: 'Experienced in CNC lathe operation and assembly floor.'
  }
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'EXP-801',
    employeeId: 'EMP-009',
    employeeName: 'Dinesh Kumar',
    department: 'Sales Executive',
    category: 'Travel',
    amount: 4500.00,
    date: '2026-08-26',
    description: 'Client visit to industrial site in Coimbatore',
    receiptUrl: '',
    status: 'Pending Finance',
    approvedBy: 'Pavithra'
  },
  {
    id: 'EXP-802',
    employeeId: 'EMP-002',
    employeeName: 'Ramesh Kumar',
    department: 'Production Head',
    category: 'Equipment',
    amount: 15000.00,
    date: '2026-08-20',
    description: 'Safety gear and tool kit calibration for production floor',
    receiptUrl: '',
    status: 'Reimbursed',
    approvedBy: 'Priya Natarajan'
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOT-01',
    title: 'Leave Approved',
    message: 'Priya Natarajan\'s Casual Leave for Aug 29-30 has been approved.',
    timestamp: '10 mins ago',
    priority: 'Normal',
    category: 'Leave',
    read: false
  },
  {
    id: 'NOT-02',
    title: 'Urgent Task Assigned',
    message: 'Shop Floor Safety Audit task has been assigned to you.',
    timestamp: '1 hour ago',
    priority: 'Urgent',
    category: 'Task',
    read: false
  },
  {
    id: 'NOT-03',
    title: 'Payroll Calculation Ready',
    message: 'August 2026 payroll batch calculation has been generated for review.',
    timestamp: '3 hours ago',
    priority: 'Important',
    category: 'Payroll',
    read: true
  }
];

const INITIAL_PAYROLL: PayrollRecord[] = [];

const INITIAL_DEPTS: DepartmentItem[] = [
  { id: 'DEP-HR', name: 'HR', code: 'HR', headName: 'Pavithra S', headId: 'EMP-001', employeeCount: 3, budget: 800000 },
  { id: 'DEP-SL', name: 'Sales', code: 'SL', headName: 'Rajesh Kannan', headId: 'EMP-008', employeeCount: 2, budget: 1200000 },
  { id: 'DEP-AC', name: 'Accounts', code: 'AC', headName: 'Priya Natarajan', headId: 'EMP-007', employeeCount: 2, budget: 600000 },
  { id: 'DEP-PR', name: 'Procurement', code: 'PR', headName: 'Karthik Rajan', headId: 'EMP-004', employeeCount: 3, budget: 750000 },
  { id: 'DEP-DP', name: 'Dispatch', code: 'DP', headName: 'Ramesh Kumar', headId: 'EMP-002', employeeCount: 2, budget: 650000 },
  { id: 'DEP-DS', name: 'Design', code: 'DS', headName: 'Swetha Sundar', headId: 'EMP-010', employeeCount: 2, budget: 900000 },
  { id: 'DEP-FN', name: 'Finance', code: 'FN', headName: 'Deepa Lakshmi', headId: 'EMP-012', employeeCount: 1, budget: 850000 },
  { id: 'DEP-TS', name: 'Technical Support', code: 'TS', headName: 'Arvind Babu', headId: 'EMP-013', employeeCount: 2, budget: 700000 }
];

const INITIAL_BRANCHES: BranchItem[] = [
  {
    id: 'BR-01',
    name: 'Chennai HQ',
    code: 'CHN',
    location: 'VRM Structures HQ, Chennai',
    departments: ['HR', 'Sales', 'Accounts', 'Procurement', 'Dispatch', 'Design', 'Finance', 'Technical Support']
  }
];

const INITIAL_DESIGNATIONS: DesignationItem[] = [
  { id: 'DSG-01', title: 'HR Manager', department: 'HR', level: 'L4 Lead' },
  { id: 'DSG-02', title: 'HR Executive', department: 'HR', level: 'L2 Executive' },
  { id: 'DSG-03', title: 'Sales Head', department: 'Sales', level: 'L5 Head' },
  { id: 'DSG-04', title: 'Sales Executive', department: 'Sales', level: 'L2 Executive' },
  { id: 'DSG-05', title: 'Accounts Head', department: 'Accounts', level: 'L5 Head' },
  { id: 'DSG-06', title: 'Senior Accountant', department: 'Accounts', level: 'L3 Senior' },
  { id: 'DSG-07', title: 'Procurement Head', department: 'Procurement', level: 'L5 Head' },
  { id: 'DSG-08', title: 'Purchase Executive', department: 'Procurement', level: 'L2 Executive' },
  { id: 'DSG-09', title: 'Vendor Coordinator', department: 'Procurement', level: 'L2 Executive' },
  { id: 'DSG-10', title: 'Dispatch Head', department: 'Dispatch', level: 'L5 Head' },
  { id: 'DSG-11', title: 'Logistics Coordinator', department: 'Dispatch', level: 'L3 Lead' },
  { id: 'DSG-12', title: 'Design Head', department: 'Design', level: 'L5 Head' },
  { id: 'DSG-13', title: 'Design Executive', department: 'Design', level: 'L2 Executive' },
  { id: 'DSG-14', title: 'Senior Structural Engineer', department: 'Design', level: 'L3 Senior' },
  { id: 'DSG-15', title: 'Finance Manager', department: 'Finance', level: 'L4 Lead' },
  { id: 'DSG-16', title: 'Technical Support Lead', department: 'Technical Support', level: 'L4 Lead' },
  { id: 'DSG-17', title: 'Support Engineer', department: 'Technical Support', level: 'L2 Engineer' },
  { id: 'DSG-18', title: 'CEO', department: 'HR', level: 'C-Level' }
];

const INITIAL_ASSETS: AssetItem[] = [
  {
    id: 'AST-101',
    assetTag: 'AST-LAP-001',
    name: 'MacBook Pro M3 Max 16"',
    category: 'Laptops & Computers',
    serialNumber: 'C02G1829MD6R',
    assignedEmployeeId: 'EMP-001',
    assignedEmployeeName: 'Pavithra',
    assignedDepartment: 'Human Resources',
    assignedDate: '2025-01-15',
    purchaseDate: '2024-12-10',
    purchaseCost: 2499,
    warrantyExpiry: '2027-12-10',
    status: 'Assigned',
    condition: 'New',
    notes: 'Primary HR Workstation'
  },
  {
    id: 'AST-102',
    assetTag: 'AST-LAP-002',
    name: 'Dell Precision Workstation i9 64GB',
    category: 'Laptops & Computers',
    serialNumber: 'DL-9918234-X',
    assignedEmployeeId: 'EMP-002',
    assignedEmployeeName: 'Ramesh Kumar',
    assignedDepartment: 'Production Head',
    assignedDate: '2025-02-01',
    purchaseDate: '2025-01-20',
    purchaseCost: 1999,
    warrantyExpiry: '2027-01-20',
    status: 'Assigned',
    condition: 'New',
    notes: 'Production Head Workstation'
  },
  {
    id: 'AST-103',
    assetTag: 'AST-MOB-001',
    name: 'Samsung Galaxy Enterprise Edition',
    category: 'Mobile Devices',
    serialNumber: 'DN6FP087V283',
    assignedEmployeeId: 'EMP-009',
    assignedEmployeeName: 'Dinesh Kumar',
    assignedDepartment: 'Sales Executive',
    assignedDate: '2025-03-10',
    purchaseDate: '2025-02-15',
    purchaseCost: 1199,
    warrantyExpiry: '2026-02-15',
    status: 'Assigned',
    condition: 'Good',
    notes: 'Field Sales Device'
  },
  {
    id: 'AST-104',
    assetTag: 'AST-MON-001',
    name: 'Dell UltraSharp 27" 4K USB-C Monitor',
    category: 'Monitors & Displays',
    serialNumber: 'CN-098231-716',
    assignedEmployeeId: undefined,
    assignedEmployeeName: undefined,
    assignedDepartment: undefined,
    assignedDate: undefined,
    purchaseDate: '2025-04-01',
    purchaseCost: 580,
    warrantyExpiry: '2028-04-01',
    status: 'Available',
    condition: 'New',
    notes: 'Ready for new engineering hire'
  },
  {
    id: 'AST-105',
    assetTag: 'AST-FUR-001',
    name: 'Herman Miller Aeron Ergonomic Chair',
    category: 'Office Furniture',
    serialNumber: 'HM-AERON-8812',
    assignedEmployeeId: 'EMP-007',
    assignedEmployeeName: 'Priya Natarajan',
    assignedDepartment: 'Accounts Head',
    assignedDate: '2025-01-10',
    purchaseDate: '2024-11-20',
    purchaseCost: 1250,
    warrantyExpiry: '2034-11-20',
    status: 'Assigned',
    condition: 'Good',
    notes: 'Accounts office workstation chair'
  },
  {
    id: 'AST-106',
    assetTag: 'AST-LAP-003',
    name: 'Lenovo ThinkPad X1 Carbon 16GB',
    category: 'Laptops & Computers',
    serialNumber: 'LNV-8871239-P',
    assignedEmployeeId: undefined,
    assignedEmployeeName: undefined,
    assignedDepartment: undefined,
    assignedDate: undefined,
    purchaseDate: '2024-06-15',
    purchaseCost: 1450,
    warrantyExpiry: '2026-06-15',
    status: 'Under Maintenance',
    condition: 'Needs Repair',
    notes: 'Battery replacement pending at service center'
  }
];

export const INITIAL_GRADES: GradeItem[] = [
  { id: 'g1', code: 'L1', title: 'Executive Leadership', description: 'Director, VP, General Manager', level: 1 },
  { id: 'g2', code: 'M2', title: 'Senior Project Management', description: 'Senior Project Manager, Chief Engineer', level: 2 },
  { id: 'g3', code: 'M1', title: 'Middle Management', description: 'Assistant Manager, Technical Lead', level: 3 },
  { id: 'g4', code: 'E2', title: 'Senior Technical Officer', description: 'Senior Engineer, QA/QC Specialist', level: 4 },
  { id: 'g5', code: 'E1', title: 'Entry Professional / Trainee', description: 'Site Engineer, Graduate Trainee', level: 5 }
];

export const INITIAL_EMPLOYMENT_TYPES: EmploymentTypeItem[] = [
  { id: 'et1', name: 'Full-Time Permanent', code: 'FT-PERM', status: 'Active' },
  { id: 'et2', name: 'Fixed Term Contract', code: 'FTC', status: 'Active' },
  { id: 'et3', name: 'Graduate Trainee / Apprentice', code: 'TRAINEE', status: 'Active' },
  { id: 'et4', name: 'Internship', code: 'INTERN', status: 'Active' },
  { id: 'et5', name: 'External Consultant', code: 'CONSULT', status: 'Active' }
];

export const INITIAL_EMPLOYEE_CATEGORIES: EmployeeCategoryItem[] = [
  { id: 'ec1', name: 'Corporate Management', code: 'CORP-MGT', status: 'Active' },
  { id: 'ec2', name: 'Engineering & Technical Staff', code: 'ENG-TECH', status: 'Active' },
  { id: 'ec3', name: 'Plant & Heavy Fabrication Crew', code: 'PLANT-OPS', status: 'Active' },
  { id: 'ec4', name: 'Site Construction Operations', code: 'SITE-OPS', status: 'Active' },
  { id: 'ec5', name: 'Support & Administration', code: 'SUPP-ADM', status: 'Active' }
];

export const INITIAL_EMPLOYEE_CONFIG: EmployeeConfigSettings = {
  idFormatPrefix: 'EMP',
  idFormatDigits: 3,
  idStartingNumber: 1,
  autoGenerateId: true,
  defaultProbationMonths: 6,
  defaultNoticeDays: 30,
  autoConfirmProbation: false,
  customFields: [
    { id: 'cf1', label: 'Blood Group', fieldName: 'bloodGroup', fieldType: 'select', category: 'Personal', required: false, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
    { id: 'cf2', label: 'Emergency Contact Person', fieldName: 'emergencyContactPerson', fieldType: 'text', category: 'Personal', required: true },
    { id: 'cf3', label: 'Safety Induction Date', fieldName: 'safetyInductionDate', fieldType: 'date', category: 'Job', required: false },
    { id: 'cf4', label: 'EPF UAN Number', fieldName: 'uanNumber', fieldType: 'text', category: 'Compliance', required: false },
    { id: 'cf5', label: 'Bank IFSC Code', fieldName: 'bankIfsc', fieldType: 'text', category: 'Payroll', required: true }
  ],
  documentTypes: [
    { id: 'dt1', name: 'Updated Resume / CV', code: 'RESUME', mandatory: true, maxSizeMb: 5, allowedFormats: ['PDF', 'DOCX'] },
    { id: 'dt2', name: 'Aadhaar / National ID Card', code: 'GOVT_ID', mandatory: true, maxSizeMb: 5, allowedFormats: ['PDF', 'JPG', 'PNG'] },
    { id: 'dt3', name: 'Income Tax PAN Card', code: 'PAN_CARD', mandatory: true, maxSizeMb: 5, allowedFormats: ['PDF', 'JPG', 'PNG'] },
    { id: 'dt4', name: 'Highest Degree / Marksheet', code: 'DEGREE', mandatory: true, maxSizeMb: 10, allowedFormats: ['PDF'] },
    { id: 'dt5', name: 'Previous Relieving / Experience Certificate', code: 'RELIEVING', mandatory: false, maxSizeMb: 5, allowedFormats: ['PDF'] }
  ]
};

export const INITIAL_APPROVAL_WORKFLOWS: ApprovalWorkflowItem[] = [
  {
    id: 'wf-leave',
    workflowName: 'Leave Approval Workflow',
    module: 'Leave',
    description: 'Reporting Manager review followed by HR verification and automated leave quota debit',
    levels: [
      { level: 1, role: 'Reporting Manager', title: 'Manager Recommendation', timeLimitHours: 24 },
      { level: 2, role: 'HR Admin', title: 'HR Policy Validation', timeLimitHours: 48 }
    ],
    active: true
  },
  {
    id: 'wf-reg',
    workflowName: 'Attendance Regularization',
    module: 'Attendance',
    description: 'Biometric missing punch and geofence override verification',
    levels: [
      { level: 1, role: 'Reporting Manager', title: 'Shift Supervisor Approval', timeLimitHours: 24 },
      { level: 2, role: 'HR Admin', title: 'Attendance Record Update', timeLimitHours: 48 }
    ],
    active: true
  },
  {
    id: 'wf-adv',
    workflowName: 'Advance Salary & Emergency Loan',
    module: 'Advance Salary',
    description: 'Two-tier verification: HR eligibility check followed by CEO disbursement authorization',
    levels: [
      { level: 1, role: 'HR Admin', title: 'Tenure & Basic Salary Eligibility Check', timeLimitHours: 24 },
      { level: 2, role: 'CEO / Super Admin', title: 'Financial Sanction & Payout Release', timeLimitHours: 48 }
    ],
    active: true
  },
  {
    id: 'wf-tada',
    workflowName: 'Travel & TA/DA Claim Workflow',
    module: 'TA/DA',
    description: 'Site project engineer outstation travel approval and accounts reimbursement',
    levels: [
      { level: 1, role: 'Project Manager', title: 'Trip Validation & Kilometers Check', timeLimitHours: 24 },
      { level: 2, role: 'Finance Manager', title: 'Accounts Audit & Disbursement', timeLimitHours: 48 }
    ],
    active: true
  },
  {
    id: 'wf-exp',
    workflowName: 'General Expense Reimbursement',
    module: 'Expense',
    description: 'Corporate and plant operational expense claims with tax invoice verification',
    levels: [
      { level: 1, role: 'Department Head', title: 'Department Budget Authorization', timeLimitHours: 24 },
      { level: 2, role: 'Finance Manager', title: 'Voucher Passed & Settlement', timeLimitHours: 48 }
    ],
    active: true
  },
  {
    id: 'wf-rec',
    workflowName: 'Job Requisition & Offer Approval',
    module: 'Recruitment',
    description: 'New hiring headcount sign-off and candidate offer compensation clearance',
    levels: [
      { level: 1, role: 'HR Manager', title: 'Candidate Profile & Compensation Fit', timeLimitHours: 48 },
      { level: 2, role: 'Super Admin', title: 'Executive Offer Sanction', timeLimitHours: 48 }
    ],
    active: true
  },
  {
    id: 'wf-ast',
    workflowName: 'Asset Allocation & Handover',
    module: 'Asset',
    description: 'IT and safety equipment issuance and return clearance',
    levels: [
      { level: 1, role: 'Store Keeper / IT Admin', title: 'Serial Number Verification', timeLimitHours: 12 },
      { level: 2, role: 'Department Manager', title: 'Allocation Acknowledgment', timeLimitHours: 24 }
    ],
    active: true
  }
];

export const INITIAL_NOTIFICATION_TRIGGERS: NotificationTriggerConfig[] = [
  { id: 'nt1', event: 'Employee Onboarded', module: 'Employee', email: true, sms: false, whatsapp: true, push: true, template: 'Welcome {{name}} to VRM! Your employee ID is {{employee_id}}.' },
  { id: 'nt2', event: 'Leave Application Submitted', module: 'Leave', email: true, sms: false, whatsapp: true, push: true, template: '{{name}} applied for {{days}} days of {{leave_type}}.' },
  { id: 'nt3', event: 'Leave Status Updated', module: 'Leave', email: true, sms: true, whatsapp: true, push: true, template: 'Your leave application for {{date}} has been {{status}}.' },
  { id: 'nt4', event: 'Late Attendance Recorded', module: 'Attendance', email: false, sms: false, whatsapp: true, push: true, template: 'Late punch recorded at {{time}} (Grace exceeded by {{minutes}}m).' },
  { id: 'nt5', event: 'Advance Salary Approved', module: 'Finance', email: true, sms: true, whatsapp: true, push: true, template: 'Your advance salary request of ₹{{amount}} has been approved by {{approver}}.' },
  { id: 'nt6', event: 'Monthly Payslip Disbursed', module: 'Payroll', email: true, sms: true, whatsapp: true, push: true, template: 'Your payslip for {{month}} {{year}} is ready for download.' },
  { id: 'nt7', event: 'Asset Assigned', module: 'Asset', email: true, sms: false, whatsapp: false, push: true, template: 'Asset {{asset_name}} (Tag: {{asset_tag}}) has been assigned to you.' }
];

export const INITIAL_GENERAL_SYSTEM_CONFIG: GeneralSystemConfig = {
  language: 'English (US / IN)',
  theme: 'Notion Slate Clean Light',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12 Hours (AM/PM)',
  currency: 'Indian Rupee (INR)',
  currencySymbol: '₹',
  tablePagination: 10,
  auditLogsEnabled: true
};

export const INITIAL_INTEGRATIONS_CONFIG: IntegrationsConfig = {
  biometricDevice: {
    enabled: true,
    provider: 'eSSL & ZKTeco Biometric SDK',
    ipAddress: '192.168.1.201',
    port: 4370,
    syncIntervalMins: 15,
    status: 'Connected'
  },
  mapsApi: {
    enabled: true,
    provider: 'Google Maps Telemetry API',
    apiKey: 'AIzaSyDemo-VRM-Maps-Key-Live2026'
  },
  emailSmtp: {
    enabled: true,
    host: 'smtp.sendgrid.net',
    port: 587,
    user: 'apikey',
    secure: true
  },
  smsGateway: {
    enabled: true,
    provider: 'Twilio SMS Cloud',
    senderId: 'VRMIND',
    apiKey: 'SK-TW-DEMO-882319-SMS'
  },
  whatsappApi: {
    enabled: true,
    provider: 'Meta WhatsApp Cloud Business API',
    phoneNumberId: '914425537890',
    apiKey: 'EAAQdemoTokenVRMWhatsAppCloud2026'
  },
  accountingSoftware: {
    enabled: true,
    software: 'Tally Prime XML Sync & Zoho Books',
    syncFormat: 'Tally XML / Zoho JSON',
    autoExportMonthly: true
  },
  webhooks: {
    enabled: true,
    endpointUrl: 'https://api.vrmstructures.com/webhooks/hrms-events',
    secretKey: 'whsec_vrm_live_secret_key_2026',
    subscribedEvents: ['employee.created', 'attendance.punched', 'leave.approved', 'payroll.processed']
  }
};

interface HRMSContextType {
  currentUser: User;
  updateCurrentUser: (updates: Partial<User>) => void;
  switchRole: (role: Role) => void;
  hasPermission: (module: ModuleName, action: PermissionAction) => boolean;
  permissionMatrix: PermissionMatrix;
  updatePermission: (role: Role, module: ModuleName, action: PermissionAction, enabled: boolean) => void;

  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, empData: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  attendanceRecords: AttendanceRecord[];
  markAttendance: (empId: string, status: AttendanceRecord['status'], method: AttendanceRecord['method'], location?: AttendanceRecord['location']) => void;
  attendanceAuditLogs: AttendanceAuditLog[];
  correctAttendanceRecord: (params: {
    attendanceId: string;
    status: AttendanceRecord['status'];
    checkIn?: string | null;
    checkOut?: string | null;
    breakDurationMinutes?: number;
    halfDayType?: 'First Half' | 'Second Half';
    absentReason?: 'Unauthorized Absence' | 'No Show' | 'Attendance Not Recorded' | 'Other';
    leaveType?: string;
    leaveDuration?: 'Full Day' | 'First Half' | 'Second Half';
    wfhReason?: string;
    wfhSource?: 'Approved WFH Request' | 'HR Assigned' | 'Manual';
    otHours?: number;
    approvedOtHours?: number;
    otStatus?: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
    otReason?: string;
    reason: string;
    changedBy: string;
  }) => { success: boolean; message: string };
  addManualAttendanceRecord: (entry: {
    employeeId: string;
    date: string;
    status: AttendanceRecord['status'];
    checkIn?: string | null;
    checkOut?: string | null;
    breakDurationMinutes?: number;
    workingHours?: number;
    halfDayType?: 'First Half' | 'Second Half';
    otHours?: number;
    reason: string;
    addedBy: string;
  }) => { success: boolean; message: string };

  // Enterprise Attendance & Overtime Module
  missedPunchRequests: MissedPunchRequest[];
  submitMissedPunchRequest: (req: Omit<MissedPunchRequest, 'id' | 'status' | 'submittedAt'>) => { success: boolean; message: string };
  approveMissedPunchRequest: (id: string, reviewedBy: string, remarks?: string) => void;
  rejectMissedPunchRequest: (id: string, reviewedBy: string, remarks?: string) => void;
  editAndApproveMissedPunchRequest: (id: string, adjustedCheckIn: string, adjustedCheckOut: string, reviewedBy: string, remarks?: string) => void;

  overtimeRequests: OvertimeRequest[];
  submitOtRequest: (req: Omit<OvertimeRequest, 'id' | 'status' | 'approvedOtHours' | 'submittedAt'>) => { success: boolean; message: string };
  approveOtRequest: (id: string, approvedHours: number, reviewedBy: string, remarks?: string, multiplier?: OvertimeRequest['multiplier']) => void;
  rejectOtRequest: (id: string, reviewedBy: string, remarks?: string) => void;
  editAndApproveOtRequest: (id: string, approvedHours: number, reviewedBy: string, remarks?: string, multiplier?: OvertimeRequest['multiplier']) => void;
  deleteOtRequest: (id: string) => void;
  addManualOtEntry: (entry: { employeeId: string; date: string; hours: number; hourlyRate: number; multiplier: OvertimeRequest['multiplier']; reason: string; addedBy: string }) => { success: boolean; message: string };

  departmentOtPolicies: DepartmentOtPolicy[];
  updateDepartmentOtPolicy: (id: string, policy: Partial<DepartmentOtPolicy>) => void;
  employeeOtPolicies: EmployeeOtPolicy[];
  updateEmployeeOtPolicy: (id: string, policy: Partial<EmployeeOtPolicy>) => void;
  overtimePolicy: OvertimePolicy;
  updateOvertimePolicy: (policy: Partial<OvertimePolicy>) => void;
  attendancePolicyConfig: AttendancePolicyConfig;
  updateAttendancePolicyConfig: (config: Partial<AttendancePolicyConfig>) => void;
  attendanceGlobalSettings: AttendanceGlobalSettings;
  updateAttendanceGlobalSettings: (settings: Partial<AttendanceGlobalSettings>) => void;
  recordEmployeePunch: (type: 'Check-In' | 'Check-Out', method?: AttendanceRecord['method']) => { success: boolean; message: string };

  faceLogs: FaceLog[];
  addFaceLog: (log: Omit<FaceLog, 'id'>) => void;

  leaveRequests: LeaveRequest[];
  applyLeave: (req: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => void;
  approveLeave: (id: string, approvedBy: string) => void;
  rejectLeave: (id: string, approvedBy: string, comment?: string) => void;

  shifts: Shift[];
  shiftRequests: ShiftRequest[];
  addShift: (shift: Omit<Shift, 'id' | 'assignedEmployeeCount'>) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  requestShiftChange: (req: Omit<ShiftRequest, 'id' | 'status'>) => void;
  approveShiftRequest: (id: string, approvedBy: string) => void;

  tasks: TaskItem[];
  addTask: (tsk: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (id: string, status: TaskItem['status']) => void;
  deleteTask: (id: string) => void;

  // Enhanced Enterprise Task Management
  enhancedTasks: TaskItemEnhanced[];
  createEnhancedTask: (task: Omit<TaskItemEnhanced, 'id' | 'taskNumber' | 'overallProgress' | 'overallStatus' | 'updates' | 'comments' | 'attachments' | 'timeline' | 'auditLogs' | 'createdAt' | 'updatedAt'> & Partial<Pick<TaskItemEnhanced, 'assignees' | 'attachments'>>) => TaskItemEnhanced;
  updateAssigneeProgress: (taskId: string, assigneeId: string, progressPercentage: number, individualStatus: TaskAssigneeStatus, latestRemark?: string, completionEvidence?: TaskCompletionEvidence) => void;
  closeTask: (taskId: string, closedBy: string, closureRemarks?: string) => void;
  reopenTask: (taskId: string, reopenedBy: string, reopenReason: string) => void;
  addTaskComment: (taskId: string, content: string, attachments?: string[]) => void;
  addTaskAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id' | 'taskId' | 'uploadedAt'>) => void;
  convertMOMActionToTask: (momId: string, actionItemId: string) => TaskItemEnhanced | null;
  syncMOMTask: (taskId: string) => void;
  deleteEnhancedTask: (taskId: string) => void;

  taskMasters: TaskMasterItem[];
  addTaskMaster: (item: Omit<TaskMasterItem, 'id'>) => void;
  updateTaskMaster: (id: string, updates: Partial<TaskMasterItem>) => void;
  deleteTaskMaster: (id: string) => void;

  momMeetings: MOMMeeting[];
  addMOMMeeting: (meeting: Omit<MOMMeeting, 'id' | 'meetingNumber'>) => void;

  escalationRules: TaskEscalationRule[];
  updateEscalationRule: (id: string, updates: Partial<TaskEscalationRule>) => void;

  taskWeights: TaskPerformanceWeights;
  updateTaskWeights: (weights: Partial<TaskPerformanceWeights>) => void;

  performanceScores: PerformanceScore[];

  jobOpenings: JobOpening[];
  candidates: Candidate[];
  addJobOpening: (job: Omit<JobOpening, 'id' | 'postedDate' | 'applicantsCount'>) => void;
  updateCandidateStage: (candidateId: string, newStage: Candidate['stage']) => void;
  referCandidate: (cand: Omit<Candidate, 'id' | 'stage' | 'appliedDate'>) => void;
  reviewReferral: (candidateId: string, status: 'Accepted' | 'Rejected', reviewerName: string, notes?: string, newStage?: Candidate['stage']) => void;

  expenses: Expense[];
  addExpense: (exp: Omit<Expense, 'id' | 'status'>) => void;
  approveExpense: (id: string, approvedBy: string, nextStatus: Expense['status']) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (note: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  payrollRecords: PayrollRecord[];
  processPayrollBatch: () => void | Promise<void>;

  departments: DepartmentItem[];
  addDepartment: (dept: Omit<DepartmentItem, 'id' | 'employeeCount'>) => void;
  updateDepartment: (id: string, updates: Partial<DepartmentItem>) => void;
  deleteDepartment: (id: string) => { success: boolean; message?: string };

  designations: DesignationItem[];
  addDesignation: (desig: Omit<DesignationItem, 'id'>) => void;
  updateDesignation: (id: string, updates: Partial<DesignationItem>) => void;
  deleteDesignation: (id: string) => { success: boolean; message?: string };

  canDeleteEmployee: (idOrEmpId: string) => { canDelete: boolean; reason?: string };
  canDeleteDepartment: (idOrName: string) => { canDelete: boolean; reason?: string };
  canDeleteBranch: (idOrName: string) => { canDelete: boolean; reason?: string };
  canDeleteShift: (idOrName: string) => { canDelete: boolean; reason?: string };
  canDeleteDesignation: (idOrTitle: string) => { canDelete: boolean; reason?: string };

  branches: BranchItem[];
  addBranch: (branch: Omit<BranchItem, 'id'>) => void;
  updateBranch: (id: string, branch: Partial<BranchItem>) => void;
  deleteBranch: (id: string) => void;
  addDepartmentToBranch: (branchId: string, departmentName: string) => void;
  removeDepartmentFromBranch: (branchId: string, departmentName: string) => void;

  assets: AssetItem[];
  addAsset: (asset: Omit<AssetItem, 'id'>) => void;
  assignAsset: (assetId: string, employeeId: string, employeeName: string, department: string) => void;
  deleteAsset: (assetId: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeModule: ModuleName;
  setActiveModule: (mod: ModuleName) => void;
  activeSettingsTab: SettingsSubTab;
  setActiveSettingsTab: (tab: SettingsSubTab) => void;

  workflowFormat: ApprovalWorkflowFormat;
  setWorkflowFormat: (format: ApprovalWorkflowFormat) => void;

  geofenceConfig: GeofenceConfig;
  updateGeofenceConfig: (config: Partial<GeofenceConfig>) => void;
  isGeofenceAdmin: boolean;

  // Enterprise Policies & Configurations
  leavePolicies: LeavePolicyItem[];
  addLeavePolicy: (policy: Omit<LeavePolicyItem, 'id'>) => void;
  updateLeavePolicy: (id: string, updates: Partial<LeavePolicyItem>) => void;
  deleteLeavePolicy: (id: string) => void;

  holidayPolicies: HolidayItem[];
  addHolidayPolicy: (holiday: Omit<HolidayItem, 'id'>) => void;
  updateHolidayPolicy: (id: string, updates: Partial<HolidayItem>) => void;
  deleteHolidayPolicy: (id: string) => void;

  attendancePolicies: AttendancePolicyItem[];
  addAttendancePolicy: (policy: Omit<AttendancePolicyItem, 'id'>) => void;
  updateAttendancePolicy: (id: string, updates: Partial<AttendancePolicyItem>) => void;
  deleteAttendancePolicy: (id: string) => void;

  weeklySchedules: WeeklyScheduleItem[];
  addWeeklySchedule: (schedule: Omit<WeeklyScheduleItem, 'id'>) => void;
  updateWeeklySchedule: (id: string, updates: Partial<WeeklyScheduleItem>) => void;
  deleteWeeklySchedule: (id: string) => void;

  attendanceConfig: GlobalAttendanceConfig;
  updateAttendanceConfig: (config: Partial<GlobalAttendanceConfig>) => void;

  policyDocuments: PolicyDocumentItem[];
  addPolicyDocument: (doc: Omit<PolicyDocumentItem, 'id'>) => void;
  updatePolicyDocument: (id: string, updates: Partial<PolicyDocumentItem>) => void;
  deletePolicyDocument: (id: string) => void;

  businessSettings: BusinessProfileSettings;
  updateBusinessSettings: (settings: Partial<BusinessProfileSettings>) => void;

  // Organization Masters
  grades: GradeItem[];
  addGrade: (grade: Omit<GradeItem, 'id'>) => void;
  updateGrade: (id: string, updates: Partial<GradeItem>) => void;
  deleteGrade: (id: string) => { success: boolean; message?: string };

  employmentTypes: EmploymentTypeItem[];
  addEmploymentType: (type: Omit<EmploymentTypeItem, 'id'>) => void;
  updateEmploymentType: (id: string, updates: Partial<EmploymentTypeItem>) => void;
  deleteEmploymentType: (id: string) => void;

  employeeCategories: EmployeeCategoryItem[];
  addEmployeeCategory: (cat: Omit<EmployeeCategoryItem, 'id'>) => void;
  updateEmployeeCategory: (id: string, updates: Partial<EmployeeCategoryItem>) => void;
  deleteEmployeeCategory: (id: string) => void;

  // Employee Configuration
  employeeConfig: EmployeeConfigSettings;
  updateEmployeeConfig: (config: Partial<EmployeeConfigSettings>) => void;

  // Workflows
  approvalWorkflows: ApprovalWorkflowItem[];
  addApprovalWorkflow: (wf: Omit<ApprovalWorkflowItem, 'id'>) => void;
  updateApprovalWorkflow: (id: string, updates: Partial<ApprovalWorkflowItem>) => void;
  deleteApprovalWorkflow: (id: string) => void;

  // Notifications
  notificationTriggers: NotificationTriggerConfig[];
  updateNotificationTrigger: (id: string, updates: Partial<NotificationTriggerConfig>) => void;

  // General & System Settings
  generalSystemConfig: GeneralSystemConfig;
  updateGeneralSystemConfig: (config: Partial<GeneralSystemConfig>) => void;

  // Integrations
  integrationsConfig: IntegrationsConfig;
  updateIntegrationsConfig: (config: Partial<IntegrationsConfig>) => void;

  // 5 New Core Enterprise Settings & Dynamic Policy Engine
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;

  companyBranches: CompanyBranch[];
  addCompanyBranch: (branch: Omit<CompanyBranch, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompanyBranch: (id: string, updates: Partial<CompanyBranch>) => void;
  deleteCompanyBranch: (id: string) => void;

  orgStructure: OrganizationStructure;
  updateOrgStructure: (structure: Partial<OrganizationStructure>) => void;

  masterAttendancePolicies: AttendancePolicy[];
  addMasterAttendancePolicy: (policy: Omit<AttendancePolicy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'>) => void;
  updateMasterAttendancePolicy: (id: string, updates: Partial<AttendancePolicy>) => void;
  archiveMasterAttendancePolicy: (id: string) => void;
  toggleMasterAttendancePolicyStatus: (id: string) => void;

  attendanceCorrections: AttendanceCorrectionRequest[];
  submitAttendanceCorrection: (req: Omit<AttendanceCorrectionRequest, 'id' | 'submittedAt' | 'status'>) => void;
  reviewAttendanceCorrection: (id: string, decision: 'Approved' | 'Rejected', comment?: string, adjustedTime?: { checkIn?: string; checkOut?: string }) => void;

  masterLeavePolicies: MasterLeavePolicy[];
  addMasterLeavePolicy: (policy: Omit<MasterLeavePolicy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'>) => void;
  updateMasterLeavePolicy: (id: string, updates: Partial<MasterLeavePolicy>) => void;
  archiveMasterLeavePolicy: (id: string) => void;
  toggleMasterLeavePolicyStatus: (id: string) => void;

  // Sandwich Leave Policy Engine
  sandwichPolicies: SandwichLeavePolicy[];
  sandwichAuditLogs: SandwichAuditLog[];
  createSandwichPolicy: (policy: Omit<SandwichLeavePolicy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'>) => void;
  updateSandwichPolicy: (id: string, updates: Partial<SandwichLeavePolicy>, reason?: string) => void;
  archiveSandwichPolicy: (id: string) => void;
  toggleSandwichPolicyStatus: (id: string) => void;
  deleteSandwichPolicy: (id: string) => void;
  overrideSandwichCalculation: (leaveRequestId: string, overrideData: {
    excludedDates?: string[];
    includedDates?: string[];
    adjustedPayType?: SandwichPayType;
    adjustedDaysCount?: number;
    internalReason: string;
  }) => void;
  computeSandwichCalculation: (params: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
  }) => SandwichCalculationResult;
  addSandwichAuditLog: (log: Omit<SandwichAuditLog, 'id' | 'timestamp' | 'user' | 'userRole'>) => void;

  payrollSettingsConfig: PayrollSettingsConfig;
  updatePayrollSettingsConfig: (config: Partial<PayrollSettingsConfig>) => void;
  toggleSalaryComponent: (code: string) => void;

  rewardPolicies: RewardPolicy[];
  addRewardPolicy: (policy: Omit<RewardPolicy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'>) => void;
  updateRewardPolicy: (id: string, updates: Partial<RewardPolicy>) => void;
  archiveRewardPolicy: (id: string) => void;
  toggleRewardPolicyStatus: (id: string) => void;

  employeeRewardRecords: EmployeeRewardRecord[];
  grantRewardToEmployee: (grant: Omit<EmployeeRewardRecord, 'id' | 'grantedDate' | 'payrollStatus'>) => void;

  policyAuditLogs: PolicyAuditLog[];
  addPolicyAuditLog: (log: Omit<PolicyAuditLog, 'id' | 'timestamp'>) => void;

  // Advance Salary / Loan Policy & Management
  loanPolicies: LoanPolicy[];
  activeLoanPolicy: LoanPolicy | undefined;
  createLoanPolicy: (policy: Omit<LoanPolicy, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => void;
  updateLoanPolicy: (id: string, updates: Partial<LoanPolicy>) => void;
  deleteLoanPolicy: (id: string) => void;

  loanRecords: LoanRecord[];
  submitLoanRequest: (request: Omit<LoanRecord, 'id' | 'requestedDate' | 'status' | 'outstandingBalance' | 'repaymentSchedule' | 'auditLogs'>) => { success: boolean; message: string; loanId?: string };
  reviewLoanRequest: (id: string, options: {
    action: 'Approve' | 'Reject';
    approvedAmount?: number;
    approvedMonths?: number;
    monthlyDeduction?: number;
    deductionStartMonth?: string;
    internalHrNotes?: string;
    employeeVisibleNotes?: string;
    rejectionReason?: string;
  }) => void;
  disburseLoan: (id: string, details: {
    disbursedDate: string;
    disbursedAmount: number;
    paymentMode: 'NEFT' | 'IMPS' | 'Cheque' | 'Cash';
    transactionRef?: string;
    notes?: string;
  }) => void;
  recordManualRepayment: (id: string, repayment: {
    amount: number;
    repaymentDate: string;
    paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI' | 'NEFT' | 'Other';
    referenceNumber?: string;
    notes?: string;
  }) => void;
  calculateEmployeeLoanEligibility: (employeeId: string, policyId?: string) => {
    isEligible: boolean;
    ineligibleReason?: string;
    employmentDurationMonths: number;
    monthlySalary: number;
    maxEligibleAmount: number;
    activeLoansCount: number;
    currentOutstanding: number;
    policy: LoanPolicy;
  };
}

const HRMSContext = createContext<HRMSContextType | undefined>(undefined);

export const HRMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('vrm_hrms_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error reading current user from storage', e);
      }
    }
    return {
      id: 'USR-001',
      name: 'Velmurugan',
      email: 'ceo@vrmstructures.com',
      role: 'Super Admin',
      avatar: '',
      department: 'Management',
      designation: 'CEO',
      employeeId: 'EMP-000'
    };
  });

  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('vrm_hrms_current_user', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving current user to storage', e);
      }
      return updated;
    });
  };

  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(DEFAULT_PERMISSIONS);
  const [activeModule, setActiveModule] = useState<ModuleName>('dashboard');
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsSubTab>('company_details');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [workflowFormat, setWorkflowFormat] = useState<ApprovalWorkflowFormat>('HR_ONLY');

  const [geofenceConfig, setGeofenceConfig] = useState<GeofenceConfig>(INITIAL_GEOFENCE_CONFIG);

  const updateGeofenceConfig = (config: Partial<GeofenceConfig>) => {
    setGeofenceConfig(prev => ({ ...prev, ...config }));
  };

  const isGeofenceAdmin = true; // Fully unlocked for all roles

  const sanitizeAvatar = (url?: string) => {
    if (!url) return '';
    if (url.includes('unsplash.com')) return '';
    return url;
  };

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [attendanceAuditLogs, setAttendanceAuditLogs] = useState<AttendanceAuditLog[]>(INITIAL_ATTENDANCE_AUDIT_LOGS);

  const correctAttendanceRecord = (params: {
    attendanceId: string;
    status: AttendanceRecord['status'];
    checkIn?: string | null;
    checkOut?: string | null;
    breakDurationMinutes?: number;
    halfDayType?: 'First Half' | 'Second Half';
    absentReason?: 'Unauthorized Absence' | 'No Show' | 'Attendance Not Recorded' | 'Other';
    leaveType?: string;
    leaveDuration?: 'Full Day' | 'First Half' | 'Second Half';
    wfhReason?: string;
    wfhSource?: 'Approved WFH Request' | 'HR Assigned' | 'Manual';
    otHours?: number;
    approvedOtHours?: number;
    otStatus?: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
    otReason?: string;
    reason: string;
    changedBy: string;
  }): { success: boolean; message: string } => {
    if (!params.reason || !params.reason.trim()) {
      return { success: false, message: 'Reason is required for manual attendance correction.' };
    }

    const existingRec = attendanceRecords.find(r => r.id === params.attendanceId);
    if (!existingRec) {
      return { success: false, message: 'Attendance record not found.' };
    }

    // Calculate working hours & OT
    let computedWorkingHours = existingRec.workingHours;
    const breakMins = params.breakDurationMinutes ?? existingRec.breakDurationMinutes ?? 0;

    if (params.status === 'Absent' || params.status === 'Holiday' || params.status === 'Week Off') {
      computedWorkingHours = 0;
    } else if (params.status === 'Half Day') {
      computedWorkingHours = 4.0;
    } else if (params.status === 'On Leave' || (params.status as string) === 'Leave') {
      computedWorkingHours = (params.leaveDuration === 'First Half' || params.leaveDuration === 'Second Half') ? 4.0 : 0;
    } else if (params.checkIn && params.checkOut) {
      const parseTime = (timeStr: string) => {
        if (!timeStr) return null;
        const clean = timeStr.trim();
        let hours = 0;
        let mins = 0;
        if (clean.includes('AM') || clean.includes('PM')) {
          const [timePart, ampm] = clean.split(' ');
          const [h, m] = timePart.split(':').map(Number);
          hours = ampm.toUpperCase() === 'PM' && h < 12 ? h + 12 : (ampm.toUpperCase() === 'AM' && h === 12 ? 0 : h);
          mins = m || 0;
        } else {
          const [h, m] = clean.split(':').map(Number);
          hours = h || 0;
          mins = m || 0;
        }
        return hours * 60 + mins;
      };

      const inMins = parseTime(params.checkIn);
      const outMins = parseTime(params.checkOut);
      if (inMins !== null && outMins !== null) {
        if (outMins < inMins) {
          return { success: false, message: 'Check-out time cannot be earlier than check-in time.' };
        }
        const netMinutes = Math.max(0, outMins - inMins - breakMins);
        computedWorkingHours = Math.round((netMinutes / 60) * 10) / 10;
      }
    }

    const calculatedOtHours = computedWorkingHours > 8.0 ? Math.round((computedWorkingHours - 8.0) * 10) / 10 : 0;
    const finalOtStatus = params.otStatus ?? existingRec.otStatus ?? 'Pending';
    const approvedOt = params.approvedOtHours !== undefined
      ? params.approvedOtHours
      : (finalOtStatus === 'Approved' || finalOtStatus === 'Paid' ? (params.otHours ?? calculatedOtHours) : 0);

    const updatedRecord: AttendanceRecord = {
      ...existingRec,
      status: params.status,
      checkIn: params.status === 'Absent' ? null : (params.checkIn !== undefined ? params.checkIn : existingRec.checkIn),
      checkOut: params.status === 'Absent' ? null : (params.checkOut !== undefined ? params.checkOut : existingRec.checkOut),
      workingHours: computedWorkingHours,
      breakDurationMinutes: breakMins,
      halfDayType: params.halfDayType,
      absentReason: params.absentReason,
      leaveType: params.leaveType,
      leaveDuration: params.leaveDuration,
      wfhReason: params.wfhReason,
      wfhSource: params.wfhSource,
      otHours: params.otHours ?? calculatedOtHours,
      calculatedOtHours,
      approvedOtHours: approvedOt,
      otStatus: finalOtStatus,
      otReason: params.otReason,
      reason: params.reason
    };

    setAttendanceRecords(prev => prev.map(r => r.id === params.attendanceId ? updatedRecord : r));

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const oldSummary = `Status: ${existingRec.status}, CheckIn: ${existingRec.checkIn || 'None'}, CheckOut: ${existingRec.checkOut || 'None'}, Hours: ${existingRec.workingHours}`;
    const newSummary = `Status: ${updatedRecord.status}, CheckIn: ${updatedRecord.checkIn || 'None'}, CheckOut: ${updatedRecord.checkOut || 'None'}, Hours: ${updatedRecord.workingHours}`;

    const newAuditLog: AttendanceAuditLog = {
      id: `AUD-${Date.now()}`,
      attendanceId: params.attendanceId,
      employeeId: existingRec.employeeId,
      employeeName: existingRec.employeeName,
      date: existingRec.date,
      fieldChanged: `Attendance Status / Punch Adjustment (${existingRec.status} -> ${updatedRecord.status})`,
      oldValue: oldSummary,
      newValue: newSummary,
      reason: params.reason,
      changedBy: params.changedBy,
      timestamp: `${dateStr} ${timeStr}`
    };

    setAttendanceAuditLogs(prev => [newAuditLog, ...prev]);

    setPayrollRecords(prev => prev.map(p => {
      if (p.employeeId === existingRec.employeeId) {
        const isAbsent = updatedRecord.status === 'Absent';
        const isHalfDay = updatedRecord.status === 'Half Day';
        return {
          ...p,
          overtimeHours: (p.overtimeHours || 0) + approvedOt,
          lopDays: isAbsent ? (p.lopDays || 0) + 1 : (isHalfDay ? (p.lopDays || 0) + 0.5 : p.lopDays)
        };
      }
      return p;
    }));

    addNotification({
      title: 'Attendance Corrected',
      message: `Attendance for ${existingRec.employeeName} on ${existingRec.date} was updated by ${params.changedBy}. Reason: ${params.reason}`,
      priority: 'Normal',
      category: 'Attendance'
    });

    return { success: true, message: 'Attendance record updated and audit log created successfully.' };
  };

  // Enterprise Attendance, Shifts & Overtime Policy State
  const [missedPunchRequests, setMissedPunchRequests] = useState<MissedPunchRequest[]>(INITIAL_MISSED_PUNCH_REQUESTS);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(INITIAL_OVERTIME_REQUESTS);
  const [departmentOtPolicies, setDepartmentOtPolicies] = useState<DepartmentOtPolicy[]>(INITIAL_DEPARTMENT_OT_POLICIES);
  const [employeeOtPolicies, setEmployeeOtPolicies] = useState<EmployeeOtPolicy[]>(INITIAL_EMPLOYEE_OT_POLICIES);
  const [attendanceGlobalSettings, setAttendanceGlobalSettings] = useState<AttendanceGlobalSettings>(INITIAL_ATTENDANCE_GLOBAL_SETTINGS);
  const [overtimePolicy, setOvertimePolicy] = useState<OvertimePolicy>(INITIAL_OVERTIME_POLICY);
  const [attendancePolicyConfig, setAttendancePolicyConfig] = useState<AttendancePolicyConfig>(INITIAL_ATTENDANCE_POLICY_CONFIG);

  const updateOvertimePolicy = (policyUpdates: Partial<OvertimePolicy>) => {
    setOvertimePolicy(prev => ({ ...prev, ...policyUpdates }));
    addNotification({
      title: 'Overtime Policy Updated',
      message: 'Overtime calculation method, multipliers, or limits updated.',
      priority: 'Normal',
      category: 'Attendance'
    });
  };

  const updateAttendancePolicyConfig = (configUpdates: Partial<AttendancePolicyConfig>) => {
    setAttendancePolicyConfig(prev => ({ ...prev, ...configUpdates }));
    addNotification({
      title: 'Attendance Policy Updated',
      message: 'Half-day, absent, and late coming rules updated successfully.',
      priority: 'Normal',
      category: 'Attendance'
    });
  };

  const recordEmployeePunch = (
    type: 'Check-In' | 'Check-Out',
    method: AttendanceRecord['method'] = 'Manual Punch'
  ): { success: boolean; message: string } => {
    const empId = currentUser.employeeId || currentUser.id || 'EMP-001';
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    const ampm = nowHours >= 12 ? 'PM' : 'AM';
    const displayHours = nowHours % 12 || 12;
    const nowTimeStr = `${String(displayHours).padStart(2, '0')}:${String(nowMinutes).padStart(2, '0')} ${ampm}`;

    const defaultShift: ShiftModel = {
      id: 'SH-01',
      shiftName: 'General Morning Shift',
      shiftCode: 'GEN-01',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      requiredWorkingHours: 9.0,
      breakDurationMinutes: 60,
      gracePeriodMinutes: 10,
      lateThresholdMinutes: 15,
      earlyCheckoutThresholdMinutes: 10,
      otStartsAfter: 'After required working hours completed',
      maximumDailyOtHours: 4.0
    };

    const targetShift = shifts.find(s => s.assignments?.some(a => a.employeeId === empId)) || defaultShift;
    const shiftModel: ShiftModel = {
      id: targetShift.id,
      shiftName: targetShift.shiftName,
      shiftCode: (targetShift as any).shiftCode || 'GEN-01',
      startTime: targetShift.startTime || '09:00 AM',
      endTime: targetShift.endTime || '06:00 PM',
      requiredWorkingHours: ('requiredWorkingHours' in targetShift ? (targetShift as any).requiredWorkingHours : (targetShift as any).workingHours) || 9.0,
      breakDurationMinutes: ('breakDurationMinutes' in targetShift ? (targetShift as any).breakDurationMinutes : (targetShift as any).breakDurationMins) || 60,
      gracePeriodMinutes: ('gracePeriodMinutes' in targetShift ? (targetShift as any).gracePeriodMinutes : (targetShift as any).gracePeriodMins) || 10,
      lateThresholdMinutes: 15,
      earlyCheckoutThresholdMinutes: 10,
      otStartsAfter: 'After required working hours completed',
      maximumDailyOtHours: 4.0
    };

    const otElig = resolveEmployeeOtEligibility(
      empId,
      currentUser.department || 'Engineering',
      departmentOtPolicies,
      employeeOtPolicies
    );

    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(a => a.employeeId === empId && a.date === todayStr);
      if (existingIdx !== -1) {
        const existing = prev[existingIdx];
        const newCheckIn = type === 'Check-In' ? nowTimeStr : (existing.checkIn || nowTimeStr);
        const newCheckOut = type === 'Check-Out' ? nowTimeStr : existing.checkOut;

        const calc = calculateAttendanceHoursAndStatus({
          checkIn: newCheckIn,
          checkOut: newCheckOut,
          shift: shiftModel,
          otPolicy: overtimePolicy,
          attendancePolicy: attendancePolicyConfig,
          isOtEligible: otElig.isEligible
        });

        const updated: AttendanceRecord = {
          ...existing,
          checkIn: newCheckIn,
          checkOut: newCheckOut,
          workingHours: calc.workedHours,
          status: calc.status,
          lateStatus: calc.lateStatus,
          lateDurationMinutes: calc.lateMinutes,
          earlyCheckoutMinutes: calc.earlyCheckoutMinutes,
          calculatedOtHours: calc.potentialOtHours,
          method
        };

        const copy = [...prev];
        copy[existingIdx] = updated;
        return copy;
      } else {
        const newCheckIn = type === 'Check-In' ? nowTimeStr : null;
        const newCheckOut = type === 'Check-Out' ? nowTimeStr : null;

        const calc = calculateAttendanceHoursAndStatus({
          checkIn: newCheckIn,
          checkOut: newCheckOut,
          shift: shiftModel,
          otPolicy: overtimePolicy,
          attendancePolicy: attendancePolicyConfig,
          isOtEligible: otElig.isEligible
        });

        const newRec: AttendanceRecord = {
          id: `ATT-${Date.now()}`,
          employeeId: empId,
          employeeName: currentUser.name,
          department: currentUser.department || 'Engineering',
          date: todayStr,
          checkIn: newCheckIn,
          checkOut: newCheckOut,
          workingHours: calc.workedHours,
          status: calc.status,
          lateStatus: calc.lateStatus,
          lateDurationMinutes: calc.lateMinutes,
          earlyCheckoutMinutes: calc.earlyCheckoutMinutes,
          calculatedOtHours: calc.potentialOtHours,
          shiftName: shiftModel.shiftName,
          method
        };

        return [newRec, ...prev];
      }
    });

    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAttendanceAuditLogs(prev => [
      {
        id: `AUD-${Date.now()}`,
        attendanceId: `ATT-${empId}-${todayStr}`,
        employeeId: empId,
        employeeName: currentUser.name,
        date: todayStr,
        fieldChanged: type === 'Check-In' ? 'Check-In Time' : 'Check-Out Time',
        oldValue: 'None',
        newValue: nowTimeStr,
        reason: `${type} punched via Employee Portal (${method})`,
        changedBy: currentUser.name,
        timestamp: nowIso
      },
      ...prev
    ]);

    addNotification({
      title: `${type} Recorded`,
      message: `Successfully logged ${type.toLowerCase()} at ${nowTimeStr}.`,
      priority: 'Normal',
      category: 'Attendance'
    });

    return {
      success: true,
      message: `${type} recorded successfully at ${nowTimeStr}`
    };
  };

  const submitMissedPunchRequest = (req: Omit<MissedPunchRequest, 'id' | 'status' | 'submittedAt'>): { success: boolean; message: string } => {
    if (!req.reason || !req.reason.trim()) {
      return { success: false, message: 'Reason is required for attendance correction request.' };
    }
    const newReq: MissedPunchRequest = {
      ...req,
      id: `MPR-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      submittedAt: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    };
    setMissedPunchRequests(prev => [newReq, ...prev]);
    addNotification({
      title: 'Correction Request Submitted',
      message: `${req.employeeName} submitted a ${req.requestType} request for ${req.date}.`,
      priority: 'Normal',
      category: 'Attendance'
    });
    return { success: true, message: 'Attendance correction request submitted successfully.' };
  };

  const approveMissedPunchRequest = (id: string, reviewedBy: string, remarks?: string) => {
    const target = missedPunchRequests.find(r => r.id === id);
    if (!target) return;

    const nowStr = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const targetCheckIn = target.requestedCheckIn || '09:00 AM';
    const targetCheckOut = target.requestedCheckOut || '06:00 PM';

    setMissedPunchRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'Approved',
      reviewedBy,
      reviewedAt: nowStr,
      hrRemarks: remarks || 'Approved by HR/CEO',
      adjustedCheckIn: targetCheckIn,
      adjustedCheckOut: targetCheckOut
    } : r));

    const assignedShift = shifts.find(s => s.assignments?.some(a => a.employeeId === target.employeeId));
    const shiftModel: ShiftModel = {
      id: assignedShift?.id || 'SH-01',
      shiftName: assignedShift?.shiftName || 'General (09:00 - 18:00)',
      shiftCode: (assignedShift as any)?.shiftCode || 'GEN-01',
      startTime: assignedShift?.startTime || '09:00 AM',
      endTime: assignedShift?.endTime || '06:00 PM',
      requiredWorkingHours: assignedShift?.workingHours || 9.0,
      breakDurationMinutes: assignedShift?.breakDurationMins || 60,
      gracePeriodMinutes: assignedShift?.gracePeriodMins || 10,
      lateThresholdMinutes: 15,
      earlyCheckoutThresholdMinutes: 10,
      otStartsAfter: 'After required working hours completed',
      maximumDailyOtHours: 4.0
    };

    const otEligibility = resolveEmployeeOtEligibility(
      target.employeeId,
      target.department,
      departmentOtPolicies,
      employeeOtPolicies
    );

    const calc = calculateAttendanceHoursAndStatus({
      checkIn: targetCheckIn,
      checkOut: targetCheckOut,
      shift: shiftModel,
      otPolicy: overtimePolicy,
      attendancePolicy: attendancePolicyConfig,
      isOtEligible: otEligibility.isEligible
    });

    setAttendanceRecords(prev => {
      const idx = prev.findIndex(a => a.employeeId === target.employeeId && a.date === target.date);
      if (idx !== -1) {
        const existing = prev[idx];
        const updated: AttendanceRecord = {
          ...existing,
          checkIn: targetCheckIn,
          checkOut: targetCheckOut,
          status: calc.status,
          workingHours: calc.workedHours,
          calculatedOtHours: calc.potentialOtHours,
          lateStatus: calc.lateStatus,
          lateDurationMinutes: calc.lateMinutes,
          earlyCheckoutMinutes: calc.earlyCheckoutMinutes,
          shiftName: shiftModel.shiftName,
          reason: `Missed Punch Approved: ${remarks || target.reason}`
        };
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      } else {
        const newRec: AttendanceRecord = {
          id: `ATT-${Date.now()}`,
          employeeId: target.employeeId,
          employeeName: target.employeeName,
          date: target.date,
          checkIn: targetCheckIn,
          checkOut: targetCheckOut,
          department: target.department,
          status: calc.status,
          method: 'Manual Punch',
          workingHours: calc.workedHours,
          calculatedOtHours: calc.potentialOtHours,
          lateStatus: calc.lateStatus,
          lateDurationMinutes: calc.lateMinutes,
          earlyCheckoutMinutes: calc.earlyCheckoutMinutes,
          shiftName: shiftModel.shiftName,
          otHours: 0,
          approvedOtHours: 0,
          otStatus: 'Pending',
          reason: `Missed Punch Approved: ${remarks || target.reason}`
        };
        return [newRec, ...prev];
      }
    });

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setAttendanceAuditLogs(prev => [{
      id: `AUD-${Date.now()}`,
      attendanceId: `ATT-${target.id}`,
      employeeId: target.employeeId,
      employeeName: target.employeeName,
      date: target.date,
      fieldChanged: `Missed Punch Approved (${target.requestType})`,
      oldValue: `Check-In: ${target.existingCheckIn || 'Missing'}, Check-Out: ${target.existingCheckOut || 'Missing'}`,
      newValue: `Check-In: ${targetCheckIn}, Check-Out: ${targetCheckOut} (${calc.workedHours}h worked, ${calc.potentialOtHours}h potential OT)`,
      reason: remarks || target.reason,
      changedBy: reviewedBy,
      timestamp: `${dateStr} ${timeStr}`
    }, ...prev]);

    addNotification({
      title: 'Correction Approved',
      message: `Attendance request for ${target.employeeName} on ${target.date} was approved.`,
      priority: 'Normal',
      category: 'Attendance'
    });
  };

  const rejectMissedPunchRequest = (id: string, reviewedBy: string, remarks?: string) => {
    const target = missedPunchRequests.find(r => r.id === id);
    if (!target) return;
    const nowStr = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    setMissedPunchRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'Rejected',
      reviewedBy,
      reviewedAt: nowStr,
      hrRemarks: remarks || 'Rejected by HR/CEO'
    } : r));

    addNotification({
      title: 'Correction Rejected',
      message: `Correction request for ${target.employeeName} on ${target.date} was rejected.`,
      priority: 'Urgent',
      category: 'Attendance'
    });
  };

  const editAndApproveMissedPunchRequest = (
    id: string,
    adjustedCheckIn: string,
    adjustedCheckOut: string,
    reviewedBy: string,
    remarks?: string
  ) => {
    const target = missedPunchRequests.find(r => r.id === id);
    if (!target) return;

    const nowStr = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    setMissedPunchRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'Approved',
      adjustedCheckIn,
      adjustedCheckOut,
      reviewedBy,
      reviewedAt: nowStr,
      hrRemarks: remarks || 'Adjusted and approved by HR/CEO'
    } : r));

    const assignedShift = shifts.find(s => s.assignments?.some(a => a.employeeId === target.employeeId));
    const shiftModel: ShiftModel = {
      id: assignedShift?.id || 'SH-01',
      shiftName: assignedShift?.shiftName || 'General (09:00 - 18:00)',
      shiftCode: (assignedShift as any)?.shiftCode || 'GEN-01',
      startTime: assignedShift?.startTime || '09:00 AM',
      endTime: assignedShift?.endTime || '06:00 PM',
      requiredWorkingHours: assignedShift?.workingHours || 9.0,
      breakDurationMinutes: assignedShift?.breakDurationMins || 60,
      gracePeriodMinutes: assignedShift?.gracePeriodMins || 10,
      lateThresholdMinutes: 15,
      earlyCheckoutThresholdMinutes: 10,
      otStartsAfter: 'After required working hours completed',
      maximumDailyOtHours: 4.0
    };

    const otEligibility = resolveEmployeeOtEligibility(
      target.employeeId,
      target.department,
      departmentOtPolicies,
      employeeOtPolicies
    );

    const calc = calculateAttendanceHoursAndStatus({
      checkIn: adjustedCheckIn,
      checkOut: adjustedCheckOut,
      shift: shiftModel,
      otPolicy: overtimePolicy,
      attendancePolicy: attendancePolicyConfig,
      isOtEligible: otEligibility.isEligible
    });

    setAttendanceRecords(prev => {
      const idx = prev.findIndex(a => a.employeeId === target.employeeId && a.date === target.date);
      if (idx !== -1) {
        const existing = prev[idx];
        const updated: AttendanceRecord = {
          ...existing,
          checkIn: adjustedCheckIn,
          checkOut: adjustedCheckOut,
          status: calc.status,
          workingHours: calc.workedHours,
          calculatedOtHours: calc.potentialOtHours,
          lateStatus: calc.lateStatus,
          lateDurationMinutes: calc.lateMinutes,
          earlyCheckoutMinutes: calc.earlyCheckoutMinutes,
          shiftName: shiftModel.shiftName,
          reason: `Missed Punch Adjusted & Approved: ${remarks || target.reason}`
        };
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      } else {
        const newRec: AttendanceRecord = {
          id: `ATT-${Date.now()}`,
          employeeId: target.employeeId,
          employeeName: target.employeeName,
          date: target.date,
          checkIn: adjustedCheckIn,
          checkOut: adjustedCheckOut,
          department: target.department,
          status: calc.status,
          method: 'Manual Punch',
          workingHours: calc.workedHours,
          calculatedOtHours: calc.potentialOtHours,
          lateStatus: calc.lateStatus,
          lateDurationMinutes: calc.lateMinutes,
          earlyCheckoutMinutes: calc.earlyCheckoutMinutes,
          shiftName: shiftModel.shiftName,
          otHours: 0,
          approvedOtHours: 0,
          otStatus: 'Pending',
          reason: `Missed Punch Adjusted & Approved: ${remarks || target.reason}`
        };
        return [newRec, ...prev];
      }
    });

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setAttendanceAuditLogs(prev => [{
      id: `AUD-${Date.now()}`,
      attendanceId: `ATT-${target.id}`,
      employeeId: target.employeeId,
      employeeName: target.employeeName,
      date: target.date,
      fieldChanged: `Missed Punch Adjusted & Approved (${target.requestType})`,
      oldValue: `Requested: ${target.requestedCheckIn || '-'} to ${target.requestedCheckOut || '-'}`,
      newValue: `Adjusted: ${adjustedCheckIn} to ${adjustedCheckOut} (${calc.workedHours}h worked, ${calc.potentialOtHours}h potential OT)`,
      reason: remarks || target.reason,
      changedBy: reviewedBy,
      timestamp: `${dateStr} ${timeStr}`
    }, ...prev]);

    addNotification({
      title: 'Correction Adjusted & Approved',
      message: `Attendance for ${target.employeeName} on ${target.date} adjusted to ${adjustedCheckIn} - ${adjustedCheckOut}.`,
      priority: 'Normal',
      category: 'Attendance'
    });
  };

  const submitOtRequest = (req: Omit<OvertimeRequest, 'id' | 'status' | 'approvedOtHours' | 'submittedAt'>): { success: boolean; message: string } => {
    if (!req.reason || !req.reason.trim()) {
      return { success: false, message: 'Reason is required for overtime request.' };
    }

    // Security check: Verify employee OT eligibility
    const otElig = resolveEmployeeOtEligibility(
      req.employeeId,
      req.department,
      departmentOtPolicies,
      employeeOtPolicies
    );

    if (!otElig.isEligible) {
      return {
        success: false,
        message: `OT Submission Blocked: ${otElig.reason}`
      };
    }

    const newReq: OvertimeRequest = {
      ...req,
      id: `OTR-${Date.now().toString().slice(-4)}`,
      approvedOtHours: 0,
      status: 'Pending Approval',
      source: 'Employee Request',
      submittedAt: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    };
    setOvertimeRequests(prev => [newReq, ...prev]);

    addNotification({
      title: 'Overtime Request Submitted',
      message: `${req.employeeName} submitted OT request for ${req.requestedOtHours} hrs on ${req.date}.`,
      priority: 'Normal',
      category: 'Attendance'
    });
    return { success: true, message: 'Overtime request submitted successfully.' };
  };

  const approveOtRequest = (
    id: string, 
    approvedHours: number, 
    reviewedBy: string, 
    remarks?: string,
    multiplier?: OvertimeRequest['multiplier']
  ) => {
    const target = overtimeRequests.find(r => r.id === id);
    if (!target) return;
    const nowStr = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    const activeMultiplier = multiplier || target.multiplier || '1x Salary';
    const factor = activeMultiplier === '2x Salary' ? 2 : activeMultiplier === '1.5x Salary' ? 1.5 : 1;
    const rate = target.hourlyRate > 0 ? target.hourlyRate : 100;
    const newCalculatedAmount = Math.round(approvedHours * rate * factor * 100) / 100;

    setOvertimeRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      approvedOtHours: approvedHours,
      multiplier: activeMultiplier,
      calculatedAmount: newCalculatedAmount,
      status: approvedHours < r.requestedOtHours ? 'Partially Approved' : 'Approved',
      reviewedBy,
      reviewedAt: nowStr,
      reviewRemarks: remarks || (approvedHours < r.requestedOtHours ? `Approved ${approvedHours}h of ${r.requestedOtHours}h requested` : 'Approved')
    } : r));

    // Update AttendanceRecord
    setAttendanceRecords(prev => prev.map(a => {
      if (a.employeeId === target.employeeId && a.date === target.date) {
        return {
          ...a,
          otHours: approvedHours,
          approvedOtHours: approvedHours,
          otStatus: 'Approved'
        };
      }
      return a;
    }));

    // Update Payroll
    setPayrollRecords(prev => prev.map(p => {
      if (p.employeeId === target.employeeId) {
        return {
          ...p,
          overtimeHours: (p.overtimeHours || 0) + approvedHours
        };
      }
      return p;
    }));

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setAttendanceAuditLogs(prev => [{
      id: `AUD-${Date.now()}`,
      attendanceId: `ATT-${target.id}`,
      employeeId: target.employeeId,
      employeeName: target.employeeName,
      date: target.date,
      fieldChanged: 'Overtime Approved',
      oldValue: `Requested: ${target.requestedOtHours} hrs (${target.multiplier})`,
      newValue: `Approved: ${approvedHours} hrs (${activeMultiplier}, ₹${newCalculatedAmount})`,
      reason: remarks || 'HR/CEO Overtime Approval',
      changedBy: reviewedBy,
      timestamp: `${dateStr} ${timeStr}`
    }, ...prev]);

    addNotification({
      title: 'OT Request Approved',
      message: `Approved ${approvedHours} hrs OT for ${target.employeeName} on ${target.date} by ${reviewedBy}.`,
      priority: 'Normal',
      category: 'Attendance'
    });
  };

  const rejectOtRequest = (id: string, reviewedBy: string, remarks?: string) => {
    const target = overtimeRequests.find(r => r.id === id);
    if (!target) return;
    const nowStr = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    setOvertimeRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'Rejected',
      approvedOtHours: 0,
      reviewedBy,
      reviewedAt: nowStr,
      reviewRemarks: remarks || 'Rejected by HR/CEO'
    } : r));

    setAttendanceRecords(prev => prev.map(a => {
      if (a.employeeId === target.employeeId && a.date === target.date) {
        return {
          ...a,
          otStatus: 'Rejected'
        };
      }
      return a;
    }));

    addNotification({
      title: 'OT Request Rejected',
      message: `OT request for ${target.employeeName} on ${target.date} was rejected by ${reviewedBy}.`,
      priority: 'Urgent',
      category: 'Attendance'
    });
  };

  const editAndApproveOtRequest = (
    id: string, 
    approvedHours: number, 
    reviewedBy: string, 
    remarks?: string,
    multiplier?: OvertimeRequest['multiplier']
  ) => {
    approveOtRequest(id, approvedHours, reviewedBy, remarks, multiplier);
  };

  const deleteOtRequest = (id: string) => {
    const target = overtimeRequests.find(r => r.id === id);
    setOvertimeRequests(prev => prev.filter(r => r.id !== id));
    addNotification({
      title: 'OT Request Cancelled',
      message: target ? `Overtime request for ${target.date} was cancelled.` : 'Overtime request removed.',
      priority: 'Normal',
      category: 'Attendance'
    });
  };

  const addManualOtEntry = (entry: { employeeId: string; date: string; hours: number; hourlyRate: number; multiplier: OvertimeRequest['multiplier']; reason: string; addedBy: string }): { success: boolean; message: string } => {
    const emp = employees.find(e => e.id === entry.employeeId || e.employeeId === entry.employeeId);
    if (!emp) return { success: false, message: 'Employee not found.' };

    const fullName = `${emp.firstName} ${emp.lastName}`.trim();
    const calculatedAmount = entry.multiplier === '1.5x Salary'
      ? entry.hours * entry.hourlyRate * 1.5
      : entry.multiplier === '2x Salary'
      ? entry.hours * entry.hourlyRate * 2
      : entry.hours * entry.hourlyRate;

    const newReq: OvertimeRequest = {
      id: `OTR-${Date.now().toString().slice(-4)}`,
      employeeId: entry.employeeId,
      employeeName: fullName,
      department: emp.department,
      date: entry.date,
      shiftEnd: '06:00 PM',
      actualCheckOut: 'Manual Addition',
      potentialOtHours: entry.hours,
      requestedOtHours: entry.hours,
      approvedOtHours: entry.hours,
      reason: entry.reason,
      workDescription: `Manual OT added by ${entry.addedBy}`,
      status: 'Manually Added',
      source: 'Manual OT',
      multiplier: entry.multiplier,
      hourlyRate: entry.hourlyRate,
      calculatedAmount,
      submittedAt: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      reviewedBy: entry.addedBy,
      reviewedAt: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      reviewRemarks: `Directly credited by ${entry.addedBy}`
    };

    setOvertimeRequests(prev => [newReq, ...prev]);

    // Sync to attendance
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(a => a.employeeId === entry.employeeId && a.date === entry.date);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          otHours: entry.hours,
          approvedOtHours: entry.hours,
          otStatus: 'Approved'
        };
        return copy;
      }
      return prev;
    });

    // Update payroll
    setPayrollRecords(prev => prev.map(p => {
      if (p.employeeId === entry.employeeId) {
        return {
          ...p,
          overtimeHours: (p.overtimeHours || 0) + entry.hours
        };
      }
      return p;
    }));

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setAttendanceAuditLogs(prev => [{
      id: `AUD-${Date.now()}`,
      attendanceId: `ATT-${entry.employeeId}-${entry.date}`,
      employeeId: entry.employeeId,
      employeeName: fullName,
      date: entry.date,
      fieldChanged: 'Manual Overtime Added',
      oldValue: '0 hrs',
      newValue: `${entry.hours} hrs @ ₹${entry.hourlyRate}/hr (${entry.multiplier})`,
      reason: entry.reason,
      changedBy: entry.addedBy,
      timestamp: `${dateStr} ${timeStr}`
    }, ...prev]);

    addNotification({
      title: 'Manual Overtime Added',
      message: `Credited ${entry.hours} hrs OT to ${fullName} on ${entry.date}.`,
      priority: 'Normal',
      category: 'Attendance'
    });

    return { success: true, message: 'Overtime hours successfully added and synced with payroll.' };
  };

  const addManualAttendanceRecord = (entry: {
    employeeId: string;
    date: string;
    status: AttendanceRecord['status'];
    checkIn?: string | null;
    checkOut?: string | null;
    breakDurationMinutes?: number;
    workingHours?: number;
    halfDayType?: 'First Half' | 'Second Half';
    otHours?: number;
    reason: string;
    addedBy: string;
  }): { success: boolean; message: string } => {
    if (!entry.employeeId) {
      return { success: false, message: 'Please select an employee.' };
    }
    if (!entry.date) {
      return { success: false, message: 'Please specify the date.' };
    }
    if (!entry.reason || !entry.reason.trim()) {
      return { success: false, message: 'Reason / authorization is mandatory.' };
    }

    const emp = employees.find(e => e.id === entry.employeeId || e.employeeId === entry.employeeId);
    if (!emp) {
      return { success: false, message: 'Employee not found.' };
    }

    const fullName = `${emp.firstName} ${emp.lastName}`.trim();
    const breakMins = entry.breakDurationMinutes ?? 45;

    // Calculate working hours if not explicitly passed
    let computedHours = entry.workingHours;
    if (computedHours === undefined) {
      if (entry.status === 'Absent' || entry.status === 'Holiday' || entry.status === 'Week Off') {
        computedHours = 0;
      } else if (entry.status === 'Half Day') {
        computedHours = 4.0;
      } else if (entry.status === 'On Leave' || (entry.status as string) === 'Leave') {
        computedHours = 0;
      } else if (entry.checkIn && entry.checkOut) {
        const parseTime = (timeStr: string) => {
          if (!timeStr) return null;
          const clean = timeStr.trim();
          let hours = 0;
          let mins = 0;
          if (clean.includes('AM') || clean.includes('PM')) {
            const [timePart, ampm] = clean.split(' ');
            const [hh, mm] = timePart.split(':').map(Number);
            hours = ampm.toUpperCase() === 'PM' && hh < 12 ? hh + 12 : (ampm.toUpperCase() === 'AM' && hh === 12 ? 0 : hh);
            mins = mm || 0;
          } else {
            const [hh, mm] = clean.split(':').map(Number);
            hours = hh || 0;
            mins = mm || 0;
          }
          return hours * 60 + mins;
        };

        const inMins = parseTime(entry.checkIn);
        const outMins = parseTime(entry.checkOut);
        if (inMins !== null && outMins !== null) {
          if (outMins >= inMins) {
            const netMins = Math.max(0, outMins - inMins - breakMins);
            computedHours = Math.round((netMins / 60) * 10) / 10;
          } else {
            computedHours = 8.0;
          }
        } else {
          computedHours = 8.0;
        }
      } else {
        computedHours = entry.status === 'Present' ? 8.0 : 0;
      }
    }

    const isNonWorking = entry.status === 'Absent' || entry.status === 'Holiday' || entry.status === 'Week Off';
    const cleanCheckIn = isNonWorking ? null : (entry.checkIn || null);
    const cleanCheckOut = isNonWorking ? null : (entry.checkOut || null);
    const otHrs = entry.otHours || 0;

    let existingRecord: AttendanceRecord | undefined;

    setAttendanceRecords(prev => {
      const idx = prev.findIndex(a => a.employeeId === entry.employeeId && a.date === entry.date);
      if (idx !== -1) {
        existingRecord = prev[idx];
        const updated: AttendanceRecord = {
          ...prev[idx],
          status: entry.status,
          checkIn: cleanCheckIn,
          checkOut: cleanCheckOut,
          workingHours: computedHours || 0,
          breakDurationMinutes: breakMins,
          halfDayType: entry.halfDayType,
          otHours: otHrs,
          approvedOtHours: otHrs > 0 ? otHrs : prev[idx].approvedOtHours,
          otStatus: otHrs > 0 ? 'Approved' : prev[idx].otStatus,
          method: 'Manual Punch',
          reason: `Manual Attendance (HR/CEO): ${entry.reason}`
        };
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      } else {
        const newRec: AttendanceRecord = {
          id: `ATT-${Date.now()}`,
          employeeId: entry.employeeId,
          employeeName: fullName,
          department: emp.department,
          date: entry.date,
          status: entry.status,
          checkIn: cleanCheckIn,
          checkOut: cleanCheckOut,
          workingHours: computedHours || 0,
          breakDurationMinutes: breakMins,
          halfDayType: entry.halfDayType,
          shiftName: 'General (09:00 - 18:00)',
          method: 'Manual Punch',
          otHours: otHrs,
          approvedOtHours: otHrs,
          otStatus: otHrs > 0 ? 'Approved' : 'Pending',
          reason: `Manual Attendance (HR/CEO): ${entry.reason}`
        };
        return [newRec, ...prev];
      }
    });

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setAttendanceAuditLogs(prev => [{
      id: `AUD-${Date.now()}`,
      attendanceId: existingRecord ? existingRecord.id : `ATT-${entry.employeeId}-${entry.date}`,
      employeeId: entry.employeeId,
      employeeName: fullName,
      date: entry.date,
      fieldChanged: existingRecord ? `Manual Attendance Override (${existingRecord.status} -> ${entry.status})` : 'Manual Attendance Entry Created',
      oldValue: existingRecord ? `Status: ${existingRecord.status}, In: ${existingRecord.checkIn || 'None'}, Out: ${existingRecord.checkOut || 'None'}` : 'No Previous Record',
      newValue: `Status: ${entry.status}, In: ${cleanCheckIn || 'None'}, Out: ${cleanCheckOut || 'None'}, Hours: ${computedHours}`,
      reason: entry.reason,
      changedBy: entry.addedBy,
      timestamp: `${dateStr} ${timeStr}`
    }, ...prev]);

    // Update payroll if absent/halfday or OT
    setPayrollRecords(prev => prev.map(p => {
      if (p.employeeId === entry.employeeId) {
        return {
          ...p,
          overtimeHours: (p.overtimeHours || 0) + otHrs,
          lopDays: entry.status === 'Absent' ? (p.lopDays || 0) + 1 : (entry.status === 'Half Day' ? (p.lopDays || 0) + 0.5 : p.lopDays)
        };
      }
      return p;
    }));

    addNotification({
      title: 'Manual Attendance Recorded',
      message: `Manual attendance for ${fullName} on ${entry.date} recorded by ${entry.addedBy}.`,
      priority: 'Normal',
      category: 'Attendance'
    });

    return { success: true, message: `Attendance for ${fullName} on ${entry.date} successfully recorded!` };
  };

  const updateDepartmentOtPolicy = (id: string, policy: Partial<DepartmentOtPolicy>) => {
    setDepartmentOtPolicies(prev => prev.map(p => p.id === id ? { ...p, ...policy } : p));
  };

  const updateEmployeeOtPolicy = (id: string, policy: Partial<EmployeeOtPolicy>) => {
    setEmployeeOtPolicies(prev => prev.map(p => p.id === id ? { ...p, ...policy } : p));
  };

  const updateAttendanceGlobalSettings = (settings: Partial<AttendanceGlobalSettings>) => {
    setAttendanceGlobalSettings(prev => ({ ...prev, ...settings }));
  };

  const [faceLogs, setFaceLogs] = useState<FaceLog[]>(INITIAL_FACE_LOGS);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);

  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);

  const [leavePolicies, setLeavePolicies] = useState<LeavePolicyItem[]>(INITIAL_LEAVE_POLICIES);

  const [holidayPolicies, setHolidayPolicies] = useState<HolidayItem[]>(INITIAL_HOLIDAYS);

  const [attendancePolicies, setAttendancePolicies] = useState<AttendancePolicyItem[]>(INITIAL_ATTENDANCE_POLICIES);

  const [weeklySchedules, setWeeklySchedules] = useState<WeeklyScheduleItem[]>(INITIAL_WEEKLY_SCHEDULES);

  const [attendanceConfig, setAttendanceConfig] = useState<GlobalAttendanceConfig>(INITIAL_GLOBAL_ATTENDANCE_CONFIG);

  const [policyDocuments, setPolicyDocuments] = useState<PolicyDocumentItem[]>(INITIAL_POLICY_DOCUMENTS);

  const [businessSettings, setBusinessSettings] = useState<BusinessProfileSettings>(INITIAL_BUSINESS_SETTINGS);
  const [shiftRequests, setShiftRequests] = useState<ShiftRequest[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

  // Enhanced Enterprise Tasks & Systems
  const [enhancedTasks, setEnhancedTasks] = useState<TaskItemEnhanced[]>(INITIAL_ENHANCED_TASKS);

  const [taskMasters, setTaskMasters] = useState<TaskMasterItem[]>(INITIAL_TASK_MASTERS);

  const [momMeetings, setMomMeetings] = useState<MOMMeeting[]>(INITIAL_MOM_MEETINGS);

  const [escalationRules, setEscalationRules] = useState<TaskEscalationRule[]>(INITIAL_ESCALATION_RULES);

  const [taskWeights, setTaskWeights] = useState<TaskPerformanceWeights>(INITIAL_TASK_WEIGHTS);

  const [performanceScores, setPerformanceScores] = useState<PerformanceScore[]>(INITIAL_PERFORMANCE);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(INITIAL_JOBS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL);

  const [departments, setDepartments] = useState<DepartmentItem[]>(INITIAL_DEPTS);

  const [designations, setDesignations] = useState<DesignationItem[]>(INITIAL_DESIGNATIONS);

  const [branches, setBranches] = useState<BranchItem[]>(INITIAL_BRANCHES);

  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS);

  // ========================================================
  // 5 CORE SETTINGS MODULES & POLICY ENGINE STATE
  // ========================================================
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(INITIAL_COMPANY_INFO);

  const [companyBranches, setCompanyBranches] = useState<CompanyBranch[]>(INITIAL_COMPANY_BRANCHES);

  const [orgStructure, setOrgStructure] = useState<OrganizationStructure>(INITIAL_ORG_STRUCTURE);

  const triggerToast = (message: string) => {
    const newNote: NotificationItem = {
      id: `nt-${Date.now()}`,
      title: 'Policy Engine Notification',
      message,
      timestamp: 'Just now',
      priority: 'Normal',
      category: 'Payroll',
      read: false
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const [masterAttendancePolicies, setMasterAttendancePolicies] = useState<AttendancePolicy[]>(DEFAULT_MASTER_ATTENDANCE_POLICIES);

  const [attendanceCorrections, setAttendanceCorrections] = useState<AttendanceCorrectionRequest[]>(INITIAL_ATTENDANCE_CORRECTIONS);

  const [masterLeavePolicies, setMasterLeavePolicies] = useState<MasterLeavePolicy[]>(DEFAULT_MASTER_LEAVE_POLICIES);

  // Sandwich Leave Policy Engine States
  const [sandwichPolicies, setSandwichPolicies] = useState<SandwichLeavePolicy[]>(initialSandwichPolicies);

  const [sandwichAuditLogs, setSandwichAuditLogs] = useState<SandwichAuditLog[]>(initialSandwichAuditLogs);

  const addSandwichAuditLog = (log: Omit<SandwichAuditLog, 'id' | 'timestamp' | 'user' | 'userRole'>) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const userRole = currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role;
    const newEntry: SandwichAuditLog = {
      id: `SAL-${Date.now()}`,
      timestamp: formatted,
      user: currentUser.name,
      userRole,
      ...log
    };
    setSandwichAuditLogs(prev => [newEntry, ...prev]);
  };

  const [payrollSettingsConfig, setPayrollSettingsConfig] = useState<PayrollSettingsConfig>(INITIAL_PAYROLL_CONFIG);

  const [rewardPolicies, setRewardPolicies] = useState<RewardPolicy[]>(INITIAL_REWARD_POLICIES);

  const [employeeRewardRecords, setEmployeeRewardRecords] = useState<EmployeeRewardRecord[]>(INITIAL_EMPLOYEE_REWARDS);

  const [policyAuditLogs, setPolicyAuditLogs] = useState<PolicyAuditLog[]>(INITIAL_POLICY_AUDIT_LOGS);

  const addPolicyAuditLog = (log: Omit<PolicyAuditLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newEntry: PolicyAuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: formatted,
      ...log
    };
    setPolicyAuditLogs(prev => [newEntry, ...prev]);
  };

  // ==========================================
  // 6. ADVANCE SALARY / LOAN POLICY & RECORDS
  // ==========================================
  const [loanPolicies, setLoanPolicies] = useState<LoanPolicy[]>(DEFAULT_LOAN_POLICIES);

  const activeLoanPolicy = loanPolicies.find(p => p.status === 'Active') || loanPolicies[0];

  const createLoanPolicy = (policyData: Omit<LoanPolicy, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const userLabel = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    const newPolicy: LoanPolicy = {
      id: `POL-LOAN-${String(loanPolicies.length + 1).padStart(3, '0')}`,
      createdAt: formatted,
      updatedAt: formatted,
      createdBy: userLabel,
      updatedBy: userLabel,
      ...policyData
    };
    setLoanPolicies(prev => [newPolicy, ...prev]);
    addPolicyAuditLog({
      policyCategory: 'Advance Salary / Loan Policy',
      policyId: newPolicy.id,
      policyName: newPolicy.policyName,
      action: 'CREATE',
      performedBy: currentUser.name,
      performedByRole: currentUser.role,
      changeSummary: `Created master loan policy "${newPolicy.policyName}" with min tenure ${newPolicy.minimumEmploymentMonths} months.`
    });
  };

  const updateLoanPolicy = (id: string, updates: Partial<LoanPolicy>) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const userLabel = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setLoanPolicies(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates, updatedAt: formatted, updatedBy: userLabel };
        addPolicyAuditLog({
          policyCategory: 'Advance Salary / Loan Policy',
          policyId: p.id,
          policyName: updated.policyName,
          action: 'EDIT',
          performedBy: currentUser.name,
          performedByRole: currentUser.role,
          changeSummary: `Updated policy settings for "${updated.policyName}".`
        });
        return updated;
      }
      return p;
    }));
  };

  const deleteLoanPolicy = (id: string) => {
    setLoanPolicies(prev => prev.filter(p => p.id !== id));
  };

  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>(INITIAL_LOAN_RECORDS);

  // Dynamic Eligibility Calculator (NO HARDCODING)
  const calculateEmployeeLoanEligibility = (employeeId: string, policyId?: string) => {
    const emp = employees.find(e => e.employeeId === employeeId);
    const policy = (policyId ? loanPolicies.find(p => p.id === policyId) : activeLoanPolicy) || DEFAULT_LOAN_POLICIES[0];
    
    if (!emp) {
      return {
        isEligible: false,
        ineligibleReason: 'Employee record not found.',
        employmentDurationMonths: 0,
        monthlySalary: 0,
        maxEligibleAmount: 0,
        activeLoansCount: 0,
        currentOutstanding: 0,
        policy
      };
    }

    // 1. Calculate Employment Duration from Joining Date to Current Date
    const joinDate = new Date(emp.joiningDate || '2022-01-01');
    const now = new Date('2026-09-07');
    const diffMonths = ((now.getFullYear() - joinDate.getFullYear()) * 12) + (now.getMonth() - joinDate.getMonth()) + ((now.getDate() - joinDate.getDate()) / 30);
    const tenureMonths = Math.max(0, Math.round(diffMonths * 10) / 10);

    // 2. Calculate Monthly Salary
    const basic = toNum(emp.basicSalary);
    const allowances = toNum(emp.allowances?.hra) + toNum(emp.allowances?.transport) + toNum(emp.allowances?.medical) + toNum(emp.allowances?.special);
    const monthlySalary = basic + allowances;

    // 3. Calculate Maximum Eligible Amount based on Policy Limit Type
    let maxEligibleAmount = 0;
    if (policy.maxLoanLimitType === 'SALARY_MULTIPLIER') {
      maxEligibleAmount = Math.round(monthlySalary * policy.maxLoanLimitValue);
    } else if (policy.maxLoanLimitType === 'PERCENTAGE_SALARY') {
      maxEligibleAmount = Math.round(monthlySalary * (policy.maxLoanLimitValue / 100));
    } else {
      maxEligibleAmount = policy.maxLoanLimitValue;
    }
    if (policy.maxLoanAmount && policy.maxLoanAmount > 0) {
      maxEligibleAmount = Math.min(maxEligibleAmount, policy.maxLoanAmount);
    }

    // 4. Check Active Loans & Outstanding Balance
    const activeLoans = loanRecords.filter(
      r => r.employeeId === employeeId && 
      (r.status === 'Active' || r.status === 'Disbursed') && 
      toNum(r.outstandingBalance) > 0
    );
    const activeLoansCount = activeLoans.length;
    const currentOutstanding = activeLoans.reduce((sum, r) => sum + toNum(r.outstandingBalance), 0);

    // 5. Dynamic Rules Validations (Not Hardcoded)
    if (tenureMonths < policy.minimumEmploymentMonths) {
      return {
        isEligible: false,
        ineligibleReason: `You are not eligible to apply for this loan yet. Minimum ${policy.minimumEmploymentMonths} months of completed employment is required. (Your completed tenure is ${tenureMonths} months)`,
        employmentDurationMonths: tenureMonths,
        monthlySalary,
        maxEligibleAmount,
        activeLoansCount,
        currentOutstanding,
        policy
      };
    }

    if (activeLoansCount >= policy.maxActiveLoans) {
      return {
        isEligible: false,
        ineligibleReason: `You already have an active loan. Please complete your current loan repayment before applying for a new loan.`,
        employmentDurationMonths: tenureMonths,
        monthlySalary,
        maxEligibleAmount,
        activeLoansCount,
        currentOutstanding,
        policy
      };
    }

    return {
      isEligible: true,
      employmentDurationMonths: tenureMonths,
      monthlySalary,
      maxEligibleAmount,
      activeLoansCount,
      currentOutstanding,
      policy
    };
  };

  const submitLoanRequest = (requestData: Omit<LoanRecord, 'id' | 'requestedDate' | 'status' | 'outstandingBalance' | 'repaymentSchedule' | 'auditLogs'>) => {
    const eligibility = calculateEmployeeLoanEligibility(requestData.employeeId, requestData.policyId);
    if (!eligibility.isEligible) {
      return { success: false, message: eligibility.ineligibleReason || 'Not eligible to submit loan request.' };
    }

    if (requestData.requestedAmount > eligibility.maxEligibleAmount) {
      return { success: false, message: 'Requested amount exceeds your maximum eligible loan limit.' };
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timestamp = `${dateStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const loanId = `ADV-${now.getFullYear()}-${String(loanRecords.length + 1).padStart(3, '0')}`;
    const months = requestData.installmentMonths || 3;
    const monthlyEMI = Math.round(requestData.requestedAmount / months);

    const schedule: LoanRepaymentInstallment[] = Array.from({ length: months }).map((_, idx) => {
      return {
        installmentNumber: idx + 1,
        periodMonth: `Month +${idx + 1}`,
        scheduledAmount: idx === months - 1 ? requestData.requestedAmount - (monthlyEMI * (months - 1)) : monthlyEMI,
        actualDeducted: 0,
        remainingBalance: requestData.requestedAmount - (monthlyEMI * (idx + 1)),
        status: 'Pending'
      };
    });

    const newRecord: LoanRecord = {
      ...requestData,
      id: loanId,
      requestedDate: dateStr,
      status: 'Pending',
      monthlyDeduction: monthlyEMI,
      outstandingBalance: requestData.requestedAmount,
      repaymentSchedule: schedule,
      auditLogs: [
        {
          id: `LOG-${Date.now()}-1`,
          loanId,
          action: 'Loan Requested',
          performedBy: `${requestData.employeeName} (${requestData.employeeId})`,
          performedByRole: currentUser.role,
          timestamp,
          notes: `Requested ₹${requestData.requestedAmount.toLocaleString('en-IN')} for ${months} months. Reason: ${requestData.purpose}`
        }
      ]
    };

    setLoanRecords(prev => [newRecord, ...prev]);
    addNotification({
      title: 'New Advance / Loan Request',
      message: `${requestData.employeeName} submitted a request for ₹${requestData.requestedAmount.toLocaleString('en-IN')}.`,
      priority: 'Important',
      category: 'Payroll'
    });

    return { success: true, message: 'Advance Salary / Loan request submitted successfully.', loanId };
  };

  const reviewLoanRequest = (id: string, options: {
    action: 'Approve' | 'Reject';
    approvedAmount?: number;
    approvedMonths?: number;
    monthlyDeduction?: number;
    deductionStartMonth?: string;
    internalHrNotes?: string;
    employeeVisibleNotes?: string;
    rejectionReason?: string;
  }) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const approverName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;

    setLoanRecords(prev => prev.map(rec => {
      if (rec.id !== id) return rec;

      if (options.action === 'Approve') {
        const approvedAmt = options.approvedAmount ?? rec.requestedAmount;
        const approvedM = options.approvedMonths ?? rec.installmentMonths;
        const emi = options.monthlyDeduction ?? Math.round(approvedAmt / approvedM);
        const startMonth = options.deductionStartMonth || 'Sep 2026';

        const schedule: LoanRepaymentInstallment[] = Array.from({ length: approvedM }).map((_, idx) => {
          return {
            installmentNumber: idx + 1,
            periodMonth: `${startMonth} +${idx}`,
            scheduledAmount: idx === approvedM - 1 ? approvedAmt - (emi * (approvedM - 1)) : emi,
            actualDeducted: 0,
            remainingBalance: Math.max(0, approvedAmt - (emi * (idx + 1))),
            status: 'Pending'
          };
        });

        const isCEO = currentUser.role === 'Super Admin';
        const updatedRec: LoanRecord = {
          ...rec,
          status: 'Approved',
          approvedAmount: approvedAmt,
          approvedMonths: approvedM,
          monthlyDeduction: emi,
          outstandingBalance: approvedAmt,
          deductionStartMonth: startMonth,
          internalHrNotes: options.internalHrNotes || rec.internalHrNotes,
          employeeVisibleNotes: options.employeeVisibleNotes || `Approved for ₹${approvedAmt.toLocaleString('en-IN')} across ${approvedM} months.`,
          repaymentSchedule: schedule,
          hrApproval: !isCEO ? {
            approvedBy: approverName,
            approvedAt: timestamp,
            remarks: options.internalHrNotes,
            status: 'Approved'
          } : rec.hrApproval,
          ceoApproval: isCEO ? {
            approvedBy: approverName,
            approvedAt: timestamp,
            remarks: options.internalHrNotes,
            status: 'Approved'
          } : rec.ceoApproval,
          auditLogs: [
            ...rec.auditLogs,
            {
              id: `LOG-${Date.now()}`,
              loanId: rec.id,
              action: 'Request Approved',
              performedBy: approverName,
              performedByRole: currentUser.role,
              timestamp,
              previousValue: `Status: ${rec.status}, Requested: ₹${rec.requestedAmount}`,
              newValue: `Status: Approved, Sanctioned: ₹${approvedAmt.toLocaleString('en-IN')} @ ₹${emi}/mo`
            }
          ]
        };
        return updatedRec;
      } else {
        const updatedRec: LoanRecord = {
          ...rec,
          status: 'Rejected',
          rejectionReason: options.rejectionReason || 'Request does not meet current organizational loan criteria.',
          internalHrNotes: options.internalHrNotes,
          auditLogs: [
            ...rec.auditLogs,
            {
              id: `LOG-${Date.now()}`,
              loanId: rec.id,
              action: 'Request Rejected',
              performedBy: approverName,
              performedByRole: currentUser.role,
              timestamp,
              previousValue: `Status: ${rec.status}`,
              newValue: `Status: Rejected. Reason: ${options.rejectionReason || 'Policy criteria not met'}`
            }
          ]
        };
        return updatedRec;
      }
    }));
  };

  const disburseLoan = (id: string, details: {
    disbursedDate: string;
    disbursedAmount: number;
    paymentMode: 'NEFT' | 'IMPS' | 'Cheque' | 'Cash';
    transactionRef?: string;
    notes?: string;
  }) => {
    const officer = `${currentUser.name} (${currentUser.role})`;

    setLoanRecords(prev => prev.map(rec => {
      if (rec.id !== id) return rec;

      const amt = details.disbursedAmount || rec.approvedAmount || rec.requestedAmount;
      const months = rec.approvedMonths || rec.installmentMonths || 3;
      const emi = rec.monthlyDeduction || Math.round(amt / months);
      const startMonth = rec.deductionStartMonth || 'Sep 2026';

      const schedule: LoanRepaymentInstallment[] = Array.from({ length: months }).map((_, idx) => {
        return {
          installmentNumber: idx + 1,
          periodMonth: `${startMonth} +${idx}`,
          scheduledAmount: idx === months - 1 ? amt - (emi * (months - 1)) : emi,
          actualDeducted: 0,
          remainingBalance: Math.max(0, amt - (emi * (idx + 1))),
          status: 'Pending'
        };
      });

      return {
        ...rec,
        status: 'Active',
        disbursedAmount: amt,
        outstandingBalance: amt,
        disbursementDetails: {
          disbursedAt: details.disbursedDate,
          disbursedBy: officer,
          paymentMode: details.paymentMode,
          transactionRef: details.transactionRef,
          notes: details.notes
        },
        repaymentSchedule: schedule,
        auditLogs: [
          ...rec.auditLogs,
          {
            id: `LOG-${Date.now()}`,
            loanId: rec.id,
            action: 'Loan Disbursed',
            performedBy: officer,
            performedByRole: currentUser.role,
            timestamp: `${details.disbursedDate} 12:00 PM`,
            previousValue: 'Status: Approved',
            newValue: `Status: Active, Disbursed ₹${amt.toLocaleString('en-IN')} via ${details.paymentMode} Ref: ${details.transactionRef || 'N/A'}`
          }
        ]
      };
    }));
  };

  const recordManualRepayment = (id: string, repayment: {
    amount: number;
    repaymentDate: string;
    paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI' | 'NEFT' | 'Other';
    referenceNumber?: string;
    notes?: string;
  }) => {
    const recorder = `${currentUser.name} (${currentUser.role})`;

    setLoanRecords(prev => prev.map(rec => {
      if (rec.id !== id) return rec;

      const newBalance = Math.max(0, toNum(rec.outstandingBalance) - repayment.amount);
      const isClosed = newBalance === 0;

      const manualEntry: LoanManualRepayment = {
        id: `PAY-MAN-${Date.now()}`,
        loanId: rec.id,
        amount: repayment.amount,
        repaymentDate: repayment.repaymentDate,
        paymentMode: repayment.paymentMode,
        referenceNumber: repayment.referenceNumber,
        recordedBy: recorder,
        notes: repayment.notes
      };

      const updatedSchedule = rec.repaymentSchedule.map(inst => {
        if (inst.status === 'Pending' && inst.actualDeducted < inst.scheduledAmount) {
          return {
            ...inst,
            actualDeducted: inst.scheduledAmount,
            status: 'Deducted' as const,
            deductedAt: repayment.repaymentDate
          };
        }
        return inst;
      });

      return {
        ...rec,
        outstandingBalance: newBalance,
        status: isClosed ? 'Closed' : rec.status,
        manualRepayments: [...(rec.manualRepayments || []), manualEntry],
        repaymentSchedule: updatedSchedule,
        auditLogs: [
          ...rec.auditLogs,
          {
            id: `LOG-${Date.now()}`,
            loanId: rec.id,
            action: isClosed ? 'Loan Closed (Manual Repayment)' : 'Manual Repayment Added',
            performedBy: recorder,
            performedByRole: currentUser.role,
            timestamp: `${repayment.repaymentDate} 04:00 PM`,
            previousValue: `Outstanding: ₹${rec.outstandingBalance.toLocaleString('en-IN')}`,
            newValue: `Outstanding: ₹${newBalance.toLocaleString('en-IN')} (Paid ₹${repayment.amount.toLocaleString('en-IN')} via ${repayment.paymentMode})`
          }
        ]
      };
    }));
  };

  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setCompanyInfo(prev => {
      const updated = {
        ...prev,
        ...info,
        updatedAt: new Date().toISOString(),
        updatedBy: userDisplayName
      };
      addPolicyAuditLog({
        policyCategory: 'Company Details',
        policyId: 'COMP-ROOT',
        policyName: updated.companyName,
        action: 'EDIT',
        performedBy: currentUser.name,
        performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
        changeSummary: 'Company general details and profile updated.',
        oldValues: prev,
        newValues: updated
      });
      return updated;
    });
  };

  const addCompanyBranch = (branch: Omit<CompanyBranch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBranch: CompanyBranch = {
      ...branch,
      id: `BR-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setCompanyBranches(prev => [...prev, newBranch]);
    addPolicyAuditLog({
      policyCategory: 'Company Details',
      policyId: newBranch.id,
      policyName: newBranch.branchName,
      action: 'CREATE',
      performedBy: currentUser.name,
      performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
      changeSummary: `Created new branch: ${newBranch.branchName} (${newBranch.branchCode}).`
    });
  };

  const updateCompanyBranch = (id: string, updates: Partial<CompanyBranch>) => {
    setCompanyBranches(prev => prev.map(b => {
      if (b.id === id) {
        const updated = { ...b, ...updates, updatedAt: new Date().toISOString() };
        addPolicyAuditLog({
          policyCategory: 'Company Details',
          policyId: id,
          policyName: updated.branchName,
          action: 'EDIT',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `Updated branch details for ${updated.branchName}.`
        });
        return updated;
      }
      return b;
    }));
  };

  const deleteCompanyBranch = (id: string) => {
    const target = companyBranches.find(b => b.id === id);
    setCompanyBranches(prev => prev.filter(b => b.id !== id));
    if (target) {
      addPolicyAuditLog({
        policyCategory: 'Company Details',
        policyId: id,
        policyName: target.branchName,
        action: 'DEACTIVATE',
        performedBy: currentUser.name,
        performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
        changeSummary: `Removed branch: ${target.branchName}.`
      });
    }
  };

  const updateOrgStructure = (structure: Partial<OrganizationStructure>) => {
    setOrgStructure(prev => ({ ...prev, ...structure }));
  };

  // Attendance Policies
  const addMasterAttendancePolicy = (policy: Omit<AttendancePolicy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'>) => {
    const now = new Date().toISOString();
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    const newPolicy: AttendancePolicy = {
      ...policy,
      id: `AP-${Date.now()}`,
      version: 1,
      createdAt: now,
      createdBy: userDisplayName,
      updatedAt: now,
      updatedBy: userDisplayName
    };
    setMasterAttendancePolicies(prev => [newPolicy, ...prev]);
    addPolicyAuditLog({
      policyCategory: 'Attendance & Time',
      policyId: newPolicy.id,
      policyName: newPolicy.policyName,
      action: 'CREATE',
      performedBy: currentUser.name,
      performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
      changeSummary: `Created attendance policy "${newPolicy.policyName}" with ${newPolicy.lateRuleType} late rule.`
    });
  };

  const updateMasterAttendancePolicy = (id: string, updates: Partial<AttendancePolicy>) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setMasterAttendancePolicies(prev => prev.map(p => {
      if (p.id === id) {
        const updated = {
          ...p,
          ...updates,
          version: p.version + 1,
          updatedAt: new Date().toISOString(),
          updatedBy: userDisplayName
        };
        addPolicyAuditLog({
          policyCategory: 'Attendance & Time',
          policyId: id,
          policyName: updated.policyName,
          action: 'EDIT',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `Updated attendance policy "${updated.policyName}" (version ${updated.version}).`,
          oldValues: p,
          newValues: updated
        });
        return updated;
      }
      return p;
    }));
  };

  const archiveMasterAttendancePolicy = (id: string) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setMasterAttendancePolicies(prev => prev.map(p => {
      if (p.id === id) {
        const updated: AttendancePolicy = { ...p, status: 'Archived', updatedAt: new Date().toISOString(), updatedBy: userDisplayName };
        addPolicyAuditLog({
          policyCategory: 'Attendance & Time',
          policyId: id,
          policyName: p.policyName,
          action: 'ARCHIVE',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `Archived attendance policy "${p.policyName}". Historical payroll records preserved.`
        });
        return updated;
      }
      return p;
    }));
  };

  const toggleMasterAttendancePolicyStatus = (id: string) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setMasterAttendancePolicies(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active';
        const updated: AttendancePolicy = { ...p, status: nextStatus, updatedAt: new Date().toISOString(), updatedBy: userDisplayName };
        addPolicyAuditLog({
          policyCategory: 'Attendance & Time',
          policyId: id,
          policyName: p.policyName,
          action: nextStatus === 'Active' ? 'ACTIVATE' : 'DEACTIVATE',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `${nextStatus === 'Active' ? 'Activated' : 'Deactivated'} attendance policy "${p.policyName}".`
        });
        return updated;
      }
      return p;
    }));
  };

  // Missed Attendance Correction Flow
  const submitAttendanceCorrection = (req: Omit<AttendanceCorrectionRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newReq: AttendanceCorrectionRequest = {
      ...req,
      id: `ACR-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'Pending'
    };
    setAttendanceCorrections(prev => [newReq, ...prev]);
    triggerToast('Attendance correction request submitted to HR for review.');
  };

  const reviewAttendanceCorrection = (
    id: string, 
    decision: 'Approved' | 'Rejected', 
    comment?: string, 
    adjustedTime?: { checkIn?: string; checkOut?: string }
  ) => {
    const target = attendanceCorrections.find(c => c.id === id);
    if (!target) return;

    const reviewerName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : 'HR'})`;
    const now = new Date().toISOString();

    setAttendanceCorrections(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: decision,
          reviewedBy: reviewerName,
          reviewedAt: now,
          hrComment: comment || (decision === 'Approved' ? 'Approved by HR' : 'Rejected by HR'),
          adjustedCheckIn: adjustedTime?.checkIn || c.requestedCheckIn,
          adjustedCheckOut: adjustedTime?.checkOut || c.requestedCheckOut
        };
      }
      return c;
    }));

    // When Approved: The Attendance Record MUST Automatically Update!
    if (decision === 'Approved') {
      const checkInVal = adjustedTime?.checkIn || target.requestedCheckIn || '09:30';
      const checkOutVal = adjustedTime?.checkOut || target.requestedCheckOut || '18:30';

      setAttendanceRecords(prev => {
        const existingIdx = prev.findIndex(r => r.employeeId === target.employeeId && r.date === target.date);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            checkIn: checkInVal,
            checkOut: checkOutVal,
            status: 'Present',
            lateStatus: 'On Time',
            method: 'Manual Punch'
          };
          return updated;
        } else {
          // Create new record for the date if not exists
          const newAtt: AttendanceRecord = {
            id: `ATT-${Date.now()}`,
            employeeId: target.employeeId,
            employeeName: target.employeeName,
            department: target.department,
            date: target.date,
            checkIn: checkInVal,
            checkOut: checkOutVal,
            workingHours: 8.5,
            status: 'Present',
            lateStatus: 'On Time',
            location: {
              lat: 13.0827,
              lng: 80.2707,
              address: 'Head Office - Corrected by HR',
              inGeofence: true
            },
            faceVerified: true,
            method: 'Manual Punch'
          };
          return [newAtt, ...prev];
        }
      });

      triggerToast(`Correction Approved: Attendance for ${target.employeeName} updated to Check-in ${checkInVal}.`);
    } else {
      triggerToast(`Attendance correction request for ${target.employeeName} was rejected.`);
    }
  };

  // Master Leave Policies
  const addMasterLeavePolicy = (policy: Omit<MasterLeavePolicy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'>) => {
    const now = new Date().toISOString();
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    const newPolicy: MasterLeavePolicy = {
      ...policy,
      id: `LP-${Date.now()}`,
      version: 1,
      createdAt: now,
      createdBy: userDisplayName,
      updatedAt: now,
      updatedBy: userDisplayName
    };
    setMasterLeavePolicies(prev => [newPolicy, ...prev]);
    addPolicyAuditLog({
      policyCategory: 'Leave Management',
      policyId: newPolicy.id,
      policyName: newPolicy.policyName,
      action: 'CREATE',
      performedBy: currentUser.name,
      performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
      changeSummary: `Created master leave policy "${newPolicy.policyName}" with ${newPolicy.monthlyFreeUnpaidLeaves} free unpaid day(s).`
    });
  };

  const updateMasterLeavePolicy = (id: string, updates: Partial<MasterLeavePolicy>) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setMasterLeavePolicies(prev => prev.map(p => {
      if (p.id === id) {
        const updated = {
          ...p,
          ...updates,
          version: p.version + 1,
          updatedAt: new Date().toISOString(),
          updatedBy: userDisplayName
        };
        addPolicyAuditLog({
          policyCategory: 'Leave Management',
          policyId: id,
          policyName: updated.policyName,
          action: 'EDIT',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `Updated leave policy "${updated.policyName}" (version ${updated.version}).`,
          oldValues: p,
          newValues: updated
        });
        return updated;
      }
      return p;
    }));
  };

  const archiveMasterLeavePolicy = (id: string) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setMasterLeavePolicies(prev => prev.map(p => {
      if (p.id === id) {
        const updated: MasterLeavePolicy = { ...p, status: 'Archived', updatedAt: new Date().toISOString(), updatedBy: userDisplayName };
        addPolicyAuditLog({
          policyCategory: 'Leave Management',
          policyId: id,
          policyName: p.policyName,
          action: 'ARCHIVE',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `Archived leave policy "${p.policyName}". Historical records preserved.`
        });
        return updated;
      }
      return p;
    }));
  };

  const toggleMasterLeavePolicyStatus = (id: string) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setMasterLeavePolicies(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active';
        const updated: MasterLeavePolicy = { ...p, status: nextStatus, updatedAt: new Date().toISOString(), updatedBy: userDisplayName };
        addPolicyAuditLog({
          policyCategory: 'Leave Management',
          policyId: id,
          policyName: p.policyName,
          action: nextStatus === 'Active' ? 'ACTIVATE' : 'DEACTIVATE',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `${nextStatus === 'Active' ? 'Activated' : 'Deactivated'} leave policy "${p.policyName}".`
        });
        return updated;
      }
      return p;
    }));
  };

  // ==========================================
  // SANDWICH LEAVE POLICY ENGINE HANDLERS
  // ==========================================
  const createSandwichPolicy = (policyData: Omit<SandwichLeavePolicy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'>) => {
    const now = new Date().toISOString();
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    const newPolicy: SandwichLeavePolicy = {
      ...policyData,
      id: `SLP-${Date.now()}`,
      version: 1,
      createdAt: now,
      createdBy: userDisplayName,
      updatedAt: now,
      updatedBy: userDisplayName
    };

    setSandwichPolicies(prev => [newPolicy, ...prev]);

    addSandwichAuditLog({
      action: 'POLICY_CREATED',
      policyId: newPolicy.id,
      policyName: newPolicy.policyName,
      newValue: {
        sandwichRuleEnabled: newPolicy.sandwichRuleEnabled,
        weeklyOff: newPolicy.countWeeklyOffAsLeave,
        publicHoliday: newPolicy.countPublicHolidayAsLeave,
        condition: newPolicy.sandwichCondition,
        payType: newPolicy.payType,
        applicableLeaveTypes: newPolicy.applicableLeaveTypes
      },
      reason: `Created sandwich leave policy "${newPolicy.policyName}" (v1).`
    });

    addPolicyAuditLog({
      policyCategory: 'Leave Management',
      policyId: newPolicy.id,
      policyName: newPolicy.policyName,
      action: 'CREATE',
      performedBy: currentUser.name,
      performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
      changeSummary: `Created sandwich leave policy "${newPolicy.policyName}" (Condition: ${newPolicy.sandwichCondition}).`
    });
  };

  const updateSandwichPolicy = (id: string, updates: Partial<SandwichLeavePolicy>, reason?: string) => {
    const now = new Date().toISOString();
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;

    setSandwichPolicies(prev => prev.map(p => {
      if (p.id === id) {
        const nextVersion = p.version + 1;
        const updated: SandwichLeavePolicy = {
          ...p,
          ...updates,
          version: nextVersion,
          updatedAt: now,
          updatedBy: userDisplayName
        };

        addSandwichAuditLog({
          action: 'POLICY_UPDATED',
          policyId: id,
          policyName: updated.policyName,
          oldValue: { version: p.version, ruleEnabled: p.sandwichRuleEnabled, condition: p.sandwichCondition, payType: p.payType },
          newValue: { version: nextVersion, ruleEnabled: updated.sandwichRuleEnabled, condition: updated.sandwichCondition, payType: updated.payType },
          reason: reason || `Updated sandwich leave policy "${updated.policyName}" to version ${nextVersion}. Historical records preserved.`
        });

        addPolicyAuditLog({
          policyCategory: 'Leave Management',
          policyId: id,
          policyName: updated.policyName,
          action: 'EDIT',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `Updated sandwich policy "${updated.policyName}" to version ${nextVersion}.`,
          oldValues: p,
          newValues: updated
        });

        return updated;
      }
      return p;
    }));
  };

  const archiveSandwichPolicy = (id: string) => {
    const now = new Date().toISOString();
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;

    setSandwichPolicies(prev => prev.map(p => {
      if (p.id === id) {
        const updated: SandwichLeavePolicy = {
          ...p,
          status: 'Archived',
          updatedAt: now,
          updatedBy: userDisplayName
        };

        addSandwichAuditLog({
          action: 'POLICY_ARCHIVED',
          policyId: id,
          policyName: p.policyName,
          reason: `Archived sandwich policy "${p.policyName}". Historical approved records preserved.`
        });

        return updated;
      }
      return p;
    }));
  };

  const toggleSandwichPolicyStatus = (id: string) => {
    const now = new Date().toISOString();
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;

    setSandwichPolicies(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active';
        const updated: SandwichLeavePolicy = {
          ...p,
          status: nextStatus,
          updatedAt: now,
          updatedBy: userDisplayName
        };

        addSandwichAuditLog({
          action: nextStatus === 'Active' ? 'POLICY_ACTIVATED' : 'POLICY_DEACTIVATED',
          policyId: id,
          policyName: p.policyName,
          reason: `${nextStatus === 'Active' ? 'Activated' : 'Deactivated'} sandwich leave policy.`
        });

        return updated;
      }
      return p;
    }));
  };

  const deleteSandwichPolicy = (id: string) => {
    setSandwichPolicies(prev => prev.filter(p => p.id !== id));
  };

  const computeSandwichCalculation = (params: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
  }): SandwichCalculationResult => {
    const emp = employees.find(e => e.employeeId === params.employeeId) || employees[0];
    return calculateSandwichLeave({
      employee: emp,
      leaveType: params.leaveType,
      startDate: params.startDate,
      endDate: params.endDate,
      policies: sandwichPolicies,
      holidays: holidayPolicies,
      existingLeaves: leaveRequests,
      weeklyOffSchedule: emp.shiftDetails?.weeklyOff
    });
  };

  const overrideSandwichCalculation = (leaveRequestId: string, overrideData: {
    excludedDates?: string[];
    includedDates?: string[];
    adjustedPayType?: SandwichPayType;
    adjustedDaysCount?: number;
    internalReason: string;
  }) => {
    const now = new Date().toISOString();
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;

    setLeaveRequests(prev => prev.map(l => {
      if (l.id === leaveRequestId) {
        const origSandwichDays = l.sandwichDays || 0;
        const origTotal = l.daysCount;
        
        let newBreakdown = l.sandwichDetails?.breakdown ? [...l.sandwichDetails.breakdown] : [];
        const excluded = overrideData.excludedDates || [];
        const included = overrideData.includedDates || [];

        newBreakdown = newBreakdown.map(b => {
          if (excluded.includes(b.date)) {
            return {
              ...b,
              isSandwich: false,
              dayType: b.dayType === 'SANDWICH_LEAVE' ? ('WEEKLY_OFF' as const) : b.dayType,
              reason: 'Manually excluded by HR override'
            };
          }
          if (included.includes(b.date)) {
            return {
              ...b,
              isSandwich: true,
              dayType: 'SANDWICH_LEAVE' as const,
              reason: 'Manually included by HR override'
            };
          }
          if (overrideData.adjustedPayType) {
            return {
              ...b,
              isPaid: overrideData.adjustedPayType === 'PAID_LEAVE' ? true : (overrideData.adjustedPayType === 'UNPAID_LEAVE' ? false : b.isPaid)
            };
          }
          return b;
        });

        const newSandwichCount = newBreakdown.filter(b => b.isSandwich).length;
        const appliedCount = newBreakdown.filter(b => b.dayType === 'APPLIED_LEAVE').length;
        const newTotalDays = overrideData.adjustedDaysCount !== undefined ? overrideData.adjustedDaysCount : (appliedCount + newSandwichCount);
        const newUnpaidSandwich = newBreakdown.filter(b => b.isSandwich && !b.isPaid).length;

        const hrOverride: HROverrideDetails = {
          isOverridden: true,
          overriddenBy: userDisplayName,
          overriddenAt: now,
          originalSandwichDays: origSandwichDays,
          originalTotalDays: origTotal,
          adjustedDaysCount: newTotalDays,
          excludedDates: excluded,
          includedDates: included,
          adjustedPayType: overrideData.adjustedPayType,
          internalReason: overrideData.internalReason
        };

        const updatedRequest: LeaveRequest = {
          ...l,
          daysCount: newTotalDays,
          sandwichDays: newSandwichCount,
          unpaidSandwichDays: newUnpaidSandwich,
          isSandwichApplied: newSandwichCount > 0,
          hrOverride,
          sandwichDetails: l.sandwichDetails ? {
            ...l.sandwichDetails,
            sandwichDays: newSandwichCount,
            totalDays: newTotalDays,
            breakdown: newBreakdown,
            payTypeApplied: overrideData.adjustedPayType || l.sandwichDetails.payTypeApplied
          } : undefined
        };

        addSandwichAuditLog({
          action: 'HR_OVERRIDE',
          leaveRequestId,
          employeeId: l.employeeId,
          oldValue: { originalDaysCount: origTotal, originalSandwichDays: origSandwichDays },
          newValue: { adjustedDaysCount: newTotalDays, adjustedSandwichDays: newSandwichCount, excluded, included, payType: overrideData.adjustedPayType },
          reason: overrideData.internalReason
        });

        return updatedRequest;
      }
      return l;
    }));

    triggerToast('HR Override successfully applied to leave calculation.');
  };

  // Payroll Settings Config
  const updatePayrollSettingsConfig = (config: Partial<PayrollSettingsConfig>) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setPayrollSettingsConfig(prev => {
      const updated = {
        ...prev,
        ...config,
        updatedAt: new Date().toISOString(),
        updatedBy: userDisplayName
      };
      addPolicyAuditLog({
        policyCategory: 'Payroll Settings',
        policyId: 'PAYROLL-MASTER-CONFIG',
        policyName: 'Global Payroll Policy & Components',
        action: 'EDIT',
        performedBy: currentUser.name,
        performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
        changeSummary: 'Updated global payroll components and formula rules.',
        oldValues: prev,
        newValues: updated
      });
      return updated;
    });
  };

  const toggleSalaryComponent = (code: string) => {
    setPayrollSettingsConfig(prev => ({
      ...prev,
      components: prev.components.map(c => c.code === code ? { ...c, active: !c.active } : c),
      updatedAt: new Date().toISOString()
    }));
  };

  // Rewards & Recognition
  const addRewardPolicy = (policy: Omit<RewardPolicy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'>) => {
    const now = new Date().toISOString();
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    const newPolicy: RewardPolicy = {
      ...policy,
      id: `RP-${Date.now()}`,
      version: 1,
      createdAt: now,
      createdBy: userDisplayName,
      updatedAt: now,
      updatedBy: userDisplayName
    };
    setRewardPolicies(prev => [newPolicy, ...prev]);
    addPolicyAuditLog({
      policyCategory: 'Rewards & Recognition',
      policyId: newPolicy.id,
      policyName: newPolicy.rewardName,
      action: 'CREATE',
      performedBy: currentUser.name,
      performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
      changeSummary: `Created reward policy "${newPolicy.rewardName}" (${newPolicy.valueType === 'FIXED_AMOUNT' ? `₹${newPolicy.amountValue}` : newPolicy.valueType}, Add to Payroll: ${newPolicy.addToPayroll ? 'Yes' : 'No'}).`
    });
  };

  const updateRewardPolicy = (id: string, updates: Partial<RewardPolicy>) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setRewardPolicies(prev => prev.map(p => {
      if (p.id === id) {
        const updated = {
          ...p,
          ...updates,
          version: p.version + 1,
          updatedAt: new Date().toISOString(),
          updatedBy: userDisplayName
        };
        addPolicyAuditLog({
          policyCategory: 'Rewards & Recognition',
          policyId: id,
          policyName: updated.rewardName,
          action: 'EDIT',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `Updated reward policy "${updated.rewardName}".`,
          oldValues: p,
          newValues: updated
        });
        return updated;
      }
      return p;
    }));
  };

  const archiveRewardPolicy = (id: string) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setRewardPolicies(prev => prev.map(p => {
      if (p.id === id) {
        const updated: RewardPolicy = { ...p, status: 'Archived', updatedAt: new Date().toISOString(), updatedBy: userDisplayName };
        addPolicyAuditLog({
          policyCategory: 'Rewards & Recognition',
          policyId: id,
          policyName: p.rewardName,
          action: 'ARCHIVE',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `Archived reward policy "${p.rewardName}".`
        });
        return updated;
      }
      return p;
    }));
  };

  const toggleRewardPolicyStatus = (id: string) => {
    const userDisplayName = `${currentUser.name} (${currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role})`;
    setRewardPolicies(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active';
        const updated: RewardPolicy = { ...p, status: nextStatus, updatedAt: new Date().toISOString(), updatedBy: userDisplayName };
        addPolicyAuditLog({
          policyCategory: 'Rewards & Recognition',
          policyId: id,
          policyName: p.rewardName,
          action: nextStatus === 'Active' ? 'ACTIVATE' : 'DEACTIVATE',
          performedBy: currentUser.name,
          performedByRole: currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role,
          changeSummary: `${nextStatus === 'Active' ? 'Activated' : 'Deactivated'} reward policy "${p.rewardName}".`
        });
        return updated;
      }
      return p;
    }));
  };

  const grantRewardToEmployee = (grant: Omit<EmployeeRewardRecord, 'id' | 'grantedDate' | 'payrollStatus'>) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newRecord: EmployeeRewardRecord = {
      ...grant,
      id: `ERR-${Date.now()}`,
      grantedDate: dateStr,
      payrollStatus: 'Pending'
    };
    setEmployeeRewardRecords(prev => [newRecord, ...prev]);
    triggerToast(`Award granted: "${grant.rewardName}" for ${grant.employeeName}${grant.addToPayroll ? ' (Queued for Next Payroll)' : ''}!`);
  };

  const [grades, setGrades] = useState<GradeItem[]>(INITIAL_GRADES);

  const [employmentTypes, setEmploymentTypes] = useState<EmploymentTypeItem[]>(INITIAL_EMPLOYMENT_TYPES);

  const [employeeCategories, setEmployeeCategories] = useState<EmployeeCategoryItem[]>(INITIAL_EMPLOYEE_CATEGORIES);

  const [employeeConfig, setEmployeeConfig] = useState<EmployeeConfigSettings>(INITIAL_EMPLOYEE_CONFIG);

  const [approvalWorkflows, setApprovalWorkflows] = useState<ApprovalWorkflowItem[]>(INITIAL_APPROVAL_WORKFLOWS);

  const [notificationTriggers, setNotificationTriggers] = useState<NotificationTriggerConfig[]>(INITIAL_NOTIFICATION_TRIGGERS);

  const [generalSystemConfig, setGeneralSystemConfig] = useState<GeneralSystemConfig>(INITIAL_GENERAL_SYSTEM_CONFIG);

  const [integrationsConfig, setIntegrationsConfig] = useState<IntegrationsConfig>(INITIAL_INTEGRATIONS_CONFIG);

  // Dynamic Performance Score Integration:
  // Dynamically recalculate task completion rates and overall scores from live enhanced tasks
  useEffect(() => {
    setPerformanceScores(prev => prev.map(p => {
      const metrics = calculateEmployeeTaskMetrics(p.employeeId, enhancedTasks);
      if (metrics.totalAssigned === 0) return p;

      const compScore = (metrics.completionRate * taskWeights.taskCompletionWeight) / 100;
      const onTimeScore = (metrics.onTimeCompletionRate * taskWeights.onTimeCompletionWeight) / 100;
      const attScore = (p.attendanceScore * taskWeights.attendanceWeight) / 100;
      const managerScore = ((p.managerRating / 5) * 100 * taskWeights.managerRatingWeight) / 100;
      const goalScore = (p.goalAchievement * taskWeights.goalAchievementWeight) / 100;

      const newOverallScore = Math.min(100, Math.max(0, Math.round(compScore + onTimeScore + attScore + managerScore + goalScore)));

      return {
        ...p,
        taskCompletionRate: metrics.completionRate,
        overallScore: newOverallScore
      };
    }));
  }, [enhancedTasks, taskWeights]);

  // Role Switching Engine supporting all HRMS and Task Management roles
  const switchRole = (newRole: Role) => {
    let name = 'Velmurugan';
    let email = 'ceo@vrmstructures.com';
    let empId = 'EMP-000';
    let dept = 'Management';
    let desig = 'CEO';
    let avatar = '';

    if (newRole === 'Super Admin' || newRole === 'Management') {
      name = 'Velmurugan';
      email = 'ceo@vrmstructures.com';
      empId = 'EMP-000';
      dept = 'Management';
      desig = 'CEO';
      avatar = '';
    } else if (newRole === 'HR Admin') {
      name = 'Pavithra';
      email = 'hr@vrmstructures.com';
      empId = 'EMP-001';
      dept = 'Human Resources';
      desig = 'HR Manager';
      avatar = '';
    } else if (newRole === 'Department Manager' || newRole === 'Department Head') {
      name = 'Ramesh Kumar';
      email = 'ramesh.ph@vrmstructures.com';
      empId = 'EMP-002';
      dept = 'Production Head';
      desig = 'Production Head';
      avatar = '';
    } else if (newRole === 'Employee' || newRole === 'Assignee') {
      name = 'Murugan S';
      email = 'murugan.fe@vrmstructures.com';
      empId = 'EMP-005';
      dept = 'Floor Employee';
      desig = 'Floor Employee';
      avatar = '';
    } else if (newRole === 'Finance Manager' || newRole === 'Responsible Person' || newRole === 'Manager') {
      name = 'Priya Natarajan';
      email = 'priya.ah@vrmstructures.com';
      empId = 'EMP-007';
      dept = 'Accounts Head';
      desig = 'Accounts Head';
      avatar = '';
    } else if (newRole === 'Task Creator') {
      name = 'Dinesh Kumar';
      email = 'dinesh.se@vrmstructures.com';
      empId = 'EMP-009';
      dept = 'Sales Executive';
      desig = 'Sales Executive';
      avatar = '';
    } else if (newRole === 'ERP Administrator') {
      name = 'Arvind Babu';
      email = 'arvind.ta@vrmstructures.com';
      empId = 'EMP-013';
      dept = 'Technical Administrator';
      desig = 'Technical Administrator';
      avatar = '';
    }

    setCurrentUser({
      id: 'USR-' + Date.now(),
      name,
      email,
      role: newRole,
      avatar,
      department: dept,
      designation: desig,
      employeeId: empId
    });
  };

  // RBAC Permission Check
  const hasPermission = (module: ModuleName, action: PermissionAction): boolean => {
    if (module === 'profile') return true;
    if (module === 'settings' && action === 'view') return true;
    if (module === 'overtime' && (action === 'view' || action === 'create')) return true;
    if (module === 'overtime' && action === 'approve') {
      return (
        currentUser.role === 'CEO' ||
        currentUser.role === 'Super Admin' ||
        currentUser.role === 'HR Admin' ||
        currentUser.role === 'HR Manager' ||
        currentUser.role === 'Department Manager' ||
        currentUser.role === 'Department Head' ||
        currentUser.role === 'Management' ||
        currentUser.role === 'ERP Administrator'
      );
    }

    // Finance Employee / Accounts Head access: full access to view and export payroll
    const isFinanceStaff = 
      currentUser.role === 'Finance Manager' ||
      (currentUser.department && currentUser.department.toLowerCase().includes('finance')) ||
      (currentUser.department && currentUser.department.toLowerCase().includes('accounts')) ||
      (currentUser.designation && currentUser.designation.toLowerCase().includes('accounts')) ||
      (currentUser.designation && currentUser.designation.toLowerCase().includes('finance'));

    if (isFinanceStaff && module === 'payroll' && (action === 'view' || action === 'export')) {
      return true;
    }

    const rolePermissions = permissionMatrix[currentUser.role];
    if (!rolePermissions) return false;
    const actions = rolePermissions[module];
    return actions ? actions.includes(action) : false;
  };

  const updatePermission = (role: Role, module: ModuleName, action: PermissionAction, enabled: boolean) => {
    setPermissionMatrix(prev => {
      const copy = { ...prev };
      const roleMods = { ...copy[role] };
      const currentActions = roleMods[module] ? [...roleMods[module]] : [];

      if (enabled && !currentActions.includes(action)) {
        currentActions.push(action);
      } else if (!enabled && currentActions.includes(action)) {
        const idx = currentActions.indexOf(action);
        currentActions.splice(idx, 1);
      }

      roleMods[module] = currentActions;
      copy[role] = roleMods;
      return copy;
    });
  };

  // Validation & Safety Helpers
  const canDeleteEmployee = (idOrEmpId: string): { canDelete: boolean; reason?: string } => {
    const emp = employees.find(e => e.id === idOrEmpId || e.employeeId === idOrEmpId);
    if (!emp) return { canDelete: true };
    const empId = emp.employeeId || emp.id;

    // 1. Check corporate assets assigned
    const assignedAssets = assets.filter(a => a.assignedEmployeeId === empId || a.assignedEmployeeId === emp.id);
    if (assignedAssets.length > 0) {
      return { 
        canDelete: false, 
        reason: `Cannot delete ${emp.firstName} ${emp.lastName}: Employee has ${assignedAssets.length} active corporate asset(s) assigned (${assignedAssets.map(a => a.name).join(', ')}). Please unassign assets first.` 
      };
    }

    // 2. Check pending / open tasks
    const activeTasks = tasks.filter(t => t.assignedEmployeeId === empId && t.status !== 'Completed');
    if (activeTasks.length > 0) {
      return { 
        canDelete: false, 
        reason: `Cannot delete ${emp.firstName} ${emp.lastName}: Employee has ${activeTasks.length} open task(s) assigned. Please reassign or complete tasks first.` 
      };
    }

    // 3. Check active advance salary loans
    const activeAdv = loanRecords.find((a) => 
      (a.employeeId === empId || a.employeeId === emp.id) && 
      (a.status === 'Disbursed' || a.status === 'Approved' || a.status === 'Active')
    );
    if (activeAdv) {
      return {
        canDelete: false,
        reason: `Cannot delete ${emp.firstName} ${emp.lastName}: Employee has an active advance salary request (${activeAdv.id} - ${activeAdv.status}).`
      };
    }

    return { canDelete: true };
  };

  const canDeleteDepartment = (idOrName: string): { canDelete: boolean; reason?: string } => {
    const dept = departments.find(d => d.id === idOrName || d.name === idOrName);
    const deptName = dept ? dept.name : idOrName;
    const assignedEmps = employees.filter(e => (e.department || '').toLowerCase() === deptName.toLowerCase());
    if (assignedEmps.length > 0) {
      return {
        canDelete: false,
        reason: `Cannot delete department "${deptName}": ${assignedEmps.length} employee(s) belong to this department (${assignedEmps.slice(0, 3).map(e => `${e.firstName} ${e.lastName}`).join(', ')}${assignedEmps.length > 3 ? '...' : ''}). Please reassign employees first.`
      };
    }
    return { canDelete: true };
  };

  const canDeleteBranch = (idOrName: string): { canDelete: boolean; reason?: string } => {
    const branch = branches.find(b => b.id === idOrName || b.name === idOrName);
    const branchName = branch ? branch.name : idOrName;
    const assignedEmps = employees.filter(e => (e.workLocation || '').toLowerCase().includes(branchName.toLowerCase()) || branchName.toLowerCase().includes((e.workLocation || '').toLowerCase()));
    if (assignedEmps.length > 0) {
      return {
        canDelete: false,
        reason: `Cannot delete branch "${branchName}": ${assignedEmps.length} employee(s) are stationed at this location. Please reassign employees first.`
      };
    }
    return { canDelete: true };
  };

  const canDeleteShift = (idOrName: string): { canDelete: boolean; reason?: string } => {
    const shift = shifts.find(s => s.id === idOrName || s.shiftName === idOrName);
    const shiftName = shift ? shift.shiftName : idOrName;
    const assignedEmps = employees.filter(e => (e.workShift || '').toLowerCase().includes(shiftName.toLowerCase()) || shiftName.toLowerCase().includes((e.workShift || '').toLowerCase()));
    if (assignedEmps.length > 0) {
      return {
        canDelete: false,
        reason: `Cannot delete shift "${shiftName}": ${assignedEmps.length} employee(s) are assigned to this shift roster. Please reassign employees first.`
      };
    }
    return { canDelete: true };
  };

  const canDeleteDesignation = (idOrTitle: string): { canDelete: boolean; reason?: string } => {
    const desig = designations.find(d => d.id === idOrTitle || d.title === idOrTitle);
    const title = desig ? desig.title : idOrTitle;
    const assignedEmps = employees.filter(e => (e.designation || '').toLowerCase() === title.toLowerCase());
    if (assignedEmps.length > 0) {
      return {
        canDelete: false,
        reason: `Cannot delete designation "${title}": ${assignedEmps.length} employee(s) currently hold this title. Please reassign designations first.`
      };
    }
    return { canDelete: true };
  };

  // Actions
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const rawPrefix = businessSettings?.employeeCodePrefix || 'EMP';
    const cleanPrefix = rawPrefix.endsWith('-') ? rawPrefix.slice(0, -1) : rawPrefix;
    const newId = empData.employeeId && empData.employeeId.trim().length > 0
      ? empData.employeeId.trim()
      : `${cleanPrefix}-${(employees.length + 1).toString().padStart(3, '0')}`;
    const newEmp: Employee = { ...empData, id: newId, employeeId: newId };
    setEmployees(prev => [newEmp, ...prev]);

    // Also add to default attendance record
    const today = new Date().toISOString().split('T')[0];
    const newAtt: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: newId,
      employeeName: `${newEmp.firstName} ${newEmp.lastName}`,
      department: newEmp.department,
      date: today,
      checkIn: null,
      checkOut: null,
      workingHours: 0,
      status: 'Absent',
      lateStatus: 'N/A',
      location: { lat: 37.7749, lng: -122.4194, address: 'HQ Building', inGeofence: true },
      faceVerified: false,
      method: 'System Auto'
    };
    setAttendanceRecords(prev => [newAtt, ...prev]);

    addNotification({
      title: 'New Employee Onboarded',
      message: `${newEmp.firstName} ${newEmp.lastName} has joined the ${newEmp.department} department (${newEmp.designation}).`,
      priority: 'Normal',
      category: 'Announcement'
    });
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...empData } : e));
  };

  const deleteEmployee = (id: string): { success: boolean; message?: string } => {
    const check = canDeleteEmployee(id);
    if (!check.canDelete) {
      return { success: false, message: check.reason };
    }
    setEmployees(prev => prev.filter(e => e.id !== id && e.employeeId !== id));
    return { success: true };
  };

  // Helper for time calculation
  const parseTimeToMinutes = (timeStr: string | null | undefined): number => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  };

  const markAttendance = (
    empId: string,
    status: AttendanceRecord['status'],
    method: AttendanceRecord['method'],
    location?: AttendanceRecord['location']
  ) => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nowTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const emp = employees.find(e => e.id === empId || e.employeeId === empId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
    const dept = emp ? emp.department : 'General';

    // Calculate shift timing & late status
    const empShift = shifts.find(s => s.shiftName === emp?.workShift) || shifts[0];
    const shiftStartMins = empShift ? parseTimeToMinutes(empShift.startTime) : 9 * 60; // 09:00 default
    const graceMins = empShift?.gracePeriodMins ?? (attendanceConfig?.lateGraceMinutes ?? 15);
    const checkInMins = parseTimeToMinutes(nowTime);

    let calculatedLateStatus: AttendanceRecord['lateStatus'] = 'On Time';
    let calculatedStatus = status;

    if (checkInMins > shiftStartMins + graceMins) {
      if (checkInMins <= shiftStartMins + 30) {
        calculatedLateStatus = 'Late (<30m)';
      } else {
        calculatedLateStatus = 'Severely Late';
      }
      if (calculatedStatus === 'Present') {
        calculatedStatus = 'Late';
      }
    }

    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(a => a.employeeId === empId && a.date === today);
      if (existingIdx >= 0) {
        const copy = [...prev];
        const existingCheckIn = copy[existingIdx].checkIn || nowTime;
        const inMins = parseTimeToMinutes(existingCheckIn);
        const outMins = parseTimeToMinutes(nowTime);
        const workedHours = existingCheckIn 
          ? Math.max(0.5, Math.round(((outMins - inMins) / 60) * 10) / 10)
          : (status === 'Present' ? 8 : 4);

        copy[existingIdx] = {
          ...copy[existingIdx],
          checkIn: existingCheckIn,
          checkOut: copy[existingIdx].checkIn ? nowTime : null,
          status: calculatedStatus,
          lateStatus: copy[existingIdx].lateStatus || calculatedLateStatus,
          method,
          location: location || copy[existingIdx].location,
          workingHours: workedHours
        };
        return copy;
      } else {
        const newRecord: AttendanceRecord = {
          id: `ATT-${Date.now()}`,
          employeeId: empId,
          employeeName: empName,
          department: dept,
          date: today,
          checkIn: nowTime,
          checkOut: null,
          workingHours: 8,
          status: calculatedStatus,
          lateStatus: calculatedLateStatus,
          location: location || { lat: 13.151968, lng: 80.2086053, address: 'HQ Office', inGeofence: true },
          faceVerified: method === 'Face Recognition',
          method
        };
        return [newRecord, ...prev];
      }
    });
  };

  const addFaceLog = (log: Omit<FaceLog, 'id'>) => {
    const newLog: FaceLog = { ...log, id: `FL-${Date.now()}` };
    setFaceLogs(prev => [newLog, ...prev]);
  };

  const applyLeave = (req: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const emp = employees.find(e => e.employeeId === req.employeeId) || employees[0];

    // Evaluate sandwich calculation dynamically
    const sandwichCalc: SandwichCalculationResult = req.sandwichDetails || calculateSandwichLeave({
      employee: emp,
      leaveType: req.leaveType,
      startDate: req.startDate,
      endDate: req.endDate,
      policies: sandwichPolicies,
      holidays: holidayPolicies,
      existingLeaves: leaveRequests,
      weeklyOffSchedule: emp.shiftDetails?.weeklyOff
    });

    const isSandwich = sandwichCalc.isSandwichApplied;
    const finalDaysCount = sandwichCalc.totalDays || req.daysCount;
    const sandwichDays = sandwichCalc.sandwichDays || 0;
    const unpaidSandwich = sandwichCalc.breakdown.filter(b => b.isSandwich && !b.isPaid).length;

    const newReq: LeaveRequest = {
      ...req,
      id: `LR-${Date.now()}`,
      status: 'Pending',
      appliedDate: today,
      daysCount: finalDaysCount,
      sandwichDetails: sandwichCalc,
      isSandwichApplied: isSandwich,
      sandwichDays,
      unpaidSandwichDays: unpaidSandwich,
      paidDaysCount: sandwichCalc.paidDays,
      unpaidDaysCount: sandwichCalc.unpaidDays
    };

    setLeaveRequests(prev => [newReq, ...prev]);

    if (isSandwich) {
      addSandwichAuditLog({
        action: 'SANDWICH_RULE_APPLIED',
        leaveRequestId: newReq.id,
        employeeId: req.employeeId,
        policyId: sandwichCalc.appliedPolicyId,
        policyName: sandwichCalc.appliedPolicyName,
        newValue: {
          appliedLeaveDays: sandwichCalc.appliedLeaveDays,
          sandwichDays: sandwichCalc.sandwichDays,
          totalDays: finalDaysCount,
          payType: sandwichCalc.payTypeApplied
        },
        reason: `Sandwich policy applied for ${req.employeeName} (${req.startDate} to ${req.endDate}).`
      });
    }

    addNotification({
      title: 'New Leave Request',
      message: `${req.employeeName} applied for ${finalDaysCount} days (${sandwichDays > 0 ? `${sandwichDays} sandwich days included, ` : ''}${req.leaveType}).`,
      priority: 'Important',
      category: 'Leave'
    });
  };

  const approveLeave = (id: string, approvedBy: string) => {
    setLeaveRequests(prev => prev.map(l => {
      if (l.id === id) {
        // Automatically sync attendance for all dates in range without duplicates
        const datesToSync: { date: string; isSandwich: boolean }[] = [];

        if (l.sandwichDetails?.breakdown && l.sandwichDetails.breakdown.length > 0) {
          l.sandwichDetails.breakdown.forEach((b: SandwichCalculationDayDetail) => {
            datesToSync.push({ date: b.date, isSandwich: b.isSandwich });
          });
        } else {
          const start = new Date(l.startDate);
          const end = new Date(l.endDate);
          const cur = new Date(start);
          while (cur <= end) {
            datesToSync.push({ date: cur.toISOString().split('T')[0], isSandwich: false });
            cur.setDate(cur.getDate() + 1);
          }
        }

        setAttendanceRecords(attPrev => {
          const updated = [...attPrev];
          datesToSync.forEach(item => {
            const idx = updated.findIndex(a => a.employeeId === l.employeeId && a.date === item.date);
            const statusLabel = 'On Leave';
            const locationNote = item.isSandwich ? 'Sandwich Leave (Policy Enforced)' : 'Approved Leave';

            if (idx >= 0) {
              updated[idx] = {
                ...updated[idx],
                status: statusLabel,
                lateStatus: 'N/A',
                location: {
                  lat: updated[idx].location?.lat ?? 13.151968,
                  lng: updated[idx].location?.lng ?? 80.2086053,
                  inGeofence: updated[idx].location?.inGeofence ?? false,
                  address: locationNote
                }
              };
            } else {
              updated.push({
                id: `ATT-LV-${Date.now()}-${item.date}`,
                employeeId: l.employeeId,
                employeeName: l.employeeName,
                department: l.department,
                date: item.date,
                checkIn: null,
                checkOut: null,
                workingHours: 0,
                status: statusLabel,
                lateStatus: 'N/A',
                location: { lat: 13.151968, lng: 80.2086053, address: locationNote, inGeofence: true },
                faceVerified: false,
                method: 'System Auto'
              });
            }
          });
          return updated;
        });

        addSandwichAuditLog({
          action: 'LEAVE_APPROVED',
          leaveRequestId: l.id,
          employeeId: l.employeeId,
          policyId: l.sandwichDetails?.appliedPolicyId,
          newValue: { approvedBy, daysCount: l.daysCount },
          reason: `Leave request approved by ${approvedBy}. Attendance calendar updated.`
        });

        return { ...l, status: 'Approved', approvedBy };
      }
      return l;
    }));

    addNotification({
      title: 'Leave Request Approved',
      message: `Your leave request has been approved by ${approvedBy}.`,
      priority: 'Normal',
      category: 'Leave'
    });
  };

  const rejectLeave = (id: string, approvedBy: string, comment?: string) => {
    setLeaveRequests(prev => prev.map(l => {
      if (l.id === id) {
        addSandwichAuditLog({
          action: 'LEAVE_REJECTED',
          leaveRequestId: l.id,
          employeeId: l.employeeId,
          reason: comment || `Leave request rejected by ${approvedBy}.`
        });
        return { ...l, status: 'Rejected', approvedBy, comment };
      }
      return l;
    }));
  };

  const addShift = (shiftData: Omit<Shift, 'id' | 'assignedEmployeeCount'>) => {
    const newShift: Shift = {
      ...shiftData,
      id: `SH-${Date.now()}`,
      assignedEmployeeCount: shiftData.assignments.length
    };
    setShifts(prev => [...prev, newShift]);
  };

  const updateShift = (id: string, updates: Partial<Shift>) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  // Policy Management Methods
  const addLeavePolicy = (policyData: Omit<LeavePolicyItem, 'id'>) => {
    const newPolicy: LeavePolicyItem = {
      ...policyData,
      id: `lp-${Date.now()}`
    };
    setLeavePolicies(prev => [...prev, newPolicy]);
  };

  const updateLeavePolicy = (id: string, updates: Partial<LeavePolicyItem>) => {
    setLeavePolicies(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteLeavePolicy = (id: string) => {
    setLeavePolicies(prev => prev.filter(p => p.id !== id));
  };

  const addHolidayPolicy = (holidayData: Omit<HolidayItem, 'id'>) => {
    const newHoliday: HolidayItem = {
      ...holidayData,
      id: `hp-${Date.now()}`
    };
    setHolidayPolicies(prev => [...prev, newHoliday]);
  };

  const updateHolidayPolicy = (id: string, updates: Partial<HolidayItem>) => {
    setHolidayPolicies(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHolidayPolicy = (id: string) => {
    setHolidayPolicies(prev => prev.filter(h => h.id !== id));
  };

  const addAttendancePolicy = (policyData: Omit<AttendancePolicyItem, 'id'>) => {
    const newPolicy: AttendancePolicyItem = {
      ...policyData,
      id: `ap-${Date.now()}`
    };
    setAttendancePolicies(prev => [...prev, newPolicy]);
  };

  const updateAttendancePolicy = (id: string, updates: Partial<AttendancePolicyItem>) => {
    setAttendancePolicies(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteAttendancePolicy = (id: string) => {
    setAttendancePolicies(prev => prev.filter(p => p.id !== id));
  };

  const addWeeklySchedule = (scheduleData: Omit<WeeklyScheduleItem, 'id'>) => {
    const newSchedule: WeeklyScheduleItem = {
      ...scheduleData,
      id: `wp-${Date.now()}`
    };
    setWeeklySchedules(prev => [...prev, newSchedule]);
  };

  const updateWeeklySchedule = (id: string, updates: Partial<WeeklyScheduleItem>) => {
    setWeeklySchedules(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWeeklySchedule = (id: string) => {
    setWeeklySchedules(prev => prev.filter(w => w.id !== id));
  };

  const updateAttendanceConfig = (updates: Partial<GlobalAttendanceConfig>) => {
    setAttendanceConfig(prev => ({ ...prev, ...updates }));
  };

  const addPolicyDocument = (docData: Omit<PolicyDocumentItem, 'id'>) => {
    const newDoc: PolicyDocumentItem = {
      ...docData,
      id: `p-${Date.now()}`
    };
    setPolicyDocuments(prev => [...prev, newDoc]);
  };

  const updatePolicyDocument = (id: string, updates: Partial<PolicyDocumentItem>) => {
    setPolicyDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deletePolicyDocument = (id: string) => {
    setPolicyDocuments(prev => prev.filter(d => d.id !== id));
  };

  const updateBusinessSettings = (updates: Partial<BusinessProfileSettings>) => {
    setBusinessSettings(prev => ({ ...prev, ...updates }));
  };

  const requestShiftChange = (req: Omit<ShiftRequest, 'id' | 'status'>) => {
    const newReq: ShiftRequest = {
      ...req,
      id: `SR-${Date.now()}`,
      status: 'Pending'
    };
    setShiftRequests(prev => [newReq, ...prev]);
  };

  const approveShiftRequest = (id: string, approvedBy: string) => {
    setShiftRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved', approvedBy } : r));
  };

  const addTask = (tsk: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...tsk,
      id: `TSK-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);

    addNotification({
      title: 'New Task Assigned',
      message: `Task "${tsk.title}" assigned to ${tsk.assignedEmployeeName}.`,
      priority: tsk.priority === 'Urgent' ? 'Urgent' : 'Normal',
      category: 'Task'
    });
  };

  const updateTaskStatus = (id: string, status: TaskItem['status']) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        // Boost employee performance score on completion!
        if (status === 'Completed') {
          setPerformanceScores(perfPrev => perfPrev.map(p => {
            if (p.employeeId === t.assignedEmployeeId) {
              const newComp = Math.min(100, p.taskCompletionRate + 4);
              const newScore = Math.min(100, p.overallScore + 2);
              return { ...p, taskCompletionRate: newComp, overallScore: newScore };
            }
            return p;
          }));
        }
        return { ...t, status };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setEnhancedTasks(prev => prev.filter(t => t.id !== id));
  };

  // ─────────────────────────────────────────────────────────────
  // Enterprise Enhanced Task Handlers
  // ─────────────────────────────────────────────────────────────

  const createEnhancedTask = (
    taskData: Omit<TaskItemEnhanced, 'id' | 'taskNumber' | 'overallProgress' | 'overallStatus' | 'updates' | 'comments' | 'attachments' | 'timeline' | 'auditLogs' | 'createdAt' | 'updatedAt'> & Partial<Pick<TaskItemEnhanced, 'assignees' | 'attachments'>>
  ): TaskItemEnhanced => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const taskId = `TSK-${Date.now()}`;
    const taskNumber = `TSK-2026-${(enhancedTasks.length + 1).toString().padStart(3, '0')}`;

    // Normalize assignees: ensure every assigned employee has full assignee record
    const preparedAssignees: TaskAssignee[] = (taskData.assignees || []).map((asn, idx) => {
      const emp = employees.find(e => e.employeeId === asn.employeeId || e.id === asn.employeeId);
      return {
        id: asn.id || `ASN-${Date.now()}-${idx}`,
        taskId,
        employeeId: asn.employeeId,
        employeeName: asn.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : 'Assignee'),
        employeeEmail: asn.employeeEmail || emp?.email || '',
        employeeDepartment: asn.employeeDepartment || emp?.department || taskData.department,
        employeeAvatar: asn.employeeAvatar || emp?.avatar || '',
        role: asn.role || (asn.employeeId === taskData.responsiblePersonId ? 'RESPONSIBLE' : 'ASSIGNEE'),
        individualStatus: asn.individualStatus || 'Pending',
        progressPercentage: asn.progressPercentage || 0,
        actualStartDate: asn.actualStartDate,
        completedDate: asn.completedDate,
        latestRemark: asn.latestRemark,
        completionEvidence: asn.completionEvidence,
        assignedAt: asn.assignedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    const { overallStatus, overallProgress } = computeTaskOverallStatusAndProgress(
      preparedAssignees, 
      'OPEN', 
      taskData.dueDate
    );

    const initialTimeline = [
      {
        id: `TL-${Date.now()}`,
        taskId,
        title: taskData.sourceType === 'MOM' ? 'Task Created from Meeting Action Item' : 'Task Created',
        description: `Created by ${taskData.createdBy || currentUser.name} and assigned to ${preparedAssignees.map(a => a.employeeName).join(', ')}.`,
        timestamp: `${today} ${nowTime}`,
        iconType: (taskData.sourceType === 'MOM' ? 'mom' : 'created') as any,
        actorName: taskData.createdBy || currentUser.name
      }
    ];

    const initialAudit: TaskAuditLog[] = [
      {
        id: `AUD-${Date.now()}`,
        taskId,
        taskNumber,
        action: 'Task Created',
        module: 'Task Management',
        oldValue: 'N/A',
        newValue: `Status: ${overallStatus}, Priority: ${taskData.priority}, Assignees: ${preparedAssignees.length}`,
        performedBy: currentUser.name,
        performedByRole: currentUser.role,
        timestamp: `${today} ${nowTime}`
      }
    ];

    const newTask: TaskItemEnhanced = {
      ...taskData,
      id: taskId,
      taskNumber,
      taskDate: taskData.taskDate || today,
      overallProgress,
      overallStatus,
      assignees: preparedAssignees,
      updates: [],
      comments: [],
      attachments: taskData.attachments || [],
      timeline: initialTimeline,
      auditLogs: initialAudit,
      createdAt: today,
      updatedAt: today
    };

    setEnhancedTasks(prev => [newTask, ...prev]);

    // Also mirror to legacy tasks
    const legacyTask: TaskItem = {
      id: taskId,
      title: newTask.title,
      description: newTask.description,
      assignedEmployeeId: preparedAssignees[0]?.employeeId || 'EMP-001',
      assignedEmployeeName: preparedAssignees[0]?.employeeName || 'Assigned Staff',
      assignedBy: newTask.assignedBy,
      department: newTask.department,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      status: overallStatus === 'COMPLETED' ? 'Completed' : overallStatus === 'IN PROGRESS' ? 'In Progress' : overallStatus === 'OVERDUE' ? 'Overdue' : 'To Do',
      createdAt: today
    };
    setTasks(prev => [legacyTask, ...prev]);

    // Send notifications to all assignees
    preparedAssignees.forEach(asn => {
      addNotification({
        title: 'New Task Assigned',
        message: `You have been assigned to task: "${newTask.title}" (Due: ${newTask.dueDate})`,
        priority: newTask.priority === 'Urgent' ? 'Urgent' : 'Normal',
        category: 'Task',
        link: newTask.id
      });
    });

    return newTask;
  };

  const updateAssigneeProgress = (
    taskId: string,
    assigneeId: string,
    progressPercentage: number,
    individualStatus: TaskAssigneeStatus,
    latestRemark?: string,
    completionEvidence?: TaskCompletionEvidence
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const clampedProgress = Math.min(100, Math.max(0, Math.round(progressPercentage)));

    setEnhancedTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const targetAssignee = task.assignees.find(a => a.id === assigneeId || a.employeeId === assigneeId);
      if (!targetAssignee) return task;

      const oldStatus = targetAssignee.individualStatus;
      const oldProgress = targetAssignee.progressPercentage;

      const isNowCompleted = clampedProgress === 100 || individualStatus === 'Completed';
      const actualStart = targetAssignee.actualStartDate || (clampedProgress > 0 ? today : undefined);
      const completedDate = isNowCompleted ? (targetAssignee.completedDate || today) : undefined;

      const updatedAssignees: TaskAssignee[] = task.assignees.map(asn => {
        if (asn.id === targetAssignee.id) {
          return {
            ...asn,
            individualStatus,
            progressPercentage: clampedProgress,
            actualStartDate: actualStart,
            completedDate,
            latestRemark: latestRemark ?? asn.latestRemark,
            completionEvidence: completionEvidence ?? asn.completionEvidence,
            updatedAt: new Date().toISOString()
          };
        }
        return asn;
      });

      // System derives overall task status & overall progress from all assignees!
      const { overallStatus: newOverallStatus, overallProgress: newOverallProgress } = 
        computeTaskOverallStatusAndProgress(updatedAssignees, task.overallStatus, task.dueDate);

      // Create new progress update log
      const newUpdate = {
        id: `UPD-${Date.now()}`,
        taskId,
        assigneeId: targetAssignee.id,
        employeeId: targetAssignee.employeeId,
        employeeName: targetAssignee.employeeName,
        employeeAvatar: targetAssignee.employeeAvatar,
        status: individualStatus,
        progressPercentage: clampedProgress,
        remarks: latestRemark || (isNowCompleted ? 'Marked task as completed.' : `Updated progress to ${clampedProgress}%.`),
        updatedBy: currentUser.name,
        updatedAt: new Date().toISOString()
      };

      // Create timeline event
      const newTimeline = {
        id: `TL-${Date.now()}`,
        taskId,
        title: isNowCompleted ? `${targetAssignee.employeeName} completed assigned work` : `${targetAssignee.employeeName} updated progress`,
        description: latestRemark ? `${clampedProgress}% — "${latestRemark}"` : `Progress updated from ${oldProgress}% to ${clampedProgress}% (${individualStatus}).`,
        timestamp: `${today} ${nowTime}`,
        iconType: (isNowCompleted ? 'evidence' : 'progress') as any,
        actorName: currentUser.name
      };

      // Create immutable audit log
      const newAudit: TaskAuditLog = {
        id: `AUD-${Date.now()}`,
        taskId,
        taskNumber: task.taskNumber,
        action: isNowCompleted ? 'Completion Submitted' : 'Progress Updated',
        module: 'Task Assignees',
        oldValue: `${targetAssignee.employeeName}: ${oldProgress}% (${oldStatus})`,
        newValue: `${targetAssignee.employeeName}: ${clampedProgress}% (${individualStatus})`,
        performedBy: currentUser.name,
        performedByRole: currentUser.role,
        timestamp: `${today} ${nowTime}`
      };

      // Also audit overall task status change if derived status changed
      const auditEntries: TaskAuditLog[] = [newAudit];
      if (newOverallStatus !== task.overallStatus) {
        auditEntries.push({
          id: `AUD-${Date.now() + 1}`,
          taskId,
          taskNumber: task.taskNumber,
          action: 'Overall Status Changed',
          module: 'System Engine',
          oldValue: task.overallStatus,
          newValue: newOverallStatus,
          performedBy: 'System Auto',
          performedByRole: 'System',
          timestamp: `${today} ${nowTime}`
        });
      }

      // Notifications: notify responsible person
      if (isNowCompleted) {
        addNotification({
          title: 'Assignee Completed Work',
          message: `${targetAssignee.employeeName} completed work on task: "${task.title}".`,
          priority: 'Normal',
          category: 'Task',
          link: task.id
        });
      }

      if (newOverallStatus === 'COMPLETED' && task.overallStatus !== 'COMPLETED') {
        addNotification({
          title: 'All Assignees Completed Task',
          message: `All assignees have completed "${task.title}". Review and closure required by Responsible Person.`,
          priority: 'Important',
          category: 'Task',
          link: task.id
        });
      }

      return {
        ...task,
        overallStatus: newOverallStatus,
        overallProgress: newOverallProgress,
        assignees: updatedAssignees,
        updates: [newUpdate, ...task.updates],
        timeline: [newTimeline, ...task.timeline],
        auditLogs: [...auditEntries, ...task.auditLogs],
        updatedAt: today
      };
    }));

    // Also mirror to legacy tasks array
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: clampedProgress === 100 ? 'Completed' : clampedProgress > 0 ? 'In Progress' : 'To Do'
        };
      }
      return t;
    }));
  };

  const closeTask = (taskId: string, closedBy: string, closureRemarks?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setEnhancedTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;

      const newTimeline = {
        id: `TL-${Date.now()}`,
        taskId,
        title: 'Task Verified & Closed',
        description: closureRemarks ? `Closed by ${closedBy}. Note: ${closureRemarks}` : `Officially verified and closed by ${closedBy}.`,
        timestamp: `${today} ${nowTime}`,
        iconType: 'closed' as any,
        actorName: closedBy
      };

      const newAudit = {
        id: `AUD-${Date.now()}`,
        taskId,
        taskNumber: t.taskNumber,
        action: 'Task Closed',
        module: 'Task Management',
        oldValue: t.overallStatus,
        newValue: 'CLOSED',
        performedBy: closedBy,
        performedByRole: currentUser.role,
        timestamp: `${today} ${nowTime}`
      };

      return {
        ...t,
        overallStatus: 'CLOSED',
        closedAt: new Date().toISOString(),
        closedBy,
        closureRemarks: closureRemarks || 'Verified and completed successfully.',
        timeline: [newTimeline, ...t.timeline],
        auditLogs: [newAudit, ...t.auditLogs],
        updatedAt: today
      };
    }));

    addNotification({
      title: 'Task Closed',
      message: `Task has been reviewed and closed by ${closedBy}.`,
      priority: 'Normal',
      category: 'Task',
      link: taskId
    });
  };

  const reopenTask = (taskId: string, reopenedBy: string, reopenReason: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setEnhancedTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;

      const { overallStatus: derivedStatus, overallProgress } = 
        computeTaskOverallStatusAndProgress(t.assignees, 'IN PROGRESS', t.dueDate);

      const newTimeline = {
        id: `TL-${Date.now()}`,
        taskId,
        title: 'Task Reopened',
        description: `Reopened by ${reopenedBy}. Reason: ${reopenReason}`,
        timestamp: `${today} ${nowTime}`,
        iconType: 'reopened' as any,
        actorName: reopenedBy
      };

      const newAudit = {
        id: `AUD-${Date.now()}`,
        taskId,
        taskNumber: t.taskNumber,
        action: 'Task Reopened',
        module: 'Task Management',
        oldValue: 'CLOSED',
        newValue: `Reopened (${derivedStatus}). Reason: ${reopenReason}`,
        performedBy: reopenedBy,
        performedByRole: currentUser.role,
        timestamp: `${today} ${nowTime}`
      };

      return {
        ...t,
        overallStatus: derivedStatus === 'CLOSED' ? 'IN PROGRESS' : derivedStatus,
        overallProgress,
        isReopened: true,
        reopenReason,
        closedAt: undefined,
        closedBy: undefined,
        closureRemarks: undefined,
        timeline: [newTimeline, ...t.timeline],
        auditLogs: [newAudit, ...t.auditLogs],
        updatedAt: today
      };
    }));

    addNotification({
      title: 'Task Reopened',
      message: `Task has been reopened by ${reopenedBy}: "${reopenReason}"`,
      priority: 'Important',
      category: 'Task',
      link: taskId
    });
  };

  const addTaskComment = (taskId: string, content: string, attachments?: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newComment = {
      id: `CMT-${Date.now()}`,
      taskId,
      userId: currentUser.employeeId || currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      content,
      attachments,
      createdAt: new Date().toISOString()
    };

    setEnhancedTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;

      const newAudit = {
        id: `AUD-${Date.now()}`,
        taskId,
        taskNumber: t.taskNumber,
        action: 'Comment Added',
        module: 'Task Comments',
        oldValue: 'N/A',
        newValue: content.slice(0, 40) + '...',
        performedBy: currentUser.name,
        performedByRole: currentUser.role,
        timestamp: `${today} ${nowTime}`
      };

      return {
        ...t,
        comments: [...t.comments, newComment],
        auditLogs: [newAudit, ...t.auditLogs]
      };
    }));
  };

  const addTaskAttachment = (taskId: string, attachmentData: Omit<TaskAttachment, 'id' | 'taskId' | 'uploadedAt'>) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newAttachment: TaskAttachment = {
      ...attachmentData,
      id: `ATT-${Date.now()}`,
      taskId,
      uploadedAt: new Date().toISOString()
    };

    setEnhancedTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;

      const newAudit = {
        id: `AUD-${Date.now()}`,
        taskId,
        taskNumber: t.taskNumber,
        action: 'Attachment Uploaded',
        module: 'Task Attachments',
        oldValue: 'N/A',
        newValue: `${newAttachment.fileName} (${newAttachment.fileSize})`,
        performedBy: currentUser.name,
        performedByRole: currentUser.role,
        timestamp: `${today} ${nowTime}`
      };

      return {
        ...t,
        attachments: [...t.attachments, newAttachment],
        auditLogs: [newAudit, ...t.auditLogs]
      };
    }));
  };

  const convertMOMActionToTask = (momId: string, actionItemId: string): TaskItemEnhanced | null => {
    const meeting = momMeetings.find(m => m.id === momId || m.meetingNumber === momId);
    if (!meeting) return null;

    const item = meeting.actionItems.find(a => a.id === actionItemId || a.itemNumber === actionItemId);
    if (!item) return null;

    const responsibleEmpId = item.assignedEmployeeIds[0] || 'EMP-001';
    const responsibleEmp = employees.find(e => e.employeeId === responsibleEmpId || e.id === responsibleEmpId);

    const assigneesList: TaskAssignee[] = item.assignedEmployeeIds.map((empId, idx): TaskAssignee => {
      const emp = employees.find(e => e.employeeId === empId || e.id === empId);
      return {
        id: `ASN-${Date.now()}-${idx}`,
        taskId: '',
        employeeId: empId,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'ASSIGNEE',
        employeeEmail: emp?.email || '',
        employeeDepartment: emp?.department || item.department,
        employeeAvatar: emp?.avatar || '',
        role: (empId === responsibleEmpId ? 'RESPONSIBLE' : 'ASSIGNEE'),
        individualStatus: 'Pending' as TaskAssigneeStatus,
        progressPercentage: 0,
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    const created = createEnhancedTask({
      title: item.title,
      taskDate: new Date().toISOString().split('T')[0],
      sourceType: 'MOM',
      sourceReference: meeting.meetingTitle,
      momId: meeting.meetingNumber,
      momItemNumber: item.itemNumber,
      createdBy: currentUser.name,
      assignedBy: currentUser.name,
      responsiblePersonId: responsibleEmpId,
      responsiblePersonName: responsibleEmp ? `${responsibleEmp.firstName} ${responsibleEmp.lastName}` : 'Responsible Person',
      department: item.department || meeting.department,
      taskCategory: 'Compliance',
      priority: item.priority,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: item.dueDate,
      description: item.description,
      expectedOutput: `Outcome mandated by MOM resolution: ${item.decision}`,
      assignees: assigneesList
    });

    // Mark MOM Action Item as Linked
    setMomMeetings(prev => prev.map(m => {
      if (m.id !== meeting.id) return m;
      return {
        ...m,
        actionItems: m.actionItems.map(ai => {
          if (ai.id !== item.id) return ai;
          return {
            ...ai,
            status: 'Task Created',
            linkedTaskId: created.id,
            linkedTaskNumber: created.taskNumber
          };
        })
      };
    }));

    return created;
  };

  const syncMOMTask = (taskId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const task = enhancedTasks.find(t => t.id === taskId);
    if (!task || !task.momId) return;

    setMomMeetings(prev => prev.map(m => {
      if (m.meetingNumber !== task.momId && m.id !== task.momId) return m;
      return {
        ...m,
        actionItems: m.actionItems.map(ai => {
          if (ai.itemNumber !== task.momItemNumber && ai.linkedTaskId !== task.id) return ai;
          return {
            ...ai,
            status: task.overallStatus === 'COMPLETED' || task.overallStatus === 'CLOSED' ? 'Completed' : 'In Progress'
          };
        })
      };
    }));

    // Record audit log in task
    setEnhancedTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        auditLogs: [
          {
            id: `AUD-${Date.now()}`,
            taskId,
            taskNumber: t.taskNumber,
            action: 'MOM Synchronization',
            module: 'MOM Integration',
            oldValue: 'Pending Sync',
            newValue: `Synced status "${t.overallStatus}" to ${task.momId}`,
            performedBy: currentUser.name,
            performedByRole: currentUser.role,
            timestamp: `${today} ${nowTime}`
          },
          ...t.auditLogs
        ]
      };
    }));

    addNotification({
      title: 'MOM Status Synchronized',
      message: `Task ${task.taskNumber} status synchronized with ${task.momId}.`,
      priority: 'Normal',
      category: 'Task'
    });
  };

  const deleteEnhancedTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const addTaskMaster = (itemData: Omit<TaskMasterItem, 'id'>) => {
    const newItem: TaskMasterItem = {
      ...itemData,
      id: `MST-${Date.now()}`
    };
    setTaskMasters(prev => [...prev, newItem]);
  };

  const updateTaskMaster = (id: string, updates: Partial<TaskMasterItem>) => {
    setTaskMasters(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteTaskMaster = (id: string) => {
    setTaskMasters(prev => prev.filter(m => m.id !== id));
  };

  const addMOMMeeting = (meetingData: Omit<MOMMeeting, 'id' | 'meetingNumber'>) => {
    const seq = (momMeetings.length + 1).toString().padStart(2, '0');
    const meetingNumber = `MOM-2026-${seq}`;
    const newMeeting: MOMMeeting = {
      ...meetingData,
      id: `MOM-${Date.now()}`,
      meetingNumber
    };
    setMomMeetings(prev => [newMeeting, ...prev]);
  };

  const updateEscalationRule = (id: string, updates: Partial<TaskEscalationRule>) => {
    setEscalationRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateTaskWeights = (weights: Partial<TaskPerformanceWeights>) => {
    setTaskWeights(prev => ({ ...prev, ...weights }));
  };

  const addJobOpening = (job: Omit<JobOpening, 'id' | 'postedDate' | 'applicantsCount'>) => {
    const newJob: JobOpening = {
      ...job,
      id: `JOB-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      applicantsCount: 0
    };
    setJobOpenings(prev => [newJob, ...prev]);
  };

  const updateCandidateStage = (candidateId: string, newStage: Candidate['stage']) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        return { ...c, stage: newStage };
      }
      return c;
    }));
  };

  const referCandidate = (cand: Omit<Candidate, 'id' | 'stage' | 'appliedDate'>) => {
    const newCand: Candidate = {
      ...cand,
      id: `CND-${Date.now()}`,
      stage: 'Applied',
      referralStatus: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    setCandidates(prev => [newCand, ...prev]);

    // Notify HR and CEO
    addNotification({
      title: 'New Candidate Referral Submitted',
      message: `${cand.referrerName || 'An Employee'} referred ${cand.name} for ${cand.jobTitle}. Pending HR/CEO review.`,
      priority: 'Normal',
      category: 'Announcement'
    });
  };

  const reviewReferral = (
    candidateId: string, 
    status: 'Accepted' | 'Rejected', 
    reviewerName: string, 
    notes?: string,
    newStage?: Candidate['stage']
  ) => {
    let targetCand: Candidate | undefined;
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        targetCand = c;
        return {
          ...c,
          referralStatus: status,
          referralReviewedBy: reviewerName,
          referralReviewedDate: new Date().toISOString().split('T')[0],
          referralReviewNotes: notes || c.referralReviewNotes,
          stage: newStage || (status === 'Accepted' ? 'Interview' : 'Rejected')
        };
      }
      return c;
    }));

    if (targetCand) {
      addNotification({
        title: status === 'Accepted' ? 'Candidate Referral Accepted! 🎉' : 'Candidate Referral Rejected',
        message: `Referral for ${targetCand.name} (${targetCand.jobTitle}) was ${status.toLowerCase()} by ${reviewerName}.`,
        priority: status === 'Accepted' ? 'Important' : 'Normal',
        category: 'Announcement'
      });
    }
  };

  const addExpense = (exp: Omit<Expense, 'id' | 'status'>) => {
    const newExp: Expense = {
      ...exp,
      id: `EXP-${Date.now()}`,
      status: 'Pending Manager'
    };
    setExpenses(prev => [newExp, ...prev]);

    addNotification({
      title: 'Expense Claim Submitted',
      message: `${exp.employeeName} submitted an expense claim for $${exp.amount}.`,
      priority: 'Normal',
      category: 'Announcement'
    });
  };

  const approveExpense = (id: string, approvedBy: string, nextStatus: Expense['status']) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: nextStatus, approvedBy } : e));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (note: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNote: NotificationItem = {
      ...note,
      id: `NOT-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const processPayrollBatch = async () => {
    const activeAttPolicy = masterAttendancePolicies.find(p => p.status === 'Active');
    const activeLeavePolicy = masterLeavePolicies.find(p => p.status === 'Active');

    let backendRecords: any[] | null = null;
    try {
      // 1. Authoritative backend run execution
      let run = await payrollApi.createPayrollRun({ payroll_month: 8, payroll_year: 2026 }).catch(() => null);
      if (!run) {
        const runs = await payrollApi.getPayrollRuns().catch(() => []);
        run = runs.find(r => r.payrollMonth === 8 && r.payrollYear === 2026) || null;
      }
      if (run && run.status === 'DRAFT') {
        run = await payrollApi.processPayrollRun(run.id).catch(() => run);
      }
      const rawRecords = await payrollApi.getPayrollRecords({ month: 8, year: 2026 }).catch(() => null) as any[] | null;
      if (rawRecords && rawRecords.length > 0) {
        backendRecords = rawRecords;
      }
    } catch (apiErr) {
      console.warn('[Payroll] Backend calculation offline, using local engine fallback:', apiErr);
    }

    const updatedRecords: PayrollRecord[] = employees.map(emp => {
      const calc = calculateEmployeePayroll(
        emp,
        attendanceRecords,
        leaveRequests,
        loanRecords,
        employeeRewardRecords,
        activeAttPolicy,
        activeLeavePolicy,
        payrollSettingsConfig,
        'August',
        2026
      );

      const backendRec = backendRecords?.find((b: any) => b.employeeId === emp.employeeId);
      if (backendRec) {
        return {
          id: backendRec.id || `PAY-2026-08-${emp.employeeId}`,
          employeeId: emp.employeeId,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          designation: emp.designation,
          month: 'August',
          year: 2026,
          basicSalary: backendRec.basicSalary,
          allowances: (backendRec.hra || 0) + (backendRec.conveyance || 0) + (backendRec.da || 0),
          bonus: backendRec.bonus || 0,
          rewardEarnings: backendRec.otherEarnings || 0,
          taxDeduction: (backendRec.pfAmount || 0) + (backendRec.esicAmount || 0) + (backendRec.professionalTax || 0),
          leaveDeduction: backendRec.lopAmount || 0,
          advanceDeduction: (backendRec.advanceRecovery || 0) + (backendRec.loanRecovery || 0),
          lateAttendanceDeduction: 0,
          epfDeduction: backendRec.pfAmount || 0,
          esiDeduction: backendRec.esicAmount || 0,
          professionalTax: backendRec.professionalTax || 0,
          workingDays: backendRec.workingDays || 26,
          presentDays: backendRec.presentDays || 26,
          paidLeaves: 0,
          unpaidLeaves: backendRec.lopDays || 0,
          netSalary: backendRec.netSalary,
          internalDetails: {
            lateDetails: calc.lateDetails,
            leaveDetails: calc.leaveDetails,
            statutoryDetails: (backendRec.deductionsBreakdown || []).map((d: any) => ({
              ruleName: d.name,
              category: 'Statutory',
              rate: d.amount,
              deductionAmount: d.amount,
              reason: d.description || ''
            })),
            rewardDetails: (backendRec.earningsBreakdown || []).map((e: any) => ({
              ruleName: e.name,
              category: 'Allowance',
              rate: e.amount,
              bonusAmount: e.amount,
              reason: e.description || ''
            }))
          },
          status: 'Processed'
        };
      }

      return {
        id: `PAY-2026-08-${emp.employeeId}`,
        employeeId: emp.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        designation: emp.designation,
        month: 'August',
        year: 2026,
        basicSalary: calc.basicSalary,
        allowances: calc.allowances,
        bonus: calc.bonus,
        rewardEarnings: calc.rewardEarnings,
        taxDeduction: calc.statutoryDeductions,
        leaveDeduction: calc.unpaidLeaveDeduction,
        advanceDeduction: calc.advanceDeduction,
        lateAttendanceDeduction: calc.lateAttendanceDeduction,
        epfDeduction: calc.epfDeduction,
        esiDeduction: calc.esiDeduction,
        professionalTax: calc.professionalTax,
        workingDays: calc.workingDays,
        presentDays: calc.presentDays,
        paidLeaves: calc.paidLeaves,
        unpaidLeaves: calc.unpaidLeaves,
        netSalary: calc.netSalary,
        internalDetails: {
          lateDetails: calc.lateDetails,
          leaveDetails: calc.leaveDetails,
          statutoryDetails: calc.statutoryDetails,
          rewardDetails: calc.rewardDetails
        },
        status: 'Processed'
      };
    });

    // Mark processed employee rewards
    setEmployeeRewardRecords(prev => prev.map(r => r.payrollStatus === 'Pending' && r.addToPayroll ? { ...r, payrollStatus: 'ProcessedInPayroll' } : r));

    // Update active loans with payroll EMI deductions
    const batchPeriod = 'Aug 2026';
    const batchId = 'PAY-2026-08';
    setLoanRecords(prev => prev.map(loan => {
      if ((loan.status === 'Active' || loan.status === 'Disbursed') && toNum(loan.outstandingBalance) > 0) {
        // Unique Deduplication Check: Ensure not already deducted in this batch for this period
        const alreadyDeducted = loan.repaymentSchedule.some(s => s.payrollBatchId === batchId && s.status === 'Deducted');
        if (alreadyDeducted) return loan;

        // Find next pending installment
        const nextInstIdx = loan.repaymentSchedule.findIndex(s => s.status === 'Pending');
        if (nextInstIdx !== -1) {
          const inst = loan.repaymentSchedule[nextInstIdx];
          const scheduledEmi = toNum(inst.scheduledAmount || loan.monthlyDeduction);
          const currentBal = toNum(loan.outstandingBalance);
          const actualDeduct = Math.min(scheduledEmi, currentBal);
          const newBal = Math.max(0, currentBal - actualDeduct);
          const isClosed = newBal === 0;

          const updatedSchedule = [...loan.repaymentSchedule];
          updatedSchedule[nextInstIdx] = {
            ...inst,
            actualDeducted: actualDeduct,
            remainingBalance: newBal,
            status: 'Deducted',
            deductedAt: '2026-08-31 06:00 PM',
            payrollBatchId: batchId
          };

          return {
            ...loan,
            outstandingBalance: newBal,
            status: isClosed ? ('Closed' as const) : loan.status,
            repaymentSchedule: updatedSchedule,
            auditLogs: [
              ...loan.auditLogs,
              {
                id: `LOG-${Date.now()}-${loan.id}`,
                loanId: loan.id,
                action: isClosed ? 'Loan Closed (Payroll Repaid)' : 'Payroll Salary Deduction',
                performedBy: 'Payroll Engine',
                performedByRole: 'System',
                timestamp: '2026-08-31 06:00 PM',
                previousValue: `Outstanding: ₹${currentBal.toLocaleString('en-IN')}`,
                newValue: `Outstanding: ₹${newBal.toLocaleString('en-IN')} (Deducted ₹${actualDeduct.toLocaleString('en-IN')} in August Batch)`
              }
            ]
          };
        }
      }
      return loan;
    }));

    setPayrollRecords(updatedRecords);

    addNotification({
      title: 'Payroll Batch Processed',
      message: `August 2026 payroll successfully processed for ${employees.length} employees with automated loan recoveries.`,
      priority: 'Important',
      category: 'Payroll'
    });
  };

  const addDepartment = (dept: Omit<DepartmentItem, 'id' | 'employeeCount'>) => {
    const newDept: DepartmentItem = {
      ...dept,
      id: `DEP-${Date.now()}`,
      employeeCount: 0
    };
    setDepartments(prev => [...prev, newDept]);
  };

  const updateDepartment = (id: string, updates: Partial<DepartmentItem>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDepartment = (id: string): { success: boolean; message?: string } => {
    const check = canDeleteDepartment(id);
    if (!check.canDelete) {
      return { success: false, message: check.reason };
    }
    setDepartments(prev => prev.filter(d => d.id !== id));
    return { success: true };
  };

  const addDesignation = (desig: Omit<DesignationItem, 'id'>) => {
    const newDesig: DesignationItem = {
      ...desig,
      id: `DSG-${Date.now()}`
    };
    setDesignations(prev => [...prev, newDesig]);
  };

  const updateDesignation = (id: string, updates: Partial<DesignationItem>) => {
    setDesignations(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDesignation = (id: string): { success: boolean; message?: string } => {
    const check = canDeleteDesignation(id);
    if (!check.canDelete) {
      return { success: false, message: check.reason };
    }
    setDesignations(prev => prev.filter(d => d.id !== id));
    return { success: true };
  };

  const addBranch = (branchData: Omit<BranchItem, 'id'>) => {
    const newBranch: BranchItem = {
      ...branchData,
      id: `BR-${Date.now()}`
    };
    setBranches(prev => [...prev, newBranch]);
  };

  const updateBranch = (id: string, branchData: Partial<BranchItem>) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...branchData } : b));
  };

  const deleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  // Organization Masters
  const addGrade = (grade: Omit<GradeItem, 'id'>) => {
    const newGrade: GradeItem = {
      ...grade,
      id: `g-${Date.now()}`
    };
    setGrades(prev => [...prev, newGrade]);
  };

  const updateGrade = (id: string, updates: Partial<GradeItem>) => {
    setGrades(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGrade = (id: string): { success: boolean; message?: string } => {
    setGrades(prev => prev.filter(g => g.id !== id));
    return { success: true };
  };

  const addEmploymentType = (type: Omit<EmploymentTypeItem, 'id'>) => {
    const newType: EmploymentTypeItem = {
      ...type,
      id: `et-${Date.now()}`
    };
    setEmploymentTypes(prev => [...prev, newType]);
  };

  const updateEmploymentType = (id: string, updates: Partial<EmploymentTypeItem>) => {
    setEmploymentTypes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteEmploymentType = (id: string) => {
    setEmploymentTypes(prev => prev.filter(t => t.id !== id));
  };

  const addEmployeeCategory = (cat: Omit<EmployeeCategoryItem, 'id'>) => {
    const newCat: EmployeeCategoryItem = {
      ...cat,
      id: `ec-${Date.now()}`
    };
    setEmployeeCategories(prev => [...prev, newCat]);
  };

  const updateEmployeeCategory = (id: string, updates: Partial<EmployeeCategoryItem>) => {
    setEmployeeCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteEmployeeCategory = (id: string) => {
    setEmployeeCategories(prev => prev.filter(c => c.id !== id));
  };

  // Employee Configuration
  const updateEmployeeConfig = (config: Partial<EmployeeConfigSettings>) => {
    setEmployeeConfig(prev => ({ ...prev, ...config }));
  };

  // Approval Workflows
  const addApprovalWorkflow = (wf: Omit<ApprovalWorkflowItem, 'id'>) => {
    const newWf: ApprovalWorkflowItem = {
      ...wf,
      id: `wf-${Date.now()}`
    };
    setApprovalWorkflows(prev => [...prev, newWf]);
  };

  const updateApprovalWorkflow = (id: string, updates: Partial<ApprovalWorkflowItem>) => {
    setApprovalWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteApprovalWorkflow = (id: string) => {
    setApprovalWorkflows(prev => prev.filter(w => w.id !== id));
  };

  // Notification Triggers
  const updateNotificationTrigger = (id: string, updates: Partial<NotificationTriggerConfig>) => {
    setNotificationTriggers(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  // General System Config
  const updateGeneralSystemConfig = (config: Partial<GeneralSystemConfig>) => {
    setGeneralSystemConfig(prev => ({ ...prev, ...config }));
  };

  // Integrations Config
  const updateIntegrationsConfig = (config: Partial<IntegrationsConfig>) => {
    setIntegrationsConfig(prev => ({ ...prev, ...config }));
  };

  const addDepartmentToBranch = (branchId: string, departmentName: string) => {
    setBranches(prev => prev.map(b => {
      if (b.id === branchId && !b.departments.includes(departmentName)) {
        return { ...b, departments: [...b.departments, departmentName] };
      }
      return b;
    }));
  };

  const removeDepartmentFromBranch = (branchId: string, departmentName: string) => {
    setBranches(prev => prev.map(b => {
      if (b.id === branchId) {
        return { ...b, departments: b.departments.filter(d => d !== departmentName) };
      }
      return b;
    }));
  };

  const addAsset = (assetData: Omit<AssetItem, 'id'>) => {
    const newAsset: AssetItem = {
      ...assetData,
      id: `AST-${Date.now()}`
    };
    setAssets(prev => [newAsset, ...prev]);
    addNotification({
      title: 'New Corporate Asset Added',
      message: `${newAsset.name} (${newAsset.assetTag}) registered into inventory.`,
      priority: 'Normal',
      category: 'Announcement'
    });
  };

  const assignAsset = (assetId: string, employeeId: string, employeeName: string, department: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          assignedEmployeeId: employeeId,
          assignedEmployeeName: employeeName,
          assignedDepartment: department,
          assignedDate: new Date().toISOString().split('T')[0],
          status: 'Assigned'
        };
      }
      return a;
    }));
  };

  const deleteAsset = (assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
  };

  return (
    <HRMSContext.Provider value={{
      currentUser,
      updateCurrentUser,
      switchRole,
      hasPermission,
      permissionMatrix,
      updatePermission,
      employees,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      attendanceRecords,
      markAttendance,
      attendanceAuditLogs,
      correctAttendanceRecord,
      missedPunchRequests,
      submitMissedPunchRequest,
      approveMissedPunchRequest,
      rejectMissedPunchRequest,
      editAndApproveMissedPunchRequest,
      overtimeRequests,
      submitOtRequest,
      approveOtRequest,
      rejectOtRequest,
      editAndApproveOtRequest,
      deleteOtRequest,
      addManualOtEntry,
      addManualAttendanceRecord,
      departmentOtPolicies,
      updateDepartmentOtPolicy,
      employeeOtPolicies,
      updateEmployeeOtPolicy,
      overtimePolicy,
      updateOvertimePolicy,
      attendancePolicyConfig,
      updateAttendancePolicyConfig,
      attendanceGlobalSettings,
      updateAttendanceGlobalSettings,
      recordEmployeePunch,
      faceLogs,
      addFaceLog,
      leaveRequests,
      applyLeave,
      approveLeave,
      rejectLeave,
      shifts,
      shiftRequests,
      addShift,
      updateShift,
      deleteShift,
      requestShiftChange,
      approveShiftRequest,
      tasks,
      addTask,
      updateTaskStatus,
      deleteTask,
      enhancedTasks,
      createEnhancedTask,
      updateAssigneeProgress,
      closeTask,
      reopenTask,
      addTaskComment,
      addTaskAttachment,
      convertMOMActionToTask,
      syncMOMTask,
      deleteEnhancedTask,
      taskMasters,
      addTaskMaster,
      updateTaskMaster,
      deleteTaskMaster,
      momMeetings,
      addMOMMeeting,
      escalationRules,
      updateEscalationRule,
      taskWeights,
      updateTaskWeights,
      performanceScores,
      jobOpenings,
      candidates,
      addJobOpening,
      updateCandidateStage,
      referCandidate,
      reviewReferral,
      expenses,
      addExpense,
      approveExpense,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      payrollRecords,
      processPayrollBatch,
      departments,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      designations,
      addDesignation,
      updateDesignation,
      deleteDesignation,
      canDeleteEmployee,
      canDeleteDepartment,
      canDeleteBranch,
      canDeleteShift,
      canDeleteDesignation,
      branches,
      addBranch,
      updateBranch,
      deleteBranch,
      addDepartmentToBranch,
      removeDepartmentFromBranch,
      assets,
      addAsset,
      assignAsset,
      deleteAsset,
      searchQuery,
      setSearchQuery,
      activeModule,
      setActiveModule,
      activeSettingsTab,
      setActiveSettingsTab,
      workflowFormat,
      setWorkflowFormat,
      geofenceConfig,
      updateGeofenceConfig,
      isGeofenceAdmin,
      leavePolicies,
      addLeavePolicy,
      updateLeavePolicy,
      deleteLeavePolicy,
      holidayPolicies,
      addHolidayPolicy,
      updateHolidayPolicy,
      deleteHolidayPolicy,
      attendancePolicies,
      addAttendancePolicy,
      updateAttendancePolicy,
      deleteAttendancePolicy,
      weeklySchedules,
      addWeeklySchedule,
      updateWeeklySchedule,
      deleteWeeklySchedule,
      attendanceConfig,
      updateAttendanceConfig,
      policyDocuments,
      addPolicyDocument,
      updatePolicyDocument,
      deletePolicyDocument,
      businessSettings,
      updateBusinessSettings,
      grades,
      addGrade,
      updateGrade,
      deleteGrade,
      employmentTypes,
      addEmploymentType,
      updateEmploymentType,
      deleteEmploymentType,
      employeeCategories,
      addEmployeeCategory,
      updateEmployeeCategory,
      deleteEmployeeCategory,
      employeeConfig,
      updateEmployeeConfig,
      approvalWorkflows,
      addApprovalWorkflow,
      updateApprovalWorkflow,
      deleteApprovalWorkflow,
      notificationTriggers,
      updateNotificationTrigger,
      generalSystemConfig,
      updateGeneralSystemConfig,
      integrationsConfig,
      updateIntegrationsConfig,

      // 5 New Settings Modules & Dynamic Policy Engine
      companyInfo,
      updateCompanyInfo,
      companyBranches,
      addCompanyBranch,
      updateCompanyBranch,
      deleteCompanyBranch,
      orgStructure,
      updateOrgStructure,
      masterAttendancePolicies,
      addMasterAttendancePolicy,
      updateMasterAttendancePolicy,
      archiveMasterAttendancePolicy,
      toggleMasterAttendancePolicyStatus,
      attendanceCorrections,
      submitAttendanceCorrection,
      reviewAttendanceCorrection,
      masterLeavePolicies,
      addMasterLeavePolicy,
      updateMasterLeavePolicy,
      archiveMasterLeavePolicy,
      toggleMasterLeavePolicyStatus,
      sandwichPolicies,
      sandwichAuditLogs,
      createSandwichPolicy,
      updateSandwichPolicy,
      archiveSandwichPolicy,
      toggleSandwichPolicyStatus,
      deleteSandwichPolicy,
      overrideSandwichCalculation,
      computeSandwichCalculation,
      addSandwichAuditLog,
      payrollSettingsConfig,
      updatePayrollSettingsConfig,
      toggleSalaryComponent,
      rewardPolicies,
      addRewardPolicy,
      updateRewardPolicy,
      archiveRewardPolicy,
      toggleRewardPolicyStatus,
      employeeRewardRecords,
      grantRewardToEmployee,
      policyAuditLogs,
      addPolicyAuditLog,

      // Advance Salary / Loan Management
      loanPolicies,
      activeLoanPolicy,
      createLoanPolicy,
      updateLoanPolicy,
      deleteLoanPolicy,
      loanRecords,
      submitLoanRequest,
      reviewLoanRequest,
      disburseLoan,
      recordManualRepayment,
      calculateEmployeeLoanEligibility
    }}>
      {children}
    </HRMSContext.Provider>
  );
};

export const useHRMS = () => {
  const context = useContext(HRMSContext);
  if (!context) {
    throw new Error('useHRMS must be used within a HRMSProvider');
  }
  return context;
};
