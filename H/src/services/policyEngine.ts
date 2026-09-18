// VRM Enterprise HRM - Central Dynamic Policy & Rule Engine
import { 
  AttendancePolicy, 
  MasterLeavePolicy, 
  PayrollSettingsConfig, 
  EmployeeRewardRecord,
  AttendanceRecord,
  LeaveRequest,
  Employee,
  PayrollRecord,
  LoanRecord,
  LoanRepaymentInstallment
} from '../types/hrms';
import { toNum } from '../utils/numbers';

// ========================================================
// 1. SAFE MATHEMATICAL FORMULA EVALUATOR (No eval)
// ========================================================
export interface FormulaContext {
  BASIC?: number;
  HRA?: number;
  GROSS?: number;
  CTC?: number;
  DAILY_SALARY?: number;
  WORKING_DAYS?: number;
  PAID_DAYS?: number;
  UNPAID_DAYS?: number;
  LATE_COUNT?: number;
  LEAVE_DAYS?: number;
  INCENTIVE?: number;
  BONUS?: number;
  REWARD?: number;
  [key: string]: number | undefined;
}

/**
 * Safely evaluates arithmetic expressions containing numbers, parentheses, operators (+, -, *, /),
 * and standard variables from the formula context.
 */
export const evaluateFormula = (formula: string, context: FormulaContext): number => {
  if (!formula || typeof formula !== 'string') return 0;

  // Substitute variables with numeric values from context
  let expr = formula.toUpperCase();
  const sortedKeys = Object.keys(context).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const val = context[key];
    if (val !== undefined) {
      // Regex replace word boundaries
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expr = expr.replace(regex, `(${Number(val) || 0})`);
    }
  }

  // Sanitize: allow only digits, decimal points, parentheses, and arithmetic operators
  const sanitized = expr.replace(/[^0-9.+\-*/() ]/g, '');

  try {
    // Standard recursive-descent parser for arithmetic
    let index = 0;

    const parseNumber = (): number => {
      let numStr = '';
      while (index < sanitized.length && (/[0-9.]/).test(sanitized[index])) {
        numStr += sanitized[index];
        index++;
      }
      return parseFloat(numStr) || 0;
    };

    const parseFactor = (): number => {
      while (index < sanitized.length && sanitized[index] === ' ') index++;
      if (index >= sanitized.length) return 0;

      if (sanitized[index] === '(') {
        index++; // skip '('
        const res = parseExpression();
        while (index < sanitized.length && sanitized[index] === ' ') index++;
        if (sanitized[index] === ')') index++; // skip ')'
        return res;
      }

      if (sanitized[index] === '-') {
        index++;
        return -parseFactor();
      }

      if (sanitized[index] === '+') {
        index++;
        return parseFactor();
      }

      return parseNumber();
    };

    const parseTerm = (): number => {
      let left = parseFactor();
      while (index < sanitized.length) {
        while (index < sanitized.length && sanitized[index] === ' ') index++;
        const op = sanitized[index];
        if (op === '*' || op === '/') {
          index++;
          const right = parseFactor();
          if (op === '*') left = left * right;
          if (op === '/') left = right !== 0 ? left / right : 0;
        } else {
          break;
        }
      }
      return left;
    };

    const parseExpression = (): number => {
      let left = parseTerm();
      while (index < sanitized.length) {
        while (index < sanitized.length && sanitized[index] === ' ') index++;
        const op = sanitized[index];
        if (op === '+' || op === '-') {
          index++;
          const right = parseTerm();
          if (op === '+') left = left + right;
          if (op === '-') left = left - right;
        } else {
          break;
        }
      }
      return left;
    };

    const result = parseExpression();
    return isNaN(result) || !isFinite(result) ? 0 : Math.round(result * 100) / 100;
  } catch {
    return 0;
  }
};

/**
 * Validates a formula string and runs a sample calculation with test values.
 */
