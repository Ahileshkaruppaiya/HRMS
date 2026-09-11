import {
  BenchmarkConfig,
  ProductIncentiveRule,
  IncentiveSplit,
  KpiWeights,
  EmployeePerformanceDetail,
  DepartmentPerformanceDetail,
  DepartmentPerformanceTemplate,
  PipRecord,
  GoalItem,
  PerformanceReviewRecord,
  PerformanceSettingsConfig,
  CompanyDepartment,
  KpiItem,
  KraItem
} from '../types/performance';

// 1. Overall Team Sales Benchmark
export const BENCHMARK_CONFIG: BenchmarkConfig = {
  monthlyBenchmarkAmount: 60000000, // ₹6,00,00,000 (₹6 Crores)
  currentAchievedAmount: 54850000,  // ₹5,48,50,000 (91.4%)
  benchmarkPeriod: 'September 2026',
  lastMonthAchieved: 58200000       // ₹5,82,00,000 (97.0%)
};

// 2. Product Incentive Rules
export const PRODUCT_INCENTIVE_RULES: ProductIncentiveRule[] = [
  {
    id: 'PIR-01',
    productName: 'Module Mounting Structures',
    benchmarkAmount: 5000000,       // ₹50,00,000
    ratePercentage: 0.7,            // 0.7%
    description: 'Hot-dip galvanized solar ground and rooftop mounting structure channels'
  },
  {
    id: 'PIR-02',
    productName: 'Balance of System',
    benchmarkAmount: 10000000,      // ₹1,00,00,000
    ratePercentage: 0.3,            // 0.3%
    description: 'Solar BOS electrical balance of system kits, combiner boxes, cabling & fasteners'
  }
];

// 3. Incentive Split Formula
export const INCENTIVE_SPLIT: IncentiveSplit = {
  salespersonShare: 50.0,
  techSupportManagerShare: 20.0,
  supportPoolShare: 30.0
};

// 4. KPI Weights Configuration
export const KPI_WEIGHTS: KpiWeights = {
  attendancePoints: 5.0,
  feedbackQualityPoints: 20.0,
  newCustomerPoints: 20.0,
  invoicePoints: 20.0,
  fullBosKitsSupply: 35.0
};

// 5. 8 Realistic Department KRA & KPI Templates
export const DEPARTMENT_TEMPLATES: DepartmentPerformanceTemplate[] = [
  {
    department: 'HR',
    kras: [
      { title: 'Employee Management', description: 'Maintain employee lifecycle records, compliance & query resolutions', weightage: 25, targetMetric: '100% Policy Compliance' },
      { title: 'Recruitment', description: 'Timely hiring of engineering, sales, and plant personnel within budget', weightage: 25, targetMetric: 'Avg Time-to-Hire < 25 Days' },
      { title: 'Attendance & Leave', description: 'Punctuality governance, biometric sync, and leave policy oversight', weightage: 20, targetMetric: '99% Attendance Accuracy' },
      { title: 'Employee Engagement', description: 'Organize quarterly wellness, awards, training & team feedback sessions', weightage: 15, targetMetric: '4.5/5 Satisfaction Score' },
      { title: 'HR Operations', description: 'Payroll coordination, statutory compliance, insurance & onboarding', weightage: 15, targetMetric: 'Zero Audit Non-conformances' }
    ],
    kpis: [
      { title: 'Recruitment Completion', target: '100%', weightage: 25, unit: '%' },
      { title: 'Employee Onboarding Completion', target: '100%', weightage: 20, unit: '%' },
      { title: 'Attendance Accuracy', target: '99%', weightage: 20, unit: '%' },
      { title: 'Leave Processing Time', target: '< 24 Hours', weightage: 20, unit: 'hrs' },
      { title: 'Employee Issue Resolution', target: '95%', weightage: 15, unit: '%' }
    ]
  },
  {
    department: 'Sales',
    kras: [
      { title: 'Sales Target', description: 'Achieve monthly and quarterly booking quota for MMS & BOS systems', weightage: 35, targetMetric: '₹80 Lakhs Quota' },
      { title: 'Customer Acquisition', description: 'Identify and convert tier-1 rooftop solar EPCs and contractors', weightage: 25, targetMetric: '8 New EPC Accounts' },
      { title: 'Revenue Growth', description: 'Upsell complete BOS packages with structure channel deliveries', weightage: 20, targetMetric: '35 Full BOS Bundles' },
      { title: 'Customer Relationship', description: 'Nurture client loyalty, rapid quotation turnarounds & repeat deals', weightage: 20, targetMetric: '90% Repeat Retention' }
    ],
    kpis: [
      { title: 'Monthly Sales Target', target: '₹80,00,000', weightage: 30, unit: '₹' },
      { title: 'New Customers', target: '8 Accounts', weightage: 25, unit: 'qty' },
      { title: 'Conversion Rate', target: '25%', weightage: 15, unit: '%' },
      { title: 'Revenue Generated', target: '₹95,00,000', weightage: 20, unit: '₹' },
      { title: 'Follow-up Completion', target: '95%', weightage: 10, unit: '%' }
    ]
  },
  {
    department: 'Accounts',
    kras: [
      { title: 'Accounting Accuracy', description: 'Ledger reconciliations, daily vouchers, and GST/TDS filings', weightage: 30, targetMetric: '100% Error-free Books' },
      { title: 'Invoice Management', description: 'Generate client dispatch invoices and verify purchase receipts', weightage: 25, targetMetric: '< 24hr Invoice Issuance' },
      { title: 'Receivables', description: 'DSO recovery from solar EPCs and milestone payment collections', weightage: 25, targetMetric: '95% Recovery Rate' },
      { title: 'Payables', description: 'Vendor disbursements, freight settlements, and cash discount optimization', weightage: 20, targetMetric: 'On-time Vendor Payouts' }
    ],
    kpis: [
      { title: 'Invoice Accuracy', target: '99.5%', weightage: 25, unit: '%' },
      { title: 'Payment Processing', target: '98%', weightage: 25, unit: '%' },
      { title: 'Reconciliation Completion', target: '100%', weightage: 25, unit: '%' },
      { title: 'Error Rate', target: '< 0.5%', weightage: 15, unit: '%' },
      { title: 'On-time Reporting', target: '100%', weightage: 10, unit: '%' }
    ]
  },
  {
    department: 'Procurement',
    kras: [
      { title: 'Vendor Management', description: 'Evaluate coil suppliers, galvanizers, and fastner manufacturers', weightage: 25, targetMetric: 'Avg 92% Vendor SLA' },
      { title: 'Purchase Management', description: 'Issue POs with optimal lead-time and transparent commercial terms', weightage: 25, targetMetric: '< 48h PO Turnaround' },
      { title: 'Cost Optimization', description: 'Negotiate volume rates on HR coils and stainless steel hardware', weightage: 25, targetMetric: '5% Annual Savings' },
      { title: 'Material Availability', description: 'Zero raw material stockouts in roll-forming and cutting lines', weightage: 25, targetMetric: 'Zero Production Stoppage' }
    ],
    kpis: [
      { title: 'Purchase Order Completion', target: '95%', weightage: 25, unit: '%' },
      { title: 'Vendor Delivery Performance', target: '92%', weightage: 25, unit: '%' },
      { title: 'Cost Savings', target: '5%', weightage: 20, unit: '%' },
      { title: 'Purchase Accuracy', target: '98%', weightage: 15, unit: '%' },
      { title: 'On-time Procurement', target: '94%', weightage: 15, unit: '%' }
    ]
  },
  {
    department: 'Dispatch',
    kras: [
      { title: 'Order Dispatch', description: 'Load-out planning, truck allotment, and dock management', weightage: 30, targetMetric: '100% Scheduled Outflow' },
      { title: 'Delivery Coordination', description: 'In-transit vehicle tracking and site coordination with EPC engineers', weightage: 25, targetMetric: '< 1% In-transit Delay' },
      { title: 'Accuracy', description: 'Zero short-shipments of fasteners, clamps, and channel accessories', weightage: 25, targetMetric: '99.8% Packing Accuracy' },
      { title: 'Timeliness', description: 'Dispatch milestone clearance matching delivery promises', weightage: 20, targetMetric: 'Zero Delivery Penalties' }
    ],
    kpis: [
      { title: 'On-time Dispatch', target: '98%', weightage: 30, unit: '%' },
      { title: 'Dispatch Accuracy', target: '99.5%', weightage: 30, unit: '%' },
      { title: 'Order Processing Time', target: '< 3 Hours', weightage: 20, unit: 'hrs' },
      { title: 'Delivery Issue Rate', target: '< 1%', weightage: 20, unit: '%' }
    ]
  },
  {
    department: 'Design',
    kras: [
      { title: 'Design Quality', description: 'Structural wind-load calculations, STAAD-Pro simulations & 3D models', weightage: 30, targetMetric: 'Zero Structural Failures' },
      { title: 'Creative Output', description: 'Deliver complete fabrication drawings, BOMs and sales proposal layouts', weightage: 25, targetMetric: '50 Project Layouts / Month' },
      { title: 'Timeliness', description: 'Fast turnaround on customized rooftop structure layout drafts', weightage: 25, targetMetric: '< 24hr Standard Layouts' },
      { title: 'Brand Compliance', description: 'Consistent drawing borders, technical datasheets & catalog updates', weightage: 20, targetMetric: '100% Standard Template' }
    ],
    kpis: [
      { title: 'Design Completion', target: '96%', weightage: 25, unit: '%' },
      { title: 'Revision Rate', target: '< 10%', weightage: 25, unit: '%' },
      { title: 'On-time Delivery', target: '95%', weightage: 20, unit: '%' },
      { title: 'Quality Rating', target: '4.8 / 5.0', weightage: 15, unit: 'pts' },
      { title: 'Creative Consistency', target: '98%', weightage: 15, unit: '%' }
    ]
  },
  {
    department: 'Finance',
    kras: [
      { title: 'Financial Reporting', description: 'Prepare P&L, balance sheets, cashflow statements & statutory MIS', weightage: 30, targetMetric: '3rd of Month Closing' },
      { title: 'Budget Management', description: 'Departmental budget variance monitoring and capex expenditure audit', weightage: 25, targetMetric: '< 3% Budget Variance' },
      { title: 'Cash Flow', description: 'Working capital financing, LC management, and banking lines', weightage: 25, targetMetric: 'Positive Working Capital' },
      { title: 'Compliance', description: 'Direct/Indirect taxation, company law compliance and external audit', weightage: 20, targetMetric: '100% Compliant' }
    ],
    kpis: [
      { title: 'Report Accuracy', target: '99.8%', weightage: 25, unit: '%' },
      { title: 'Budget Variance', target: '< 3%', weightage: 25, unit: '%' },
      { title: 'Payment Processing', target: '97%', weightage: 20, unit: '%' },
      { title: 'Financial Closing', target: 'By 3rd of Month', weightage: 15, unit: 'day' },
      { title: 'Compliance Completion', target: '100%', weightage: 15, unit: '%' }
    ]
  },
  {
    department: 'Technical Support',
    kras: [
      { title: 'Ticket Resolution', description: 'Solve field installation doubts, structural questions & torque specs', weightage: 30, targetMetric: '120 Tickets Closed / Mo' },
      { title: 'Customer Support', description: 'Field site visits, commissioning guidance, and pre-sales engineering', weightage: 25, targetMetric: '4.8/5 CSAT Score' },
      { title: 'Technical Quality', description: 'Provide accurate engineering troubleshooting and installation SOPs', weightage: 25, targetMetric: 'Zero Misalignment Rework' },
      { title: 'Response Time', description: 'Maintain rapid response SLA on WhatsApp and portal helpdesk', weightage: 20, targetMetric: '< 15 Mins First Response' }
    ],
    kpis: [
      { title: 'Tickets Resolved', target: '120 Tickets', weightage: 30, unit: 'qty' },
      { title: 'First Response Time', target: '< 15 Mins', weightage: 25, unit: 'min' },
      { title: 'Resolution Time', target: '< 4 Hours', weightage: 20, unit: 'hrs' },
      { title: 'Customer Satisfaction', target: '4.8 / 5.0', weightage: 15, unit: 'pts' },
      { title: 'Escalation Rate', target: '< 2%', weightage: 10, unit: '%' }
    ]
  }
];

