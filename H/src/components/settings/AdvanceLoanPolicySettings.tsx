import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  LoanPolicy, 
  LoanPolicyType, 
  LoanLimitType, 
  ApprovalWorkflowMode, 
  LowSalaryRepaymentRule, 
  PayslipVisibilityRule 
} from '../../types/settings';
import { 
  Banknote, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  Calendar, 
  Calculator, 
  Percent, 
  DollarSign, 
  UserCheck, 
  Clock, 
  HelpCircle,
  Eye,
  Check,
  X,
  Building,
  Users,
  Maximize2,
  Minimize2,
  ShieldCheck
} from 'lucide-react';

export const AdvanceLoanPolicySettings: React.FC = () => {
  const { 
    loanPolicies, 
    createLoanPolicy, 
    updateLoanPolicy, 
    deleteLoanPolicy, 
    currentUser, 
    departments,
    branches 
  } = useHRMS();

  const isPrivileged = currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [editingPolicy, setEditingPolicy] = useState<LoanPolicy | null>(null);

  const [formData, setFormData] = useState<{
    policyName: string;
    policyType: LoanPolicyType;
    description: string;
    applicableEmployees: 'ALL' | string[];
    applicableDepartments: 'ALL' | string[];
    applicableBranches: 'ALL' | string[];
    effectiveFrom: string;
    effectiveTo: string;
    status: 'Active' | 'Inactive';
    minimumEmploymentMonths: number;
    maxLoanLimitType: LoanLimitType;
    maxLoanLimitValue: number;
    maxActiveLoans: number;
    minLoanAmount: number;
    maxLoanAmount: number;
    minRepaymentMonths: number;
    maxRepaymentMonths: number;
    deductionStartRule: 'NEXT_PAYROLL_CYCLE' | 'SPECIFIED_MONTH';
    approvalWorkflow: ApprovalWorkflowMode;
    lowSalaryRule: LowSalaryRepaymentRule;
    payslipVisibility: PayslipVisibilityRule;
  }>({
    policyName: '',
    policyType: 'Employee Loan',
    description: '',
    applicableEmployees: 'ALL',
    applicableDepartments: 'ALL',
    applicableBranches: 'ALL',
    effectiveFrom: '2026-01-01',
    effectiveTo: '',
    status: 'Active',
    minimumEmploymentMonths: 6,
    maxLoanLimitType: 'SALARY_MULTIPLIER',
    maxLoanLimitValue: 2,
    maxActiveLoans: 1,
    minLoanAmount: 5000,
    maxLoanAmount: 500000,
    minRepaymentMonths: 3,
    maxRepaymentMonths: 12,
    deductionStartRule: 'NEXT_PAYROLL_CYCLE',
    approvalWorkflow: 'HR_OR_CEO',
    lowSalaryRule: 'DEDUCT_AVAILABLE_CARRY_FORWARD',
    payslipVisibility: 'GENERIC'
  });

  const openAddModal = () => {
    setEditingPolicy(null);
    setFormData({
      policyName: '',
      policyType: 'Employee Loan',
      description: '',
      applicableEmployees: 'ALL',
      applicableDepartments: 'ALL',
      applicableBranches: 'ALL',
      effectiveFrom: '2026-01-01',
      effectiveTo: '',
      status: 'Active',
      minimumEmploymentMonths: 6,
      maxLoanLimitType: 'SALARY_MULTIPLIER',
      maxLoanLimitValue: 2,
      maxActiveLoans: 1,
      minLoanAmount: 5000,
      maxLoanAmount: 500000,
      minRepaymentMonths: 3,
      maxRepaymentMonths: 12,
      deductionStartRule: 'NEXT_PAYROLL_CYCLE',
      approvalWorkflow: 'HR_OR_CEO',
      lowSalaryRule: 'DEDUCT_AVAILABLE_CARRY_FORWARD',
      payslipVisibility: 'GENERIC'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: LoanPolicy) => {
    setEditingPolicy(p);
    setFormData({
      policyName: p.policyName,
      policyType: p.policyType,
      description: p.description,
      applicableEmployees: p.applicableEmployees,
      applicableDepartments: p.applicableDepartments,
      applicableBranches: p.applicableBranches,
      effectiveFrom: p.effectiveFrom,
      effectiveTo: p.effectiveTo || '',
      status: p.status,
      minimumEmploymentMonths: p.minimumEmploymentMonths,
      maxLoanLimitType: p.maxLoanLimitType,
      maxLoanLimitValue: p.maxLoanLimitValue,
      maxActiveLoans: p.maxActiveLoans,
      minLoanAmount: p.minLoanAmount,
      maxLoanAmount: p.maxLoanAmount,
      minRepaymentMonths: p.minRepaymentMonths,
      maxRepaymentMonths: p.maxRepaymentMonths,
      deductionStartRule: p.deductionStartRule,
      approvalWorkflow: p.approvalWorkflow,
      lowSalaryRule: p.lowSalaryRule,
      payslipVisibility: p.payslipVisibility
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.policyName.trim()) return;

    if (editingPolicy) {
      updateLoanPolicy(editingPolicy.id, formData);
    } else {
      createLoanPolicy(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Integrated Navigation & Actions Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        padding: '12px 18px',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#F1F5F9',
          padding: '4px',
          borderRadius: '10px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            color: '#0E7490',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            fontWeight: 750,
            fontSize: '0.82rem'
          }}>
            <Banknote size={15} />
            <span>Master Loan & Advance Policies</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '999px',
              backgroundColor: '#ECFEFF',
              color: '#0E7490',
              fontWeight: 700
            }}>
              {loanPolicies.length}
            </span>
          </div>
        </div>

        {isPrivileged && (
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={openAddModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              padding: '7px 16px',
              borderRadius: '10px'
            }}
          >
            <Plus size={15} />
            <span>Create Master Policy</span>
          </button>
        )}
      </div>

      {/* Security & Access Info Alert */}
      <div style={{
        padding: '14px 18px',
        backgroundColor: '#ECFEFF',
        border: '1px solid #CFFAFE',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.82rem',
        color: '#0E7490'
      }}>
        <UserCheck size={20} strokeWidth={2.2} />
        <div>
          <strong>Access Governance:</strong> Only HR Managers and CEO (Super Admin) are authorized to create or edit master loan policies. Employees cannot alter eligibility formulas or borrowing limits.
        </div>
      </div>

      {/* Policies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {loanPolicies.map((policy) => {
          const isActive = policy.status === 'Active';
          return (
            <div 
              key={policy.id}
              className="card"
              style={{
                borderRadius: '16px',
                border: isActive ? '1px solid #0E7490' : '1px solid var(--color-border)',
                position: 'relative',
                boxShadow: isActive ? '0 4px 14px rgba(14, 116, 144, 0.08)' : 'var(--shadow-sm)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="status-pill" style={{
                        backgroundColor: isActive ? '#DCFCE7' : '#F1F5F9',
                        color: isActive ? '#166534' : '#64748B',
                        fontWeight: 700,
                        fontSize: '0.7rem'
                      }}>
                        {policy.status}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                        {policy.policyType}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                      {policy.policyName}
                    </h3>
                  </div>

                  {isPrivileged && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        type="button" 
                        onClick={() => openEditModal(policy)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 8px', borderRadius: '8px' }}
                        title="Edit Policy"
                      >
                        <Edit3 size={14} />
                      </button>
                      {loanPolicies.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => deleteLoanPolicy(policy.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 8px', borderRadius: '8px', color: '#EF4444' }}
                          title="Delete Policy"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                  {policy.description}
                </p>

                {/* Key Policy Highlights Badges */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '10px', 
                  backgroundColor: '#F8FAFC', 
                  padding: '12px', 
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '0.75rem'
                }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Min Work Experience:</span>
                    <strong style={{ color: '#0F172A' }}>{policy.minimumEmploymentMonths} Months</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Max Loan Limit:</span>
                    <strong style={{ color: '#0E7490' }}>
                      {policy.maxLoanLimitType === 'SALARY_MULTIPLIER' && `${policy.maxLoanLimitValue} × Monthly Salary`}
                      {policy.maxLoanLimitType === 'PERCENTAGE_SALARY' && `${policy.maxLoanLimitValue}% of Monthly Salary`}
                      {policy.maxLoanLimitType === 'FIXED_AMOUNT' && `₹${policy.maxLoanLimitValue.toLocaleString('en-IN')} Fixed`}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Active Loan Rule:</span>
                    <strong style={{ color: '#0F172A' }}>Max {policy.maxActiveLoans} Active Loan</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Repayment Tenure:</span>
                    <strong style={{ color: '#0F172A' }}>{policy.minRepaymentMonths} - {policy.maxRepaymentMonths} Months</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Approval Mode:</span>
                    <strong style={{ color: '#0F172A' }}>
                      {policy.approvalWorkflow === 'HR_OR_CEO' && 'HR or CEO'}
                      {policy.approvalWorkflow === 'HR_ONLY' && 'HR Only'}
                      {policy.approvalWorkflow === 'CEO_ONLY' && 'CEO Only'}
                      {policy.approvalWorkflow === 'HR_THEN_CEO' && 'HR then CEO'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Payslip Visibility:</span>
                    <strong style={{ color: '#0F172A' }}>
                      {policy.payslipVisibility === 'GENERIC' ? 'Generic (OTHERS)' : 'Detailed'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Footer Meta */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingTop: '12px', 
                borderTop: '1px solid var(--color-border)', 
                fontSize: '0.72rem', 
                color: '#64748B' 
              }}>
                <span>Created: {policy.createdAt}</span>
                <span style={{ fontWeight: 600 }}>By: {policy.createdBy}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Policy Edit / Create Modal - Full Screen & Aligned */}
      {isModalOpen && (
        <div 
          className="modal-overlay" 
          style={{ 
            zIndex: 9999, 
            backgroundColor: 'rgba(15, 23, 42, 0.65)', 
            backdropFilter: 'blur(6px)',
            padding: isFullScreen ? '12px' : '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            className="modal-content" 
            style={{ 
              width: isFullScreen ? '98vw' : '92vw',
              maxWidth: isFullScreen ? '1440px' : '1160px',
              height: isFullScreen ? '96vh' : '90vh',
              maxHeight: isFullScreen ? '96vh' : '90vh',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* 1. Fixed Header */}
            <div className="modal-header" style={{ 
              padding: '18px 28px', 
              borderBottom: '1px solid #E2E8F0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexShrink: 0,
              background: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: '#ECFEFF', 
                  border: '1px solid #CFFAFE', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Banknote size={24} color="#0E7490" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                      {editingPolicy ? 'Edit Master Loan Policy' : 'Create New Advance Salary / Loan Policy'}
                    </h3>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      padding: '3px 10px', 
                      borderRadius: '9999px',
                      background: formData.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                      color: formData.status === 'Active' ? '#15803D' : '#64748B',
                      border: formData.status === 'Active' ? '1px solid #BBF7D0' : '1px solid #E2E8F0'
                    }}>
                      {formData.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '3px 0 0' }}>
                    All rules dynamically enforce eligibility, limit formulas, and payroll recovery without hardcoding.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  title={isFullScreen ? "Restore modal size" : "Expand to full screen"}
                  style={{ 
                    background: '#F8FAFC', 
                    border: '1px solid #E2E8F0', 
                    cursor: 'pointer', 
                    color: '#64748B',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  title="Close"
                  style={{ 
                    background: '#F8FAFC', 
                    border: '1px solid #E2E8F0', 
                    cursor: 'pointer', 
                    color: '#64748B',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* 2. Scrollable Body & Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '24px 28px', 
                background: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                
                {/* 2-Column Responsive Grid for Core Sections */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', 
                  gap: '20px' 
                }}>
                  
                  {/* Left Column: Core Identity & Eligibility */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Card 1: Basic Information */}
                    <div style={{ 
                      background: '#FFFFFF', 
                      borderRadius: '14px', 
                      border: '1px solid #E2E8F0', 
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                        <Building size={18} color="#0E7490" />
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                          Basic Policy Information
                        </h4>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Policy Name *
                        </label>
                        <input 
                          type="text"
                          className="form-control"
                          required
                          placeholder="e.g. Employee Salary Loan Policy"
                          value={formData.policyName}
                          onChange={e => setFormData({ ...formData, policyName: e.target.value })}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                            Policy Type
                          </label>
                          <select 
                            className="form-control"
                            value={formData.policyType}
                            onChange={e => setFormData({ ...formData, policyType: e.target.value as LoanPolicyType })}
                          >
                            <option value="Advance Salary">Advance Salary</option>
                            <option value="Employee Loan">Employee Loan</option>
                            <option value="Emergency Loan">Emergency Loan</option>
                            <option value="Salary Advance">Salary Advance</option>
                            <option value="Custom Loan Type">Custom Loan Type</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                            Policy Status
                          </label>
                          <select 
                            className="form-control"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Description / Purpose Guidelines
                        </label>
                        <textarea 
                          className="form-control"
                          rows={2}
                          placeholder="Provide overview of who can apply and loan purpose guidelines..."
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Card 2: Work Experience & Tenure Eligibility */}
                    <div style={{ 
                      background: '#FFFFFF', 
                      borderRadius: '14px', 
                      border: '1px solid #E2E8F0', 
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                        <Clock size={18} color="#0E7490" />
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                          1. Work Experience & Tenure Eligibility Rule
                        </h4>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Minimum Employment Duration (Months) *
                        </label>
                        <input 
                          type="number"
                          min={0}
                          max={60}
                          className="form-control"
                          value={formData.minimumEmploymentMonths}
                          onChange={e => setFormData({ ...formData, minimumEmploymentMonths: Number(e.target.value) })}
                        />
                      </div>

                      <div style={{ 
                        padding: '12px 14px', 
                        background: '#F0FDF4', 
                        border: '1px solid #BBF7D0', 
                        borderRadius: '10px', 
                        fontSize: '0.76rem', 
                        color: '#166534',
                        lineHeight: 1.45
                      }}>
                        <strong>Automated Guardrail:</strong> System evaluates <code>Employee Joining Date + Current Date = Tenure</code>. If tenure &lt; <strong>{formData.minimumEmploymentMonths} months</strong>, loan submission is automatically prevented by the validation engine.
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Loan Limit Engine & Repayment Bounds */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Card 3: Salary-Based Limit Calculation */}
                    <div style={{ 
                      background: '#FFFFFF', 
                      borderRadius: '14px', 
                      border: '1px solid #E2E8F0', 
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                        <Calculator size={18} color="#0E7490" />
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                          2. Salary-Based Loan Limit Calculation
                        </h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                            Maximum Limit Type *
                          </label>
                          <select 
                            className="form-control"
                            value={formData.maxLoanLimitType}
                            onChange={e => setFormData({ ...formData, maxLoanLimitType: e.target.value as LoanLimitType })}
                          >
                            <option value="SALARY_MULTIPLIER">Salary Multiplier (e.g. 2 × Salary)</option>
                            <option value="PERCENTAGE_SALARY">Percentage of Salary (e.g. 50%)</option>
                            <option value="FIXED_AMOUNT">Fixed Amount (e.g. ₹50,000)</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                            Formula Value *
                          </label>
                          <input 
                            type="number"
                            step={formData.maxLoanLimitType === 'SALARY_MULTIPLIER' ? '0.5' : '1'}
                            className="form-control"
                            value={formData.maxLoanLimitValue}
                            onChange={e => setFormData({ ...formData, maxLoanLimitValue: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                            Min Loan Amount (₹)
                          </label>
                          <input 
                            type="number"
                            className="form-control"
                            value={formData.minLoanAmount}
                            onChange={e => setFormData({ ...formData, minLoanAmount: Number(e.target.value) })}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                            Absolute Max Loan Cap (₹)
                          </label>
                          <input 
                            type="number"
                            className="form-control"
                            value={formData.maxLoanAmount}
                            onChange={e => setFormData({ ...formData, maxLoanAmount: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div style={{ padding: '10px 14px', background: '#ECFEFF', border: '1px solid #CFFAFE', borderRadius: '10px', fontSize: '0.78rem', color: '#0E7490' }}>
                        <strong>Live Formula Simulation:</strong> For an employee with monthly gross salary of ₹30,000, max limit = <strong>{formData.maxLoanLimitType === 'SALARY_MULTIPLIER' ? `₹${(30000 * formData.maxLoanLimitValue).toLocaleString('en-IN')} (${formData.maxLoanLimitValue} × ₹30,000)` : formData.maxLoanLimitType === 'PERCENTAGE_SALARY' ? `₹${(30000 * formData.maxLoanLimitValue / 100).toLocaleString('en-IN')} (${formData.maxLoanLimitValue}% of ₹30,000)` : `₹${formData.maxLoanLimitValue.toLocaleString('en-IN')} Fixed`}</strong>
                      </div>
                    </div>

                    {/* Card 4: Active Loans & Repayment Bounds */}
                    <div style={{ 
                      background: '#FFFFFF', 
                      borderRadius: '14px', 
                      border: '1px solid #E2E8F0', 
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                        <UserCheck size={18} color="#0E7490" />
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                          3. Active Loans & Repayment Bounds
                        </h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                            Max Active Loans *
                          </label>
                          <select 
                            className="form-control"
                            value={formData.maxActiveLoans}
                            onChange={e => setFormData({ ...formData, maxActiveLoans: Number(e.target.value) })}
                          >
                            <option value={1}>1 Active Loan</option>
                            <option value={2}>2 Active Loans</option>
                            <option value={3}>3 Active Loans</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                            Min Repayment (Mo)
                          </label>
                          <input 
                            type="number"
                            min={1}
                            className="form-control"
                            value={formData.minRepaymentMonths}
                            onChange={e => setFormData({ ...formData, minRepaymentMonths: Number(e.target.value) })}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                            Max Repayment (Mo)
                          </label>
                          <input 
                            type="number"
                            max={48}
                            className="form-control"
                            value={formData.maxRepaymentMonths}
                            onChange={e => setFormData({ ...formData, maxRepaymentMonths: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Card 5: Full-Width Governance, Low Salary & Payslip Integration */}
                <div style={{ 
                  background: '#FFFFFF', 
                  borderRadius: '14px', 
                  border: '1px solid #E2E8F0', 
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                    <ShieldAlert size={18} color="#0E7490" />
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                      4. Approval Workflow, Payroll Recovery & Payslip Integration
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                        Approval Mode
                      </label>
                      <select 
                        className="form-control"
                        value={formData.approvalWorkflow}
                        onChange={e => setFormData({ ...formData, approvalWorkflow: e.target.value as ApprovalWorkflowMode })}
                      >
                        <option value="HR_OR_CEO">HR OR CEO Can Approve</option>
                        <option value="HR_ONLY">HR Approval Only</option>
                        <option value="CEO_ONLY">CEO Approval Only</option>
                        <option value="HR_THEN_CEO">HR Then CEO Approval</option>
                      </select>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                        Determines required authorization level for disbursements
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                        Low Salary Rule
                      </label>
                      <select 
                        className="form-control"
                        value={formData.lowSalaryRule}
                        onChange={e => setFormData({ ...formData, lowSalaryRule: e.target.value as LowSalaryRepaymentRule })}
                      >
                        <option value="DEDUCT_AVAILABLE_CARRY_FORWARD">Deduct Available + Carry Forward</option>
                        <option value="CARRY_FORWARD_NEXT_MONTH">Carry Full EMI To Next Month</option>
                        <option value="ALLOW_NEGATIVE_SALARY">Allow Negative Salary</option>
                        <option value="REQUIRE_HR_REVIEW">Require HR Manual Review</option>
                      </select>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                        Automated handling when monthly salary is insufficient for EMI
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                        Payslip Visibility
                      </label>
                      <select 
                        className="form-control"
                        value={formData.payslipVisibility}
                        onChange={e => setFormData({ ...formData, payslipVisibility: e.target.value as PayslipVisibilityRule })}
                      >
                        <option value="GENERIC">Generic (Masked as OTHERS)</option>
                        <option value="DETAILED">Detailed (Employee Loan Recovery)</option>
                      </select>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                        Controls line-item labelling on employee salary slips
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Fixed Sticky Footer */}
              <div style={{ 
                padding: '16px 28px', 
                borderTop: '1px solid #E2E8F0', 
                background: '#FFFFFF', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexShrink: 0 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Type: <strong style={{ color: '#0F172A' }}>{formData.policyType}</strong>
                  </span>
                  <span style={{ color: '#CBD5E1' }}>•</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Limit: <strong style={{ color: '#0E7490' }}>
                      {formData.maxLoanLimitType === 'SALARY_MULTIPLIER' ? `${formData.maxLoanLimitValue}× Salary` : formData.maxLoanLimitType === 'PERCENTAGE_SALARY' ? `${formData.maxLoanLimitValue}% Salary` : `₹${formData.maxLoanLimitValue.toLocaleString('en-IN')}`}
                    </strong>
                  </span>
                  <span style={{ color: '#CBD5E1' }}>•</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Tenure: <strong style={{ color: '#0F172A' }}>{formData.minRepaymentMonths}–{formData.maxRepaymentMonths} Months</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setIsModalOpen(false)}
                    style={{ borderRadius: '10px', padding: '8px 18px', fontSize: '0.84rem' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ 
                      borderRadius: '10px', 
                      padding: '8px 22px', 
                      fontSize: '0.84rem', 
                      fontWeight: 700, 
                      backgroundColor: '#0E7490', 
                      borderColor: '#0E7490',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(14, 116, 144, 0.25)'
                    }}
                  >
                    <Check size={16} />
                    {editingPolicy ? 'Update Policy Settings' : 'Create Policy'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
