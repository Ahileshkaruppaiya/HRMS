import React, { useState, useMemo, useEffect } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  LoanRecord, 
  LoanRequestStatus, 
  LoanRepaymentInstallment 
} from '../../types/hrms';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { 
  Banknote, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  ShieldCheck, 
  Calendar, 
  IndianRupee, 
  Calculator,
  FileText, 
  Download, 
  Check, 
  X, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  Receipt,
  Eye,
  Send,
  HelpCircle,
  History,
  SlidersHorizontal,
  Wallet,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toNum } from '../../utils/numbers';
import { downloadElementAsPDF } from '../../utils/exportUtils';
import { StandardTablePagination } from '../common/StandardTablePagination';

export const AdvanceSalaryManagement: React.FC = () => {
  const { 
    currentUser, 
    employees, 
    loanRecords, 
    loanPolicies, 
    activeLoanPolicy, 
    calculateEmployeeLoanEligibility, 
    submitLoanRequest, 
    reviewLoanRequest, 
    disburseLoan, 
    recordManualRepayment 
  } = useHRMS();

  // Role resolution
  const isEmployeeRole = currentUser.role === 'Employee';
  const isViewingAsEmployee = isEmployeeRole;

  // Target Employee for Employee View
  const targetEmployeeId = currentUser.employeeId || 'EMP-003';
  const targetEmployee = employees.find(e => e.employeeId === targetEmployeeId) || employees[0];

  // Employee Self-Service Eligibility
  const employeeEligibility = useMemo(() => {
    return calculateEmployeeLoanEligibility(targetEmployeeId);
  }, [targetEmployeeId, calculateEmployeeLoanEligibility, activeLoanPolicy, loanRecords]);

  // Employee's own loans
  const myLoans = useMemo(() => {
    return loanRecords.filter(r => r.employeeId === targetEmployeeId);
  }, [loanRecords, targetEmployeeId]);

  const myActiveLoans = useMemo(() => {
    return myLoans.filter(r => (r.status === 'Active' || r.status === 'Disbursed') && toNum(r.outstandingBalance) > 0);
  }, [myLoans]);

  const myTotalActiveAmount = myActiveLoans.reduce((sum, r) => sum + toNum(r.disbursedAmount || r.approvedAmount || r.requestedAmount), 0);
  const myTotalOutstanding = myActiveLoans.reduce((sum, r) => sum + toNum(r.outstandingBalance), 0);
  const myTotalMonthlyEMI = myActiveLoans.reduce((sum, r) => sum + toNum(r.monthlyDeduction), 0);

  // Admin Tab & Filter State
  type AdminTab = 'pending' | 'approved' | 'active' | 'rejected' | 'closed' | 'all';
  const [adminTab, setAdminTab] = useState<AdminTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Standard Pagination State (Strictly [5, 10] per design guidelines)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Target employee for Request modal (for HR/Admin mode)
  const [requestModalEmployeeId, setRequestModalEmployeeId] = useState<string>(targetEmployeeId);

  // Reset page when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [adminTab, departmentFilter, typeFilter, searchQuery]);


  // Modals & Drawers
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<LoanRecord | null>(null);
  const [reviewModalRecord, setReviewModalRecord] = useState<LoanRecord | null>(null);
  const [isReviewFullScreen, setIsReviewFullScreen] = useState(true);
  const [disbursementModalRecord, setDisbursementModalRecord] = useState<LoanRecord | null>(null);
  const [manualRepaymentModalRecord, setManualRepaymentModalRecord] = useState<LoanRecord | null>(null);
  const [scheduleModalRecord, setScheduleModalRecord] = useState<LoanRecord | null>(null);

  // Request Form State
  const [requestFormData, setRequestFormData] = useState<{
    requestType: 'Advance Salary' | 'Employee Loan' | 'Emergency Loan' | 'Salary Advance';
    requestedAmount: number;
    installmentMonths: number;
    purpose: string;
    reasonDetails: string;
    neededByDate: string;
  }>({
    requestType: 'Employee Loan',
    requestedAmount: 30000,
    installmentMonths: 6,
    purpose: 'Personal / Family Urgent Requirement',
    reasonDetails: '',
    neededByDate: '2026-09-15'
  });

  // Review Form State
  const [reviewFormData, setReviewFormData] = useState<{
    action: 'Approve' | 'Reject';
    approvedAmount: number;
    approvedMonths: number;
    monthlyDeduction: number;
    deductionStartMonth: string;
    internalHrNotes: string;
    employeeVisibleNotes: string;
    rejectionReason: string;
  }>({
    action: 'Approve',
    approvedAmount: 0,
    approvedMonths: 0,
    monthlyDeduction: 0,
    deductionStartMonth: 'Sep 2026',
    internalHrNotes: '',
    employeeVisibleNotes: '',
    rejectionReason: 'Request exceeds allowable repayment ratio or eligibility guidelines.'
  });

  // Disbursement Form State
  const [disbursementFormData, setDisbursementFormData] = useState<{
    disbursedDate: string;
    disbursedAmount: number;
    paymentMode: 'NEFT' | 'IMPS' | 'Cheque' | 'Cash';
    transactionRef: string;
    notes: string;
  }>({
    disbursedDate: '2026-09-08',
    disbursedAmount: 0,
    paymentMode: 'NEFT',
    transactionRef: '',
    notes: 'Disbursed to primary salary account.'
  });

  // Manual Repayment Form State
  const [manualRepaymentFormData, setManualRepaymentFormData] = useState<{
    amount: number;
    repaymentDate: string;
    paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI' | 'NEFT' | 'Other';
    referenceNumber: string;
    notes: string;
  }>({
    amount: 10000,
    repaymentDate: '2026-09-08',
    paymentMode: 'Bank Transfer',
    referenceNumber: '',
    notes: 'Direct voluntary repayment received.'
  });

  // Toast / Feedback State
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedbackBanner({ type, message });
    setTimeout(() => setFeedbackBanner(null), 5000);
  };

  // Filtered Records for Admin Table
  const filteredRecords = useMemo(() => {
    return loanRecords.filter(record => {
      // Tab filter
      if (adminTab === 'pending' && record.status !== 'Pending') return false;
      if (adminTab === 'approved' && record.status !== 'Approved') return false;
      if (adminTab === 'active' && record.status !== 'Active' && record.status !== 'Disbursed') return false;
      if (adminTab === 'rejected' && record.status !== 'Rejected') return false;
      if (adminTab === 'closed' && record.status !== 'Closed') return false;

      // Department filter
      if (departmentFilter !== 'ALL' && record.department !== departmentFilter) return false;

      // Type filter
      if (typeFilter !== 'ALL' && record.requestType !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = record.employeeName.toLowerCase().includes(q);
        const matchesId = record.employeeId.toLowerCase().includes(q);
        const matchesReqId = record.id.toLowerCase().includes(q);
        const matchesPurpose = record.purpose.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesReqId && !matchesPurpose) return false;
      }

      return true;
    });
  }, [loanRecords, adminTab, departmentFilter, typeFilter, searchQuery]);

  // Admin KPI metrics
  const adminKPIs = useMemo(() => {
    const totalPending = loanRecords.filter(r => r.status === 'Pending').length;
    const activeList = loanRecords.filter(r => (r.status === 'Active' || r.status === 'Disbursed') && toNum(r.outstandingBalance) > 0);
    const totalActiveCount = activeList.length;
    const totalOutstanding = activeList.reduce((sum, r) => sum + toNum(r.outstandingBalance), 0);
    const thisMonthDeductions = activeList.reduce((sum, r) => sum + toNum(r.monthlyDeduction), 0);
    const closedCount = loanRecords.filter(r => r.status === 'Closed').length;

    return {
      totalPending,
      totalActiveCount,
      totalOutstanding,
      thisMonthDeductions,
      closedCount
    };
  }, [loanRecords]);

  // Display all filtered records directly
  const paginatedRecords = filteredRecords;

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Ref ID', 'Employee ID', 'Employee Name', 'Department', 'Type', 'Requested (INR)', 'Approved (INR)', 'Tenure (Mos)', 'Monthly EMI (INR)', 'Outstanding (INR)', 'Status', 'Requested Date'];
    const rows = filteredRecords.map(r => [
      r.id,
      r.employeeId,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      `"${r.requestType}"`,
      r.requestedAmount,
      r.approvedAmount || 0,
      r.approvedMonths || r.installmentMonths,
      r.monthlyDeduction,
      r.outstandingBalance,
      r.status,
      r.requestedDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Loan_Advance_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(paginatedRecords.map(r => r.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRowIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Open Request Modal
  const openRequestModal = () => {
    const targetEmpId = isViewingAsEmployee ? targetEmployeeId : (requestModalEmployeeId || targetEmployeeId);
    const targetEmp = employees.find(e => e.employeeId === targetEmpId) || targetEmployee;
    const elig = calculateEmployeeLoanEligibility(targetEmp.employeeId);
    setRequestFormData({
      requestType: 'Employee Loan',
      requestedAmount: Math.min(30000, elig.maxEligibleAmount || 30000),
      installmentMonths: 6,
      purpose: 'Emergency Medical & Personal Expense',
      reasonDetails: '',
      neededByDate: '2026-09-15'
    });
    setIsRequestModalOpen(true);
  };

  // Submit Loan Request Handler
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmpId = isViewingAsEmployee ? targetEmployeeId : (requestModalEmployeeId || targetEmployeeId);
    const targetEmp = employees.find(e => e.employeeId === targetEmpId) || targetEmployee;
    const elig = calculateEmployeeLoanEligibility(targetEmp.employeeId);

    if (!elig.isEligible) {
      showFeedback('error', elig.ineligibleReason || 'Employee is not eligible to apply.');
      return;
    }

    if (requestFormData.requestedAmount > elig.maxEligibleAmount) {
      showFeedback('error', `Requested amount exceeds maximum eligible loan limit of ₹${elig.maxEligibleAmount.toLocaleString('en-IN')}.`);
      return;
    }

    const res = submitLoanRequest({
      employeeId: targetEmp.employeeId,
      employeeName: `${targetEmp.firstName} ${targetEmp.lastName}`,
      department: targetEmp.department,
      designation: targetEmp.designation,
      policyId: elig.policy.id,
      policyName: elig.policy.policyName,
      requestType: requestFormData.requestType,
      basicSalary: toNum(targetEmp.basicSalary),
      eligibleLimitAmount: elig.maxEligibleAmount,
      requestedAmount: requestFormData.requestedAmount,
      installmentMonths: requestFormData.installmentMonths,
      monthlyDeduction: Math.round(requestFormData.requestedAmount / (requestFormData.installmentMonths || 1)),
      deductionStartMonth: 'Oct 2026',
      purpose: requestFormData.purpose,
      reasonDetails: requestFormData.reasonDetails,
      neededByDate: requestFormData.neededByDate
    });

    if (res.success) {
      showFeedback('success', `Loan Request submitted successfully for ${targetEmp.firstName} (Ref: ${res.loanId})!`);
      setIsRequestModalOpen(false);
    } else {
      showFeedback('error', res.message);
    }
  };

  // Open Review Modal
  const openReviewModal = (record: LoanRecord) => {
    setReviewModalRecord(record);
    const amt = record.approvedAmount || record.requestedAmount;
    const months = record.approvedMonths || record.installmentMonths;
    setReviewFormData({
      action: 'Approve',
      approvedAmount: amt,
      approvedMonths: months,
      monthlyDeduction: record.monthlyDeduction || Math.round(amt / months),
      deductionStartMonth: record.deductionStartMonth || 'Sep 2026',
      internalHrNotes: record.internalHrNotes || '',
      employeeVisibleNotes: record.employeeVisibleNotes || '',
      rejectionReason: record.rejectionReason || 'Request does not meet current organizational loan criteria.'
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalRecord) return;

    reviewLoanRequest(reviewModalRecord.id, {
      action: reviewFormData.action,
      approvedAmount: reviewFormData.action === 'Approve' ? reviewFormData.approvedAmount : undefined,
      approvedMonths: reviewFormData.action === 'Approve' ? reviewFormData.approvedMonths : undefined,
      monthlyDeduction: reviewFormData.action === 'Approve' ? reviewFormData.monthlyDeduction : undefined,
      deductionStartMonth: reviewFormData.action === 'Approve' ? reviewFormData.deductionStartMonth : undefined,
      internalHrNotes: reviewFormData.internalHrNotes,
      employeeVisibleNotes: reviewFormData.employeeVisibleNotes,
      rejectionReason: reviewFormData.action === 'Reject' ? reviewFormData.rejectionReason : undefined
    });

    showFeedback('success', `Request ${reviewModalRecord.id} successfully ${reviewFormData.action === 'Approve' ? 'Approved' : 'Rejected'}!`);
    setReviewModalRecord(null);
  };

  // Open Disbursement Modal
  const openDisbursementModal = (record: LoanRecord) => {
    setDisbursementModalRecord(record);
    setDisbursementFormData({
      disbursedDate: '2026-09-08',
      disbursedAmount: record.approvedAmount || record.requestedAmount,
      paymentMode: 'NEFT',
      transactionRef: `NEFT-VRM-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: 'Disbursed via bank transfer to employee salary account.'
    });
  };

  const handleDisbursementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disbursementModalRecord) return;

    disburseLoan(disbursementModalRecord.id, {
      disbursedDate: disbursementFormData.disbursedDate,
      disbursedAmount: disbursementFormData.disbursedAmount,
      paymentMode: disbursementFormData.paymentMode,
      transactionRef: disbursementFormData.transactionRef,
      notes: disbursementFormData.notes
    });

    showFeedback('success', `Loan ${disbursementModalRecord.id} disbursed successfully! Monthly deductions will commence as scheduled.`);
    setDisbursementModalRecord(null);
  };

  // Open Manual Repayment Modal
  const openManualRepaymentModal = (record: LoanRecord) => {
    setManualRepaymentModalRecord(record);
    setManualRepaymentFormData({
      amount: Math.min(record.monthlyDeduction || 10000, record.outstandingBalance),
      repaymentDate: '2026-09-08',
      paymentMode: 'Bank Transfer',
      referenceNumber: `TRX-${Date.now().toString().slice(-6)}`,
      notes: 'Direct repayment received.'
    });
  };

  const handleManualRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRepaymentModalRecord) return;

    recordManualRepayment(manualRepaymentModalRecord.id, {
      amount: Number(manualRepaymentFormData.amount),
      repaymentDate: manualRepaymentFormData.repaymentDate,
      paymentMode: manualRepaymentFormData.paymentMode,
      referenceNumber: manualRepaymentFormData.referenceNumber,
      notes: manualRepaymentFormData.notes
    });

    showFeedback('success', `Manual repayment of ₹${Number(manualRepaymentFormData.amount).toLocaleString('en-IN')} recorded successfully!`);
    setManualRepaymentModalRecord(null);
  };

  // Status Badge Formatter
  const renderStatusBadge = (status: LoanRequestStatus) => {
    switch (status) {
      case 'Pending':
      case 'Under Review':
        return (
          <span className="status-pill pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {status}
          </span>
        );
      case 'Approved':
        return (
          <span className="status-pill" style={{ backgroundColor: '#CFFAFE', color: '#0891B2', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Approved (Pending Disb.)
          </span>
        );
      case 'Active':
      case 'Disbursed':
        return (
          <span className="status-pill approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Active / Repaying
          </span>
        );
      case 'Closed':
        return (
          <span className="status-pill" style={{ backgroundColor: '#F1F5F9', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Receipt size={12} /> Closed (₹0 Bal)
          </span>
        );
      case 'Rejected':
        return (
          <span className="status-pill rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return <span className="status-pill pending">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      {/* Toast Banner */}
      {feedbackBanner && (
        <div style={{
          position: 'fixed',
          top: '84px',
          right: '24px',
          zIndex: 9999,
          padding: '14px 20px',
          borderRadius: '12px',
          backgroundColor: feedbackBanner.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${feedbackBanner.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          color: feedbackBanner.type === 'success' ? '#065F46' : '#991B1B',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          {feedbackBanner.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedbackBanner.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="page-title-group">
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            {isViewingAsEmployee ? 'My Advance Salary / Loan' : 'Advance Salary & Employee Loan Management'}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0' }}>
            {isViewingAsEmployee 
              ? 'Check personal borrowing limits, submit requests, view ongoing EMI deductions, and track remaining loan balances.'
              : 'End-to-end administration for employee advance salaries, eligibility evaluations, multi-stage approvals, disbursements, and automated payroll recoveries.'}
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Export Report Button */}
          {!isViewingAsEmployee && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                padding: '9px 16px',
                fontWeight: 600,
                fontSize: '0.84rem'
              }}
              title="Export all filtered records to CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          )}

          {/* Quick Apply / Create Request Button */}
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={openRequestModal}
            disabled={isViewingAsEmployee && !employeeEligibility.isEligible}
            title={isViewingAsEmployee && !employeeEligibility.isEligible ? employeeEligibility.ineligibleReason : 'Apply for Advance Salary or Loan'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '12px',
              padding: '9px 18px',
              fontWeight: 700,
              fontSize: '0.84rem',
              backgroundColor: '#0E7490',
              borderColor: '#0E7490',
              opacity: (isViewingAsEmployee && !employeeEligibility.isEligible) ? 0.6 : 1,
              cursor: (isViewingAsEmployee && !employeeEligibility.isEligible) ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(14, 116, 144, 0.2)'
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{isViewingAsEmployee ? 'Request Advance / Loan' : 'New Request'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          1. EMPLOYEE SELF-SERVICE VIEW
          ======================================================== */}
      {isViewingAsEmployee ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Eligibility Banner if Ineligible */}
          {!employeeEligibility.isEligible && (
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              fontSize: '0.85rem',
              color: '#92400E'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>
                  Loan Application Notice
                </strong>
                <span>{employeeEligibility.ineligibleReason}</span>
              </div>
            </div>
          )}

          {/* Employee KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-card-header">
                <span>Maximum Eligible Limit</span>
                <div className="kpi-icon-wrapper teal"><Calculator size={20} /></div>
              </div>
              <div className="kpi-card-body">
                <div className="kpi-value">₹{employeeEligibility.maxEligibleAmount.toLocaleString('en-IN')}</div>
                <div className="kpi-caption" style={{ color: '#0E7490', fontWeight: 600 }}>
                  Based on: {employeeEligibility.policy.maxLoanLimitType === 'SALARY_MULTIPLIER' ? `${employeeEligibility.policy.maxLoanLimitValue}× Monthly Salary` : 'Salary Formula'}
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <span>Active Loan Sanctioned</span>
                <div className="kpi-icon-wrapper blue"><Banknote size={20} /></div>
              </div>
              <div className="kpi-card-body">
                <div className="kpi-value">
                  {myTotalActiveAmount > 0 ? `₹${myTotalActiveAmount.toLocaleString('en-IN')}` : 'No Active Loan'}
                </div>
                <div className="kpi-caption">
                  {myActiveLoans.length} active account{myActiveLoans.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <span>Outstanding Balance</span>
                <div className="kpi-icon-wrapper amber"><Receipt size={20} /></div>
              </div>
              <div className="kpi-card-body">
                <div className="kpi-value" style={{ color: myTotalOutstanding > 0 ? '#B45309' : '#166534' }}>
                  ₹{myTotalOutstanding.toLocaleString('en-IN')}
                </div>
                <div className="kpi-caption">Remaining recoverable amount</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <span>Monthly Deduction (EMI)</span>
                <div className="kpi-icon-wrapper purple"><CreditCard size={20} /></div>
              </div>
              <div className="kpi-card-body">
                <div className="kpi-value">₹{myTotalMonthlyEMI.toLocaleString('en-IN')}</div>
                <div className="kpi-caption">Next payroll deduction: 30th Sep 2026</div>
              </div>
            </div>
          </div>

          {/* Employee Loan Applications & Active Records Table */}
          <div className="card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                  My Advance Salary & Loan Accounts
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                  Complete transparent statement of your requested amounts, approved terms, monthly deductions, and settlement status.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Request Date</th>
                    <th>Loan Type</th>
                    <th>Requested Amt</th>
                    <th>Approved Amt</th>
                    <th>Tenure</th>
                    <th>Monthly EMI</th>
                    <th>Outstanding</th>
                    <th>Status</th>
                    <th>Schedule</th>
                  </tr>
                </thead>
                <tbody>
                  {myLoans.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                        <Wallet size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No Advance Salary or Loan Requests Found</div>
                        <p style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>Click "Request Advance / Loan" above to submit a new application.</p>
                      </td>
                    </tr>
                  ) : (
                    myLoans.map(loan => (
                      <tr key={loan.id}>
                        <td><strong style={{ color: '#0E7490' }}>{loan.id}</strong></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateDDMMYYYY(loan.requestedDate)}</td>
                        <td><span style={{ fontWeight: 600 }}>{loan.requestType}</span></td>
                        <td>₹{loan.requestedAmount.toLocaleString('en-IN')}</td>
                        <td>
                          {loan.approvedAmount ? (
                            <strong style={{ color: '#166534' }}>₹{loan.approvedAmount.toLocaleString('en-IN')}</strong>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>Pending</span>
                          )}
                        </td>
                        <td>{loan.approvedMonths || loan.installmentMonths} Mos</td>
                        <td>
                          <strong style={{ color: '#0E7490' }}>
                            ₹{loan.monthlyDeduction.toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td>
                          <span style={{ 
                            fontWeight: 800, 
                            color: loan.outstandingBalance > 0 ? '#B45309' : '#166534' 
                          }}>
                            ₹{loan.outstandingBalance.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>{renderStatusBadge(loan.status)}</td>
                        <td>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setScheduleModalRecord(loan)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontSize: '0.74rem' }}
                          >
                            <Calendar size={13} /> View Schedule
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================
           2. HR & CEO ADMIN MANAGEMENT VIEW
           ======================================================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Admin KPI Cards (Interactive & Active Highlight) */}
          <div className="kpi-grid">
            <div 
              className="kpi-card" 
              onClick={() => setAdminTab('pending')} 
              style={{ 
                cursor: 'pointer',
                border: adminTab === 'pending' ? '2px solid #0E7490' : '1px solid #E2E8F0',
                backgroundColor: adminTab === 'pending' ? '#FAFEFF' : '#FFFFFF',
                boxShadow: adminTab === 'pending' ? '0 4px 14px rgba(14, 116, 144, 0.12)' : undefined,
                transition: 'all 0.15s ease'
              }}
            >
              <div className="kpi-card-header">
                <span>Pending HR/CEO Reviews</span>
                <div className="kpi-icon-wrapper amber"><Clock size={20} /></div>
              </div>
              <div className="kpi-card-body">
                <div className="kpi-value" style={{ color: adminKPIs.totalPending > 0 ? '#B45309' : 'inherit' }}>
                  {adminKPIs.totalPending}
                </div>
                <div className="kpi-caption">Awaiting review & sanction</div>
              </div>
            </div>

            <div 
              className="kpi-card" 
              onClick={() => setAdminTab('active')} 
              style={{ 
                cursor: 'pointer',
                border: adminTab === 'active' ? '2px solid #0E7490' : '1px solid #E2E8F0',
                backgroundColor: adminTab === 'active' ? '#FAFEFF' : '#FFFFFF',
                boxShadow: adminTab === 'active' ? '0 4px 14px rgba(14, 116, 144, 0.12)' : undefined,
                transition: 'all 0.15s ease'
              }}
            >
              <div className="kpi-card-header">
                <span>Active Loan Accounts</span>
                <div className="kpi-icon-wrapper teal"><CheckCircle2 size={20} /></div>
              </div>
              <div className="kpi-card-body">
                <div className="kpi-value">{adminKPIs.totalActiveCount}</div>
                <div className="kpi-caption">Under automated salary deduction</div>
              </div>
            </div>

            <div 
              className="kpi-card" 
              onClick={() => setAdminTab('all')} 
              style={{ 
                cursor: 'pointer',
                border: adminTab === 'all' ? '2px solid #0E7490' : '1px solid #E2E8F0',
                backgroundColor: adminTab === 'all' ? '#FAFEFF' : '#FFFFFF',
                boxShadow: adminTab === 'all' ? '0 4px 14px rgba(14, 116, 144, 0.12)' : undefined,
                transition: 'all 0.15s ease'
              }}
            >
              <div className="kpi-card-header">
                <span>Total Outstanding Balance</span>
                <div className="kpi-icon-wrapper blue"><Receipt size={20} /></div>
              </div>
              <div className="kpi-card-body">
                <div className="kpi-value">₹{adminKPIs.totalOutstanding.toLocaleString('en-IN')}</div>
                <div className="kpi-caption">Total recoverable company asset</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <span>Monthly Payroll Deduction Run</span>
                <div className="kpi-icon-wrapper emerald"><CreditCard size={20} /></div>
              </div>
              <div className="kpi-card-body">
                <div className="kpi-value">₹{adminKPIs.thisMonthDeductions.toLocaleString('en-IN')}</div>
                <div className="kpi-caption">Scheduled September deduction</div>
              </div>
            </div>
          </div>

          {/* Status Segmented Tabs + Clean Filter Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 1. Status Navigation Tabs (Pills) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '2px',
              scrollbarWidth: 'none'
            }}>
              {[
                { id: 'pending' as AdminTab, label: 'Pending Reviews', count: adminKPIs.totalPending, icon: Clock },
                { id: 'approved' as AdminTab, label: 'Approved (Ready to Disburse)', count: loanRecords.filter(r => r.status === 'Approved').length, icon: CheckCircle2 },
                { id: 'active' as AdminTab, label: 'Active Loans', count: adminKPIs.totalActiveCount, icon: Banknote },
                { id: 'closed' as AdminTab, label: 'Closed / Repaid', count: adminKPIs.closedCount, icon: Receipt },
                { id: 'rejected' as AdminTab, label: 'Rejected', count: loanRecords.filter(r => r.status === 'Rejected').length, icon: XCircle },
                { id: 'all' as AdminTab, label: 'All Records', count: loanRecords.length, icon: SlidersHorizontal }
              ].map(tab => {
                const isActive = adminTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAdminTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: isActive ? '1.5px solid #0E7490' : '1px solid #E2E8F0',
                      backgroundColor: isActive ? '#0E7490' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#475569',
                      fontWeight: isActive ? 750 : 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 3px 10px rgba(14, 116, 144, 0.2)' : '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <Icon size={15} color={isActive ? '#FFFFFF' : (tab.id === 'pending' && tab.count > 0 ? '#D97706' : '#64748B')} />
                    <span>{tab.label}</span>
                    <span style={{
                      padding: '1px 7px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: isActive 
                        ? 'rgba(255, 255, 255, 0.25)' 
                        : (tab.id === 'pending' && tab.count > 0 ? '#FEF3C7' : '#F1F5F9'),
                      color: isActive 
                        ? '#FFFFFF' 
                        : (tab.id === 'pending' && tab.count > 0 ? '#B45309' : '#475569')
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 2. Unified Single-Row Filter Toolbar */}
            <div className="card" style={{
              padding: '12px 18px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {/* Left group: Search + Department + Loan Type + Clear */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 auto', flexWrap: 'wrap' }}>
                {/* Search Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '7px 12px',
                  minWidth: '240px',
                  flex: '1 1 260px'
                }}>
                  <Search size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search employee, ID, purpose..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '0.82rem',
                      color: '#1E293B',
                      width: '100%'
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8' }}
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Department Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    value={departmentFilter}
                    onChange={e => setDepartmentFilter(e.target.value)}
                    style={{
                      height: '38px',
                      padding: '0 12px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: departmentFilter !== 'ALL' ? '#0E7490' : '#475569',
                      backgroundColor: departmentFilter !== 'ALL' ? '#ECFEFF' : '#FFFFFF',
                      border: departmentFilter !== 'ALL' ? '1.5px solid #0E7490' : '1px solid #E2E8F0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      outline: 'none',
                      minWidth: '160px'
                    }}
                  >
                    <option value="ALL">All Departments</option>
                    {Array.from(new Set(employees.map(e => e.department))).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Loan Type Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    style={{
                      height: '38px',
                      padding: '0 12px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: typeFilter !== 'ALL' ? '#0E7490' : '#475569',
                      backgroundColor: typeFilter !== 'ALL' ? '#ECFEFF' : '#FFFFFF',
                      border: typeFilter !== 'ALL' ? '1.5px solid #0E7490' : '1px solid #E2E8F0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      outline: 'none',
                      minWidth: '160px'
                    }}
                  >
                    <option value="ALL">All Loan Types</option>
                    <option value="Advance Salary">Advance Salary</option>
                    <option value="Employee Loan">Employee Loan</option>
                    <option value="Emergency Loan">Emergency Loan</option>
                    <option value="Salary Advance">Salary Advance</option>
                  </select>
                </div>

                {/* Clear Filter button */}
                {(departmentFilter !== 'ALL' || typeFilter !== 'ALL' || searchQuery.trim() !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setDepartmentFilter('ALL');
                      setTypeFilter('ALL');
                      setSearchQuery('');
                    }}
                    style={{
                      height: '38px',
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      color: '#64748B',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <X size={13} /> Clear
                  </button>
                )}
              </div>

              {/* Showing count */}
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Showing <strong style={{ color: '#0E7490' }}>{filteredRecords.length}</strong> of {loanRecords.length} records
              </div>
            </div>
          </div>

          {/* Admin Table adhering to Standard Table Rules */}
          <div className="card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Requested</th>
                    <th>Eligible Limit</th>
                    <th>Tenure / EMI</th>
                    <th>Active Loans</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-secondary)' }}>
                        <Banknote size={36} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>No loan requests matching current filter</div>
                        <p style={{ fontSize: '0.8rem', margin: '4px 0 0', color: '#64748B' }}>
                          Try adjusting search terms, department, or selecting another status tab.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map(record => {
                      const isSelected = selectedRowIds.includes(record.id);
                      const empInitials = record.employeeName
                        ? record.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        : 'EM';
                      return (
                        <tr 
                          key={record.id}
                          style={{
                            backgroundColor: isSelected ? '#ECFEFF' : undefined,
                            borderLeft: isSelected ? '4px solid #0E7490' : undefined
                          }}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: '#ECFEFF',
                                color: '#0E7490',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                flexShrink: 0
                              }}>
                                {empInitials}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 750, color: 'var(--color-text-primary)', fontSize: '0.86rem' }}>
                                  {record.employeeName}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  {record.employeeId} • {record.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B' }}>{record.department}</div>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{record.designation}</span>
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              backgroundColor: record.requestType.includes('Advance') ? '#EFF6FF' : '#F5F3FF',
                              color: record.requestType.includes('Advance') ? '#1D4ED8' : '#6D28D9'
                            }}>
                              {record.requestType}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 750, fontSize: '0.86rem', color: '#0F172A' }}>
                              ₹{record.requestedAmount.toLocaleString('en-IN')}
                            </div>
                            {record.approvedAmount && record.approvedAmount !== record.requestedAmount && (
                              <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700 }}>
                                Sanctioned: ₹{record.approvedAmount.toLocaleString('en-IN')}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: '#0E7490', fontWeight: 750 }}>
                              ₹{record.eligibleLimitAmount.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem', fontWeight: 650, color: '#1E293B' }}>
                              {record.approvedMonths || record.installmentMonths} Mos
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                              ₹{record.monthlyDeduction.toLocaleString('en-IN')}/mo
                            </span>
                          </td>
                          <td>
                            <span className="status-pill" style={{ backgroundColor: '#F1F5F9', color: '#334155' }}>
                              {loanRecords.filter(r => r.employeeId === record.employeeId && (r.status === 'Active' || r.status === 'Disbursed')).length} Active
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {formatDateDDMMYYYY(record.requestedDate)}
                          </td>
                          <td>{renderStatusBadge(record.status)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              {/* Pending Review Action */}
                              {record.status === 'Pending' && (
                                <button 
                                  type="button" 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => openReviewModal(record)}
                                  style={{ padding: '5px 12px', fontSize: '0.74rem', borderRadius: '8px', backgroundColor: '#0E7490', borderColor: '#0E7490', fontWeight: 700 }}
                                >
                                  Review
                                </button>
                              )}

                              {/* Approved -> Disburse Action */}
                              {record.status === 'Approved' && (
                                <button 
                                  type="button" 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => openDisbursementModal(record)}
                                  style={{ padding: '5px 12px', fontSize: '0.74rem', borderRadius: '8px', backgroundColor: '#0891B2', borderColor: '#0891B2', fontWeight: 700 }}
                                >
                                  Disburse
                                </button>
                              )}

                              {/* Active -> Manual Repayment Action */}
                              {(record.status === 'Active' || record.status === 'Disbursed') && record.outstandingBalance > 0 && (
                                <button 
                                  type="button" 
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => openManualRepaymentModal(record)}
                                  style={{ padding: '5px 8px', fontSize: '0.74rem', borderRadius: '8px' }}
                                  title="Record Manual Repayment"
                                >
                                  <IndianRupee size={13} />
                                </button>
                              )}

                              {/* View Details / Dossier */}
                              <button 
                                type="button" 
                                className="btn btn-secondary btn-sm"
                                onClick={() => setSelectedRecordForDetail(record)}
                                style={{ padding: '5px 8px', fontSize: '0.74rem', borderRadius: '8px' }}
                                title="View Dossier & Audits"
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Floating Action Bar (Standard VRM Table Rule) */}
          {selectedRowIds.length > 0 && (
            <div style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9000,
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: '9999px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              <span>{selectedRowIds.length} Selected</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <button 
                type="button"
                onClick={() => {
                  const target = loanRecords.find(r => r.id === selectedRowIds[0]);
                  if (target) openReviewModal(target);
                }}
                style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ✏️ Review Info
              </button>
              <button 
                type="button"
                onClick={() => setSelectedRowIds([])}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL 1: REQUEST LOAN MODAL (LIVE VALIDATION & ESTIMATOR)
          ======================================================== */}
      {isRequestModalOpen && (() => {
        const modalEmpId = isViewingAsEmployee ? targetEmployeeId : (requestModalEmployeeId || targetEmployeeId);
        const modalEmp = employees.find(e => e.employeeId === modalEmpId) || targetEmployee;
        const modalElig = calculateEmployeeLoanEligibility(modalEmp.employeeId);

        return (
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal-content" style={{ maxWidth: '640px', borderRadius: '20px' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                    {isViewingAsEmployee ? 'Request Advance Salary / Loan' : 'Create Employee Advance / Loan Request'}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                    {isViewingAsEmployee 
                      ? `Calculated against your monthly salary: ₹${toNum(targetEmployee.basicSalary).toLocaleString('en-IN')}`
                      : `Applying on behalf of ${modalEmp.firstName} ${modalEmp.lastName} (${modalEmp.employeeId})`}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsRequestModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {/* Employee Selector for Admin */}
                  {!isViewingAsEmployee && (
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} color="#0E7490" />
                        <span>Select Target Employee *</span>
                      </label>
                      <select 
                        className="form-control"
                        value={modalEmpId}
                        onChange={e => {
                          const newEmpId = e.target.value;
                          setRequestModalEmployeeId(newEmpId);
                          const newElig = calculateEmployeeLoanEligibility(newEmpId);
                          setRequestFormData(prev => ({
                            ...prev,
                            requestedAmount: Math.min(prev.requestedAmount, newElig.maxEligibleAmount || 30000)
                          }));
                        }}
                        style={{
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          borderRadius: '10px',
                          border: '1.5px solid #0E7490',
                          fontWeight: 650,
                          color: '#0F172A',
                          backgroundColor: '#F8FAFC'
                        }}
                      >
                        {employees.map(emp => (
                          <option key={emp.employeeId} value={emp.employeeId}>
                            {emp.firstName} {emp.lastName} ({emp.employeeId}) — {emp.department} • Basic: ₹{toNum(emp.basicSalary).toLocaleString('en-IN')}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Ineligibility Alert */}
                  {!modalElig.isEligible && (
                    <div style={{
                      gridColumn: 'span 2',
                      padding: '12px 16px',
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '0.8rem',
                      color: '#92400E'
                    }}>
                      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '2px' }}>Policy Notice:</strong>
                        <span>{modalElig.ineligibleReason}</span>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Request Type *
                    </label>
                    <select 
                      className="form-control"
                      value={requestFormData.requestType}
                      onChange={e => setRequestFormData({ ...requestFormData, requestType: e.target.value as any })}
                    >
                      <option value="Advance Salary">Advance Salary</option>
                      <option value="Employee Loan">Employee Loan</option>
                      <option value="Emergency Loan">Emergency Loan</option>
                      <option value="Salary Advance">Salary Advance</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Requested Amount (₹) *
                    </label>
                    <input 
                      type="number"
                      min={modalElig.policy.minLoanAmount}
                      max={modalElig.maxEligibleAmount}
                      required
                      className="form-control"
                      value={requestFormData.requestedAmount}
                      onChange={e => setRequestFormData({ ...requestFormData, requestedAmount: Number(e.target.value) })}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#0E7490', fontWeight: 600 }}>
                      Max eligible: ₹{modalElig.maxEligibleAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Repayment Period (Months) *
                    </label>
                    <input 
                      type="number"
                      min={modalElig.policy.minRepaymentMonths}
                      max={modalElig.policy.maxRepaymentMonths}
                      required
                      className="form-control"
                      value={requestFormData.installmentMonths}
                      onChange={e => setRequestFormData({ ...requestFormData, installmentMonths: Number(e.target.value) })}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      Policy allowed: {modalElig.policy.minRepaymentMonths} to {modalElig.policy.maxRepaymentMonths} months
                    </span>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Funds Needed By Date
                    </label>
                    <input 
                      type="date"
                      className="form-control"
                      value={requestFormData.neededByDate}
                      onChange={e => setRequestFormData({ ...requestFormData, neededByDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Purpose / Reason *
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Medical Emergency, Higher Education, Home Renovation"
                      className="form-control"
                      value={requestFormData.purpose}
                      onChange={e => setRequestFormData({ ...requestFormData, purpose: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Additional Details & Notes (Optional)
                    </label>
                    <textarea 
                      rows={2}
                      placeholder="Specify hospital name, admission date, or urgency details..."
                      className="form-control"
                      value={requestFormData.reasonDetails}
                      onChange={e => setRequestFormData({ ...requestFormData, reasonDetails: e.target.value })}
                    />
                  </div>
                </div>

                {/* Pre-Submission Live Summary Card */}
                <div style={{
                  padding: '14px 18px',
                  backgroundColor: '#ECFEFF',
                  border: '1px solid #CFFAFE',
                  borderRadius: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Applicant Monthly Salary:</span>
                    <strong style={{ color: '#0F172A' }}>₹{toNum(modalEmp.basicSalary).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Maximum Eligible Limit:</span>
                    <strong style={{ color: '#0E7490' }}>₹{modalElig.maxEligibleAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Requested Amount:</span>
                    <strong style={{ color: '#0F172A' }}>₹{requestFormData.requestedAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Estimated Monthly EMI:</span>
                    <strong style={{ color: '#0E7490', fontSize: '0.95rem' }}>
                      ₹{Math.round(requestFormData.requestedAmount / (requestFormData.installmentMonths || 1)).toLocaleString('en-IN')} / mo
                    </strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setIsRequestModalOpen(false)}
                    style={{ borderRadius: '12px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0E7490', borderColor: '#0E7490' }}
                  >
                    <Send size={15} /> Submit Loan Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          MODAL 2: HR / CEO REVIEW & APPROVAL MODAL (FULL SCREEN CAPABLE)
          ======================================================== */}
      {reviewModalRecord && (
        <div 
          className="modal-overlay" 
          style={{ 
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            padding: isReviewFullScreen ? '12px' : '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            className="modal-content" 
            style={{ 
              width: isReviewFullScreen ? '98vw' : '90vw',
              maxWidth: isReviewFullScreen ? '1200px' : '720px',
              height: isReviewFullScreen ? '96vh' : 'auto',
              maxHeight: isReviewFullScreen ? '96vh' : '92vh',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Fixed Header */}
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
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '12px', 
                  background: '#ECFEFF', 
                  border: '1px solid #CFFAFE', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={22} color="#0E7490" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                      Review Loan Application: {reviewModalRecord.id}
                    </h3>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      padding: '3px 10px', 
                      borderRadius: '9999px',
                      background: '#FEF3C7',
                      color: '#B45309',
                      border: '1px solid #FDE68A'
                    }}>
                      Pending Review
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '3px 0 0' }}>
                    Applicant: <strong style={{ color: '#1E293B' }}>{reviewModalRecord.employeeName}</strong> ({reviewModalRecord.employeeId}) • {reviewModalRecord.department}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsReviewFullScreen(!isReviewFullScreen)}
                  title={isReviewFullScreen ? "Restore modal size" : "Expand to full screen"}
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
                  {isReviewFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button 
                  type="button" 
                  onClick={() => setReviewModalRecord(null)}
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
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '24px 28px', 
                background: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {/* Applicant Dossier Box */}
                <div style={{ 
                  padding: '16px 20px', 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '14px', 
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'grid',
                  gridTemplateColumns: isReviewFullScreen ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
                  gap: '14px',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block', marginBottom: '3px' }}>Requested Amount</span>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>₹{reviewModalRecord.requestedAmount.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block', marginBottom: '3px' }}>Eligible Limit</span>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0E7490' }}>₹{reviewModalRecord.eligibleLimitAmount.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block', marginBottom: '3px' }}>Tenure Requested</span>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>{reviewModalRecord.installmentMonths} Months</div>
                  </div>
                  <div style={{ gridColumn: isReviewFullScreen ? 'span 1' : 'span 3', borderLeft: isReviewFullScreen ? '1px solid #E2E8F0' : 'none', paddingLeft: isReviewFullScreen ? '14px' : '0', borderTop: isReviewFullScreen ? 'none' : '1px solid #E2E8F0', paddingTop: isReviewFullScreen ? '0' : '8px' }}>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block', marginBottom: '3px' }}>Purpose & Context</span>
                    <div style={{ fontWeight: 650, color: '#334155' }}>{reviewModalRecord.purpose}</div>
                    {reviewModalRecord.reasonDetails && (
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '3px', lineHeight: 1.35 }}>{reviewModalRecord.reasonDetails}</div>
                    )}
                  </div>
                </div>

                {/* Action Decision Toggle */}
                <div style={{ 
                  background: '#FFFFFF', 
                  borderRadius: '14px', 
                  border: '1px solid #E2E8F0', 
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Select Action Decision
                  </label>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setReviewFormData({ ...reviewFormData, action: 'Approve' })}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: reviewFormData.action === 'Approve' ? '2px solid #0E7490' : '1px solid #E2E8F0',
                        backgroundColor: reviewFormData.action === 'Approve' ? '#ECFEFF' : '#FFFFFF',
                        color: reviewFormData.action === 'Approve' ? '#0E7490' : '#475569',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <CheckCircle2 size={18} /> Approve / Partial Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFormData({ ...reviewFormData, action: 'Reject' })}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: reviewFormData.action === 'Reject' ? '2px solid #EF4444' : '1px solid #E2E8F0',
                        backgroundColor: reviewFormData.action === 'Reject' ? '#FEF2F2' : '#FFFFFF',
                        color: reviewFormData.action === 'Reject' ? '#DC2626' : '#475569',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <XCircle size={18} /> Reject Request
                    </button>
                  </div>
                </div>

                {/* Form Controls Card */}
                <div style={{ 
                  background: '#FFFFFF', 
                  borderRadius: '14px', 
                  border: '1px solid #E2E8F0', 
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  {reviewFormData.action === 'Approve' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: isReviewFullScreen ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '16px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Approved Amount (₹) *
                        </label>
                        <input 
                          type="number"
                          max={reviewModalRecord.eligibleLimitAmount}
                          className="form-control"
                          value={reviewFormData.approvedAmount}
                          onChange={e => {
                            const amt = Number(e.target.value);
                            setReviewFormData({
                              ...reviewFormData,
                              approvedAmount: amt,
                              monthlyDeduction: Math.round(amt / (reviewFormData.approvedMonths || 1))
                            });
                          }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Approved Tenure (Months) *
                        </label>
                        <input 
                          type="number"
                          min={1}
                          max={36}
                          className="form-control"
                          value={reviewFormData.approvedMonths}
                          onChange={e => {
                            const m = Number(e.target.value);
                            setReviewFormData({
                              ...reviewFormData,
                              approvedMonths: m,
                              monthlyDeduction: Math.round(reviewFormData.approvedAmount / (m || 1))
                            });
                          }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Monthly Deduction (₹)
                        </label>
                        <input 
                          type="number"
                          className="form-control"
                          value={reviewFormData.monthlyDeduction}
                          onChange={e => setReviewFormData({ ...reviewFormData, monthlyDeduction: Number(e.target.value) })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Deduction Start Month
                        </label>
                        <select 
                          className="form-control"
                          value={reviewFormData.deductionStartMonth}
                          onChange={e => setReviewFormData({ ...reviewFormData, deductionStartMonth: e.target.value })}
                        >
                          <option value="Sep 2026">September 2026 Cycle</option>
                          <option value="Oct 2026">October 2026 Cycle</option>
                          <option value="Nov 2026">November 2026 Cycle</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ gridColumn: isReviewFullScreen ? 'span 2' : 'span 2', marginBottom: 0 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Employee Visible Notes
                        </label>
                        <input 
                          type="text"
                          className="form-control"
                          placeholder="e.g. Approved. Funds will be credited after disbursement verification."
                          value={reviewFormData.employeeVisibleNotes}
                          onChange={e => setReviewFormData({ ...reviewFormData, employeeVisibleNotes: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: isReviewFullScreen ? 'span 2' : 'span 2', marginBottom: 0 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Internal HR Confidential Notes
                        </label>
                        <input 
                          type="text"
                          className="form-control"
                          placeholder="Verified salary and employment tenure. Sanction recommended."
                          value={reviewFormData.internalHrNotes}
                          onChange={e => setReviewFormData({ ...reviewFormData, internalHrNotes: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                        Rejection Reason *
                      </label>
                      <textarea 
                        rows={3}
                        className="form-control"
                        required
                        placeholder="Please specify detailed rationale for rejecting this loan request..."
                        value={reviewFormData.rejectionReason}
                        onChange={e => setReviewFormData({ ...reviewFormData, rejectionReason: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Fixed Footer Actions (Always 100% visible) */}
              <div style={{ 
                padding: '16px 28px', 
                borderTop: '1px solid #E2E8F0', 
                background: '#FFFFFF',
                flexShrink: 0,
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Action Selected: <strong style={{ color: reviewFormData.action === 'Approve' ? '#0E7490' : '#DC2626' }}>{reviewFormData.action}</strong>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setReviewModalRecord(null)}
                    style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`btn ${reviewFormData.action === 'Approve' ? 'btn-primary' : 'btn-danger'}`}
                    style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 700 }}
                  >
                    {reviewFormData.action === 'Approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: LOAN DISBURSEMENT MODAL (FULL SCREEN)
          ======================================================== */}
      {disbursementModalRecord && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: '#FFFFFF',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Full Screen Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 32px',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              flexShrink: 0
            }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                  Execute Loan Disbursement
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '3px 0 0' }}>
                  Sanctioned Loan Account: {disbursementModalRecord.id} • {disbursementModalRecord.employeeName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDisbursementModalRecord(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '8px' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <form id="disbursement-form" onSubmit={handleDisbursementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ padding: '16px', background: '#ECFEFF', borderRadius: '12px', fontSize: '0.85rem', color: '#0E7490', border: '1px solid #A5F3FC' }}>
                    <strong>Important:</strong> Disbursing this loan activates monthly repayment deductions starting from <strong>{disbursementModalRecord.deductionStartMonth || 'Sep 2026'}</strong>.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Disbursement Date *</label>
                      <input
                        type="date" required className="form-control"
                        value={disbursementFormData.disbursedDate}
                        onChange={e => setDisbursementFormData({ ...disbursementFormData, disbursedDate: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Disbursed Amount (₹) *</label>
                      <input
                        type="number" required className="form-control"
                        value={disbursementFormData.disbursedAmount}
                        onChange={e => setDisbursementFormData({ ...disbursementFormData, disbursedAmount: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Payment Mode *</label>
                      <select
                        className="form-control"
                        value={disbursementFormData.paymentMode}
                        onChange={e => setDisbursementFormData({ ...disbursementFormData, paymentMode: e.target.value as any })}
                      >
                        <option value="NEFT">NEFT (Direct Bank Transfer)</option>
                        <option value="IMPS">IMPS (Instant Transfer)</option>
                        <option value="Cheque">Company Cheque</option>
                        <option value="Cash">Cash Voucher</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Transaction Reference *</label>
                      <input
                        type="text" required placeholder="e.g. NEFT-VRM-89217340"
                        className="form-control"
                        value={disbursementFormData.transactionRef}
                        onChange={e => setDisbursementFormData({ ...disbursementFormData, transactionRef: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Disbursement Notes</label>
                      <input
                        type="text" className="form-control"
                        value={disbursementFormData.notes}
                        onChange={e => setDisbursementFormData({ ...disbursementFormData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Fixed Footer */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              padding: '20px 32px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              flexShrink: 0
            }}>
              <button
                type="button" className="btn btn-secondary"
                onClick={() => setDisbursementModalRecord(null)}
                style={{ borderRadius: '12px', minWidth: '120px' }}
              >
                Cancel
              </button>
              <button
                type="submit" form="disbursement-form" className="btn btn-primary"
                style={{ borderRadius: '12px', backgroundColor: '#0E7490', minWidth: '200px' }}
              >
                Confirm Disbursement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: MANUAL REPAYMENT MODAL
          ======================================================== */}
      {manualRepaymentModalRecord && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '540px', borderRadius: '20px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                  Record Manual Direct Repayment
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                  Loan: {manualRepaymentModalRecord.id} • Outstanding: ₹{manualRepaymentModalRecord.outstandingBalance.toLocaleString('en-IN')}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setManualRepaymentModalRecord(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualRepaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Payment Amount (₹) *
                  </label>
                  <input 
                    type="number"
                    max={manualRepaymentModalRecord.outstandingBalance}
                    required
                    className="form-control"
                    value={manualRepaymentFormData.amount}
                    onChange={e => setManualRepaymentFormData({ ...manualRepaymentFormData, amount: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Payment Date *
                  </label>
                  <input 
                    type="date"
                    required
                    className="form-control"
                    value={manualRepaymentFormData.repaymentDate}
                    onChange={e => setManualRepaymentFormData({ ...manualRepaymentFormData, repaymentDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Payment Mode *
                  </label>
                  <select 
                    className="form-control"
                    value={manualRepaymentFormData.paymentMode}
                    onChange={e => setManualRepaymentFormData({ ...manualRepaymentFormData, paymentMode: e.target.value as any })}
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash Deposit</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Receipt / Ref Number
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. UPI-92182740"
                    className="form-control"
                    value={manualRepaymentFormData.referenceNumber}
                    onChange={e => setManualRepaymentFormData({ ...manualRepaymentFormData, referenceNumber: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Notes
                  </label>
                  <input 
                    type="text"
                    className="form-control"
                    value={manualRepaymentFormData.notes}
                    onChange={e => setManualRepaymentFormData({ ...manualRepaymentFormData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setManualRepaymentModalRecord(null)}
                  style={{ borderRadius: '12px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ borderRadius: '12px', backgroundColor: '#0E7490' }}
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: REPAYMENT SCHEDULE & AUDIT TRAIL MODAL
          ======================================================== */}
      {(selectedRecordForDetail || scheduleModalRecord) && (
        (() => {
          const rec = selectedRecordForDetail || scheduleModalRecord!;
          return (
            <div className="modal-overlay" style={{ zIndex: 9999 }}>
              <div className="modal-content" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px' }}>
                <div className="modal-header">
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                      Loan Account Dossier: {rec.id}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                      {rec.employeeName} ({rec.employeeId}) • {rec.department}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => downloadElementAsPDF('printable-loan-schedule', `Loan_Schedule_${rec.id}`)}
                      style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={13} /> PDF
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setSelectedRecordForDetail(null); setScheduleModalRecord(null); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div id="printable-loan-schedule" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
                  {/* Account Summary Cards */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '10px', 
                    padding: '14px', 
                    backgroundColor: '#F8FAFC', 
                    borderRadius: '12px',
                    fontSize: '0.78rem'
                  }}>
                    <div>
                      <span style={{ color: '#64748B' }}>Sanctioned:</span>
                      <strong style={{ display: 'block', color: '#0F172A', fontSize: '0.95rem' }}>
                        ₹{(rec.approvedAmount || rec.requestedAmount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Monthly EMI:</span>
                      <strong style={{ display: 'block', color: '#0E7490', fontSize: '0.95rem' }}>
                        ₹{rec.monthlyDeduction.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Outstanding:</span>
                      <strong style={{ display: 'block', color: rec.outstandingBalance > 0 ? '#B45309' : '#166534', fontSize: '0.95rem' }}>
                        ₹{rec.outstandingBalance.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Status:</span>
                      <div style={{ marginTop: '2px' }}>{renderStatusBadge(rec.status)}</div>
                    </div>
                  </div>

                  {/* Monthly Repayment Installments Table */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                      Monthly Repayment Schedule
                    </h4>
                    <div className="table-responsive">
                      <table className="hrms-table" style={{ fontSize: '0.78rem' }}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Month / Cycle</th>
                            <th>Scheduled EMI</th>
                            <th>Actual Deducted</th>
                            <th>Remaining Balance</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rec.repaymentSchedule.map((inst: LoanRepaymentInstallment) => (
                            <tr key={inst.installmentNumber}>
                              <td>{inst.installmentNumber}</td>
                              <td><strong>{inst.periodMonth}</strong></td>
                              <td>₹{inst.scheduledAmount.toLocaleString('en-IN')}</td>
                              <td style={{ color: inst.actualDeducted > 0 ? '#166534' : '#64748B', fontWeight: 700 }}>
                                ₹{inst.actualDeducted.toLocaleString('en-IN')}
                              </td>
                              <td>₹{inst.remainingBalance.toLocaleString('en-IN')}</td>
                              <td>
                                <span className={`status-pill ${inst.status === 'Deducted' ? 'approved' : 'pending'}`}>
                                  {inst.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Audit Trail (Visible to HR/CEO or summarized) */}
                  {!isViewingAsEmployee && rec.auditLogs && rec.auditLogs.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <History size={16} color="#0E7490" /> Audit Log & Lifecycle Trail
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {rec.auditLogs.map((log: any) => (
                          <div 
                            key={log.id} 
                            style={{ 
                              padding: '10px 14px', 
                              backgroundColor: '#F8FAFC', 
                              borderRadius: '8px', 
                              border: '1px solid #E2E8F0',
                              fontSize: '0.75rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                              <strong style={{ color: '#0E7490' }}>{log.action}</strong>
                              <span style={{ color: '#64748B' }}>{log.timestamp}</span>
                            </div>
                            <div style={{ color: '#334155' }}>By: {log.performedBy} ({log.performedByRole})</div>
                            {log.newValue && (
                              <div style={{ color: '#166534', marginTop: '2px' }}>{log.newValue}</div>
                            )}
                            {log.notes && (
                              <div style={{ color: '#64748B', fontStyle: 'italic', marginTop: '2px' }}>{log.notes}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};

export default AdvanceSalaryManagement;