// Helper to compute incentive
export function calculateEmployeeIncentive(
  roleCategory: EmployeePerformanceDetail['roleCategory'],
  mmsSales: number,
  bosSales: number
): { incentiveAmount: number; sharePercent: number } {
  const mmsIncentivePool = mmsSales * (PRODUCT_INCENTIVE_RULES[0].ratePercentage / 100);
  const bosIncentivePool = bosSales * (PRODUCT_INCENTIVE_RULES[1].ratePercentage / 100);
  const totalPool = mmsIncentivePool + bosIncentivePool;

  if (roleCategory === 'Sales') {
    return {
      incentiveAmount: Math.round(totalPool * (INCENTIVE_SPLIT.salespersonShare / 100)),
      sharePercent: INCENTIVE_SPLIT.salespersonShare
    };
  } else if (roleCategory === 'Tech Support' || roleCategory === 'Management') {
    return {
      incentiveAmount: Math.round(totalPool * (INCENTIVE_SPLIT.techSupportManagerShare / 100)),
      sharePercent: INCENTIVE_SPLIT.techSupportManagerShare
    };
  } else {
    return {
      incentiveAmount: Math.round(totalPool * (INCENTIVE_SPLIT.supportPoolShare / 100) * 0.25),
      sharePercent: INCENTIVE_SPLIT.supportPoolShare
    };
  }
}