export const validateFormula = (formula: string): { isValid: boolean; error?: string; sampleResult?: number } => {
  if (!formula || !formula.trim()) {
    return { isValid: false, error: 'Formula cannot be empty' };
  }

  // Check for balanced parentheses
  let balance = 0;
  for (const ch of formula) {
    if (ch === '(') balance++;
    if (ch === ')') balance--;
    if (balance < 0) return { isValid: false, error: 'Unbalanced parentheses' };
  }
  if (balance !== 0) return { isValid: false, error: 'Unclosed parenthesis' };

  // Check for forbidden characters
  const allowed = /^[A-Z0-9_.+\-*/() ]+$/i;
  if (!allowed.test(formula)) {
    return { isValid: false, error: 'Formula contains unsupported special characters' };
  }

  // Mock test calculation
  const mockContext: FormulaContext = {
    BASIC: 30000,
    HRA: 12000,
    GROSS: 45000,
    CTC: 50000,
    DAILY_SALARY: 1153.85,
    WORKING_DAYS: 26,
    PAID_DAYS: 24,
    UNPAID_DAYS: 2,
    LATE_COUNT: 4,
    LEAVE_DAYS: 2,
    INCENTIVE: 2000,
    BONUS: 3000,
    REWARD: 5000
  };

  try {
    const res = evaluateFormula(formula, mockContext);
    return { isValid: true, sampleResult: res };
  } catch (err: any) {
    return { isValid: false, error: err.message || 'Evaluation error' };
  }
};

// ========================================================
// 2. ATTENDANCE LATE DEDUCTION EVALUATION
// ========================================================
export interface LateDeductionResult {
  lateCount: number;
  severelyLateCount: number;
  deductionAmount: number;
  ruleApplied: string;
  isConfidential: boolean;
  genericCategoryLabel: string;
  details: string;
}

/**
 * Checks if a check-in time exceeds shift start time + grace period.
 */
export const isCheckInLate = (
  checkInStr: string | null, 
  shiftStartStr: string = '09:30', 
  graceMins: number = 10
): boolean => {
  if (!checkInStr) return false;

  const [cHour, cMin] = checkInStr.split(':').map(Number);
  const [sHour, sMin] = shiftStartStr.split(':').map(Number);

  if (isNaN(cHour) || isNaN(sHour)) return false;

  const checkInMinutes = cHour * 60 + (cMin || 0);
  const allowedMinutes = sHour * 60 + (sMin || 0) + graceMins;

  return checkInMinutes > allowedMinutes;
};

/**
 * Evaluates the attendance policy for an employee over a month to calculate late deductions.
 */
