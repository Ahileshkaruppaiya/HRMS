import React, { useState, useMemo } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  CalendarDays, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  Sliders, 
  ShieldAlert, 
  FileCheck, 
  Info,
  Calendar,
  Layers,
  Check,
  DollarSign
} from 'lucide-react';
import { LeaveRequest, SandwichCalculationResult, SandwichPayType, SandwichCalculationDayDetail } from '../../types/hrms';
import { toNum } from '../../utils/numbers';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

interface LeaveManagementProps {
  openApplyModal?: boolean;
  onCloseQuickAdd?: () => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({ openApplyModal, onCloseQuickAdd }) => {
  const { 
    leaveRequests, 
    applyLeave, 
    approveLeave, 
    rejectLeave, 
    currentUser, 
    employees, 
    hasPermission,
    leavePolicies,
    holidayPolicies,
    masterLeavePolicies,
    sandwichPolicies,
    computeSandwichCalculation,
    overrideSandwichCalculation
  } = useHRMS();

  const isEmployeeRole = currentUser.role === 'Employee';
  const isManagerRole = currentUser.role === 'Department Manager';
  const isPrivileged = currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin' || currentUser.role === 'HR Manager' || currentUser.role === 'CEO' || currentUser.role === 'Management';
  const canApprove = hasPermission('leaves', 'approve');

  const [showModal, setShowModal] = useState<boolean>((openApplyModal && isEmployeeRole) || false);
  const [inspectLeave, setInspectLeave] = useState<LeaveRequest | null>(null);
  const [overrideLeave, setOverrideLeave] = useState<LeaveRequest | null>(null);

  // Role-based data scoping for leave applications
  const roleScopedLeaves = isEmployeeRole
    ? leaveRequests.filter(l => l.employeeId === (currentUser.employeeId || 'EMP-001'))
    : isManagerRole
    ? leaveRequests.filter(l => l.department === currentUser.department)
    : leaveRequests;

  const [form, setForm] = useState({
    employeeId: currentUser.employeeId || 'EMP-001',
    leaveType: leavePolicies[0]?.name || 'Casual Leave (CL)',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    attachmentUrl: ''
  });

  // HR Override Form State
  const [overrideForm, setOverrideForm] = useState<{
    excludedDates: string[];
    includedDates: string[];
    adjustedPayType: SandwichPayType;
    adjustedDaysCount: number;
    internalReason: string;
  }>({
    excludedDates: [],
    includedDates: [],
    adjustedPayType: 'SAME_AS_APPLIED_LEAVE',
    adjustedDaysCount: 1,
    internalReason: ''
  });

  React.useEffect(() => {
    if (openApplyModal && isEmployeeRole) setShowModal(true);
  }, [openApplyModal, isEmployeeRole]);

  React.useEffect(() => {
    if (currentUser.employeeId) {
      setForm(prev => ({ ...prev, employeeId: currentUser.employeeId || 'EMP-001' }));
    }
  }, [currentUser]);

  // Live Dynamic Sandwich Calculation for the active application modal
  const liveCalculation: SandwichCalculationResult | null = useMemo(() => {
    const targetEmpId = isEmployeeRole ? (currentUser.employeeId || 'EMP-001') : form.employeeId;
    if (!targetEmpId || !form.startDate || !form.endDate) return null;

    try {
      return computeSandwichCalculation({
        employeeId: targetEmpId,
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate
      });
    } catch (e) {
      console.error('Error calculating sandwich preview', e);
      return null;
    }
  }, [computeSandwichCalculation, isEmployeeRole, currentUser.employeeId, form.employeeId, form.leaveType, form.startDate, form.endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmpId = isEmployeeRole ? (currentUser.employeeId || 'EMP-001') : form.employeeId;
    const emp = employees.find(e => e.employeeId === targetEmpId) || employees[0];
    
    applyLeave({
      employeeId: targetEmpId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      daysCount: liveCalculation?.totalDays || 1,
      reason: form.reason || 'Personal leave request',
      sandwichDetails: liveCalculation || undefined
    });

    setShowModal(false);
    if (onCloseQuickAdd) onCloseQuickAdd();
  };

  const openOverrideModal = (leave: LeaveRequest) => {
    setOverrideLeave(leave);
    setOverrideForm({
      excludedDates: leave.hrOverride?.excludedDates || [],
      includedDates: leave.hrOverride?.includedDates || [],
      adjustedPayType: leave.hrOverride?.adjustedPayType || leave.sandwichDetails?.payTypeApplied || 'SAME_AS_APPLIED_LEAVE',
      adjustedDaysCount: leave.daysCount,
      internalReason: leave.hrOverride?.internalReason || ''
    });
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideLeave || !overrideForm.internalReason.trim()) return;

    overrideSandwichCalculation(overrideLeave.id, {
      excludedDates: overrideForm.excludedDates,
      includedDates: overrideForm.includedDates,
      adjustedPayType: overrideForm.adjustedPayType,
      adjustedDaysCount: Number(overrideForm.adjustedDaysCount),
      internalReason: overrideForm.internalReason.trim()
    });

    setOverrideLeave(null);
  };

  const toggleOverrideExcludeDate = (dateStr: string) => {
    setOverrideForm(prev => {
      const isExcluded = prev.excludedDates.includes(dateStr);
      return {
        ...prev,
        excludedDates: isExcluded ? prev.excludedDates.filter(d => d !== dateStr) : [...prev.excludedDates, dateStr],
        includedDates: prev.includedDates.filter(d => d !== dateStr)
      };
    });
  };

  const pendingCount = roleScopedLeaves.filter(l => l.status === 'Pending').length;
  const approvedCount = roleScopedLeaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = roleScopedLeaves.filter(l => l.status === 'Rejected').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Leave Management System</h1>
          <p className="page-subtitle">
            Policy-driven leave engine, automated sandwich calculations, attendance sync, and payroll integration
          </p>
        </div>
        {isEmployeeRole && (
          <div className="header-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Apply Leave Request
            </button>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Pending Approvals</span>
            <div className="kpi-icon-wrapper amber"><Clock size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{pendingCount}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Approved Leaves</span>
            <div className="kpi-icon-wrapper emerald"><CheckCircle2 size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{approvedCount}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Rejected Requests</span>
            <div className="kpi-icon-wrapper rose"><XCircle size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* Table of Requests */}
      <div className="card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <h3 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {isEmployeeRole ? 'My Leave Applications' : isManagerRole ? `${currentUser.department} Leave Applications` : 'All Leave Applications'} ({roleScopedLeaves.length})
          </span>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            Includes Sandwich Days & Pay Breakdown
          </span>
        </h3>
        
        <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="hrms-table" style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>Applicant</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '140px' }}>Department & Type</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '180px' }}>Leave Duration</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '200px' }}>Pay & Sandwich Breakdown</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '100px' }}>Status</th>
                <th style={{ 
                  textAlign: 'right', 
                  whiteSpace: 'nowrap', 
                  minWidth: '150px',
                  position: 'sticky',
                  right: 0,
                  backgroundColor: '#f8fafc',
                  zIndex: 3,
                  boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.04)'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {roleScopedLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                    No leave applications found.
                  </td>
                </tr>
              ) : (
                roleScopedLeaves.map(l => {
                  const hasSandwich = (l.sandwichDays && l.sandwichDays > 0) || l.isSandwichApplied;
                  const isOverridden = l.hrOverride?.isOverridden;

                  return (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{l.employeeName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>{l.employeeId}</div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.84rem', marginBottom: '3px' }}>
                          {l.department}
                        </div>
                        <span style={{ 
                          fontWeight: 700, 
                          color: '#0E7490', 
                          backgroundColor: '#ECFEFF', 
                          border: '1px solid #CFFAFE',
                          padding: '2px 7px', 
                          borderRadius: '6px', 
                          fontSize: '0.74rem' 
                        }}>
                          {l.leaveType}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                          {formatDateDDMMYYYY(l.startDate)} <span style={{ color: '#94A3B8', fontWeight: 500 }}>to</span> {formatDateDDMMYYYY(l.endDate)}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#0E7490', fontWeight: 700, marginTop: '2px' }}>
                          {l.daysCount} {toNum(l.daysCount) === 1 ? 'day' : 'days'} total
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          {l.unpaidSandwichDays && l.unpaidSandwichDays > 0 ? (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              {l.unpaidSandwichDays}d Unpaid LOP
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#DCFCE7',
                              color: '#166534',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              Paid Leave
                            </span>
                          )}
                          {isOverridden && (
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              backgroundColor: '#FEF3C7',
                              color: '#D97706',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              Overridden
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                          {toNum(l.daysCount) - (l.sandwichDays || 0)}d Applied
                          {hasSandwich && (
                            <span style={{ color: '#0E7490', fontWeight: 700, marginLeft: '4px' }}>
                              (+{l.sandwichDays}d Sandwich)
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`status-pill ${l.status.toLowerCase()}`}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ 
                        textAlign: 'right', 
                        whiteSpace: 'nowrap',
                        position: 'sticky',
                        right: 0,
                        backgroundColor: '#ffffff',
                        zIndex: 2,
                        boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.04)'
                      }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {/* Approval Actions */}
                          {l.status === 'Pending' && canApprove ? (
                            <>
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => approveLeave(l.id, currentUser.name)}
                                style={{ padding: '6px 14px', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 1px 2px rgba(34,197,94,0.2)' }}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => rejectLeave(l.id, currentUser.name)}
                                style={{ padding: '6px 14px', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 1px 2px rgba(239,68,68,0.2)' }}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 500, paddingRight: '8px' }}>—</span>
                          )}
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

      {/* ======================================================== */}
      {/* 1. APPLY LEAVE MODAL WITH REAL-TIME SANDWICH PREVIEW */}
      {/* ======================================================== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', width: '92%', maxHeight: '92vh', overflowY: 'auto', borderRadius: '18px', padding: '24px' }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '10px', marginBottom: '8px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Request Leave</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  Select dates to preview real-time sandwich calculations and working days
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Employee selection if Admin/Manager */}
                {!isEmployeeRole && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      APPLICANT EMPLOYEE
                    </label>
                    <select 
                      className="form-control" 
                      value={form.employeeId} 
                      onChange={e => setForm({ ...form, employeeId: e.target.value })}
                      style={{ borderRadius: '10px', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.employeeId}>{e.firstName} {e.lastName} ({e.employeeId}) - {e.department}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Leave Type Category Selection */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    LEAVE CATEGORY
                  </label>
                  <select 
                    className="form-control" 
                    value={form.leaveType} 
                    onChange={e => setForm({ ...form, leaveType: e.target.value })}
                    style={{ borderRadius: '10px', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}
                    required
                  >
                    {(masterLeavePolicies && masterLeavePolicies.length > 0
                      ? masterLeavePolicies.filter(p => p.status === 'Active').flatMap(p => 
                          (p.leaveTypes || []).map(t => ({
                            id: `${p.id}-${t.id}`,
                            value: t.name,
                            label: `${t.name} • Quota: ${t.quotaPerYear}d (${t.isPaid ? 'Paid' : 'Unpaid'})`
                          }))
                        )
                      : leavePolicies.filter(p => p.status === 'Active').map(p => ({
                          id: p.id,
                          value: p.name,
                          label: `${p.name} (${p.quotaDays} Days/Year • ${p.monthlyAccrual})`
                        }))
                    ).map(item => (
                      <option key={item.id} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      FROM DATE
                    </label>
                    <input 
                      className="form-control" 
                      type="date" 
                      value={form.startDate} 
                      onChange={e => setForm({ ...form, startDate: e.target.value })} 
                      style={{ borderRadius: '10px', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      TO DATE
                    </label>
                    <input 
                      className="form-control" 
                      type="date" 
                      value={form.endDate} 
                      onChange={e => setForm({ ...form, endDate: e.target.value })} 
                      style={{ borderRadius: '10px', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}
                      required 
                    />
                  </div>
                </div>

                {/* REAL-TIME SANDWICH & LEAVE CALCULATION PREVIEW CARD */}
                {liveCalculation && (
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: liveCalculation.isSandwichApplied ? '2px solid #0E7490' : '1px solid #E2E8F0',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0E7490', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Automated Leave Calculation Preview
                      </span>
                      {liveCalculation.isSandwichApplied ? (
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#ECFEFF', color: '#0E7490', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', border: '1px solid #A5F3FC' }}>
                          Sandwich Rule Active
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                          Standard Quota
                        </span>
                      )}
                    </div>

                    {/* Breakdown Metrics Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px',
                      backgroundColor: '#F8FAFC',
                      padding: '10px',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      textAlign: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Working Days</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>{liveCalculation.appliedLeaveDays}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Weekly Offs</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>{liveCalculation.weeklyOffDays}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Holidays</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>{liveCalculation.publicHolidayDays}</div>
                      </div>
                      <div style={{ backgroundColor: liveCalculation.sandwichDays > 0 ? '#ECFEFF' : 'transparent', borderRadius: '8px', padding: '2px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#0E7490', fontWeight: 700 }}>Sandwich Days</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0E7490' }}>{liveCalculation.sandwichDays}</div>
                      </div>
                    </div>

                    {/* Total & Pay Notice */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Total Leave Deducted: </span>
                        <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>{liveCalculation.totalDays} Days</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem' }}>
                        {liveCalculation.unpaidDays > 0 ? (
                          <span style={{ color: '#DC2626', fontWeight: 700 }}>
                            ⚠️ {liveCalculation.unpaidDays} Unpaid Day(s) (Flows to Payroll)
                          </span>
                        ) : (
                          <span style={{ color: '#166534', fontWeight: 700 }}>
                            ✓ 100% Paid Leave Days
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notice message */}
                    {liveCalculation.noticeMessage && (
                      <div style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: liveCalculation.isSandwichApplied ? '#ECFEFF' : '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.76rem',
                        color: liveCalculation.isSandwichApplied ? '#0E7490' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Info size={14} />
                        <span>{liveCalculation.noticeMessage}</span>
                      </div>
                    )}

                    {/* Itemized Day-by-Day Timeline Preview */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Day-by-Day Calendar Timeline:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                        {liveCalculation.breakdown.map(day => (
                          <div 
                            key={day.date} 
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              backgroundColor: day.isSandwich ? '#ECFEFF' : '#F8FAFC',
                              fontSize: '0.76rem',
                              border: day.isSandwich ? '1px solid #A5F3FC' : '1px solid #F1F5F9'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: '#1E293B', width: '85px' }}>{day.date}</strong>
                              <span style={{ color: '#64748B', width: '70px' }}>({day.dayOfWeek})</span>
                              <span style={{ color: day.isSandwich ? '#0E7490' : '#475569', fontWeight: day.isSandwich ? 700 : 500 }}>
                                {day.reason}
                              </span>
                            </div>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: day.isPaid ? '#166534' : '#DC2626'
                            }}>
                              {day.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason Textarea */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    REASON
                  </label>
                  <textarea 
                    className="form-control" 
                    rows={2} 
                    value={form.reason} 
                    onChange={e => setForm({ ...form, reason: e.target.value })} 
                    placeholder="Personal leave, medical reason, etc."
                    style={{ borderRadius: '10px', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ borderTop: 'none', padding: 0, marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowModal(false)}
                  style={{ borderRadius: '10px', padding: '10px 20px' }}
                >
                  Cancel
                </button>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  style={{
                    borderRadius: '10px',
                    padding: '10px 24px',
                    backgroundColor: '#0E7490',
                    borderColor: '#0E7490',
                    fontWeight: 700
                  }}
                >
                  Submit Leave Request ({liveCalculation?.totalDays || 1} Days)
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. DETAIL INSPECTION MODAL (CALCULATION BREAKDOWN) */}
      {/* ======================================================== */}
      {inspectLeave && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px', width: '92%', maxHeight: '88vh', overflowY: 'auto', borderRadius: '18px', padding: '24px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                  Leave & Sandwich Calculation Breakdown
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#0E7490', fontWeight: 700, marginTop: '2px' }}>
                  {inspectLeave.employeeName} ({inspectLeave.employeeId}) • {inspectLeave.leaveType}
                </div>
              </div>
              <button 
                onClick={() => setInspectLeave(null)}
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Summary Badges */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                backgroundColor: '#F8FAFC',
                padding: '12px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Duration</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>{formatDateDDMMYYYY(inspectLeave.startDate)} → {formatDateDDMMYYYY(inspectLeave.endDate)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Working Days</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
                    {inspectLeave.sandwichDetails?.appliedLeaveDays ?? inspectLeave.daysCount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#0E7490' }}>Sandwich Days</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0E7490' }}>
                    {inspectLeave.sandwichDays || inspectLeave.sandwichDetails?.sandwichDays || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Total Leave Days</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                    {inspectLeave.daysCount}
                  </div>
                </div>
              </div>

              {/* Policy Applied Info */}
              <div style={{ backgroundColor: '#ECFEFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CFFAFE', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0E7490', fontWeight: 700, marginBottom: '4px' }}>
                  <Info size={16} />
                  <span>
                    Policy: {inspectLeave.sandwichDetails?.appliedPolicyName || 'Standard Policy'} (v{inspectLeave.sandwichDetails?.policyVersion || 1})
                  </span>
                </div>
                <div style={{ color: '#475569', fontSize: '0.78rem' }}>
                  Pay Treatment: <strong>{inspectLeave.sandwichDetails?.payTypeApplied?.replace(/_/g, ' ') || 'Same as Applied Leave'}</strong>
                </div>
              </div>

              {/* HR Override Info (Visible only if override applied, with confidential reason hidden for employee!) */}
              {inspectLeave.hrOverride?.isOverridden && (
                <div style={{ backgroundColor: '#FEF3C7', padding: '12px 16px', borderRadius: '10px', border: '1px solid #FDE68A', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={15} />
                    <span>HR Override Applied by {inspectLeave.hrOverride.overriddenBy}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#78350F', marginTop: '4px' }}>
                    Original: {inspectLeave.hrOverride.originalTotalDays} days ({inspectLeave.hrOverride.originalSandwichDays} sandwich) → Adjusted: {inspectLeave.daysCount} days.
                  </div>
                  {isPrivileged && inspectLeave.hrOverride.internalReason && (
                    <div style={{ marginTop: '6px', padding: '6px 8px', backgroundColor: '#FFFFFF', borderRadius: '6px', fontSize: '0.75rem', color: '#451A03' }}>
                      <strong>Internal HR Reason:</strong> {inspectLeave.hrOverride.internalReason}
                    </div>
                  )}
                </div>
              )}

              {/* Full Day-by-Day Table */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>
                  Day-by-Day Breakdown
                </h4>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569' }}>Date</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569' }}>Day</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569' }}>Classification / Reason</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', color: '#475569' }}>Sandwich</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>Pay Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspectLeave.sandwichDetails?.breakdown && inspectLeave.sandwichDetails.breakdown.length > 0 ? (
                        inspectLeave.sandwichDetails.breakdown.map((item: SandwichCalculationDayDetail) => (
                          <tr key={item.date} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: item.isSandwich ? '#ECFEFF' : '#FFFFFF' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1E293B' }}>{item.date}</td>
                            <td style={{ padding: '8px 12px', color: '#64748B' }}>{item.dayOfWeek}</td>
                            <td style={{ padding: '8px 12px', color: item.isSandwich ? '#0E7490' : '#334155' }}>{item.reason}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              {item.isSandwich ? (
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0E7490', backgroundColor: '#CFFAFE', padding: '2px 6px', borderRadius: '4px' }}>
                                  YES
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>NO</span>
                              )}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: item.isPaid ? '#166534' : '#DC2626' }}>
                                {item.isPaid ? 'Paid' : 'Unpaid (LOP)'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#64748B' }}>
                            {inspectLeave.daysCount} days applied ({inspectLeave.leaveType}).
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setInspectLeave(null)}
                style={{ borderRadius: '10px', padding: '8px 18px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. HR OVERRIDE MODAL (AUTHORIZED HR / CEO ONLY) */}
      {/* ======================================================== */}
      {overrideLeave && isPrivileged && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', width: '92%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '18px', padding: '24px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                  Override Sandwich Calculation
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  For {overrideLeave.employeeName} ({overrideLeave.employeeId}) • Recorded in Audit Log
                </p>
              </div>
              <button 
                onClick={() => setOverrideLeave(null)}
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOverride}>
              <div className="modal-body" style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Day Selection to Exclude/Include */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                    MANUALLY EXCLUDE / INCLUDE SPECIFIC DAYS
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {overrideLeave.sandwichDetails?.breakdown?.map((b: SandwichCalculationDayDetail) => {
                      const isExcluded = overrideForm.excludedDates.includes(b.date);
                      return (
                        <div 
                          key={b.date}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: isExcluded ? '#FEE2E2' : '#FFFFFF',
                            border: isExcluded ? '1px solid #FCA5A5' : '1px solid #E2E8F0',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div>
                            <strong>{b.date} ({b.dayOfWeek})</strong>
                            <span style={{ marginLeft: '8px', color: '#64748B' }}>{b.reason}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleOverrideExcludeDate(b.date)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: 'none',
                              backgroundColor: isExcluded ? '#DC2626' : '#0E7490',
                              color: '#FFFFFF'
                            }}
                          >
                            {isExcluded ? 'Excluded (Undo)' : 'Exclude from Leave'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Change Pay Treatment */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                    ADJUST PAY TREATMENT FOR SANDWICH DAYS
                  </label>
                  <select
                    className="form-control"
                    value={overrideForm.adjustedPayType}
                    onChange={e => setOverrideForm({ ...overrideForm, adjustedPayType: e.target.value as SandwichPayType })}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="SAME_AS_APPLIED_LEAVE">Same as Applied Leave Type</option>
                    <option value="PAID_LEAVE">Force Paid Leave (No Salary Deduction)</option>
                    <option value="UNPAID_LEAVE">Force Unpaid Leave (LOP Salary Deduction)</option>
                  </select>
                </div>

                {/* Adjusted Total Days Count */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                    FINAL ADJUSTED LEAVE DAYS
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    className="form-control"
                    value={overrideForm.adjustedDaysCount}
                    onChange={e => setOverrideForm({ ...overrideForm, adjustedDaysCount: Number(e.target.value) })}
                    required
                    style={{ borderRadius: '10px' }}
                  />
                </div>

                {/* Mandatory HR Reason (Stored in Audit Log, Hidden from Employee) */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                    MANDATORY INTERNAL HR OVERRIDE REASON <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Enter explicit reason for override (e.g. Executive approval for family emergency, weekend exempt from LOP). Kept private from employee."
                    value={overrideForm.internalReason}
                    onChange={e => setOverrideForm({ ...overrideForm, internalReason: e.target.value })}
                    required
                    style={{ borderRadius: '10px' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                    This note is strictly confidential and will only appear in management audit trails.
                  </div>
                </div>

              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #E2E8F0', padding: '16px 0 0', marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOverrideLeave(null)}
                  style={{ borderRadius: '10px', padding: '8px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#0E7490',
                    borderColor: '#0E7490',
                    borderRadius: '10px',
                    padding: '8px 22px',
                    fontWeight: 700
                  }}
                >
                  Apply HR Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
