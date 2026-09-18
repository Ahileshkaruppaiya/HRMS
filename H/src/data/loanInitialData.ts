import { LoanPolicy } from '../types/settings';
import { LoanRecord } from '../types/hrms';

export const DEFAULT_LOAN_POLICIES: LoanPolicy[] = [
  {
    id: 'POL-LOAN-001',
    policyName: 'Employee Salary Loan Policy',
    policyType: 'Employee Loan',
    description: 'Standard enterprise personal loan policy against employee salary with automated payroll recovery.',
    applicableEmployees: 'ALL',
    applicableDepartments: 'ALL',
    applicableBranches: 'ALL',
    effectiveFrom: '2026-01-01',
    status: 'Active',
    minimumEmploymentMonths: 6, // Fully configurable in Settings
    maxLoanLimitType: 'SALARY_MULTIPLIER',
    maxLoanLimitValue: 2, // 2 × Monthly Salary
    maxActiveLoans: 1, // Only 1 active loan per employee
    minLoanAmount: 5000,
    maxLoanAmount: 500000,
    minRepaymentMonths: 3,
    maxRepaymentMonths: 12,
    deductionStartRule: 'NEXT_PAYROLL_CYCLE',
    approvalWorkflow: 'HR_OR_CEO',
    lowSalaryRule: 'DEDUCT_AVAILABLE_CARRY_FORWARD',
    payslipVisibility: 'GENERIC', // Masked as 'OTHERS' for employees or detailed for HR/CEO
    createdAt: '2026-01-01 09:00 AM',
    createdBy: 'Velmurugan (CEO)',
    updatedAt: '2026-01-01 09:00 AM',
    updatedBy: 'Velmurugan (CEO)'
  },
  {
    id: 'POL-LOAN-002',
    policyName: 'Emergency Salary Advance Policy',
    policyType: 'Advance Salary',
    description: 'Short-term medical or urgent family emergency advance with quick single-window approval.',
    applicableEmployees: 'ALL',
    applicableDepartments: 'ALL',
    applicableBranches: 'ALL',
    effectiveFrom: '2026-01-01',
    status: 'Active',
    minimumEmploymentMonths: 3,
    maxLoanLimitType: 'PERCENTAGE_SALARY',
    maxLoanLimitValue: 100, // 100% of Monthly Salary
    maxActiveLoans: 1,
    minLoanAmount: 5000,
    maxLoanAmount: 100000,
    minRepaymentMonths: 1,
    maxRepaymentMonths: 4,
    deductionStartRule: 'NEXT_PAYROLL_CYCLE',
    approvalWorkflow: 'HR_OR_CEO',
    lowSalaryRule: 'DEDUCT_AVAILABLE_CARRY_FORWARD',
    payslipVisibility: 'DETAILED',
    createdAt: '2026-01-01 09:30 AM',
    createdBy: 'Pavithra (HR)',
    updatedAt: '2026-01-01 09:30 AM',
    updatedBy: 'Pavithra (HR)'
  }
];

export const INITIAL_LOAN_RECORDS: LoanRecord[] = [];