// 6. Detailed Employee Performance Records
export const INITIAL_EMPLOYEE_PERFORMANCE: EmployeePerformanceDetail[] = [
  // 1. Sales - Arun Kumar (Top Performer)
  {
    id: 'PERF-008',
    employeeId: 'EMP-008',
    employeeName: 'Arun Kumar',
    department: 'Sales',
    designation: 'Senior Sales Manager',
    reportingManager: 'Velmurugan (CEO)',
    roleCategory: 'Sales',
    overallScore: 96,
    performanceGrade: 'Exceptional',
    performanceStatus: 'Outstanding',
    kraScore: 98,
    kpiScore: 94,
    goalScore: 95,
    taskScore: 96,
    attendanceScore: 99,
    kpiBreakdown: {
      attendanceScore: 4.9,
      attendancePercent: 99,
      feedbackQualityScore: 19.3,
      feedbackRating: 4.9,
      newCustomerScore: 19.5,
      newCustomersCount: 12,
      invoiceScore: 19.0,
      invoiceClearanceRate: 96,
      fullBosKitsSupplyScore: 33.5,
      bosKitsSuppliedCount: 48
    },
    attendanceImpact: {
      attendancePercent: 99,
      lateDays: 0,
      absentDays: 0,
      leaveDays: 1,
      overtimeHours: 14
    },
    taskPerformance: {
      tasksAssigned: 28,
      tasksCompleted: 27,
      completionRate: 96,
      overdueTasks: 0
    },
    mmsSalesAmount: 9500000,
    bosSalesAmount: 14000000,
    totalSalesAchieved: 23500000,
    calculatedIncentive: 54250,
    incentiveRoleShare: 50.0,
    incentiveStatus: 'Eligible',
    kras: [
      {
        id: 'kra-s1',
        title: 'Utility & C&I Solar Order Booking',
        description: 'Secure purchase orders for Module Mounting Structures in South India',
        weightage: 35,
        targetMetric: '₹80.0 Lakhs',
        achievedMetric: '₹95.0 Lakhs (119%)',
        achievementPercentage: 119,
        score: 100,
        status: 'Exceeded'
      },
      {
        id: 'kra-s2',
        title: 'Full BOS Kit Solution Bundling',
        description: 'Attach complete BOS balance of system packages with MMS sales',
        weightage: 30,
        targetMetric: '35 Full Kits',
        achievedMetric: '48 Kits (137%)',
        achievementPercentage: 137,
        score: 100,
        status: 'Exceeded'
      },
      {
        id: 'kra-s3',
        title: 'New Customer Acquisition',
        description: 'Onboard tier-1 rooftop solar EPC contractors',
        weightage: 20,
        targetMetric: '8 Accounts',
        achievedMetric: '12 Accounts (150%)',
        achievementPercentage: 150,
        score: 100,
        status: 'Exceeded'
      },
      {
        id: 'kra-s4',
        title: 'Customer Retention & Relationships',
        description: 'Nurture client loyalty, rapid quotation turnarounds & repeat deals',
        weightage: 15,
        targetMetric: '90% Retention',
        achievedMetric: '94% Retention',
        achievementPercentage: 104,
        score: 95,
        status: 'Good'
      }
    ],
    kpis: [
      { id: 'kpi-s1', title: 'Monthly Sales Target', department: 'Sales', target: '₹80,00,000', actual: '₹95,00,000', achievementPercentage: 119, weightage: 30, score: 100, unit: '₹' },
      { id: 'kpi-s2', title: 'New Customers', department: 'Sales', target: '8 Accounts', actual: '12 Accounts', achievementPercentage: 150, weightage: 25, score: 100, unit: 'qty' },
      { id: 'kpi-s3', title: 'Conversion Rate', department: 'Sales', target: '25%', actual: '28%', achievementPercentage: 112, weightage: 15, score: 95, unit: '%' },
      { id: 'kpi-s4', title: 'Revenue Generated', department: 'Sales', target: '₹80,00,000', actual: '₹95,00,000', achievementPercentage: 119, weightage: 20, score: 100, unit: '₹' },
      { id: 'kpi-s5', title: 'Follow-up Completion', department: 'Sales', target: '95%', actual: '97%', achievementPercentage: 102, weightage: 10, score: 97, unit: '%' }
    ],
    hasActivePip: false,
    monthlyHistory: [
      { month: '2026 Q1', score: 91 },
      { month: '2026 Q2', score: 94 },
      { month: '2026 Q3', score: 96 }
    ],
    managerAppraisalNotes: 'Outstanding quarterly performance. Championed multi-MW ground mount solar structures and maintained perfect customer relationship scores.',
    lastEvaluationDate: '2026-09-02'
  },

  // 2. Sales - Meera Reddy
  {
    id: 'PERF-009',
    employeeId: 'EMP-009',
    employeeName: 'Meera Reddy',
    department: 'Sales',
    designation: 'Regional Sales Lead',
    reportingManager: 'Arun Kumar',
    roleCategory: 'Sales',
    overallScore: 91,
    performanceGrade: 'Exceptional',
    performanceStatus: 'Outstanding',
    kraScore: 92,
    kpiScore: 90,
    goalScore: 91,
    taskScore: 92,
    attendanceScore: 97,
    kpiBreakdown: {
      attendanceScore: 4.8,
      attendancePercent: 97,
      feedbackQualityScore: 18.5,
      feedbackRating: 4.7,
      newCustomerScore: 18.0,
      newCustomersCount: 9,
      invoiceScore: 18.0,
      invoiceClearanceRate: 92,
      fullBosKitsSupplyScore: 31.5,
      bosKitsSuppliedCount: 38
    },
    attendanceImpact: {
      attendancePercent: 97,
      lateDays: 1,
      absentDays: 0,
      leaveDays: 1,
      overtimeHours: 8
    },
    taskPerformance: {
      tasksAssigned: 24,
      tasksCompleted: 23,
      completionRate: 96,
      overdueTasks: 0
    },
    mmsSalesAmount: 7200000,
    bosSalesAmount: 9000000,
    totalSalesAchieved: 16200000,
    calculatedIncentive: 38700,
    incentiveRoleShare: 50.0,
    incentiveStatus: 'Eligible',
    kras: [
      { id: 'kra-s5', title: 'Solar Target Booking', description: 'Regional rooftop solar sales conversion', weightage: 35, targetMetric: '₹60.0 Lakhs', achievedMetric: '₹72.0 Lakhs', achievementPercentage: 120, score: 96, status: 'Exceeded' },
      { id: 'kra-s6', title: 'Customer Acquisition', description: 'Key EPC contractor signups in West zone', weightage: 25, targetMetric: '6 Accounts', achievedMetric: '9 Accounts', achievementPercentage: 150, score: 100, status: 'Exceeded' },
      { id: 'kra-s7', title: 'Full BOS Kit Solutions', description: 'Package attachment rate', weightage: 20, targetMetric: '25 Kits', achievedMetric: '38 Kits', achievementPercentage: 152, score: 98, status: 'Exceeded' },
      { id: 'kra-s8', title: 'Customer Satisfaction', description: 'Post-dispatch feedback', weightage: 20, targetMetric: '4.5/5', achievedMetric: '4.7/5', achievementPercentage: 104, score: 94, status: 'Good' }
    ],
    kpis: [
      { id: 'kpi-s6', title: 'Monthly Sales Target', department: 'Sales', target: '₹60,00,000', actual: '₹72,00,000', achievementPercentage: 120, weightage: 30, score: 98, unit: '₹' },
      { id: 'kpi-s7', title: 'New Customers', department: 'Sales', target: '6 Accounts', actual: '9 Accounts', achievementPercentage: 150, weightage: 25, score: 100, unit: 'qty' },
      { id: 'kpi-s8', title: 'Conversion Rate', department: 'Sales', target: '25%', actual: '26%', achievementPercentage: 104, weightage: 15, score: 92, unit: '%' }
    ],
    hasActivePip: false,
    monthlyHistory: [
      { month: '2026 Q1', score: 87 },
      { month: '2026 Q2', score: 89 },
      { month: '2026 Q3', score: 91 }
    ],
    managerAppraisalNotes: 'Consistent high performer with strong pipeline in commercial rooftop installations.',
    lastEvaluationDate: '2026-09-03'
  },

  // 3. HR - Pavithra (HR Lead)
  {
    id: 'PERF-001',
    employeeId: 'EMP-001',
    employeeName: 'Pavithra',
    department: 'HR',
    designation: 'HR Specialist',
    reportingManager: 'Velmurugan (CEO)',
    roleCategory: 'Management',
    overallScore: 93,
    performanceGrade: 'Exceptional',
    performanceStatus: 'Outstanding',
    kraScore: 94,
    kpiScore: 92,
    goalScore: 94,
    taskScore: 95,
    attendanceScore: 100,
    kpiBreakdown: {
      attendanceScore: 5.0,
      attendancePercent: 100,
      feedbackQualityScore: 19.0,
      feedbackRating: 4.8,
      newCustomerScore: 16.0,
      newCustomersCount: 0,
      invoiceScore: 19.2,
      invoiceClearanceRate: 98,
      fullBosKitsSupplyScore: 33.3,
      bosKitsSuppliedCount: 0
    },
    attendanceImpact: {
      attendancePercent: 100,
      lateDays: 0,
      absentDays: 0,
      leaveDays: 0,
      overtimeHours: 6
    },
    taskPerformance: {
      tasksAssigned: 32,
      tasksCompleted: 31,
      completionRate: 97,
      overdueTasks: 0
    },
    mmsSalesAmount: 0,
    bosSalesAmount: 0,
    totalSalesAchieved: 0,
    calculatedIncentive: 26000,
    incentiveRoleShare: 20.0,
    incentiveStatus: 'Eligible',
    kras: [
      { id: 'kra-h1', title: 'Employee Management', description: 'Maintain employee lifecycle records & compliance', weightage: 25, targetMetric: '100% Compliance', achievedMetric: '100%', achievementPercentage: 100, score: 98, status: 'Completed' },
      { id: 'kra-h2', title: 'Recruitment', description: 'Timely hiring of plant and sales engineers', weightage: 25, targetMetric: '< 25 Days', achievedMetric: '21 Days Avg', achievementPercentage: 119, score: 95, status: 'Exceeded' },
      { id: 'kra-h3', title: 'Attendance & Leave', description: 'Punctuality governance and leave policies', weightage: 20, targetMetric: '99% Accuracy', achievedMetric: '99.5% Accuracy', achievementPercentage: 101, score: 96, status: 'Good' },
      { id: 'kra-h4', title: 'Employee Engagement', description: 'Wellness initiatives and monthly recognitions', weightage: 15, targetMetric: '4.5/5 Rating', achievedMetric: '4.7/5 Rating', achievementPercentage: 104, score: 92, status: 'Good' },
      { id: 'kra-h5', title: 'HR Operations', description: 'Statutory filings and payroll verification', weightage: 15, targetMetric: 'Zero Defects', achievedMetric: 'Zero Audit Defects', achievementPercentage: 100, score: 96, status: 'Completed' }
    ],
    kpis: [
      { id: 'kpi-h1', title: 'Recruitment Completion', department: 'HR', target: '100%', actual: '100%', achievementPercentage: 100, weightage: 25, score: 98, unit: '%' },
      { id: 'kpi-h2', title: 'Employee Onboarding Completion', department: 'HR', target: '100%', actual: '96%', achievementPercentage: 96, weightage: 20, score: 95, unit: '%' },
      { id: 'kpi-h3', title: 'Attendance Accuracy', department: 'HR', target: '99%', actual: '99.5%', achievementPercentage: 101, weightage: 20, score: 98, unit: '%' },
      { id: 'kpi-h4', title: 'Leave Processing Time', department: 'HR', target: '< 24 Hours', actual: '18 Hours', achievementPercentage: 125, weightage: 20, score: 94, unit: 'hrs' },
      { id: 'kpi-h5', title: 'Employee Issue Resolution', department: 'HR', target: '95%', actual: '96%', achievementPercentage: 101, weightage: 15, score: 95, unit: '%' }
    ],
    hasActivePip: false,
    monthlyHistory: [
      { month: '2026 Q1', score: 90 },
      { month: '2026 Q2', score: 92 },
      { month: '2026 Q3', score: 93 }
    ],
    managerAppraisalNotes: 'Exceptional ownership of HRM automation, onboarding documentation, and company culture.',
    lastEvaluationDate: '2026-09-01'
  },

  // 4. Procurement - Murugan S (On PIP)
  {
    id: 'PERF-005',
    employeeId: 'EMP-005',
    employeeName: 'Murugan S',
    department: 'Procurement',
    designation: 'Purchase Executive',
    reportingManager: 'Karthik Rajan (Procurement Head)',
    roleCategory: 'Operations',
    overallScore: 68,
    performanceGrade: 'Critical / PIP',
    performanceStatus: 'Needs Improvement',
    kraScore: 65,
    kpiScore: 66,
    goalScore: 68,
    taskScore: 70,
    attendanceScore: 74,
    kpiBreakdown: {
      attendanceScore: 3.5,
      attendancePercent: 74,
      feedbackQualityScore: 13.5,
      feedbackRating: 3.4,
      newCustomerScore: 11.0,
      newCustomersCount: 0,
      invoiceScore: 13.0,
      invoiceClearanceRate: 65,
      fullBosKitsSupplyScore: 21.0,
      bosKitsSuppliedCount: 0
    },
    attendanceImpact: {
      attendancePercent: 74,
      lateDays: 5,
      absentDays: 4,
      leaveDays: 2,
      overtimeHours: 0
    },
    taskPerformance: {
      tasksAssigned: 20,
      tasksCompleted: 14,
      completionRate: 70,
      overdueTasks: 4
    },
    mmsSalesAmount: 0,
    bosSalesAmount: 0,
    totalSalesAchieved: 0,
    calculatedIncentive: 0,
    incentiveRoleShare: 30.0,
    incentiveStatus: 'Not Applicable',
    kras: [
      { id: 'kra-p1', title: 'Hardware Fastener Vendor SLA', description: 'Prevent line stockouts of SS brackets & bolts', weightage: 50, targetMetric: 'Zero Stockouts', achievedMetric: '2 Stockouts Logged', achievementPercentage: 60, score: 62, status: 'At Risk' },
      { id: 'kra-p2', title: 'Vendor Invoice Entry Reconciliation', description: 'Process supplier bills within 5 business days', weightage: 50, targetMetric: '< 5 Days', achievedMetric: '12 Days Avg', achievementPercentage: 58, score: 65, status: 'Behind' }
    ],
    kpis: [
      { id: 'kpi-p1', title: 'Purchase Order Completion', department: 'Procurement', target: '95%', actual: '78%', achievementPercentage: 82, weightage: 25, score: 70, unit: '%' },
      { id: 'kpi-p2', title: 'Vendor Delivery Performance', department: 'Procurement', target: '92%', actual: '75%', achievementPercentage: 81, weightage: 25, score: 68, unit: '%' },
      { id: 'kpi-p3', title: 'Cost Savings', department: 'Procurement', target: '5%', actual: '2.5%', achievementPercentage: 50, weightage: 20, score: 60, unit: '%' },
      { id: 'kpi-p4', title: 'Purchase Accuracy', department: 'Procurement', target: '98%', actual: '89%', achievementPercentage: 91, weightage: 15, score: 72, unit: '%' },
      { id: 'kpi-p5', title: 'On-time Procurement', department: 'Procurement', target: '94%', actual: '74%', achievementPercentage: 78, weightage: 15, score: 65, unit: '%' }
    ],
    hasActivePip: true,
    activePipId: 'PIP-2026-02',
    monthlyHistory: [
      { month: '2026 Q1', score: 72 },
      { month: '2026 Q2', score: 65 },
      { month: '2026 Q3', score: 68 }
    ],
    managerAppraisalNotes: 'Currently in 60-day PIP review. Progress is tracking positively with recent vendor invoice backlog clearing.',
    lastEvaluationDate: '2026-08-01'
  },

  // 5. Technical Support - Vignesh S (Lead)
  {
    id: 'PERF-011',
    employeeId: 'EMP-011',
    employeeName: 'Vignesh S',
    department: 'Technical Support',
    designation: 'Technical Support Manager',
    reportingManager: 'Velmurugan (CEO)',
    roleCategory: 'Tech Support',
    overallScore: 94,
    performanceGrade: 'Exceptional',
    performanceStatus: 'Outstanding',
    kraScore: 95,
    kpiScore: 93,
    goalScore: 94,
    taskScore: 96,
    attendanceScore: 98,
    kpiBreakdown: {
      attendanceScore: 4.9,
      attendancePercent: 98,
      feedbackQualityScore: 19.1,
      feedbackRating: 4.9,
      newCustomerScore: 17.0,
      newCustomersCount: 0,
      invoiceScore: 18.2,
      invoiceClearanceRate: 94,
      fullBosKitsSupplyScore: 33.2,
      bosKitsSuppliedCount: 0
    },
    attendanceImpact: {
      attendancePercent: 98,
      lateDays: 1,
      absentDays: 0,
      leaveDays: 1,
      overtimeHours: 12
    },
    taskPerformance: {
      tasksAssigned: 35,
      tasksCompleted: 34,
      completionRate: 97,
      overdueTasks: 0
    },
    mmsSalesAmount: 0,
    bosSalesAmount: 0,
    totalSalesAchieved: 0,
    calculatedIncentive: 32400,
    incentiveRoleShare: 20.0,
    incentiveStatus: 'Eligible',
    kras: [
      { id: 'kra-t1', title: 'Ticket Resolution', description: 'Solve field installation questions & torque specs', weightage: 30, targetMetric: '120 Tickets', achievedMetric: '138 Tickets (115%)', achievementPercentage: 115, score: 98, status: 'Exceeded' },
      { id: 'kra-t2', title: 'Customer Support CSAT', description: 'Field site visits & technical onboarding', weightage: 25, targetMetric: '4.8/5 CSAT', achievedMetric: '4.9/5 CSAT', achievementPercentage: 102, score: 96, status: 'Good' },
      { id: 'kra-t3', title: 'Technical Documentation', description: 'Provide updated installation SOPs & manuals', weightage: 25, targetMetric: '100% Up to Date', achievedMetric: '100%', achievementPercentage: 100, score: 94, status: 'Completed' },
      { id: 'kra-t4', title: 'Response SLA', description: 'First response on critical support queries', weightage: 20, targetMetric: '< 15 Mins', achievedMetric: '11 Mins', achievementPercentage: 136, score: 97, status: 'Exceeded' }
    ],
    kpis: [
      { id: 'kpi-t1', title: 'Tickets Resolved', department: 'Technical Support', target: '120 Tickets', actual: '138 Tickets', achievementPercentage: 115, weightage: 30, score: 98, unit: 'qty' },
      { id: 'kpi-t2', title: 'First Response Time', department: 'Technical Support', target: '< 15 Mins', actual: '11 Mins', achievementPercentage: 136, weightage: 25, score: 97, unit: 'min' },
      { id: 'kpi-t3', title: 'Resolution Time', department: 'Technical Support', target: '< 4 Hours', actual: '3.2 Hours', achievementPercentage: 125, weightage: 20, score: 94, unit: 'hrs' },
      { id: 'kpi-t4', title: 'Customer Satisfaction', department: 'Technical Support', target: '4.8 / 5.0', actual: '4.9 / 5.0', achievementPercentage: 102, weightage: 15, score: 96, unit: 'pts' },
      { id: 'kpi-t5', title: 'Escalation Rate', department: 'Technical Support', target: '< 2%', actual: '0.8%', achievementPercentage: 150, weightage: 10, score: 98, unit: '%' }
    ],
    hasActivePip: false,
    monthlyHistory: [
      { month: '2026 Q1', score: 92 },
      { month: '2026 Q2', score: 93 },
      { month: '2026 Q3', score: 94 }
    ],
    managerAppraisalNotes: 'Superb technical leadership and zero escalation complaints from major ground mount EPC accounts.',
    lastEvaluationDate: '2026-09-05'
  },

  // 6. Accounts - Suresh N
  {
    id: 'PERF-004',
    employeeId: 'EMP-004',
    employeeName: 'Suresh N',
    department: 'Accounts',
    designation: 'Senior Accountant',
    reportingManager: 'Velmurugan (CEO)',
    roleCategory: 'Operations',
    overallScore: 89,
    performanceGrade: 'Exceeds Expectations',
    performanceStatus: 'Good Performance',
    kraScore: 90,
    kpiScore: 88,
    goalScore: 88,
    taskScore: 92,
    attendanceScore: 96,
    kpiBreakdown: {
      attendanceScore: 4.7,
      attendancePercent: 96,
      feedbackQualityScore: 17.8,
      feedbackRating: 4.6,
      newCustomerScore: 15.0,
      newCustomersCount: 0,
      invoiceScore: 18.5,
      invoiceClearanceRate: 94,
      fullBosKitsSupplyScore: 30.0,
      bosKitsSuppliedCount: 0
    },
    attendanceImpact: {
      attendancePercent: 96,
      lateDays: 1,
      absentDays: 1,
      leaveDays: 1,
      overtimeHours: 8
    },
    taskPerformance: {
      tasksAssigned: 26,
      tasksCompleted: 24,
      completionRate: 92,
      overdueTasks: 1
    },
    mmsSalesAmount: 0,
    bosSalesAmount: 0,
    totalSalesAchieved: 0,
    calculatedIncentive: 22500,
    incentiveRoleShare: 30.0,
    incentiveStatus: 'Eligible',
    kras: [
      { id: 'kra-a1', title: 'Accounting Accuracy', description: 'Reconciliations, vouchers & GST filings', weightage: 30, targetMetric: '100% Error-free', achievedMetric: '99.5% Error-free', achievementPercentage: 99.5, score: 92, status: 'Good' },
      { id: 'kra-a2', title: 'Invoice Clearance', description: 'Dispatch invoice clearance within 24h', weightage: 25, targetMetric: '< 24 Hours', achievedMetric: '19 Hours Avg', achievementPercentage: 126, score: 94, status: 'Exceeded' },
      { id: 'kra-a3', title: 'Receivables & Collections', description: 'DSO recovery from solar EPC clients', weightage: 25, targetMetric: '95% Recovery', achievedMetric: '93% Recovery', achievementPercentage: 98, score: 88, status: 'Good' },
      { id: 'kra-a4', title: 'Payables Reconciliation', description: 'Vendor disbursements & bank reconciliation', weightage: 20, targetMetric: '100% Timely', achievedMetric: '98% Timely', achievementPercentage: 98, score: 86, status: 'Good' }
    ],
    kpis: [
      { id: 'kpi-a1', title: 'Invoice Accuracy', department: 'Accounts', target: '99.5%', actual: '99.4%', achievementPercentage: 99.8, weightage: 25, score: 92, unit: '%' },
      { id: 'kpi-a2', title: 'Payment Processing', department: 'Accounts', target: '98%', actual: '97%', achievementPercentage: 99, weightage: 25, score: 90, unit: '%' },
      { id: 'kpi-a3', title: 'Reconciliation Completion', department: 'Accounts', target: '100%', actual: '100%', achievementPercentage: 100, weightage: 25, score: 95, unit: '%' },
      { id: 'kpi-a4', title: 'Error Rate', department: 'Accounts', target: '< 0.5%', actual: '0.4%', achievementPercentage: 125, weightage: 15, score: 90, unit: '%' },
      { id: 'kpi-a5', title: 'On-time Reporting', department: 'Accounts', target: '100%', actual: '96%', achievementPercentage: 96, weightage: 10, score: 88, unit: '%' }
    ],
    hasActivePip: false,
    monthlyHistory: [
      { month: '2026 Q1', score: 86 },
      { month: '2026 Q2', score: 88 },
      { month: '2026 Q3', score: 89 }
    ],
    managerAppraisalNotes: 'Dependable financial oversight and thorough reconciliation of multi-party solar dispatch contracts.',
    lastEvaluationDate: '2026-09-02'
  },

  // 7. Dispatch - Ramesh Kumar
  {
    id: 'PERF-006',
    employeeId: 'EMP-006',
    employeeName: 'Ramesh Kumar',
    department: 'Dispatch',
    designation: 'Logistics Coordinator',
    reportingManager: 'Velmurugan (CEO)',
    roleCategory: 'Operations',
    overallScore: 91,
    performanceGrade: 'Exceptional',
    performanceStatus: 'Outstanding',
    kraScore: 92,
    kpiScore: 90,
    goalScore: 91,
    taskScore: 93,
    attendanceScore: 98,
    kpiBreakdown: {
      attendanceScore: 4.8,
      attendancePercent: 98,
      feedbackQualityScore: 18.4,
      feedbackRating: 4.7,
      newCustomerScore: 15.5,
      newCustomersCount: 0,
      invoiceScore: 19.2,
      invoiceClearanceRate: 98,
      fullBosKitsSupplyScore: 32.9,
      bosKitsSuppliedCount: 0
    },
    attendanceImpact: {
      attendancePercent: 98,
      lateDays: 0,
      absentDays: 1,
      leaveDays: 0,
      overtimeHours: 15
    },
    taskPerformance: {
      tasksAssigned: 30,
      tasksCompleted: 29,
      completionRate: 97,
      overdueTasks: 0
    },
    mmsSalesAmount: 0,
    bosSalesAmount: 0,
    totalSalesAchieved: 0,
    calculatedIncentive: 24500,
    incentiveRoleShare: 30.0,
    incentiveStatus: 'Eligible',
    kras: [
      { id: 'kra-d1', title: 'Order Dispatch Execution', description: 'Schedule trucks and load structural channels safely', weightage: 30, targetMetric: '100%', achievedMetric: '99%', achievementPercentage: 99, score: 94, status: 'Good' },
      { id: 'kra-d2', title: 'Delivery Coordination', description: 'In-transit vehicle tracking and site arrival calls', weightage: 25, targetMetric: '< 1% Delays', achievedMetric: '0.6% Delays', achievementPercentage: 140, score: 96, status: 'Exceeded' },
      { id: 'kra-d3', title: 'Packing Accuracy', description: 'Zero short-shipments of fasteners, clamps & brackets', weightage: 25, targetMetric: '99.8%', achievedMetric: '99.9%', achievementPercentage: 100, score: 98, status: 'Exceeded' },
      { id: 'kra-d4', title: 'Timeliness', description: 'Deliveries to EPC project sites on promised dates', weightage: 20, targetMetric: 'Zero Penalties', achievedMetric: 'Zero Penalties', achievementPercentage: 100, score: 95, status: 'Completed' }
    ],
    kpis: [
      { id: 'kpi-d1', title: 'On-time Dispatch', department: 'Dispatch', target: '98%', actual: '98.5%', achievementPercentage: 100.5, weightage: 30, score: 94, unit: '%' },
      { id: 'kpi-d2', title: 'Dispatch Accuracy', department: 'Dispatch', target: '99.5%', actual: '99.8%', achievementPercentage: 100.3, weightage: 30, score: 96, unit: '%' },
      { id: 'kpi-d3', title: 'Order Processing Time', department: 'Dispatch', target: '< 3 Hours', actual: '2.4 Hours', achievementPercentage: 125, weightage: 20, score: 92, unit: 'hrs' },
      { id: 'kpi-d4', title: 'Delivery Issue Rate', department: 'Dispatch', target: '< 1%', actual: '0.4%', achievementPercentage: 150, weightage: 20, score: 95, unit: '%' }
    ],
    hasActivePip: false,
    monthlyHistory: [
      { month: '2026 Q1', score: 88 },
      { month: '2026 Q2', score: 90 },
      { month: '2026 Q3', score: 91 }
    ],
    managerAppraisalNotes: 'Maintains near-perfect packing and on-time truck dispatch records across heavy trailer routes.',
    lastEvaluationDate: '2026-09-04'
  },

  // 8. Design - Priya M
  {
    id: 'PERF-007',
    employeeId: 'EMP-007',
    employeeName: 'Priya M',
    department: 'Design',
    designation: 'Solar Structural Design Engineer',
    reportingManager: 'Velmurugan (CEO)',
    roleCategory: 'Operations',
    overallScore: 92,
    performanceGrade: 'Exceptional',
    performanceStatus: 'Outstanding',
    kraScore: 94,
    kpiScore: 91,
    goalScore: 93,
    taskScore: 94,
    attendanceScore: 99,
    kpiBreakdown: {
      attendanceScore: 4.9,
      attendancePercent: 99,
      feedbackQualityScore: 18.8,
      feedbackRating: 4.8,
      newCustomerScore: 16.0,
      newCustomersCount: 0,
      invoiceScore: 18.0,
      invoiceClearanceRate: 92,
      fullBosKitsSupplyScore: 32.0,
      bosKitsSuppliedCount: 0
    },
    attendanceImpact: {
      attendancePercent: 99,
      lateDays: 0,
      absentDays: 0,
      leaveDays: 1,
      overtimeHours: 10
    },
    taskPerformance: {
      tasksAssigned: 26,
      tasksCompleted: 25,
      completionRate: 96,
      overdueTasks: 0
    },
    mmsSalesAmount: 0,
    bosSalesAmount: 0,
    totalSalesAchieved: 0,
    calculatedIncentive: 23000,
    incentiveRoleShare: 30.0,
    incentiveStatus: 'Eligible',
    kras: [
      { id: 'kra-ds1', title: 'Design Quality & Wind Simulation', description: 'STAAD-Pro analysis conforming to IS-875 wind codes', weightage: 30, targetMetric: 'Zero Structural Errors', achievedMetric: 'Zero Errors', achievementPercentage: 100, score: 98, status: 'Exceeded' },
      { id: 'kra-ds2', title: 'Drawing Layout Output', description: 'Deliver client approval GA drawings and fabrication cuts', weightage: 25, targetMetric: '50 Layouts / Mo', achievedMetric: '54 Layouts', achievementPercentage: 108, score: 95, status: 'Exceeded' },
      { id: 'kra-ds3', title: 'Turnaround Timeliness', description: 'Draft layouts delivered for fast proposal submissions', weightage: 25, targetMetric: '< 24 Hours', achievedMetric: '18 Hours', achievementPercentage: 133, score: 94, status: 'Good' },
      { id: 'kra-ds4', title: 'Brand & Technical Compliance', description: 'Datasheet formatting and standard parts catalog', weightage: 20, targetMetric: '100%', achievedMetric: '100%', achievementPercentage: 100, score: 92, status: 'Completed' }
    ],
    kpis: [
      { id: 'kpi-ds1', title: 'Design Completion', department: 'Design', target: '96%', actual: '98%', achievementPercentage: 102, weightage: 25, score: 96, unit: '%' },
      { id: 'kpi-ds2', title: 'Revision Rate', department: 'Design', target: '< 10%', actual: '6%', achievementPercentage: 140, weightage: 25, score: 94, unit: '%' },
      { id: 'kpi-ds3', title: 'On-time Delivery', department: 'Design', target: '95%', actual: '96%', achievementPercentage: 101, weightage: 20, score: 92, unit: '%' },
      { id: 'kpi-ds4', title: 'Quality Rating', department: 'Design', target: '4.8 / 5.0', actual: '4.9 / 5.0', achievementPercentage: 102, weightage: 15, score: 96, unit: 'pts' },
      { id: 'kpi-ds5', title: 'Creative Consistency', department: 'Design', target: '98%', actual: '99%', achievementPercentage: 101, weightage: 15, score: 95, unit: '%' }
    ],
    hasActivePip: false,
    monthlyHistory: [
      { month: '2026 Q1', score: 89 },
      { month: '2026 Q2', score: 91 },
      { month: '2026 Q3', score: 92 }
    ],
    managerAppraisalNotes: 'High engineering precision and fast structural calculation turnarounds for EPC clients.',
    lastEvaluationDate: '2026-09-06'
  },

  // 9. Finance - Ananya S
  {
    id: 'PERF-012',
    employeeId: 'EMP-012',
    employeeName: 'Ananya S',
    department: 'Finance',
    designation: 'Finance Controller',
    reportingManager: 'Velmurugan (CEO)',
    roleCategory: 'Management',
    overallScore: 93,
    performanceGrade: 'Exceptional',
    performanceStatus: 'Outstanding',
    kraScore: 94,
    kpiScore: 92,
    goalScore: 94,
    taskScore: 95,
    attendanceScore: 99,
    kpiBreakdown: {
      attendanceScore: 4.9,
      attendancePercent: 99,
      feedbackQualityScore: 19.0,
      feedbackRating: 4.8,
      newCustomerScore: 16.0,
      newCustomersCount: 0,
      invoiceScore: 19.0,
      invoiceClearanceRate: 96,
      fullBosKitsSupplyScore: 32.5,
      bosKitsSuppliedCount: 0
    },
    attendanceImpact: {
      attendancePercent: 99,
      lateDays: 0,
      absentDays: 0,
      leaveDays: 1,
      overtimeHours: 8
    },
    taskPerformance: {
      tasksAssigned: 25,
      tasksCompleted: 24,
      completionRate: 96,
      overdueTasks: 0
    },
    mmsSalesAmount: 0,
    bosSalesAmount: 0,
    totalSalesAchieved: 0,
    calculatedIncentive: 28000,
    incentiveRoleShare: 20.0,
    incentiveStatus: 'Eligible',
    kras: [
      { id: 'kra-f1', title: 'Financial Reporting & Closing', description: 'Month-end closing of balance sheet & cash flow', weightage: 30, targetMetric: 'By 3rd of Month', achievedMetric: '3rd of Month', achievementPercentage: 100, score: 96, status: 'Completed' },
      { id: 'kra-f2', title: 'Budget Management', description: 'Control departmental variance against quarterly OPEX', weightage: 25, targetMetric: '< 3% Variance', achievedMetric: '1.8% Variance', achievementPercentage: 140, score: 95, status: 'Exceeded' },
      { id: 'kra-f3', title: 'Working Capital & Cash Flow', description: 'Raw material procurement financing and bank LC', weightage: 25, targetMetric: 'Positive Cashflow', achievedMetric: 'Optimized', achievementPercentage: 100, score: 92, status: 'Good' },
      { id: 'kra-f4', title: 'Statutory Compliance', description: 'Ensure timely tax payments, GST, and audit reports', weightage: 20, targetMetric: '100% On-time', achievedMetric: '100%', achievementPercentage: 100, score: 96, status: 'Completed' }
    ],
    kpis: [
      { id: 'kpi-f1', title: 'Report Accuracy', department: 'Finance', target: '99.8%', actual: '99.9%', achievementPercentage: 100.1, weightage: 25, score: 96, unit: '%' },
      { id: 'kpi-f2', title: 'Budget Variance', department: 'Finance', target: '< 3%', actual: '1.8%', achievementPercentage: 140, weightage: 25, score: 95, unit: '%' },
      { id: 'kpi-f3', title: 'Payment Processing', department: 'Finance', target: '97%', actual: '98%', achievementPercentage: 101, weightage: 20, score: 92, unit: '%' },
      { id: 'kpi-f4', title: 'Financial Closing', department: 'Finance', target: 'By 3rd of Month', actual: '3rd of Month', achievementPercentage: 100, weightage: 15, score: 94, unit: 'day' },
      { id: 'kpi-f5', title: 'Compliance Completion', department: 'Finance', target: '100%', actual: '100%', achievementPercentage: 100, weightage: 15, score: 98, unit: '%' }
    ],
    hasActivePip: false,
    monthlyHistory: [
      { month: '2026 Q1', score: 90 },
      { month: '2026 Q2', score: 92 },
      { month: '2026 Q3', score: 93 }
    ],
    managerAppraisalNotes: 'Diligent financial stewardship, excellent working capital oversight, and zero compliance penalties.',
    lastEvaluationDate: '2026-09-01'
  },

  // 10. Technical Support / Field Sales - Rajesh G (On PIP)
  {
    id: 'PERF-010',
    employeeId: 'EMP-010',
    employeeName: 'Rajesh G',
    department: 'Sales',
    designation: 'Field Sales Executive',
    reportingManager: 'Arun Kumar',
    roleCategory: 'Sales',
    overallScore: 64,
    performanceGrade: 'Critical / PIP',
    performanceStatus: 'Needs Improvement',
    kraScore: 62,
    kpiScore: 61,
    goalScore: 65,
    taskScore: 68,
    attendanceScore: 78,
    kpiBreakdown: {
      attendanceScore: 3.8,
      attendancePercent: 78,
      feedbackQualityScore: 13.0,
      feedbackRating: 3.3,
      newCustomerScore: 11.5,
      newCustomersCount: 2,
      invoiceScore: 12.0,
      invoiceClearanceRate: 60,
      fullBosKitsSupplyScore: 20.0,
      bosKitsSuppliedCount: 8
    },
    attendanceImpact: {
      attendancePercent: 78,
      lateDays: 4,
      absentDays: 3,
      leaveDays: 1,
      overtimeHours: 2
    },
    taskPerformance: {
      tasksAssigned: 18,
      tasksCompleted: 12,
      completionRate: 67,
      overdueTasks: 3
    },
    mmsSalesAmount: 2200000,
    bosSalesAmount: 1800000,
    totalSalesAchieved: 4000000,
    calculatedIncentive: 0,
    incentiveRoleShare: 50.0,
    incentiveStatus: 'Not Applicable',
    kras: [
      { id: 'kra-s9', title: 'Monthly Sales Quota', description: 'Convert structure inquiries into closed POs', weightage: 50, targetMetric: '₹50.0 Lakhs', achievedMetric: '₹40.0 Lakhs (80%)', achievementPercentage: 80, score: 62, status: 'Behind' },
      { id: 'kra-s10', title: 'BOS Kit Attachment', description: 'Attach electrical balance of system packages', weightage: 50, targetMetric: '15 Kits', achievedMetric: '8 Kits (53%)', achievementPercentage: 53, score: 60, status: 'At Risk' }
    ],
    kpis: [
      { id: 'kpi-s9', title: 'Monthly Sales Target', department: 'Sales', target: '₹50,00,000', actual: '₹40,00,000', achievementPercentage: 80, weightage: 30, score: 62, unit: '₹' },
      { id: 'kpi-s10', title: 'New Customers', department: 'Sales', target: '5 Accounts', actual: '2 Accounts', achievementPercentage: 40, weightage: 25, score: 55, unit: 'qty' },
      { id: 'kpi-s11', title: 'Conversion Rate', department: 'Sales', target: '20%', actual: '12%', achievementPercentage: 60, weightage: 15, score: 60, unit: '%' }
    ],
    hasActivePip: true,
    activePipId: 'PIP-2026-01',
    monthlyHistory: [
      { month: '2026 Q1', score: 70 },
      { month: '2026 Q2', score: 61 },
      { month: '2026 Q3', score: 64 }
    ],
    managerAppraisalNotes: 'Under active 60-day PIP. Demonstration of client pitching is progressing positively with senior mentor.',
    lastEvaluationDate: '2026-08-15'
  }
];