export const evaluateAttendanceLateDeduction = (
  employee: Employee,
  attendanceRecords: AttendanceRecord[],
  policy: AttendancePolicy | undefined,
  dailySalary: number,
  basicSalary: number
): LateDeductionResult => {
  const defaultResult: LateDeductionResult = {
    lateCount: 0,
    severelyLateCount: 0,
    deductionAmount: 0,
    ruleApplied: 'None',
    isConfidential: false,
    genericCategoryLabel: 'OTHERS',
    details: 'No deduction'
  };

  if (!policy || policy.status !== 'Active') {
    return defaultResult;
  }

  // Check eligibility: department or branch or specific employees
  if (policy.applicableEmployees !== 'ALL' && !policy.applicableEmployees.includes(employee.employeeId)) {
    return defaultResult;
  }
  if (policy.applicableDepartments !== 'ALL' && !policy.applicableDepartments.includes(employee.department)) {
    return defaultResult;
  }

  // Count late punches for this employee
  const empRecords = attendanceRecords.filter(r => r.employeeId === employee.employeeId);
  let lateCount = 0;
  let severelyLateCount = 0;

  empRecords.forEach(rec => {
    const isLate = rec.status === 'Late' || isCheckInLate(rec.checkIn, policy.startTime, policy.graceTimeMinutes);
    if (isLate) {
      lateCount++;
      if (rec.lateStatus === 'Severely Late') {
        severelyLateCount++;
      }
    }
  });

  if (lateCount === 0) {
    return {
      ...defaultResult,
      isConfidential: policy.deductionVisibility === 'GENERIC',
      genericCategoryLabel: policy.genericCategoryLabel || 'OTHERS'
    };
  }

  let deductionAmount = 0;
  let ruleApplied = '';

  switch (policy.lateRuleType) {
    case 'FIXED_AMOUNT': {
      const perLate = toNum(policy.fixedAmount || 100);
      deductionAmount = lateCount * perLate;
      ruleApplied = `Fixed ₹${perLate} per late entry (${lateCount} entries)`;
      break;
    }

    case 'PERCENTAGE_DAILY': {
      const pct = toNum(policy.percentageOfDailySalary || 5);
      const perOccurrence = (dailySalary * pct) / 100;
      deductionAmount = Math.round(lateCount * perOccurrence);
      ruleApplied = `${pct}% of Daily Salary (₹${Math.round(perOccurrence)}) × ${lateCount}`;
      break;
    }

    case 'COUNT_BASED': {
      // e.g. 1-3 free, 4-5 ₹100 each, 6+ ₹200 each
      const tiers = policy.countTiers || [
        { id: 't1', minCount: 1, maxCount: 3, deductionPerOccurrence: 0 },
        { id: 't2', minCount: 4, maxCount: 5, deductionPerOccurrence: 100 },
        { id: 't3', minCount: 6, maxCount: null, deductionPerOccurrence: 200 }
      ];

      for (let i = 1; i <= lateCount; i++) {
        const tier = tiers.find(t => i >= t.minCount && (t.maxCount === null || i <= t.maxCount));
        if (tier) {
          deductionAmount += toNum(tier.deductionPerOccurrence);
        }
      }
      ruleApplied = `Count-based tiered late deduction for ${lateCount} entries`;
      break;
    }

    case 'HALF_DAY_CONVERSION': {
      // Severely late entries converted to half days
      const halfDays = severelyLateCount;
      deductionAmount = Math.round(halfDays * (dailySalary * 0.5));
      ruleApplied = `${halfDays} entries converted to half-day deductions`;
      break;
    }

    case 'CUSTOM_FORMULA': {
      if (policy.customFormula) {
        deductionAmount = evaluateFormula(policy.customFormula, {
          LATE_COUNT: lateCount,
          DAILY_SALARY: dailySalary,
          BASIC: basicSalary
        });
        ruleApplied = `Formula: ${policy.customFormula}`;
      }
      break;
    }
  }

  return {
    lateCount,
    severelyLateCount,
    deductionAmount: Math.max(0, Math.round(deductionAmount)),
    ruleApplied,
    isConfidential: policy.deductionVisibility === 'GENERIC',
    genericCategoryLabel: policy.genericCategoryLabel || 'OTHERS',
    details: `${policy.policyName}: ${ruleApplied}`
  };
};

// ========================================================
// 3. LEAVE DEDUCTION EVALUATION
// ========================================================
export interface LeaveDeductionResult {
  totalUnpaidDays: number;
  allowedFreeDays: number;
  excessUnpaidDays: number;
  deductionAmount: number;
  ruleApplied: string;
  isConfidential: boolean;
  genericCategoryLabel: string;
  details: string;
  sandwichUnpaidDays?: number;
  sandwichDeduction?: number;
}

/**
 * Evaluates the master leave policy for an employee over a month to calculate unpaid leave deductions.
 */
