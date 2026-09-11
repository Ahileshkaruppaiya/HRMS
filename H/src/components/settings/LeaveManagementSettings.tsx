import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { MasterLeavePolicy, LeaveApprovalFlow, LeaveDeductionRuleType, DeductionVisibility, LeaveTypeConfig } from '../../types/settings';
import { SandwichCondition } from '../../types/sandwichLeave';
import { validateFormula } from '../../services/policyEngine';
import { 
  CalendarDays, 
  Plus, 
  Edit3, 
  Archive, 
  GitFork, 
  ShieldCheck, 
  EyeOff, 
  Eye, 
  CheckCircle2, 
  Layers, 
  Trash2,
  HelpCircle,
  Sliders,
  Check,
  Sparkles,
  Info,
  X
} from 'lucide-react';

export const LeaveManagementSettings: React.FC = () => {
  const { 
    masterLeavePolicies, 
    addMasterLeavePolicy, 
    updateMasterLeavePolicy, 
    archiveMasterLeavePolicy,
    toggleMasterLeavePolicyStatus,
    sandwichPolicies,
    updateSandwichPolicy,
    createSandwichPolicy,
    currentUser
  } = useHRMS();

  const isPrivileged = currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin' || currentUser.role === 'Management';

  // Sub tab: 'policies' | 'sandwich'
  const [activeSubTab, setActiveSubTab] = useState<'policies' | 'sandwich'>('policies');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<MasterLeavePolicy | null>(null);

  // Form State
  const [form, setForm] = useState<{
    policyName: string;
    description: string;
    effectiveDate: string;
    status: 'Active' | 'Inactive';
    leaveTypes: LeaveTypeConfig[];
    monthlyFreeUnpaidLeaves: number;
    deductionRuleType: LeaveDeductionRuleType;
    fixedDeductionAmount: number;
    dailySalaryMultiplier: number;
    percentageOfDailySalary: number;
    customFormula: string;
    approvalFlow: LeaveApprovalFlow;
    deductionVisibility: DeductionVisibility;
    genericCategoryLabel: string;
  }>({
    policyName: '',
    description: '',
    effectiveDate: '2026-01-01',
    status: 'Active',
    leaveTypes: [],
    monthlyFreeUnpaidLeaves: 1,
    deductionRuleType: 'DAILY_SALARY',
    fixedDeductionAmount: 1000,
    dailySalaryMultiplier: 1,
    percentageOfDailySalary: 100,
    customFormula: '(DAILY_SALARY * UNPAID_DAYS)',
    approvalFlow: 'EMPLOYEE_HR',
    deductionVisibility: 'GENERIC',
    genericCategoryLabel: 'OTHERS'
  });

  const [formulaValidation, setFormulaValidation] = useState<{ isValid: boolean; error?: string; sampleResult?: number }>({ isValid: true });
  const [newLeaveTypeName, setNewLeaveTypeName] = useState('');
  const [newLeaveTypeQuota, setNewLeaveTypeQuota] = useState(12);
  const [newLeaveTypeIsPaid, setNewLeaveTypeIsPaid] = useState(true);

  const openAddModal = () => {
    setEditingPolicy(null);
    setForm({
      policyName: '',
      description: '',
      effectiveDate: '2026-09-01',
      status: 'Active',
      leaveTypes: [
        { id: 'lt-cl', name: 'Casual Leave', isPaid: true, quotaPerYear: 12, description: 'Short personal leave', color: '#0E7490' },
        { id: 'lt-sl', name: 'Sick Leave', isPaid: true, quotaPerYear: 10, description: 'Medical recovery leave', color: '#22C55E' },
        { id: 'lt-pl', name: 'Paid Leave', isPaid: true, quotaPerYear: 15, description: 'Annual privileged leave', color: '#3B82F6' },
        { id: 'lt-ul', name: 'Unpaid Leave', isPaid: false, quotaPerYear: 12, description: 'Loss of pay leave beyond paid quotas', color: '#EF4444' },
        { id: 'lt-el', name: 'Earned Leave', isPaid: true, quotaPerYear: 18, description: 'Accrued long leave', color: '#8B5CF6' },
        { id: 'lt-ml', name: 'Maternity Leave', isPaid: true, quotaPerYear: 180, description: 'Statutory maternity leave', color: '#EC4899' },
        { id: 'lt-pt', name: 'Paternity Leave', isPaid: true, quotaPerYear: 15, description: 'New father support leave', color: '#14B8A6' },
        { id: 'lt-co', name: 'Compensatory Leave', isPaid: true, quotaPerYear: 12, description: 'Comp-off for weekend project work', color: '#F59E0B' }
      ],
      monthlyFreeUnpaidLeaves: 1,
      deductionRuleType: 'DAILY_SALARY',
      fixedDeductionAmount: 1000,
      dailySalaryMultiplier: 1,
      percentageOfDailySalary: 100,
      customFormula: '(DAILY_SALARY * UNPAID_DAYS)',
      approvalFlow: 'EMPLOYEE_HR',
      deductionVisibility: 'GENERIC',
      genericCategoryLabel: 'OTHERS'
    });
    setFormulaValidation({ isValid: true });
    setIsModalOpen(true);
  };

  const openEditModal = (p: MasterLeavePolicy) => {
    setEditingPolicy(p);
    setForm({
      policyName: p.policyName,
      description: p.description,
      effectiveDate: p.effectiveDate,
      status: p.status === 'Archived' ? 'Inactive' : p.status,
      leaveTypes: p.leaveTypes || [],
      monthlyFreeUnpaidLeaves: p.monthlyFreeUnpaidLeaves,
      deductionRuleType: p.deductionRuleType,
      fixedDeductionAmount: p.fixedDeductionAmount || 1000,
      dailySalaryMultiplier: p.dailySalaryMultiplier || 1,
      percentageOfDailySalary: p.percentageOfDailySalary || 100,
      customFormula: p.customFormula || '(DAILY_SALARY * UNPAID_DAYS)',
      approvalFlow: p.approvalFlow,
      deductionVisibility: p.deductionVisibility,
      genericCategoryLabel: p.genericCategoryLabel || 'OTHERS'
    });
    setFormulaValidation(validateFormula(p.customFormula || '(DAILY_SALARY * UNPAID_DAYS)'));
    setIsModalOpen(true);
  };

  const handleFormulaChange = (val: string) => {
    setForm(prev => ({ ...prev, customFormula: val }));
    setFormulaValidation(validateFormula(val));
  };

  const handleAddCustomLeaveType = () => {
    if (!newLeaveTypeName.trim()) return;
    const newType: LeaveTypeConfig = {
      id: `lt-${Date.now()}`,
      name: newLeaveTypeName.trim(),
      isPaid: newLeaveTypeIsPaid,
      quotaPerYear: Number(newLeaveTypeQuota) || 12,
      description: 'Custom defined leave quota',
      color: '#0E7490'
    };
    setForm(prev => ({ ...prev, leaveTypes: [...prev.leaveTypes, newType] }));
    setNewLeaveTypeName('');
    setNewLeaveTypeQuota(12);
  };

  const handleRemoveLeaveType = (id: string) => {
    setForm(prev => ({ ...prev, leaveTypes: prev.leaveTypes.filter(t => t.id !== id) }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.policyName.trim()) return;

    const payload = {
      policyName: form.policyName.trim(),
      description: form.description.trim(),
      applicableEmployees: 'ALL' as const,
      applicableDepartments: 'ALL' as const,
      applicableBranches: 'ALL' as const,
      effectiveDate: form.effectiveDate,
      status: form.status,
      leaveTypes: form.leaveTypes,
      monthlyFreeUnpaidLeaves: Number(form.monthlyFreeUnpaidLeaves) || 0,
      deductionRuleType: form.deductionRuleType,
      fixedDeductionAmount: Number(form.fixedDeductionAmount) || 0,
      dailySalaryMultiplier: Number(form.dailySalaryMultiplier) || 1,
      percentageOfDailySalary: Number(form.percentageOfDailySalary) || 100,
      customFormula: form.customFormula,
      approvalFlow: form.approvalFlow,
      deductionVisibility: form.deductionVisibility,
      genericCategoryLabel: form.genericCategoryLabel || 'OTHERS'
    };

    if (editingPolicy) {
      updateMasterLeavePolicy(editingPolicy.id, payload);
    } else {
      addMasterLeavePolicy(payload);
    }
    setIsModalOpen(false);
  };

  // Sandwich Rule State & Handlers
  const [sandwichFeedback, setSandwichFeedback] = useState<string | null>(null);

  const showSandwichFeedback = (msg: string) => {
    setSandwichFeedback(msg);
    setTimeout(() => setSandwichFeedback(null), 3000);
  };

  const isSandwichEnabled = sandwichPolicies.length > 0
    ? sandwichPolicies.some(p => p.sandwichRuleEnabled && p.status === 'Active')
    : false;

  const countWeeklyOff = sandwichPolicies.length > 0
    ? sandwichPolicies.some(p => p.countWeeklyOffAsLeave)
    : true;

  const countPublicHoliday = sandwichPolicies.length > 0
    ? sandwichPolicies.some(p => p.countPublicHolidayAsLeave)
    : true;

  const currentCondition = sandwichPolicies[0]?.sandwichCondition || 'BOTH_SIDES_MANDATORY';

  const handleToggleGlobalSandwich = (nextState?: boolean) => {
    const newState = typeof nextState === 'boolean' ? nextState : !isSandwichEnabled;
    if (sandwichPolicies.length === 0) {
      createSandwichPolicy({
        policyName: 'Corporate Sandwich Leave Policy',
        description: 'Enforces sandwich rule on leaves bounded by weekly offs or holidays.',
        applicableLeaveTypes: ['Casual Leave', 'Sick Leave', 'Unpaid Leave'],
        applicableEmployees: 'ALL',
        applicableDepartments: 'ALL',
        applicableDesignations: 'ALL',
        applicableBranches: 'ALL',
        effectiveFrom: '2026-01-01',
        status: newState ? 'Active' : 'Inactive',
        sandwichRuleEnabled: newState,
        countWeeklyOffAsLeave: true,
        countPublicHolidayAsLeave: true,
        sandwichCondition: 'BOTH_SIDES_MANDATORY',
        payType: 'SAME_AS_APPLIED_LEAVE'
      });
    } else {
      sandwichPolicies.forEach(p => {
        updateSandwichPolicy(p.id, {
          sandwichRuleEnabled: newState,
          status: newState ? 'Active' : 'Inactive'
        }, newState ? 'Enabled sandwich leave rule via Settings' : 'Disabled sandwich leave rule via Settings');
      });
    }
    showSandwichFeedback(newState ? 'Sandwich Leave Rule turned ON.' : 'Sandwich Leave Rule turned OFF.');
  };

  const handleToggleWeeklyOff = (nextVal?: boolean) => {
    const val = typeof nextVal === 'boolean' ? nextVal : !countWeeklyOff;
    sandwichPolicies.forEach(p => {
      updateSandwichPolicy(p.id, { countWeeklyOffAsLeave: val });
    });
    showSandwichFeedback(val ? 'Counting Weekly Offs as leave enabled.' : 'Counting Weekly Offs as leave disabled.');
  };

  const handleTogglePublicHoliday = (nextVal?: boolean) => {
    const val = typeof nextVal === 'boolean' ? nextVal : !countPublicHoliday;
    sandwichPolicies.forEach(p => {
      updateSandwichPolicy(p.id, { countPublicHolidayAsLeave: val });
    });
    showSandwichFeedback(val ? 'Counting Public Holidays as leave enabled.' : 'Counting Public Holidays as leave disabled.');
  };

  const handleConditionChange = (condition: SandwichCondition) => {
    sandwichPolicies.forEach(p => {
      updateSandwichPolicy(p.id, { sandwichCondition: condition });
    });
    showSandwichFeedback('Sandwich trigger condition updated.');
  };

  const toggleRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    transition: 'all 0.15s ease'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-tabs & Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        padding: '10px 14px',
        borderRadius: '12px',
        border: '1px solid #E7ECF3'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('policies')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              backgroundColor: activeSubTab === 'policies' ? '#0E7490' : 'transparent',
              color: activeSubTab === 'policies' ? '#FFFFFF' : '#64748B',
              transition: 'all 0.15s ease'
            }}
          >
            <CalendarDays size={16} />
            <span>Leave Policies & Quotas</span>
            <span style={{
              fontSize: '0.72rem',
              padding: '1px 7px',
              borderRadius: '999px',
              backgroundColor: activeSubTab === 'policies' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
              color: activeSubTab === 'policies' ? '#FFFFFF' : '#475569',
              fontWeight: 800
            }}>
              {masterLeavePolicies.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sandwich')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              backgroundColor: activeSubTab === 'sandwich' ? '#0E7490' : 'transparent',
              color: activeSubTab === 'sandwich' ? '#FFFFFF' : '#64748B',
              transition: 'all 0.15s ease'
            }}
          >
            <Sliders size={16} />
            <span>Sandwich Leave Rule</span>
            <span style={{
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: isSandwichEnabled ? '#DCFCE7' : '#F1F5F9',
              color: isSandwichEnabled ? '#15803D' : '#64748B',
              fontWeight: 800
            }}>
              {isSandwichEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {activeSubTab === 'policies' && isPrivileged && (
          <button
            className="btn btn-primary btn-sm"
            onClick={openAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Create Leave Policy
          </button>
        )}
      </div>

      {activeSubTab === 'sandwich' ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E7ECF3',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '16px'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={20} color="#0E7490" />
                Sandwich Leave Rule Configuration
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                Simple ON / OFF rule to determine if intervening weekends and public holidays are deducted as leave.
              </p>
            </div>

            {/* Notification Toast if updated */}
            {sandwichFeedback && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: '#ECFEFF',
                color: '#0E7490',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: '1px solid #A5F3FC'
              }}>
                <CheckCircle2 size={16} />
                <span>{sandwichFeedback}</span>
              </div>
            )}
          </div>

          {/* Clean Preference Rows (Matching exact screenshot format) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Row 1: Master Sandwich Rule ON/OFF */}
            <div style={toggleRowStyle}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                  Enforce Sandwich Leave Rule
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Automatically treat intervening weekly offs and holidays as leaves when an employee takes leave on both surrounding working days
                </div>
              </div>
              <input
                type="checkbox"
                checked={isSandwichEnabled}
                onChange={(e) => handleToggleGlobalSandwich(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0E7490', cursor: 'pointer' }}
              />
            </div>

            {/* Row 2: Count Weekly Offs */}
            <div style={{
              ...toggleRowStyle,
              opacity: isSandwichEnabled ? 1 : 0.5,
              pointerEvents: isSandwichEnabled ? 'auto' : 'none'
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                  Count Intervening Weekly Offs as Leave
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Include Saturday and Sunday (or weekly rest days) in leave deduction when bounded by leave days
                </div>
              </div>
              <input
                type="checkbox"
                checked={countWeeklyOff}
                disabled={!isSandwichEnabled}
                onChange={(e) => handleToggleWeeklyOff(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0E7490', cursor: isSandwichEnabled ? 'pointer' : 'not-allowed' }}
              />
            </div>

            {/* Row 3: Count Public Holidays */}
            <div style={{
              ...toggleRowStyle,
              opacity: isSandwichEnabled ? 1 : 0.5,
              pointerEvents: isSandwichEnabled ? 'auto' : 'none'
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                  Count Intervening Public Holidays as Leave
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Include official company or public holidays in leave deduction when bounded by leave days
                </div>
              </div>
              <input
                type="checkbox"
                checked={countPublicHoliday}
                disabled={!isSandwichEnabled}
                onChange={(e) => handleTogglePublicHoliday(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0E7490', cursor: isSandwichEnabled ? 'pointer' : 'not-allowed' }}
              />
            </div>

            {/* Row 4: Trigger Condition */}
            <div style={{
              ...toggleRowStyle,
              opacity: isSandwichEnabled ? 1 : 0.5,
              pointerEvents: isSandwichEnabled ? 'auto' : 'none'
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                  Sandwich Trigger Condition
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Standard rule requires leave on both preceding and succeeding work days (e.g. Friday AND Monday)
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={!isSandwichEnabled}
                  onClick={() => handleConditionChange('BOTH_SIDES_MANDATORY')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: isSandwichEnabled ? 'pointer' : 'not-allowed',
                    backgroundColor: currentCondition === 'BOTH_SIDES_MANDATORY' ? '#0E7490' : '#E2E8F0',
                    color: currentCondition === 'BOTH_SIDES_MANDATORY' ? '#FFFFFF' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Both Sides Mandatory
                </button>
                <button
                  type="button"
                  disabled={!isSandwichEnabled}
                  onClick={() => handleConditionChange('LEAVE_ONLY_BEFORE')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: isSandwichEnabled ? 'pointer' : 'not-allowed',
                    backgroundColor: currentCondition !== 'BOTH_SIDES_MANDATORY' ? '#0E7490' : '#E2E8F0',
                    color: currentCondition !== 'BOTH_SIDES_MANDATORY' ? '#FFFFFF' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Either Side (Relaxed)
                </button>
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: '#F0FDFA',
            border: '1px solid #CCFBF1',
            color: '#0F766E',
            fontSize: '0.80rem'
          }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>How it works:</strong> If an employee applies for leave on Friday and Monday, the intervening weekend (Saturday & Sunday) will {isSandwichEnabled ? 'automatically be counted as 2 additional leave days.' : 'NOT be counted (Sandwich Rule is currently OFF).'}
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Policies List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {masterLeavePolicies.map(policy => {
          const isActive = policy.status === 'Active';
          const isArchived = policy.status === 'Archived';

          return (
            <div
              key={policy.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: isActive ? '1.5px solid #0E7490' : '1px solid #E7ECF3',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                opacity: isArchived ? 0.6 : 1
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                        {policy.policyName}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                        v{policy.version}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                      {policy.description}
                    </p>
                  </div>

                  <span className={`status-pill ${isActive ? 'approved' : isArchived ? 'overdue' : 'pending'}`}>
                    {policy.status}
                  </span>
                </div>

                {/* Free Leave Quota & Deduction Formula */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '14px'
                }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Monthly Free Unpaid Leave:</span>
                    <div style={{ fontWeight: 700, color: '#0E7490' }}>
                      {policy.monthlyFreeUnpaidLeaves} Day(s) Free
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B' }}>Subsequent Deductions:</span>
                    <div style={{ fontWeight: 700, color: '#1E293B' }}>
                      {policy.deductionRuleType === 'DAILY_SALARY' && `${policy.dailySalaryMultiplier || 1}x Daily Salary`}
                      {policy.deductionRuleType === 'FIXED_AMOUNT' && `₹${policy.fixedDeductionAmount}/day`}
                      {policy.deductionRuleType === 'PERCENTAGE' && `${policy.percentageOfDailySalary}% Daily Salary`}
                      {policy.deductionRuleType === 'CUSTOM_FORMULA' && 'Custom Formula'}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B' }}>Approval Flow:</span>
                    <div style={{ fontWeight: 700, color: '#1E293B' }}>
                      {policy.approvalFlow === 'EMPLOYEE_HR_CEO' && 'Emp → HR → CEO'}
                      {policy.approvalFlow === 'EMPLOYEE_MANAGER_HR' && 'Emp → Manager → HR'}
                      {policy.approvalFlow === 'EMPLOYEE_HR' && 'Emp → HR'}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B' }}>Employee Payslip Privacy:</span>
                    <div style={{ fontWeight: 700, color: '#1E293B' }}>
                      {policy.deductionVisibility === 'GENERIC' ? `Generic (${policy.genericCategoryLabel})` : 'Detailed Breakdown'}
                    </div>
                  </div>
                </div>

                {/* Supported Leave Types Badges */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Available Quotas ({(policy.leaveTypes || []).length} Types):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {(policy.leaveTypes || []).map(t => (
                      <span
                        key={t.id}
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          backgroundColor: t.isPaid ? '#ECFEFF' : '#FEE2E2',
                          color: t.isPaid ? '#0E7490' : '#DC2626',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {t.name} ({t.quotaPerYear}d)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {isPrivileged && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(policy)}
                    >
                      <Edit3 size={14} /> Edit Policy
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleMasterLeavePolicyStatus(policy.id)}
                      disabled={isArchived}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  {!isArchived && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#EF4444' }}
                      onClick={() => {
                        if (window.confirm(`Archive "${policy.policyName}"? Historical payroll runs will continue using their past versions.`)) {
                          archiveMasterLeavePolicy(policy.id);
                        }
                      }}
                      title="Archive Policy"
                    >
                      <Archive size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editingPolicy ? `Edit Policy: ${editingPolicy.policyName}` : 'Create Master Leave Policy'}</h3>
              <button className="close-btn" title="Close" onClick={() => setIsModalOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Policy Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.policyName}
                      onChange={e => setForm({ ...form, policyName: e.target.value })}
                      placeholder="e.g. Corporate Master Leave & Unpaid Policy"
                      required
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Brief summary of policy coverage..."
                    />
                  </div>

                  <div>
                    <label className="form-label">Effective Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.effectiveDate}
                      onChange={e => setForm({ ...form, effectiveDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Policy Status</label>
                    <select
                      className="form-control"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value as any })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Section B: Custom Unpaid Leave Rule Builder */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                    Custom Leave Deduction Rule Builder
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label className="form-label">Monthly Free / Allowed Unpaid Leaves</label>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        max={10}
                        value={form.monthlyFreeUnpaidLeaves}
                        onChange={e => setForm({ ...form, monthlyFreeUnpaidLeaves: parseInt(e.target.value) || 0 })}
                        required
                      />
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        e.g. 1 = First unpaid leave incurs no salary penalty.
                      </span>
                    </div>

                    <div>
                      <label className="form-label">Excess Leave Deduction Rule Type</label>
                      <select
                        className="form-control"
                        value={form.deductionRuleType}
                        onChange={e => setForm({ ...form, deductionRuleType: e.target.value as LeaveDeductionRuleType })}
                      >
                        <option value="DAILY_SALARY">Daily Salary (1 Day Salary per Excess Day)</option>
                        <option value="FIXED_AMOUNT">Fixed Amount (e.g. ₹1,000 per Day)</option>
                        <option value="PERCENTAGE">Percentage of Daily Salary</option>
                        <option value="CUSTOM_FORMULA">Custom Formula (DAILY_SALARY * UNPAID_DAYS)</option>
                      </select>
                    </div>
                  </div>

                  {form.deductionRuleType === 'DAILY_SALARY' && (
                    <div>
                      <label className="form-label">Daily Salary Multiplier</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.5"
                        value={form.dailySalaryMultiplier}
                        onChange={e => setForm({ ...form, dailySalaryMultiplier: parseFloat(e.target.value) || 1 })}
                      />
                    </div>
                  )}

                  {form.deductionRuleType === 'FIXED_AMOUNT' && (
                    <div>
                      <label className="form-label">Fixed Amount Per Excess Day (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.fixedDeductionAmount}
                        onChange={e => setForm({ ...form, fixedDeductionAmount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  )}

                  {form.deductionRuleType === 'CUSTOM_FORMULA' && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
                      <label className="form-label">Custom Formula</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.customFormula}
                        onChange={e => handleFormulaChange(e.target.value)}
                        placeholder="(DAILY_SALARY * UNPAID_DAYS)"
                      />
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>
                        Allowed variables: <code>DAILY_SALARY</code>, <code>UNPAID_DAYS</code>, <code>BASIC</code>
                      </div>
                      {formulaValidation.isValid ? (
                        <div style={{ marginTop: '6px', color: '#16A34A', fontSize: '0.78rem', fontWeight: 600 }}>
                          ✓ Valid formula!
                        </div>
                      ) : (
                        <div style={{ marginTop: '6px', color: '#DC2626', fontSize: '0.78rem', fontWeight: 600 }}>
                          ⚠ {formulaValidation.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section C: Approval Flow & Privacy */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                    Approval Flow & Payslip Visibility
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <label className="form-label">Approval Hierarchy Flow</label>
                      <select
                        className="form-control"
                        value={form.approvalFlow}
                        onChange={e => setForm({ ...form, approvalFlow: e.target.value as LeaveApprovalFlow })}
                      >
                        <option value="EMPLOYEE_HR">Option 3: Employee → HR</option>
                        <option value="EMPLOYEE_MANAGER_HR">Option 2: Employee → Manager → HR</option>
                        <option value="EMPLOYEE_HR_CEO">Option 1: Employee → HR → CEO</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Employee Payslip Visibility</label>
                      <select
                        className="form-control"
                        value={form.deductionVisibility}
                        onChange={e => setForm({ ...form, deductionVisibility: e.target.value as DeductionVisibility })}
                      >
                        <option value="GENERIC">Generic Label (Confidential)</option>
                        <option value="DETAILED">Detailed Breakdown</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Generic Label on Slip</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.genericCategoryLabel}
                        onChange={e => setForm({ ...form, genericCategoryLabel: e.target.value })}
                        disabled={form.deductionVisibility !== 'GENERIC'}
                      />
                    </div>
                  </div>
                </div>

                {/* Section D: Quota Types */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                    Leave Types Configuration ({form.leaveTypes.length})
                  </h4>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Custom Leave Type Name"
                      value={newLeaveTypeName}
                      onChange={e => setNewLeaveTypeName(e.target.value)}
                    />
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Quota"
                      style={{ width: '90px' }}
                      value={newLeaveTypeQuota}
                      onChange={e => setNewLeaveTypeQuota(parseInt(e.target.value) || 0)}
                    />
                    <select
                      className="form-control form-control-sm"
                      value={newLeaveTypeIsPaid ? 'PAID' : 'UNPAID'}
                      onChange={e => setNewLeaveTypeIsPaid(e.target.value === 'PAID')}
                      style={{ width: '110px' }}
                    >
                      <option value="PAID">Paid</option>
                      <option value="UNPAID">Unpaid</option>
                    </select>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCustomLeaveType}>
                      Add Type
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {form.leaveTypes.map(t => (
                      <span
                        key={t.id}
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {t.name} ({t.quotaPerYear} days / {t.isPaid ? 'Paid' : 'Unpaid'})
                        <button
                          type="button"
                          onClick={() => handleRemoveLeaveType(t.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPolicy ? 'Update Policy' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
