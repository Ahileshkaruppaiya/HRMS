// VRM Enterprise HRM - Initial Settings & Policy Configuration Data
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
  PolicyAuditLog 
} from '../types/settings';

export const INITIAL_COMPANY_INFO: CompanyInfo = {
  logoUrl: '',
  companyName: 'Businz',
  legalCompanyName: 'Businz Private Limited',
  companyType: 'Private Limited',
  industry: 'Civil Infrastructure & Construction Engineering',
  registrationNumber: 'U45201TN2018PTC123456',
  gstNumber: '33AAACV1234F1Z5',
  panNumber: 'AAACV1234F',
  cinNumber: 'U45201TN2018PTC123456',
  website: 'https://vrmstructures.com',
  officialEmail: 'corporate@vrmstructures.com',
  officialPhone: '+91 44 2250 8890',
  createdAt: '2026-01-01T09:00:00.000Z',
  createdBy: 'Rajesh Sharma (CEO)',
  updatedAt: '2026-08-15T14:30:00.000Z',
  updatedBy: 'Pavithra (HR)'
};

export const INITIAL_COMPANY_BRANCHES: CompanyBranch[] = [
  {
    id: 'BR-HO-01',
    branchName: 'Head Office - Chennai',
    branchCode: 'HO-CHN',
    isHeadOffice: true,
    address: {
      addressLine1: 'Plot 42, Heavy Industrial Growth Estate',
      addressLine2: 'Phase II, Guindy Industrial Area',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '600032'
    },
    contactNumber: '+91 44 2250 8891',
    email: 'chennai.ho@vrmstructures.com',
    branchHr: 'Pavithra',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: {
      startTime: '09:30',
      endTime: '18:30'
    },
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z'
  }
];

export const INITIAL_ORG_STRUCTURE: OrganizationStructure = {
  departments: [
    'HR',
    'Sales',
    'Accounts',
    'Procurement',
    'Dispatch',
    'Design',
    'Finance',
    'Technical Support'
  ],
  designations: [
    'CEO',
    'HR Manager',
    'HR Executive',
    'Sales Head',
    'Sales Executive',
    'Accounts Head',
    'Senior Accountant',
    'Procurement Head',
    'Purchase Executive',
    'Dispatch Head',
    'Logistics Coordinator',
    'Chief Structural Engineer',
    'Lead CAD Designer',
    'Junior Draftsman',
    'Finance Manager',
    'Technical Support Lead'
  ],
  employmentTypes: [
    'Full-Time Regular',
    'Contractual Project Basis',
    'Site Deputation',
    'Probationary Associate'
  ],
  workLocations: [
    'Chennai HQ'
  ],
  reportingManagers: [
    { id: 'EMP-000', name: 'Velmurugan', department: 'Management' }
  ],
  teams: [
    { id: 'TM-01', name: 'Operations Team', departmentId: 'Management', leadEmployeeName: 'Velmurugan' }
  ]
};