export const evaluateLeaveDeductions = (
  employee: Employee,
  leaveRequests: LeaveRequest[],
  policy: MasterLeavePolicy | undefined,
  dailySalary: number,
  basicSalary: number
): LeaveDeductionResult => {
  const defaultResult: LeaveDeductionResult = {
    totalUnpaidDays: 0,
    allowedFreeDays: 1,
    excessUnpaidDays: 0,
    deductionAmount: 0,
    ruleApplied: 'None',
    isConfidential: false,
    genericCategoryLabel: 'OTHERS',
    details: 'No unpaid leave deduction',
    sandwichUnpaidDays: 0,
    sandwichDeduction: 0
  };

  // Find all approved leaves for this employee
  const approvedLeaves = leaveRequests.filter(
    l => l.employeeId === employee.employeeId && l.status === 'Approved'
  );

  const isProv = policy?.applicableEmploymentType === 'Provisional' || 
    policy?.id === 'LP-MASTER-PROVISIONAL' || 
    (policy?.policyName || '').toLowerCase().includes('provisional') || 
    (policy?.policyName || '').toLowerCase().includes('probation');

  let paidLeavesTaken = 0;
  let regularUnpaidDays = 0;
  let sandwichUnpaidDays = 0;

  approvedLeaves.forEach(l => {
    const leaveName = (l.leaveType || '').toLowerCase();
    const isExplicitUnpaid = leaveName.includes('unpaid') || leaveName.includes('lop') || leaveName.includes('loss of pay');
    if (isExplicitUnpaid) {
      regularUnpaidDays += toNum(l.daysCount);
    } else {
      paidLeavesTaken += toNum(l.daysCount);
    }

    // Also include unpaid sandwich days
    if (l.unpaidSandwichDays && l.unpaidSandwichDays > 0) {
      sandwichUnpaidDays += toNum(l.unpaidSandwichDays);
    } else if (l.sandwichDetails?.unpaidDays && l.sandwichDetails.unpaidDays > 0 && !isExplicitUnpaid) {
      sandwichUnpaidDays += toNum(l.sandwichDetails.unpaidDays);
    }
  });

  // Calculate excess paid leave days beyond allowed policy quota:
  // - Confirmed: 1 day paid casual leave allowed per month. Excess incurs salary deduction.
  // - Provisional: 1 day paid leave allowed during the first 3 months of probation. Excess incurs salary deduction.
  const allowedPaidQuota = 1;
  const excessPaidLeaves = Math.max(0, paidLeavesTaken - allowedPaidQuota);

  // For provisional employees, free unpaid days is strictly 0 (any leave past 1 paid day incurs deduction)
  // For confirmed employees, monthly free unpaid leaves comes from policy (default 1)
  const freeDays = isProv ? 0 : (policy ? toNum(policy.monthlyFreeUnpaidLeaves ?? 1) : 1);
  const totalUnpaidDays = regularUnpaidDays + sandwichUnpaidDays + excessPaidLeaves;
  const excessUnpaidDays = isProv 
    ? (regularUnpaidDays + sandwichUnpaidDays + excessPaidLeaves)
    : Math.max(0, (regularUnpaidDays + sandwichUnpaidDays) - (paidLeavesTaken === 0 ? freeDays : 0) + excessPaidLeaves);

  const sandwichDeduction = Math.round(sandwichUnpaidDays * dailySalary);

  if (totalUnpaidDays === 0 || excessUnpaidDays === 0) {
    return {
      ...defaultResult,
      totalUnpaidDays,
      allowedFreeDays: freeDays,
      excessUnpaidDays: 0,
      deductionAmount: 0,
      ruleApplied: isProv 
        ? 'Within Provisional 1 Paid Leave allowance' 
        : `Within ${freeDays} paid/free leave allowance`,
      isConfidential: policy?.deductionVisibility === 'GENERIC',
      genericCategoryLabel: policy?.genericCategoryLabel || 'OTHERS',
      details: isProv 
        ? 'Provisional leave covered by 1-day probation allowance.' 
        : `Covered by 1 day/month paid leave allowance.`
    };
  }

  let deductionAmount = 0;
  let ruleApplied = '';

  const ruleType = policy?.deductionRuleType || 'DAILY_SALARY';

  switch (ruleType) {
    case 'DAILY_SALARY': {
      const multiplier = toNum(policy?.dailySalaryMultiplier || 1);
      deductionAmount = excessUnpaidDays * (dailySalary * multiplier);
      ruleApplied = `${excessUnpaidDays} excess day(s) × Daily Salary (₹${Math.round(dailySalary * multiplier)})`;
      break;
    }

    case 'FIXED_AMOUNT': {
      const perDay = toNum(policy?.fixedDeductionAmount || 1000);
      deductionAmount = excessUnpaidDays * perDay;
      ruleApplied = `Fixed ₹${perDay} per excess day (${excessUnpaidDays} days)`;
      break;
    }

    case 'PERCENTAGE': {
      const pct = toNum(policy?.percentageOfDailySalary || 100);
      deductionAmount = excessUnpaidDays * ((dailySalary * pct) / 100);
      ruleApplied = `${pct}% of Daily Salary for ${excessUnpaidDays} excess day(s)`;
      break;
    }

    case 'CUSTOM_FORMULA': {
      if (policy?.customFormula) {
        deductionAmount = evaluateFormula(policy.customFormula, {
          UNPAID_DAYS: excessUnpaidDays,
          DAILY_SALARY: dailySalary,
          BASIC: basicSalary
        });
        ruleApplied = `Formula: ${policy.customFormula}`;
      } else {
        deductionAmount = excessUnpaidDays * dailySalary;
      }
      break;
    }
  }

  return {
    totalUnpaidDays,
    allowedFreeDays: freeDays,
    excessUnpaidDays,
    deductionAmount: Math.max(0, Math.round(deductionAmount)),
    ruleApplied,
    isConfidential: policy?.deductionVisibility === 'GENERIC',
    genericCategoryLabel: policy?.genericCategoryLabel || 'OTHERS',
    details: `${policy?.policyName || 'Unpaid Leave Policy'}: ${ruleApplied}${sandwichUnpaidDays > 0 ? ` (includes ${sandwichUnpaidDays} unpaid sandwich day(s))` : ''}`,
    sandwichUnpaidDays,
    sandwichDeduction
  };
};