// 7. 8 Department Performance Benchmark & Summaries
export const INITIAL_DEPARTMENT_PERFORMANCE: DepartmentPerformanceDetail[] = [
  {
    id: 'dept-hr',
    departmentName: 'HR',
    headcount: 3,
    headName: 'Pavithra',
    avgOverallScore: 92.5,
    avgKpiScore: 93.0,
    avgKraScore: 94.0,
    goalCompletionRate: 95.0,
    attendanceImpactScore: 99.0,
    taskCompletionRate: 97.0,
    reviewStatus: 'Up to Date',
    totalIncentiveGenerated: 26000,
    supportPoolAllocation: 12000,
    topPerformerName: 'Pavithra',
    topPerformerScore: 93.8,
    pipCount: 0,
    improvementNeededCount: 0,
    avgKpiScores: { attendance: 5.0, feedback: 19.0, newCustomers: 16.0, invoicing: 19.2, bosKits: 33.3 }
  },
  {
    id: 'dept-sales',
    departmentName: 'Sales',
    headcount: 5,
    headName: 'Arun Kumar',
    avgOverallScore: 83.6,
    avgKpiScore: 84.0,
    avgKraScore: 85.2,
    goalCompletionRate: 88.0,
    attendanceImpactScore: 91.0,
    taskCompletionRate: 86.0,
    reviewStatus: 'Pending Reviews',
    salesTargetAmount: 60000000,
    salesAchievedAmount: 54850000,
    salesAchievementPercent: 91.4,
    totalIncentiveGenerated: 92950,
    supportPoolAllocation: 27885,
    topPerformerName: 'Arun Kumar',
    topPerformerScore: 96.2,
    pipCount: 1,
    improvementNeededCount: 1,
    avgKpiScores: { attendance: 4.5, feedback: 16.6, newCustomers: 15.8, invoicing: 16.0, bosKits: 27.5 }
  },
  {
    id: 'dept-accounts',
    departmentName: 'Accounts',
    headcount: 4,
    headName: 'Suresh N',
    avgOverallScore: 88.4,
    avgKpiScore: 87.5,
    avgKraScore: 89.0,
    goalCompletionRate: 91.0,
    attendanceImpactScore: 96.0,
    taskCompletionRate: 92.0,
    reviewStatus: 'Up to Date',
    totalIncentiveGenerated: 22500,
    supportPoolAllocation: 14500,
    topPerformerName: 'Suresh N',
    topPerformerScore: 89.0,
    pipCount: 0,
    improvementNeededCount: 0,
    avgKpiScores: { attendance: 4.7, feedback: 17.8, newCustomers: 15.0, invoicing: 18.5, bosKits: 30.0 }
  },
  {
    id: 'dept-procurement',
    departmentName: 'Procurement',
    headcount: 5,
    headName: 'Karthik Rajan',
    avgOverallScore: 78.6,
    avgKpiScore: 76.5,
    avgKraScore: 79.0,
    goalCompletionRate: 80.0,
    attendanceImpactScore: 84.0,
    taskCompletionRate: 82.0,
    reviewStatus: 'Action Required',
    totalIncentiveGenerated: 22000,
    supportPoolAllocation: 15400,
    topPerformerName: 'Karthik Rajan',
    topPerformerScore: 89.4,
    pipCount: 1,
    improvementNeededCount: 1,
    avgKpiScores: { attendance: 4.2, feedback: 15.8, newCustomers: 13.5, invoicing: 16.1, bosKits: 29.0 }
  },
  {
    id: 'dept-dispatch',
    departmentName: 'Dispatch',
    headcount: 4,
    headName: 'Ramesh Kumar',
    avgOverallScore: 90.8,
    avgKpiScore: 90.0,
    avgKraScore: 91.5,
    goalCompletionRate: 94.0,
    attendanceImpactScore: 98.0,
    taskCompletionRate: 97.0,
    reviewStatus: 'Up to Date',
    totalIncentiveGenerated: 24500,
    supportPoolAllocation: 18500,
    topPerformerName: 'Ramesh Kumar',
    topPerformerScore: 92.2,
    pipCount: 0,
    improvementNeededCount: 0,
    avgKpiScores: { attendance: 4.8, feedback: 18.4, newCustomers: 15.5, invoicing: 19.2, bosKits: 32.9 }
  },
  {
    id: 'dept-design',
    departmentName: 'Design',
    headcount: 4,
    headName: 'Priya M',
    avgOverallScore: 91.6,
    avgKpiScore: 91.0,
    avgKraScore: 93.0,
    goalCompletionRate: 93.0,
    attendanceImpactScore: 99.0,
    taskCompletionRate: 96.0,
    reviewStatus: 'Up to Date',
    totalIncentiveGenerated: 23000,
    supportPoolAllocation: 16000,
    topPerformerName: 'Priya M',
    topPerformerScore: 92.0,
    pipCount: 0,
    improvementNeededCount: 0,
    avgKpiScores: { attendance: 4.9, feedback: 18.8, newCustomers: 16.0, invoicing: 18.0, bosKits: 32.0 }
  },
  {
    id: 'dept-finance',
    departmentName: 'Finance',
    headcount: 3,
    headName: 'Ananya S',
    avgOverallScore: 93.2,
    avgKpiScore: 92.5,
    avgKraScore: 94.0,
    goalCompletionRate: 96.0,
    attendanceImpactScore: 99.0,
    taskCompletionRate: 96.0,
    reviewStatus: 'Up to Date',
    totalIncentiveGenerated: 28000,
    supportPoolAllocation: 14000,
    topPerformerName: 'Ananya S',
    topPerformerScore: 93.2,
    pipCount: 0,
    improvementNeededCount: 0,
    avgKpiScores: { attendance: 4.9, feedback: 19.0, newCustomers: 16.0, invoicing: 19.0, bosKits: 32.5 }
  },
  {
    id: 'dept-tech',
    departmentName: 'Technical Support',
    headcount: 4,
    headName: 'Vignesh S',
    avgOverallScore: 92.4,
    avgKpiScore: 92.0,
    avgKraScore: 94.0,
    goalCompletionRate: 95.0,
    attendanceImpactScore: 98.0,
    taskCompletionRate: 97.0,
    reviewStatus: 'Up to Date',
    totalIncentiveGenerated: 32400,
    supportPoolAllocation: 9720,
    topPerformerName: 'Vignesh S',
    topPerformerScore: 94.6,
    pipCount: 0,
    improvementNeededCount: 0,
    avgKpiScores: { attendance: 4.9, feedback: 19.1, newCustomers: 17.0, invoicing: 18.2, bosKits: 33.2 }
  }
];

