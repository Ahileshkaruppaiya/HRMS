// Initial Seed Policies for Sandwich Leave Management Engine
import { SandwichLeavePolicy, SandwichAuditLog } from '../types/sandwichLeave';

export const initialSandwichPolicies: SandwichLeavePolicy[] = [
  {
    id: 'SLP-001',
    policyName: 'Standard Corporate Sandwich Leave Policy',
    description: 'Enforces sandwich rule on Casual, Sick, and Unpaid leaves when bounded by weekly offs or corporate holidays.',
    applicableLeaveTypes: ['Casual Leave', 'Sick Leave', 'Unpaid Leave'],
    applicableEmployees: 'ALL',
    applicableDepartments: 'ALL',
    applicableDesignations: 'ALL',
    applicableBranches: 'ALL',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    status: 'Active',
    version: 1,
    sandwichRuleEnabled: true,
    countWeeklyOffAsLeave: true,
    countPublicHolidayAsLeave: true,
    sandwichCondition: 'BOTH_SIDES_MANDATORY',
    payType: 'SAME_AS_APPLIED_LEAVE',
    createdAt: '2026-01-01T09:00:00.000Z',
    createdBy: 'HR Admin',
    updatedAt: '2026-01-01T09:00:00.000Z',
    updatedBy: 'HR Admin'
  },
  {
    id: 'SLP-002',
    policyName: 'Chennai Tech Division - Relaxed Sandwich Policy',
    description: 'Public holidays are exempt from sandwich treatment for tech personnel in Chennai division.',
    applicableLeaveTypes: ['Casual Leave', 'Sick Leave'],
    applicableEmployees: 'ALL',
    applicableDepartments: ['Engineering', 'Product'],
    applicableDesignations: 'ALL',
    applicableBranches: ['Chennai HQ'],
    effectiveFrom: '2026-03-01',
    status: 'Active',
    version: 1,
    sandwichRuleEnabled: true,
    countWeeklyOffAsLeave: true,
    countPublicHolidayAsLeave: false,
    sandwichCondition: 'BOTH_SIDES_MANDATORY',
    payType: 'PAID_LEAVE',
    createdAt: '2026-03-01T09:00:00.000Z',
    createdBy: 'HR Admin',
    updatedAt: '2026-03-01T09:00:00.000Z',
    updatedBy: 'HR Admin'
  },
  {
    id: 'SLP-003',
    policyName: 'Contractual / Plant Operations Strict Sandwich Rule',
    description: 'Sandwich days are strictly treated as Unpaid Leave (Loss of Pay) flowing directly to payroll deductions.',
    applicableLeaveTypes: ['Casual Leave', 'Sick Leave', 'Unpaid Leave'],
    applicableEmployees: 'ALL',
    applicableDepartments: ['Operations', 'Plant Logistics'],
    applicableDesignations: 'ALL',
    applicableBranches: ['Chennai Plant', 'Site A'],
    effectiveFrom: '2026-01-01',
    status: 'Active',
    version: 1,
    sandwichRuleEnabled: true,
    countWeeklyOffAsLeave: true,
    countPublicHolidayAsLeave: true,
    sandwichCondition: 'BOTH_SIDES_MANDATORY',
    payType: 'UNPAID_LEAVE',
    createdAt: '2026-01-01T10:00:00.000Z',
    createdBy: 'Super Admin',
    updatedAt: '2026-01-01T10:00:00.000Z',
    updatedBy: 'Super Admin'
  }
];

export const initialSandwichAuditLogs: SandwichAuditLog[] = [
  {
    id: 'SAL-001',
    timestamp: '2026-01-01T09:00:00.000Z',
    user: 'HR Admin',
    userRole: 'HR Admin',
    action: 'POLICY_CREATED',
    policyId: 'SLP-001',
    policyName: 'Standard Corporate Sandwich Leave Policy',
    newValue: { status: 'Active', sandwichRuleEnabled: true },
    reason: 'Initial setup of enterprise sandwich leave policy for FY 2026'
  },
  {
    id: 'SAL-002',
    timestamp: '2026-03-01T09:00:00.000Z',
    user: 'HR Admin',
    userRole: 'HR Admin',
    action: 'POLICY_CREATED',
    policyId: 'SLP-002',
    policyName: 'Bangalore Tech Branch - Relaxed Sandwich Policy',
    newValue: { status: 'Active', countPublicHolidayAsLeave: false },
    reason: 'Created branch specific relaxation for Bangalore engineering site'
  }
];