// ========================================================
// 4. STATUTORY CONTRIBUTIONS (PF, ESIC, PT)
// ========================================================
export interface StatutoryDeductionsResult {
  epfDeduction: number;
  esiDeduction: number;
  professionalTax: number;
  totalStatutory: number;
  epfRule: string;
  esiRule: string;
}

export const evaluateStatutoryContributions = (
  basicSalary: number,
  grossSalary: number,
  payrollConfig: PayrollSettingsConfig | undefined,
  withPf: boolean = true,
  da: number = 0,
  conveyance: number = 0,
  hra: number = 0,
  attendanceBonus: number = 0,
  overtime: number = 0
): StatutoryDeductionsResult => {
  let professionalTax = 0;
  if (!payrollConfig || payrollConfig.enableProfessionalTax !== false) {
    professionalTax = payrollConfig?.standardPtAmount || 200;
  }

  // Scheme 1: Without PF & ESIC (New Employee / Under 6 Months probation)
  // PF and ESIC are strictly 0!
  if (!withPf) {
    return {
      epfDeduction: 0,
      esiDeduction: 0,
      professionalTax,
      totalStatutory: professionalTax,
      epfRule: 'Exempt (New Employee / < 6 Months)',
      esiRule: 'Exempt (New Employee / < 6 Months)'
    };
  }

  // Scheme 2: With PF & ESIC (Eligible / > 6 Months)
  // PF Calculation: (Basic + DA + Conveyance) * 12%
  const pfBase = basicSalary + da + conveyance;
  const pfRate = payrollConfig?.pfPolicy?.percentage || 12;
  const epfDeduction = Math.round((pfBase * pfRate) / 100);
  const epfRule = `${pfRate}% of Base ₹${pfBase.toLocaleString('en-IN')} (Basic + DA + Conveyance)`;

  // ESIC Calculation: (Basic + DA + Conveyance + HRA + Attendance Bonus + Overtime) * 0.75%
  // Applicable only when gross is within statutory ceiling (₹21,000)
  const esicBase = basicSalary + da + conveyance + hra + attendanceBonus + overtime;
  const esicLimit = payrollConfig?.esicPolicy?.grossSalaryLimit || 21000;
  let esiDeduction = 0;
  let esiRule = '';

  if (grossSalary <= esicLimit || esicBase <= esicLimit) {
    const esicRate = payrollConfig?.esicPolicy?.percentage || 0.75;
    esiDeduction = Math.round((esicBase * esicRate) / 100);
    esiRule = `${esicRate}% of Base ₹${esicBase.toLocaleString('en-IN')}`;
  } else {
    esiDeduction = 0;
    esiRule = `Gross ₹${grossSalary.toLocaleString('en-IN')} exceeds wage ceiling ₹${esicLimit.toLocaleString('en-IN')}`;
  }

  return {
    epfDeduction,
    esiDeduction,
    professionalTax,
    totalStatutory: epfDeduction + esiDeduction + professionalTax,
    epfRule,
    esiRule
  };
};

// ========================================================
// 5. EMPLOYEE REWARDS INTEGRATION
// ========================================================
export interface RewardEarningsResult {
  totalRewardEarnings: number;
  rewardItems: EmployeeRewardRecord[];
  rewardBreakdown: { title: string; amount: number }[];
}