// 8. Performance Goals
export const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'GOAL-001',
    goalName: 'Achieve ₹1.2 Cr MMS Structure Sales',
    description: 'Target high-capacity rooftop solar EPC contractors across Karnataka & Tamil Nadu',
    employeeId: 'EMP-008',
    employeeName: 'Arun Kumar',
    department: 'Sales',
    startDate: '2026-07-01',
    dueDate: '2026-09-30',
    targetMetric: '₹1.20 Cr Booking',
    currentProgress: 95,
    weightage: 35,
    status: 'In Progress',
    approvedBy: 'Velmurugan (CEO)'
  },
  {
    id: 'GOAL-002',
    goalName: 'Zero Non-Conformance Biometric Attendance Sync',
    description: 'Ensure 100% cloud sync of factory shift biometric and face logs without manual override',
    employeeId: 'EMP-001',
    employeeName: 'Pavithra',
    department: 'HR',
    startDate: '2026-08-01',
    dueDate: '2026-10-31',
    targetMetric: '100% Automated Sync',
    currentProgress: 90,
    weightage: 25,
    status: 'In Progress',
    approvedBy: 'Velmurugan (CEO)'
  },
  {
    id: 'GOAL-003',
    goalName: 'Fastener Supplier SLA Restoration',
    description: 'Maintain buffer inventory of SS-304 hardware to achieve zero manufacturing line stops',
    employeeId: 'EMP-005',
    employeeName: 'Murugan S',
    department: 'Procurement',
    startDate: '2026-08-15',
    dueDate: '2026-10-15',
    targetMetric: 'Zero Stockouts for 60 Days',
    currentProgress: 65,
    weightage: 40,
    status: 'In Progress',
    approvedBy: 'Karthik Rajan (Procurement Head)'
  },
  {
    id: 'GOAL-004',
    goalName: 'Automate Dispatch Packing Slip Generation',
    description: 'Implement QR scanning on pallet loading to reduce dispatch turnaround time by 30 mins',
    employeeId: 'EMP-006',
    employeeName: 'Ramesh Kumar',
    department: 'Dispatch',
    startDate: '2026-07-15',
    dueDate: '2026-09-15',
    targetMetric: '< 2 Hours Loading Time',
    currentProgress: 100,
    weightage: 30,
    status: 'Completed',
    approvedBy: 'Velmurugan (CEO)'
  },
  {
    id: 'GOAL-005',
    goalName: 'Wind Tunnel Verified High-Wind MMS Design',
    description: 'Develop certified ballast structure layout for 180 km/h cyclone prone coastal solar plants',
    employeeId: 'EMP-007',
    employeeName: 'Priya M',
    department: 'Design',
    startDate: '2026-08-01',
    dueDate: '2026-11-30',
    targetMetric: 'Certified Structural Drawing Set',
    currentProgress: 75,
    weightage: 30,
    status: 'In Progress',
    approvedBy: 'Velmurugan (CEO)'
  },
  {
    id: 'GOAL-006',
    goalName: 'Client First-Contact Resolution under 15 Mins',
    description: 'Achieve 95% first contact ticket resolution for solar mounting site engineers',
    employeeId: 'EMP-011',
    employeeName: 'Vignesh S',
    department: 'Technical Support',
    startDate: '2026-07-01',
    dueDate: '2026-09-30',
    targetMetric: '< 15 Mins SLA',
    currentProgress: 96,
    weightage: 30,
    status: 'In Progress',
    approvedBy: 'Velmurugan (CEO)'
  }
];

