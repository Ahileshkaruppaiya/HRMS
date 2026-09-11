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
    createdBy: 'Pavithra (HR Manager)',
    updatedAt: '2026-01-01 09:30 AM',
    updatedBy: 'Pavithra (HR Manager)'
  }
];

export const INITIAL_LOAN_RECORDS: LoanRecord[] = [
  {
    id: 'ADV-2026-001',
    employeeId: 'EMP-003',
    employeeName: 'Suresh Patel',
    department: 'Dispatch Head',
    designation: 'Dispatch Head',
    policyId: 'POL-LOAN-001',
    policyName: 'Employee Salary Loan Policy',
    requestType: 'Emergency Loan',
    basicSalary: 82000,
    eligibleLimitAmount: 164000,
    requestedAmount: 40000,
    outstandingBalance: 40000,
    installmentMonths: 2,
    monthlyDeduction: 20000,
    deductionStartMonth: 'Oct 2026',
    purpose: 'Medical Emergency',
    reasonDetails: 'Urgent hospitalization expenses for family member in Apollo Hospital.',
    requestedDate: '2026-09-02',
    neededByDate: '2026-09-08',
    status: 'Pending',
    repaymentSchedule: [
      {
        installmentNumber: 1,
        periodMonth: 'Oct 2026',
        scheduledAmount: 20000,
        actualDeducted: 0,
        remainingBalance: 20000,
        status: 'Pending'
      },
      {
        installmentNumber: 2,
        periodMonth: 'Nov 2026',
        scheduledAmount: 20000,
        actualDeducted: 0,
        remainingBalance: 0,
        status: 'Pending'
      }
    ],
    auditLogs: [
      {
        id: 'LOG-ADV-001-1',
        loanId: 'ADV-2026-001',
        action: 'Loan Requested',
        performedBy: 'Suresh Patel (EMP-003)',
        performedByRole: 'Employee',
        timestamp: '2026-09-02 10:15 AM',
        notes: 'Submitted emergency loan request for ₹40,000 for 2 months.'
      }
    ]
  },
  {
    id: 'ADV-2026-002',
    employeeId: 'EMP-004',
    employeeName: 'Karthik Rajan',
    department: 'Fabrication & Site Yard',
    designation: 'Fabrication Supervisor',
    policyId: 'POL-LOAN-001',
    policyName: 'Employee Salary Loan Policy',
    requestType: 'Employee Loan',
    basicSalary: 65000,
    eligibleLimitAmount: 130000,
    requestedAmount: 50000,
    approvedAmount: 50000,
    outstandingBalance: 50000,
    installmentMonths: 3,
    approvedMonths: 3,
    monthlyDeduction: 16667,
    deductionStartMonth: 'Sep 2026',
    purpose: 'Education & Tuition Fees',
    reasonDetails: 'Annual semester tuition and college admission fees for son.',
    requestedDate: '2026-08-28',
    neededByDate: '2026-09-05',
    status: 'Approved',
    hrApproval: {
      approvedBy: 'Pavithra (HR Manager)',
      approvedAt: '2026-08-30 11:30 AM',
      remarks: 'Verified salary and 5+ years track record. Approved in full.',
      status: 'Approved'
    },
    employeeVisibleNotes: 'Approved in full. Disbursement will be executed via NEFT within 2 business days.',
    internalHrNotes: 'Satisfactory performance record. Deduction starts from September 2026 cycle.',
    repaymentSchedule: [
      {
        installmentNumber: 1,
        periodMonth: 'Sep 2026',
        scheduledAmount: 16667,
        actualDeducted: 0,
        remainingBalance: 33333,
        status: 'Pending'
      },
      {
        installmentNumber: 2,
        periodMonth: 'Oct 2026',
        scheduledAmount: 16667,
        actualDeducted: 0,
        remainingBalance: 16666,
        status: 'Pending'
      },
      {
        installmentNumber: 3,
        periodMonth: 'Nov 2026',
        scheduledAmount: 16666,
        actualDeducted: 0,
        remainingBalance: 0,
        status: 'Pending'
      }
    ],
    auditLogs: [
      {
        id: 'LOG-ADV-002-1',
        loanId: 'ADV-2026-002',
        action: 'Loan Requested',
        performedBy: 'Karthik Rajan (EMP-004)',
        performedByRole: 'Employee',
        timestamp: '2026-08-28 02:40 PM',
        notes: 'Submitted loan request for ₹50,000 for 3 months.'
      },
      {
        id: 'LOG-ADV-002-2',
        loanId: 'ADV-2026-002',
        action: 'Loan Approved',
        performedBy: 'Pavithra (HR Manager)',
        performedByRole: 'HR Admin',
        timestamp: '2026-08-30 11:30 AM',
        previousValue: 'Status: Pending',
        newValue: 'Status: Approved, Sanctioned: ₹50,000'
      }
    ]
  },
  {
    id: 'ADV-2026-003',
    employeeId: 'EMP-002',
    employeeName: 'Ramesh Kumar',
    department: 'Production Head',
    designation: 'Production Head',
    policyId: 'POL-LOAN-001',
    policyName: 'Employee Salary Loan Policy',
    requestType: 'Employee Loan',
    basicSalary: 95000,
    eligibleLimitAmount: 190000,
    requestedAmount: 60000,
    approvedAmount: 60000,
    disbursedAmount: 60000,
    outstandingBalance: 40000, // 20,000 already recovered in Aug 2026 payroll
    installmentMonths: 3,
    approvedMonths: 3,
    monthlyDeduction: 20000,
    deductionStartMonth: 'Aug 2026',
    purpose: 'Home Renovation & Repair',
    reasonDetails: 'Urgent civil structural roofing repair before monsoon.',
    requestedDate: '2026-08-10',
    neededByDate: '2026-08-15',
    status: 'Active',
    hrApproval: {
      approvedBy: 'Pavithra (HR Manager)',
      approvedAt: '2026-08-11 10:15 AM',
      remarks: 'Verified eligibility and confirmed no other active loans.',
      status: 'Approved'
    },
    ceoApproval: {
      approvedBy: 'Velmurugan (CEO)',
      approvedAt: '2026-08-12 04:45 PM',
      remarks: 'Sanctioned in full. Ensure payroll deduction starts from August cycle.',
      status: 'Approved'
    },
    disbursementDetails: {
      disbursedAt: '2026-08-13',
      disbursedBy: 'Finance Disbursement Officer',
      paymentMode: 'NEFT',
      transactionRef: 'NEFT-VRM-89217340',
      notes: 'Disbursed to Canara Bank account.'
    },
    repaymentSchedule: [
      {
        installmentNumber: 1,
        periodMonth: 'Aug 2026',
        scheduledAmount: 20000,
        actualDeducted: 20000,
        remainingBalance: 40000,
        status: 'Deducted',
        deductedAt: '2026-08-31 06:30 PM',
        payrollBatchId: 'PAY-2026-08'
      },
      {
        installmentNumber: 2,
        periodMonth: 'Sep 2026',
        scheduledAmount: 20000,
        actualDeducted: 0,
        remainingBalance: 20000,
        status: 'Pending'
      },
      {
        installmentNumber: 3,
        periodMonth: 'Oct 2026',
        scheduledAmount: 20000,
        actualDeducted: 0,
        remainingBalance: 0,
        status: 'Pending'
      }
    ],
    auditLogs: [
      {
        id: 'LOG-ADV-003-1',
        loanId: 'ADV-2026-003',
        action: 'Loan Requested',
        performedBy: 'Ramesh Kumar (EMP-002)',
        performedByRole: 'Employee',
        timestamp: '2026-08-10 11:00 AM'
      },
      {
        id: 'LOG-ADV-003-2',
        loanId: 'ADV-2026-003',
        action: 'Loan Approved',
        performedBy: 'Velmurugan (CEO)',
        performedByRole: 'Super Admin',
        timestamp: '2026-08-12 04:45 PM'
      },
      {
        id: 'LOG-ADV-003-3',
        loanId: 'ADV-2026-003',
        action: 'Loan Disbursed',
        performedBy: 'Finance Officer',
        performedByRole: 'HR Admin',
        timestamp: '2026-08-13 02:00 PM',
        newValue: 'Disbursed ₹60,000 via NEFT Ref: NEFT-VRM-89217340'
      },
      {
        id: 'LOG-ADV-003-4',
        loanId: 'ADV-2026-003',
        action: 'Payroll Salary Deduction',
        performedBy: 'Payroll Engine',
        performedByRole: 'System',
        timestamp: '2026-08-31 06:30 PM',
        previousValue: 'Outstanding: ₹60,000',
        newValue: 'Outstanding: ₹40,000 (Deducted ₹20,000 in August Batch)'
      }
    ]
  },
  {
    id: 'ADV-2026-004',
    employeeId: 'EMP-005',
    employeeName: 'Priya Sharma',
    department: 'Quality & Safety',
    designation: 'Safety Officer',
    policyId: 'POL-LOAN-001',
    policyName: 'Employee Salary Loan Policy',
    requestType: 'Employee Loan',
    basicSalary: 58000,
    eligibleLimitAmount: 116000,
    requestedAmount: 30000,
    approvedAmount: 30000,
    disbursedAmount: 30000,
    outstandingBalance: 0, // Fully repaid
    installmentMonths: 2,
    approvedMonths: 2,
    monthlyDeduction: 15000,
    deductionStartMonth: 'Jun 2026',
    purpose: 'Vehicle Purchase / Repair',
    reasonDetails: 'Two-wheeler emergency engine overhaul and insurance renewal.',
    requestedDate: '2026-05-20',
    status: 'Closed',
    hrApproval: {
      approvedBy: 'Pavithra (HR Manager)',
      approvedAt: '2026-05-22 10:00 AM',
      remarks: 'Sanctioned.',
      status: 'Approved'
    },
    disbursementDetails: {
      disbursedAt: '2026-05-25',
      disbursedBy: 'Finance',
      paymentMode: 'NEFT',
      transactionRef: 'NEFT-VRM-71829011'
    },
    repaymentSchedule: [
      {
        installmentNumber: 1,
        periodMonth: 'Jun 2026',
        scheduledAmount: 15000,
        actualDeducted: 15000,
        remainingBalance: 15000,
        status: 'Deducted',
        deductedAt: '2026-06-30 06:00 PM',
        payrollBatchId: 'PAY-2026-06'
      },
      {
        installmentNumber: 2,
        periodMonth: 'Jul 2026',
        scheduledAmount: 15000,
        actualDeducted: 15000,
        remainingBalance: 0,
        status: 'Deducted',
        deductedAt: '2026-07-31 06:00 PM',
        payrollBatchId: 'PAY-2026-07'
      }
    ],
    auditLogs: [
      {
        id: 'LOG-ADV-004-1',
        loanId: 'ADV-2026-004',
        action: 'Loan Closed',
        performedBy: 'Payroll Engine',
        performedByRole: 'System',
        timestamp: '2026-07-31 06:00 PM',
        notes: 'Outstanding balance reached ₹0. Loan successfully closed.'
      }
    ]
  }
];