export const evaluateEmployeeRewards = (
  employeeId: string,
  rewardRecords: EmployeeRewardRecord[]
): RewardEarningsResult => {
  const eligible = rewardRecords.filter(
    r => r.employeeId === employeeId && r.addToPayroll && r.payrollStatus === 'Pending'
  );

  const total = eligible.reduce((sum, r) => sum + toNum(r.amount), 0);
  const breakdown = eligible.map(r => ({
    title: r.rewardName,
    amount: toNum(r.amount)
  }));

  return {
    totalRewardEarnings: total,
    rewardItems: eligible,
    rewardBreakdown: breakdown
  };
};

// ========================================================
// 6. CENTRAL CALCULATION ENGINE
// ========================================================
export interface FullPayrollCalculationResult {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  da?: number;
  conveyance?: number;
  hra?: number;
  withPf?: boolean;
  bonus: number;
  attendanceBonus?: number;
  rewardEarnings: number;
  grossSalary: number;

  // Deductions
  epfDeduction: number;
  esiDeduction: number;
  professionalTax: number;
  statutoryDeductions: number;
  advanceDeduction: number;
  lateAttendanceDeduction: number;
  unpaidLeaveDeduction: number;
  sandwichUnpaidDays?: number;
  sandwichDeduction?: number;
  totalDeductions: number;

  netSalary: number;

  // Days
  workingDays: number;
  presentDays: number;
  paidLeaves: number;
  unpaidLeaves: number;

  // Policy references & details
  lateDetails: LateDeductionResult;
  leaveDetails: LeaveDeductionResult;
  statutoryDetails: StatutoryDeductionsResult;
  rewardDetails: RewardEarningsResult;
}