// 9. Structured Performance Reviews
export const INITIAL_REVIEWS: PerformanceReviewRecord[] = [
  {
    id: 'REV-2026-Q2-001',
    employeeId: 'EMP-008',
    employeeName: 'Arun Kumar',
    department: 'Sales',
    designation: 'Senior Sales Manager',
    reviewPeriod: 'Quarterly',
    reviewPeriodLabel: '2026 Q2 Review',
    reviewerName: 'Velmurugan',
    reviewerRole: 'CEO',
    reviewDate: '2026-07-05',
    kraScore: 98,
    kpiScore: 94,
    goalScore: 95,
    taskPerformance: 96,
    attendanceImpact: 99,
    overallScore: 96,
    rating: 5,
    ratingLabel: 'Outstanding',
    strengths: [
      'Exceeded monthly MMS sales quota by 19%',
      'Mastery of technical pitch for Full BOS Kits',
      'Flawless customer rapport and payment milestone recovery'
    ],
    areasForImprovement: [
      'Mentor junior regional sales reps on quotation speed'
    ],
    managerComments: 'Arun is a benchmark performer in our solar structures division. Keep up the high standard.',
    hrComments: 'Attendance and documentation adherence are top tier. Approved for full incentive payout.',
    finalComments: 'Promoted to lead South Zone strategic accounts.',
    status: 'Completed'
  },
  {
    id: 'REV-2026-Q2-002',
    employeeId: 'EMP-001',
    employeeName: 'Pavithra',
    department: 'HR',
    designation: 'HR Specialist',
    reviewPeriod: 'Quarterly',
    reviewPeriodLabel: '2026 Q2 Review',
    reviewerName: 'Velmurugan',
    reviewerRole: 'CEO',
    reviewDate: '2026-07-04',
    kraScore: 94,
    kpiScore: 92,
    goalScore: 94,
    taskPerformance: 95,
    attendanceImpact: 100,
    overallScore: 93,
    rating: 5,
    ratingLabel: 'Outstanding',
    strengths: [
      'Streamlined plant biometric compliance',
      'Completed all recruitment targets ahead of timeline',
      'Zero statutory audit non-conformances'
    ],
    areasForImprovement: [
      'Implement structured mid-year employee survey'
    ],
    managerComments: 'Exceptional HR coordination and employee responsiveness.',
    hrComments: 'Self-appraisal verified with exemplary compliance metrics.',
    finalComments: 'Confirmed rating: Outstanding.',
    status: 'Completed'
  },
  {
    id: 'REV-2026-Q2-003',
    employeeId: 'EMP-005',
    employeeName: 'Murugan S',
    department: 'Procurement',
    designation: 'Purchase Executive',
    reviewPeriod: 'Quarterly',
    reviewPeriodLabel: '2026 Q2 Review',
    reviewerName: 'Karthik Rajan',
    reviewerRole: 'Department Head',
    reviewDate: '2026-07-10',
    kraScore: 65,
    kpiScore: 66,
    goalScore: 68,
    taskPerformance: 70,
    attendanceImpact: 74,
    overallScore: 68,
    rating: 2,
    ratingLabel: 'Needs Improvement',
    strengths: [
      'Good familiarity with local hardware suppliers in Coimbatore'
    ],
    areasForImprovement: [
      'Invoice reconciliation turnaround time must be reduced to < 5 days',
      'Unplanned absences impacting PO clearing',
      'Prevent stockout escalations on standard fasteners'
    ],
    managerComments: 'Performance has dipped over the past 2 months. Placed on structured 60-day Performance Improvement Plan.',
    hrComments: 'PIP initiated with weekly progress reviews scheduled with mentor.',
    finalComments: 'Active PIP under monitoring.',
    status: 'Completed'
  }
];