export const DEFAULT_MASTER_ATTENDANCE_POLICIES: AttendancePolicy[] = [
  {
    id: 'AP-STD-01',
    policyName: 'General Corporate Late Attendance & Grace Policy',
    description: '10-minute grace period with tiered count-based deductions for late punches.',
    applicableEmployees: 'ALL',
    applicableDepartments: 'ALL',
    applicableBranches: 'ALL',
    effectiveFrom: '2026-01-01',
    status: 'Active',
    version: 1,

    shiftName: 'General Day Shift (9:30 AM - 6:30 PM)',
    startTime: '09:30',
    endTime: '18:30',
    graceTimeMinutes: 10,
    minWorkingHours: 8,
    halfDayHours: 4,
    fullDayHours: 8.5,
    weeklyOff: ['Sunday'],
    holidayCalendar: 'HQ Corporate Calendar 2026',

    lateRuleType: 'COUNT_BASED',
    countTiers: [
      { id: 'ct1', minCount: 1, maxCount: 3, deductionPerOccurrence: 0 },
      { id: 'ct2', minCount: 4, maxCount: 5, deductionPerOccurrence: 100 },
      { id: 'ct3', minCount: 6, maxCount: null, deductionPerOccurrence: 200 }
    ],
    halfDayLateHoursThreshold: 3,
    customFormula: '(LATE_COUNT * 100)',

    deductionVisibility: 'GENERIC',
    genericCategoryLabel: 'OTHERS',

    createdAt: '2026-01-01T09:00:00.000Z',
    createdBy: 'Velmurugan (CEO)',
    updatedAt: '2026-08-01T10:00:00.000Z',
    updatedBy: 'HR Admin'
  },
  {
    id: 'AP-SITE-02',
    policyName: 'Site Construction Strict Punctuality Policy',
    description: 'Fixed ₹100 deduction on every late check-in with 5-minute grace period for construction supervisors.',
    applicableEmployees: 'ALL',
    applicableDepartments: ['Civil & Structural Engineering', 'Plant & Machinery'],
    applicableBranches: ['BR-CBE-02'],
    effectiveFrom: '2026-02-01',
    status: 'Inactive',
    version: 1,

    shiftName: 'Early Site Shift (8:30 AM - 5:30 PM)',
    startTime: '08:30',
    endTime: '17:30',
    graceTimeMinutes: 5,
    minWorkingHours: 8.5,
    halfDayHours: 4,
    fullDayHours: 9,
    weeklyOff: ['Sunday'],
    holidayCalendar: 'Site Construction Calendar',

    lateRuleType: 'FIXED_AMOUNT',
    fixedAmount: 100,

    deductionVisibility: 'GENERIC',
    genericCategoryLabel: 'OTHERS',

    createdAt: '2026-02-01T09:00:00.000Z',
    createdBy: 'Pavithra (HR)',
    updatedAt: '2026-07-15T12:00:00.000Z',
    updatedBy: 'Pavithra (HR)'
  }
];

export const INITIAL_ATTENDANCE_CORRECTIONS: AttendanceCorrectionRequest[] = [];

export const DEFAULT_MASTER_LEAVE_POLICIES: MasterLeavePolicy[] = [
  {
    id: 'LP-MASTER-CONFIRMED',
    policyName: 'Casual Leave Policy',
    description: 'Casual Leave (CL): 1 day per month (12 days/year) - Paid. Additional unpaid leaves incur 1 day salary deduction.',
    applicableEmployees: 'ALL',
    applicableDepartments: 'ALL',
    applicableBranches: 'ALL',
    applicableEmploymentType: 'Confirmed',
    effectiveDate: '2026-01-01',
    status: 'Active',
    version: 1,

    leaveTypes: [
      { id: 'lt-cl', name: 'Casual Leave (CL)', isPaid: true, quotaPerYear: 12, description: '1 Day Paid Casual Leave per month', color: '#0E7490' },
      { id: 'lt-ul', name: 'Unpaid Leave (LWP)', isPaid: false, quotaPerYear: 12, description: 'Loss of pay leave beyond monthly paid quota', color: '#EF4444' }
    ],

    monthlyFreeUnpaidLeaves: 1,
    deductionRuleType: 'DAILY_SALARY',
    dailySalaryMultiplier: 1,
    customFormula: '(DAILY_SALARY * UNPAID_DAYS)',

    approvalFlow: 'EMPLOYEE_HR',

    deductionVisibility: 'GENERIC',
    genericCategoryLabel: 'OTHERS',

    createdAt: '2026-01-01T09:00:00.000Z',
    createdBy: 'HR Admin',
    updatedAt: '2026-08-01T10:00:00.000Z',
    updatedBy: 'HR Admin'
  },
  {
    id: 'LP-MASTER-SICK',
    policyName: 'Sick Leave Policy',
    description: 'Sick Leave (SL): 6 days per year - Paid. For medical recovery and health reasons.',
    applicableEmployees: 'ALL',
    applicableDepartments: 'ALL',
    applicableBranches: 'ALL',
    applicableEmploymentType: 'Confirmed',
    effectiveDate: '2026-01-01',
    status: 'Active',
    version: 1,

    leaveTypes: [
      { id: 'lt-sl', name: 'Sick Leave (SL)', isPaid: true, quotaPerYear: 6, description: '6 Days Paid Sick Leave per year', color: '#0E7490' },
      { id: 'lt-ul-sl', name: 'Unpaid Leave (LWP)', isPaid: false, quotaPerYear: 12, description: 'Loss of pay leave beyond quota', color: '#EF4444' }
    ],

    monthlyFreeUnpaidLeaves: 1,
    deductionRuleType: 'DAILY_SALARY',
    dailySalaryMultiplier: 1,
    customFormula: '(DAILY_SALARY * UNPAID_DAYS)',

    approvalFlow: 'EMPLOYEE_HR',

    deductionVisibility: 'GENERIC',
    genericCategoryLabel: 'OTHERS',

    createdAt: '2026-01-01T09:00:00.000Z',
    createdBy: 'HR Admin',
    updatedAt: '2026-08-01T10:00:00.000Z',
    updatedBy: 'HR Admin'
  },
  {
    id: 'LP-MASTER-PROVISIONAL',
    policyName: 'Provisional Leave Policy',
    description: 'Provisional Paid Leave: 1 day total during the first 3 months of probation - Paid.',
    applicableEmployees: 'ALL',
    applicableDepartments: 'ALL',
    applicableBranches: 'ALL',
    applicableEmploymentType: 'Provisional',
    effectiveDate: '2026-01-01',
    status: 'Active',
    version: 1,

    leaveTypes: [
      { id: 'lt-pl-prov', name: 'Provisional Paid Leave', isPaid: true, quotaPerYear: 1, description: '1 Paid Leave total during initial 3-month probation', color: '#0E7490' },
      { id: 'lt-ul-prov', name: 'Unpaid Leave (LWP)', isPaid: false, quotaPerYear: 12, description: 'Loss of pay leave beyond 1 provisional paid day', color: '#EF4444' }
    ],

    monthlyFreeUnpaidLeaves: 0,
    deductionRuleType: 'DAILY_SALARY',
    dailySalaryMultiplier: 1,
    customFormula: '(DAILY_SALARY * UNPAID_DAYS)',

    approvalFlow: 'EMPLOYEE_HR',

    deductionVisibility: 'GENERIC',
    genericCategoryLabel: 'OTHERS',

    createdAt: '2026-01-01T09:00:00.000Z',
    createdBy: 'HR Admin',
    updatedAt: '2026-08-01T10:00:00.000Z',
    updatedBy: 'HR Admin'
  }
];