export const calculateEmployeePayroll = (
  employee: Employee,
  attendanceRecords: AttendanceRecord[],
  leaveRequests: LeaveRequest[],
  advanceSalaryRecords: LoanRecord[],
  rewardRecords: EmployeeRewardRecord[],
  attendancePolicy: AttendancePolicy | undefined,
  leavePolicy: MasterLeavePolicy | undefined,
  payrollConfig: PayrollSettingsConfig | undefined,
  month: string = 'August',
  year: number = 2026
): FullPayrollCalculationResult => {
  const basic = toNum(employee.basicSalary);
  const totalCtc = employee.salaryDetails?.monthlyCtc || (basic > 0 ? Math.round(basic / 0.40) : 15000);
  const da = toNum(employee.allowances?.da ?? employee.salaryDetails?.da ?? Math.round(totalCtc * 0.20));
  const conveyance = toNum(employee.allowances?.conveyance ?? employee.salaryDetails?.conveyance ?? Math.round(totalCtc * 0.05));
  const hra = toNum(employee.allowances?.hra ?? employee.salaryDetails?.hra ?? Math.round(totalCtc * 0.35));
  const allowances = da + conveyance + hra;
  const standardDays = payrollConfig?.standardWorkingDaysPerMonth || 26;

  const dailySalary = standardDays > 0 ? basic / standardDays : basic / 26;

  // 1. Attendance & Present Days
  const empAtt = attendanceRecords.filter(a => a.employeeId === employee.employeeId);
  const presentCount = empAtt.filter(
    a => a.status === 'Present' || a.status === 'Late' || a.status === 'Work From Home'
  ).length;
  const presentDays = presentCount > 0 ? Math.min(standardDays, presentCount) : (employee.status === 'Active' ? standardDays : 0);

  // 2. Late Attendance Policy Evaluation
  const lateDetails = evaluateAttendanceLateDeduction(
    employee,
    attendanceRecords,
    attendancePolicy,
    dailySalary,
    basic
  );

  // 3. Leave Policy Evaluation
  const leaveDetails = evaluateLeaveDeductions(
    employee,
    leaveRequests,
    leavePolicy,
    dailySalary,
    basic
  );

  // 4. Rewards Evaluation
  const rewardDetails = evaluateEmployeeRewards(employee.employeeId, rewardRecords);

  // Attendance bonus: granted dynamically ONLY when employee achieves 100% attendance
  const isFullAttendance = presentDays >= standardDays && standardDays > 0 && (leaveDetails.totalUnpaidDays || 0) === 0;
  const attendanceBonus = isFullAttendance ? 1000 : 0;

  const bonus = 0;
  const grossSalary = basic + allowances + attendanceBonus + bonus + rewardDetails.totalRewardEarnings;

  const withPf = employee.withPf !== undefined 
    ? employee.withPf 
    : (employee.salaryDetails?.withPf !== undefined 
        ? employee.salaryDetails.withPf 
        : (employee.salaryDetails?.salaryScheme ? employee.salaryDetails.salaryScheme === 'WITH_PF' : true));

  // 5. Statutory Deductions
  const statutoryDetails = evaluateStatutoryContributions(
    basic,
    grossSalary,
    payrollConfig,
    withPf,
    da,
    conveyance,
    hra,
    attendanceBonus,
    0
  );

  // 6. Advance Salary / Loan EMI deduction ("Others" deduction)
  let scheduledLoanDeduction = 0;
  if (Array.isArray(advanceSalaryRecords)) {
    advanceSalaryRecords.forEach(adv => {
      if (
        adv.employeeId === employee.employeeId && 
        (adv.status === 'Active' || adv.status === 'Disbursed') &&
        toNum(adv.outstandingBalance) > 0
      ) {
        const nextInst = adv.repaymentSchedule?.find((s: LoanRepaymentInstallment) => s.status === 'Pending');
        let emi = nextInst 
          ? toNum(nextInst.scheduledAmount || nextInst.actualDeducted) 
          : toNum(adv.monthlyDeduction);
        
        // Automatically handle final month: deduct only up to remaining outstanding balance
        const balance = toNum(adv.outstandingBalance);
        emi = Math.min(emi, balance);
        scheduledLoanDeduction += emi;
      }
    });
  }

  // Low Salary Protection: Cap loan deduction to available net salary
  const preLoanDeductions = statutoryDetails.totalStatutory + lateDetails.deductionAmount + leaveDetails.deductionAmount;
  const availableSalary = Math.max(0, grossSalary - preLoanDeductions);
  const advanceDeduction = Math.min(scheduledLoanDeduction, availableSalary);

  const totalDeductions = preLoanDeductions + advanceDeduction;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    employeeId: employee.employeeId,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    department: employee.department,
    designation: employee.designation,
    month,
    year,
    basicSalary: basic,
    allowances,
    da,
    conveyance,
    hra,
    withPf,
    bonus,
    attendanceBonus,
    rewardEarnings: rewardDetails.totalRewardEarnings,
    grossSalary,

    epfDeduction: statutoryDetails.epfDeduction,
    esiDeduction: statutoryDetails.esiDeduction,
    professionalTax: statutoryDetails.professionalTax,
    statutoryDeductions: statutoryDetails.totalStatutory,
    advanceDeduction,
    lateAttendanceDeduction: lateDetails.deductionAmount,
    unpaidLeaveDeduction: leaveDetails.deductionAmount,
    sandwichUnpaidDays: leaveDetails.sandwichUnpaidDays || 0,
    sandwichDeduction: leaveDetails.sandwichDeduction || 0,
    totalDeductions,

    netSalary,

    workingDays: standardDays,
    presentDays,
    paidLeaves: 0,
    unpaidLeaves: leaveDetails.totalUnpaidDays,

    lateDetails,
    leaveDetails,
    statutoryDetails,
    rewardDetails
  };
};

// ========================================================
// 7. PAYSLIP PRIVACY & DEDUCTIONS FORMATTER
// ========================================================
export interface PayslipDeductionLineItem {
  label: string;
  amount: number;
  category: 'STATUTORY' | 'LOAN' | 'INTERNAL_PENALTY' | 'GENERIC_OTHER';
  isConfidential: boolean;
  internalReason?: string;
}

/**
 * Formats deductions for payslips strictly respecting the role & confidentiality settings.
 * - For Employee role: confidential policies are collapsed into generic 'OTHERS' (or custom generic label).
 * - For HR / CEO role: complete internal deduction reasons and policy names are clearly presented.
 */