// 10. Structured 5-Question PIP Records
export const INITIAL_PIP_RECORDS: PipRecord[] = [
  {
    id: 'PIP-2026-01',
    employeeId: 'EMP-010',
    employeeName: 'Rajesh G',
    department: 'Sales',
    designation: 'Field Sales Executive',
    initiatorName: 'Velmurugan (CEO)',
    mentorName: 'Arun Kumar (Senior Sales Manager)',
    assignedReviewer: 'Arun Kumar',
    startDate: '2026-08-15',
    targetEndDate: '2026-10-15',
    durationDays: 60,
    reason: 'Monthly sales conversion below quota and shortfall in BOS kit attachment rate.',
    performanceIssue: 'Conversion rate dropped to 12% against 20% target; unable to explain technical differentiation of Full BOS Kits to rooftop clients.',
    improvementArea: 'Mastering MMS technical specifications, adhering to 24-hour follow-up SLAs, and logging customer visits punctually in CRM.',
    expectedTarget: 'Achieve minimum ₹35 Lakhs cumulative sales bookings and close at least 3 Full BOS Kit orders monthly.',
    supportRequired: 'Direct joint client visits twice weekly with Senior Sales Manager Arun Kumar and BOS product engineering walkthroughs.',
    actionPlan: 'Week 1-2: Product certification. Week 3-6: Joint client pitching. Week 7-8: Independent conversions with CRM audit.',
    reviewFrequency: 'Weekly',
    focusAreas: [
      'MMS & BOS Product pitch mastery',
      'Client follow-ups within 24 hours',
      'Closing min. 3 Full BOS Kit orders monthly',
      'Punctual CRM quotation logging'
    ],
    milestones: [
      { id: 'm1', title: 'Complete Advanced Solar BOS Technical Certification', targetDate: '2026-08-31', status: 'Completed', notes: 'Scored 88% on internal technical assessment' },
      { id: 'm2', title: 'Convert 3 Tier-2 Rooftop EPC Clients', targetDate: '2026-09-20', status: 'In Progress', notes: '2 clients in advance contract discussion' },
      { id: 'm3', title: 'Achieve ₹35L Cumulative Monthly Booking', targetDate: '2026-10-10', status: 'Pending', notes: 'Target review scheduled on Oct 10' }
    ],
    status: 'Active',
    progressPercentage: 55,
    reviewNotes: 'Showing noticeable improvement in technical presentation. Client pipeline increased from ₹15L to ₹42L.'
  },
  {
    id: 'PIP-2026-02',
    employeeId: 'EMP-005',
    employeeName: 'Murugan S',
    department: 'Procurement',
    designation: 'Purchase Executive',
    initiatorName: 'Karthik Rajan (Procurement Head)',
    mentorName: 'Anand Sharma (Senior Vendor Coordinator)',
    assignedReviewer: 'Karthik Rajan',
    startDate: '2026-08-01',
    targetEndDate: '2026-09-30',
    durationDays: 60,
    reason: 'Vendor invoice reconciliation delay exceeding 12 days and inventory stockout on standard fasteners.',
    performanceIssue: 'Frequent discrepancies between purchase orders and supplier bills leading to accounts hold-ups; inventory stockouts on fasteners.',
    improvementArea: 'Clear invoice backlogs within 48 hours, ensure continuous minimum safety stock on SS fasteners, and improve attendance punctuality.',
    expectedTarget: 'Zero line stops, 100% vendor invoice clearance within 5 days, and minimum 90% monthly attendance.',
    supportRequired: 'ERP purchase training, revised safety stock calculation sheets, and weekly 1-on-1 coaching with Senior Vendor Coordinator.',
    actionPlan: 'Daily 15-minute morning inventory sync with roll-forming supervisors; Friday accounts audit.',
    reviewFrequency: 'Weekly',
    focusAreas: [
      'PO processing turnaround time < 48 hrs',
      'Zero stockouts on standard BOS fasteners',
      'Vendor rating documentation'
    ],
    milestones: [
      { id: 'm4', title: 'Clear 100% backlogged vendor invoices', targetDate: '2026-08-25', status: 'Completed', notes: 'Backlog cleared and verified with Accounts' },
      { id: 'm5', title: 'Establish secondary vendor for SS-304 hardware', targetDate: '2026-09-15', status: 'In Progress', notes: 'Quotes received from 3 vendors' },
      { id: 'm6', title: 'Zero inventory mismatch audit', targetDate: '2026-09-30', status: 'Pending', notes: 'Audit planned on Sept 30' }
    ],
    status: 'Under Review',
    progressPercentage: 70,
    reviewNotes: 'Vendor communications have significantly improved. Invoice clearance rate restored to 92%.'
  }
];