export const INITIAL_PAYROLL_CONFIG: PayrollSettingsConfig = {
  components: [
    // 1. Official Earnings (100% Total CTC Breakdown)
    { id: 'c-basic', name: 'Basic Salary', code: 'BASIC', type: 'EARNING', calculationMethod: 'PERCENTAGE', defaultValue: 40, percentageBase: 'CTC', isStatutory: true, active: true, isConfidential: false, description: '40% of Total Monthly CTC' },
    { id: 'c-da', name: 'Dearness Allowance (DA)', code: 'DA', type: 'EARNING', calculationMethod: 'PERCENTAGE', defaultValue: 20, percentageBase: 'CTC', isStatutory: true, active: true, isConfidential: false, description: '20% of Total Monthly CTC' },
    { id: 'c-hra', name: 'House Rent Allowance (HRA)', code: 'HRA', type: 'EARNING', calculationMethod: 'PERCENTAGE', defaultValue: 35, percentageBase: 'CTC', isStatutory: false, active: true, isConfidential: false, description: '35% of Total Monthly CTC' },
    { id: 'c-conv', name: 'Conveyance Allowance', code: 'CONV', type: 'EARNING', calculationMethod: 'PERCENTAGE', defaultValue: 5, percentageBase: 'CTC', isStatutory: false, active: true, isConfidential: false, description: '5% of Total Monthly CTC' },

    // 2. Official Deductions & Statutory Contributions
    { id: 'c-pf', name: 'Employee Provident Fund (EPF)', code: 'EPF', type: 'DEDUCTION', calculationMethod: 'FORMULA', defaultValue: 12, formula: '((BASIC + DA + CONV) * 12) / 100', isStatutory: true, active: true, isConfidential: false, description: '12% of PF Base (Basic + DA + Conveyance) for With PF staff; Exempt for < 6 months' },
    { id: 'c-esi', name: 'Employees State Insurance (ESIC)', code: 'ESIC', type: 'DEDUCTION', calculationMethod: 'PERCENTAGE', defaultValue: 0.75, percentageBase: 'GROSS', isStatutory: true, active: true, isConfidential: false, description: '0.75% of Gross for wages <= ₹21,000 for With PF staff; Exempt for < 6 months' },
    { id: 'c-pt', name: 'Professional Tax (PT)', code: 'PT', type: 'DEDUCTION', calculationMethod: 'FIXED_AMOUNT', defaultValue: 200, isStatutory: true, active: true, isConfidential: false, description: 'State government professional tax deduction' },
    { id: 'c-adv', name: 'Advance Salary Recovery', code: 'ADV_REC', type: 'DEDUCTION', calculationMethod: 'FIXED_AMOUNT', defaultValue: 0, isStatutory: false, active: true, isConfidential: false, description: 'Monthly EMI recovery for approved advance salary' },
    { id: 'c-late', name: 'Late Attendance Deduction', code: 'LATE_DED', type: 'DEDUCTION', calculationMethod: 'FORMULA', defaultValue: 0, formula: '(LATE_COUNT * 100)', isStatutory: false, active: true, isConfidential: true, description: 'Deduction generated dynamically from Attendance Policy' },
    { id: 'c-lop', name: 'Unpaid Leave Deduction', code: 'LOP_DED', type: 'DEDUCTION', calculationMethod: 'FORMULA', defaultValue: 0, formula: '(DAILY_SALARY * UNPAID_DAYS)', isStatutory: false, active: true, isConfidential: true, description: 'Deduction calculated dynamically from Leave Policy (1x Daily Salary)' }
  ],

  pfPolicy: {
    active: true,
    calculationType: 'FORMULA',
    percentage: 12,
    calculationBase: 'CUSTOM',
    formula: '(BASIC + DA + CONV) * 12 / 100',
    effectiveDate: '2026-01-01',
    version: 1
  },

  esicPolicy: {
    active: true,
    percentage: 0.75,
    grossSalaryLimit: 21000,
    formula: 'GROSS * 0.75 / 100',
    effectiveDate: '2026-01-01',
    version: 1
  },

  incrementPolicy: {
    active: true,
    cycle: 'Annual Appraisal Cycle (April)',
    effectiveMonth: 'April',
    standardBaseIncrement: 8,
    allowManagerRecommendation: true,
    slabs: [
      { id: 'inc-1', name: 'Top Performer (Rating 4.8 - 5.0)', ratingMin: 4.8, ratingMax: 5.0, incrementPercentage: 18, applicableCadre: 'All Confirmed Staff', effectiveCycle: 'April Annual Appraisal', status: 'Active' },
      { id: 'inc-2', name: 'Exceeds Expectations (Rating 4.0 - 4.7)', ratingMin: 4.0, ratingMax: 4.7, incrementPercentage: 12, applicableCadre: 'All Confirmed Staff', effectiveCycle: 'April Annual Appraisal', status: 'Active' },
      { id: 'inc-3', name: 'Meets Expectations (Rating 3.0 - 3.9)', ratingMin: 3.0, ratingMax: 3.9, incrementPercentage: 8, applicableCadre: 'All Confirmed Staff', effectiveCycle: 'April Annual Appraisal', status: 'Active' },
      { id: 'inc-4', name: 'Developing / Needs Improvement (< 3.0)', ratingMin: 0, ratingMax: 2.9, incrementPercentage: 0, applicableCadre: 'All Confirmed Staff', effectiveCycle: 'April Annual Appraisal', status: 'Active' }
    ]
  },

  standardWorkingDaysPerMonth: 26,
  payrollCycleDay: 1,
  enableProfessionalTax: true,
  standardPtAmount: 200,
  updatedAt: '2026-08-01T10:00:00.000Z',
  updatedBy: 'Pavithra (HR)'
};

export const INITIAL_REWARD_POLICIES: RewardPolicy[] = [
  {
    id: 'RP-ATT-01',
    rewardName: 'Monthly 100% Attendance & Punctuality Reward',
    rewardType: 'Attendance Reward',
    description: 'Monthly incentive of ₹1,000 awarded for 100% presence — zero leaves, zero unplanned absent days, and zero late check-ins in the calendar month.',
    applicableEmployees: 'ALL',
    applicableDepartments: 'ALL',
    eligibilityRule: 'Zero leaves, zero absent days, and zero late marks in the calendar month (100% attendance)',
    valueType: 'FIXED_AMOUNT',
    amountValue: 1000,
    addToPayroll: true,
    status: 'Active',
    version: 1,
    createdAt: '2026-01-01T09:00:00.000Z',
    createdBy: 'Pavithra (HR)',
    updatedAt: '2026-09-10T10:00:00.000Z',
    updatedBy: 'Pavithra (HR)'
  }
];

export const INITIAL_EMPLOYEE_REWARDS: EmployeeRewardRecord[] = [];

export const INITIAL_POLICY_AUDIT_LOGS: PolicyAuditLog[] = [];