export const formatPayslipDeductionsForViewer = (
  calc: FullPayrollCalculationResult,
  viewerRole: 'CEO' | 'HR' | 'HR Admin' | 'Super Admin' | 'Employee' | string,
  loanPolicy?: { payslipVisibility?: 'DETAILED' | 'GENERIC' }
): PayslipDeductionLineItem[] => {
  const isPrivileged = viewerRole === 'CEO' || viewerRole === 'HR' || viewerRole === 'HR Admin' || viewerRole === 'Super Admin';
  const items: PayslipDeductionLineItem[] = [];

  // Statutory lines (always visible)
  if (calc.epfDeduction > 0) {
    items.push({
      label: 'EPF Employee Contribution (12%)',
      amount: calc.epfDeduction,
      category: 'STATUTORY',
      isConfidential: false
    });
  }

  if (calc.esiDeduction > 0) {
    items.push({
      label: 'ESI Contribution',
      amount: calc.esiDeduction,
      category: 'STATUTORY',
      isConfidential: false
    });
  }

  if (calc.professionalTax > 0) {
    items.push({
      label: 'Professional Tax (PT)',
      amount: calc.professionalTax,
      category: 'STATUTORY',
      isConfidential: false
    });
  }

  if (calc.advanceDeduction > 0) {
    const isGeneric = loanPolicy?.payslipVisibility === 'GENERIC' && !isPrivileged;
    items.push({
      label: isGeneric ? 'OTHERS' : 'Employee Loan Recovery',
      amount: calc.advanceDeduction,
      category: 'LOAN',
      isConfidential: isGeneric
    });
  }

  // Internal attendance & leave deductions
  let genericOtherTotal = 0;

  // 1. Late Attendance Deduction
  if (calc.lateAttendanceDeduction > 0) {
    if (isPrivileged) {
      items.push({
        label: `Late Attendance Deduction (${calc.lateDetails.lateCount} Late Entries)`,
        amount: calc.lateAttendanceDeduction,
        category: 'INTERNAL_PENALTY',
        isConfidential: true,
        internalReason: calc.lateDetails.ruleApplied
      });
    } else {
      if (calc.lateDetails.isConfidential) {
        genericOtherTotal += calc.lateAttendanceDeduction;
      } else {
        items.push({
          label: 'Attendance Deduction',
          amount: calc.lateAttendanceDeduction,
          category: 'INTERNAL_PENALTY',
          isConfidential: false
        });
      }
    }
  }

  // 2. Unpaid Leave & Sandwich Leave Deductions
  const sandwichDeduct = toNum(calc.sandwichDeduction || calc.leaveDetails?.sandwichDeduction || 0);
  const remainingUnpaidDeduct = Math.max(0, calc.unpaidLeaveDeduction - sandwichDeduct);

  // Sandwich Leave Deduction item
  if (sandwichDeduct > 0) {
    if (isPrivileged) {
      items.push({
        label: `Sandwich Leave Deduction`,
        amount: sandwichDeduct,
        category: 'INTERNAL_PENALTY',
        isConfidential: true,
        internalReason: 'Sandwich Leave'
      });
    } else {
      if (calc.leaveDetails.isConfidential) {
        genericOtherTotal += sandwichDeduct;
      } else {
        items.push({
          label: 'Sandwich Leave Deduction',
          amount: sandwichDeduct,
          category: 'INTERNAL_PENALTY',
          isConfidential: false
        });
      }
    }
  }

  // Other Unpaid Leave Days (if any beyond sandwich)
  if (remainingUnpaidDeduct > 0) {
    if (isPrivileged) {
      items.push({
        label: `Unpaid Leave Penalty (${calc.leaveDetails.excessUnpaidDays} Days Beyond Quota)`,
        amount: remainingUnpaidDeduct,
        category: 'INTERNAL_PENALTY',
        isConfidential: true,
        internalReason: calc.leaveDetails.ruleApplied
      });
    } else {
      if (calc.leaveDetails.isConfidential) {
        genericOtherTotal += remainingUnpaidDeduct;
      } else {
        items.push({
          label: 'Leave Deduction',
          amount: remainingUnpaidDeduct,
          category: 'INTERNAL_PENALTY',
          isConfidential: false
        });
      }
    }
  }

  // If there are confidential deductions collapsed for employees, add the generic line
  if (!isPrivileged && genericOtherTotal > 0) {
    const label = calc.lateDetails.genericCategoryLabel || calc.leaveDetails.genericCategoryLabel || 'OTHERS';
    items.push({
      label,
      amount: genericOtherTotal,
      category: 'GENERIC_OTHER',
      isConfidential: false
    });
  }

  return items;
};