// 11. Performance Settings Configuration
export const INITIAL_PERFORMANCE_SETTINGS: PerformanceSettingsConfig = {
  general: {
    currentCycle: 'Quarterly',
    ratingScale: '1-5 Stars',
    scoreCalculation: 'Weighted Average',
    minimumPassingScore: 70,
    exceptionalThreshold: 90
  },
  kraSettings: {
    defaultKraWeightage: 30,
    maxKrasPerEmployee: 6,
    allowEmployeeKraProposal: true
  },
  kpiSettings: {
    calculationMethod: 'Linear Metric Achievement',
    targetTypes: ['Percentage (%)', 'Monetary Value (₹)', 'Numeric Count', 'Hours / Time']
  },
  reviewSettings: {
    reviewFrequency: 'Quarterly',
    reviewerRules: 'Direct Manager + HR Approval',
    approvalWorkflow: 'Multi-tier HR + CEO Approval'
  },
  pipSettings: {
    defaultDurationDays: 60,
    reviewFrequency: 'Weekly',
    escalationRules: 'If progress < 50% after 30 days, mandatory HR review meeting'
  },
  attendanceTaskIntegration: {
    enableAttendanceImpact: true,
    attendanceWeight: 10,
    enableTaskImpact: true,
    taskWeight: 15,
    kraWeight: 35,
    kpiWeight: 25,
    goalsWeight: 15
  }
};
