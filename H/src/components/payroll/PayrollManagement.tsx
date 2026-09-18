import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { CreditCard, IndianRupee, CheckCircle2, FileText, Download, X, Edit3, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PayrollRecord } from '../../types/hrms';
import { toNum } from '../../utils/numbers';
import { downloadElementAsPDF, downloadCSV, downloadExcel, downloadPDF } from '../../utils/exportUtils';
import { ExportDropdown } from '../common/ExportDropdown';
import { StandardFloatingActionBar } from '../common/StandardFloatingActionBar';
import { StandardTablePagination } from '../common/StandardTablePagination';

export const PayrollManagement: React.FC = () => {
  const { 
    payrollRecords, 
    processPayrollBatch, 
    updatePayrollRecordAdvanceDeduction,
    employees, 
    currentUser, 
    hasPermission, 
    businessSettings,
    masterAttendancePolicies,
    masterLeavePolicies,
    activeLoanPolicy,
    loanPolicies,
    loanRecords
  } = useHRMS();

  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  // Multi-row selection state
  const [selectedPayslipIds, setSelectedPayslipIds] = useState<string[]>([]);

  // Advance Salary / Loan Recovery ("Others") Editing State
  const [editingAdvance, setEditingAdvance] = useState<{ recordId: string; employeeName: string; currentAmount: number } | null>(null);
  const [advanceInputVal, setAdvanceInputVal] = useState<number>(0);

  // Pagination state (Standardized to [5, 10] per design system)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Detect Finance Employees, Accounts Staff, and Admins
  const isFinanceUser = 
    currentUser.role === 'Finance Manager' ||
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'HR Admin' ||
    currentUser.role === 'Management' ||
    currentUser.role === 'Department Head' ||
    (currentUser.department && currentUser.department.toLowerCase().includes('finance')) ||
    (currentUser.department && currentUser.department.toLowerCase().includes('accounts')) ||
    (currentUser.designation && currentUser.designation.toLowerCase().includes('accounts')) ||
    (currentUser.designation && currentUser.designation.toLowerCase().includes('finance')) ||
    (currentUser.role && (currentUser.role as string).toLowerCase().includes('finance'));

  const isEmployeeRole = currentUser.role === 'Employee' && !isFinanceUser;
  const isPrivilegedViewer = isFinanceUser;
  const canProcessPayroll = (hasPermission('payroll', 'approve') || isFinanceUser) && (currentUser.role !== 'Employee' || isFinanceUser);

  // If user is a Finance employee or admin, show all employees' payroll details
  const visibleRecords = isEmployeeRole
    ? payrollRecords.filter(p => p.employeeId === (currentUser.employeeId || 'EMP-001'))
    : payrollRecords;

  const totalEntries = visibleRecords.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = visibleRecords.slice(startIndex, startIndex + pageSize);

  const totalPayout = visibleRecords.reduce((acc, curr) => acc + toNum(curr.netSalary), 0);
  const processedCount = visibleRecords.filter(p => p.status === 'Processed' || p.status === 'Paid').length;

  const handleTogglePayslip = (id: string) => {
    setSelectedPayslipIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (paginatedRecords.length > 0 && paginatedRecords.every(p => selectedPayslipIds.includes(p.id))) {
      setSelectedPayslipIds(prev => prev.filter(id => !paginatedRecords.some(p => p.id === id)));
    } else {
      const pageIds = paginatedRecords.map(p => p.id);
      setSelectedPayslipIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const openAdvanceModal = (p: PayrollRecord) => {
    setEditingAdvance({
      recordId: p.id,
      employeeName: p.employeeName,
      currentAmount: toNum(p.advanceDeduction || 0)
    });
    setAdvanceInputVal(toNum(p.advanceDeduction || 0));
  };

  const handleSaveAdvanceDeduction = () => {
    if (editingAdvance) {
      updatePayrollRecordAdvanceDeduction(editingAdvance.recordId, advanceInputVal);
      if (selectedPayslip && selectedPayslip.id === editingAdvance.recordId) {
        setSelectedPayslip(prev => prev ? { ...prev, advanceDeduction: advanceInputVal } : null);
      }
      setEditingAdvance(null);
    }
  };

  // Active Policy visibility flags
  const activeAttPolicy = masterAttendancePolicies.find(p => p.status === 'Active');
  const activeLeavePolicy = masterLeavePolicies.find(p => p.status === 'Active');
  const activeLoanPol = activeLoanPolicy || loanPolicies.find(p => p.status === 'Active');
  const isAttGeneric = activeAttPolicy ? activeAttPolicy.deductionVisibility === 'GENERIC' : true;
  const isLeaveGeneric = activeLeavePolicy ? activeLeavePolicy.deductionVisibility === 'GENERIC' : true;
  const isLoanGeneric = activeLoanPol ? activeLoanPol.payslipVisibility === 'GENERIC' : true;

  // Export Handlers (Excel, PDF, CSV)
  const getPayrollExportData = () => {
    const columns = [
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'department', label: 'Department' },
      { key: 'basicSalary', label: 'Basic Salary (40%)' },
      { key: 'da', label: 'DA (20%)' },
      { key: 'conveyance', label: 'Conveyance (5%)' },
      { key: 'hra', label: 'HRA (35%)' },
      { key: 'advanceDeduction', label: 'Advance / Loan EMI' },
      { key: 'epfDeduction', label: 'EPF (12%)' },
      { key: 'esiDeduction', label: 'ESIC (0.75%)' },
      { key: 'professionalTax', label: 'PT' },
      { key: 'workingDays', label: 'Working Days' },
      { key: 'netSalary', label: 'Net Payout' },
      { key: 'status', label: 'Status' }
    ];
    const data = payrollRecords.map(p => {
      const basic = toNum(p.basicSalary);
      const da = toNum(p.da ?? Math.round(basic * 0.5));
      const conv = toNum(p.conveyance ?? Math.round(basic * 0.125));
      const hra = toNum(p.hra ?? Math.round(basic * 0.875));
      return {
        employeeId: p.employeeId,
        employeeName: p.employeeName,
        department: p.department,
        basicSalary: basic,
        da: da,
        conveyance: conv,
        hra: hra,
        advanceDeduction: toNum(p.advanceDeduction || 0),
        epfDeduction: toNum(p.epfDeduction || 0),
        esiDeduction: toNum(p.esiDeduction || 0),
        professionalTax: toNum(p.professionalTax || 0),
        workingDays: `${p.presentDays || 0} / ${p.workingDays || 0}`,
        netSalary: toNum(p.netSalary),
        status: p.status
      };
    });
    return { columns, data };
  };

  const handleExportCSV = () => {
    const { columns, data } = getPayrollExportData();
    downloadCSV(data, `Payroll_Register_${new Date().toISOString().slice(0, 10)}`, columns);
  };

  const handleExportExcel = () => {
    const { columns, data } = getPayrollExportData();
    downloadExcel(data, `Payroll_Register_${new Date().toISOString().slice(0, 10)}`, columns);
  };

  const handleExportPDF = () => {
    const { columns, data } = getPayrollExportData();
    downloadPDF(data, 'Monthly Processed Payroll Register', `Payroll_Register_${new Date().toISOString().slice(0, 10)}`, columns);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">
            {isEmployeeRole ? 'My Payroll & Payslips' : 'Payroll Management'}
          </h1>
          <p className="page-subtitle">
            {isEmployeeRole 
              ? 'View official monthly salary slips, itemized allowances, statutory deductions, and download signed records.'
              : 'Automated 100% CTC calculation engine (Basic 40%, DA 20%, Conveyance 5%, HRA 35%), statutory compliance, and batch disbursement.'}
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {canProcessPayroll && (
            <button className="btn btn-primary" onClick={processPayrollBatch}>
              <CreditCard size={16} /> Process August Payroll Batch
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total August Net Payout</span>
            <div className="kpi-icon-wrapper emerald"><IndianRupee size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">₹{totalPayout.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total Staff Included</span>
            <div className="kpi-icon-wrapper blue"><CreditCard size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{isEmployeeRole ? 1 : employees.length}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Processed Payroll Runs</span>
            <div className="kpi-icon-wrapper purple"><CheckCircle2 size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{processedCount}</div>
          </div>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>
              {isEmployeeRole ? 'My Payslips History' : 'August 2026 Processed Salary Batch'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Salary Formula: Basic (40%) + DA (20%) + Conveyance (5%) + HRA (35%) = 100% CTC
            </span>
          </div>
          <ExportDropdown 
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
          />
        </div>

        <div className="table-responsive">
          <table className="hrms-table">
            <thead>
              <tr>
                <th style={{ width: '40px', minWidth: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={paginatedRecords.length > 0 && paginatedRecords.every(p => selectedPayslipIds.includes(p.id))}
                    onChange={handleToggleSelectAll}
                    style={{ accentColor: '#0E7490', cursor: 'pointer', width: '16px', height: '16px' }}
                    aria-label="Select all payslips"
                  />
                </th>
                <th>Employee</th>
                <th>Department</th>
                <th>Basic (40%)</th>
                <th>DA + Conv + HRA</th>
                <th>Others (Advance / Loan)</th>
                <th>Statutory & Tax</th>
                <th>Working Days</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map(p => {
                const isSelected = selectedPayslipIds.includes(p.id);
                const basic = toNum(p.basicSalary);
                const da = toNum(p.da ?? Math.round(basic * 0.5));
                const conv = toNum(p.conveyance ?? Math.round(basic * 0.125));
                const hra = toNum(p.hra ?? Math.round(basic * 0.875));
                const allowancesTotal = da + conv + hra;
                const advance = toNum(p.advanceDeduction || 0);
                const statutoryTax = toNum(p.epfDeduction || 0) + toNum(p.esiDeduction || 0) + toNum(p.professionalTax || 0);

                return (
                  <tr 
                    key={p.id}
                    style={{
                      backgroundColor: isSelected ? '#ECFEFF' : undefined,
                      borderLeft: isSelected ? '4px solid #0E7490' : undefined,
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', width: '40px' }} onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTogglePayslip(p.id)}
                        style={{ accentColor: '#0E7490', cursor: 'pointer', width: '16px', height: '16px' }}
                        aria-label={`Select payslip for ${p.employeeName}`}
                      />
                    </td>
                    <td>
                      <div>
                        <strong>{p.employeeName}</strong>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{p.employeeId}</span>
                          {p.withPf === false ? (
                            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 600 }}>
                              No PF (&lt;6M)
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#ECFDF5', color: '#065F46', fontWeight: 600 }}>
                              PF Active
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{p.department}</td>
                    <td>₹{basic.toLocaleString('en-IN')}</td>
                    <td>
                      <span title={`DA (20%): ₹${da} | Conv (5%): ₹${conv} | HRA (35%): ₹${hra}`}>
                        +₹{allowancesTotal.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          color: advance > 0 ? 'var(--accent-rose)' : '#94A3B8', 
                          fontWeight: advance > 0 ? 700 : 400 
                        }}>
                          {advance > 0 ? `-₹${advance.toLocaleString('en-IN')}` : '₹0'}
                        </span>
                        {canProcessPayroll && (
                          <button
                            type="button"
                            title="Edit Advance / Loan Recovery installment"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAdvanceModal(p);
                            }}
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              borderRadius: '4px',
                              padding: '2px 5px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              color: '#0E7490',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            <Edit3 size={11} /> Edit
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--accent-rose)' }}>
                      -₹{statutoryTax.toLocaleString('en-IN')}
                    </td>
                    <td>{p.presentDays} / {p.workingDays} days</td>
                    <td><strong style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>₹{toNum(p.netSalary).toLocaleString('en-IN')}</strong></td>
                    <td><span className="status-pill approved">{p.status}</span></td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setSelectedPayslip(p)}
                        title="View Payslip"
                        aria-label="View Payslip"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          color: '#0E7490'
                        }}
                      >
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Standardized Table Pagination */}
        <StandardTablePagination
          currentPage={currentPage}
          totalEntries={totalEntries}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10]}
        />
      </div>

      {/* Floating Action Bar per AGENTS.md */}
      <StandardFloatingActionBar
        selectedCount={selectedPayslipIds.length}
        onClearSelection={() => setSelectedPayslipIds([])}
        onEdit={selectedPayslipIds.length === 1 ? () => {
          const rec = visibleRecords.find(p => p.id === selectedPayslipIds[0]);
          if (rec) setSelectedPayslip(rec);
        } : undefined}
      />

      {/* Modal: Edit Advance / Loan Recovery ("Others") */}
      {editingAdvance && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '420px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="#0E7490" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                  Edit Advance Salary / Loan Recovery
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingAdvance(null)} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '18px 20px' }}>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div>Employee: <strong>{editingAdvance.employeeName}</strong></div>
                <div style={{ color: '#64748B', marginTop: '2px' }}>Deduction Category: <strong>Others (Advance / Loan Recovery)</strong></div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Monthly Recovery Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="form-control"
                  value={advanceInputVal}
                  onChange={(e) => setAdvanceInputVal(Math.max(0, Number(e.target.value) || 0))}
                  style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0E7490', width: '100%' }}
                  placeholder="0"
                  autoFocus
                />
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '6px', display: 'block' }}>
                  Adjustable by HR, CEO, and Accounts team. Set to ₹0 to pause or defer deduction for this run.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setEditingAdvance(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#0E7490', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={handleSaveAdvanceDeduction}
                >
                  Save Recovery Amount
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal */}
      {selectedPayslip && (() => {
        const basicSalary = toNum(selectedPayslip.basicSalary);
        const da = toNum(selectedPayslip.da ?? Math.round(basicSalary * 0.5));
        const conveyance = toNum(selectedPayslip.conveyance ?? Math.round(basicSalary * 0.125));
        const hra = toNum(selectedPayslip.hra ?? Math.round(basicSalary * 0.875));
        const attBonus = toNum(selectedPayslip.attendanceBonus || 0);
        const otAmount = toNum(selectedPayslip.overtimeAmount || 0);
        const rewardBonus = toNum(selectedPayslip.bonus) + toNum(selectedPayslip.rewardEarnings || 0);

        const totalGross = basicSalary + da + conveyance + hra + attBonus + otAmount + rewardBonus;

        const isWithPf = selectedPayslip.withPf !== undefined 
          ? selectedPayslip.withPf 
          : (toNum(selectedPayslip.epfDeduction) > 0);

        const epfDeduction = isWithPf 
          ? toNum(selectedPayslip.epfDeduction || Math.round((basicSalary + da + conveyance) * 0.12))
          : 0;
        const esiDeduction = isWithPf
          ? toNum(selectedPayslip.esiDeduction || (totalGross <= 21000 ? Math.round(totalGross * 0.0075) : 0))
          : 0;
        const ptDeduction = toNum(selectedPayslip.professionalTax || 0);
        const advanceRecovery = toNum(selectedPayslip.advanceDeduction || 0);
        const leaveDeduction = toNum(selectedPayslip.leaveDeduction || 0);
        const lateDeduction = toNum(selectedPayslip.lateAttendanceDeduction || 0);

        const totalDeductions = epfDeduction + esiDeduction + ptDeduction + advanceRecovery + leaveDeduction + lateDeduction;
        const netSalary = Math.max(0, totalGross - totalDeductions);

        return (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '720px' }}>
              <div className="modal-header">
                <h2>Official Employee Payslip</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    className="btn btn-primary btn-sm" 
                    onClick={() => downloadElementAsPDF('printable-payslip-content', `Payslip_${selectedPayslip.employeeName.replace(/\s+/g, '_')}_${selectedPayslip.month}_${selectedPayslip.year}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0E7490', border: 'none' }}
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button onClick={() => setSelectedPayslip(null)}><X size={20} /></button>
                </div>
              </div>
              <div className="modal-body">
                <div className="payslip-container" id="printable-payslip-content">
                  <div className="payslip-header">
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0E7490' }}>
                        {businessSettings?.businessName || 'Businz'}
                      </h2>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {businessSettings?.address || 'Plot 42, Heavy Industrial Growth Estate, Guindy, Chennai, Tamil Nadu - 600032'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>PAYSLIP: {selectedPayslip.month.toUpperCase()} {selectedPayslip.year}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ref: {selectedPayslip.id}</span>
                    </div>
                  </div>

                  {/* Scheme & Details Banner */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isWithPf ? '#ECFDF5' : '#FFFBEB', border: isWithPf ? '1px solid #A7F3D0' : '1px solid #FDE68A', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isWithPf ? <ShieldCheck size={16} color="#059669" /> : <ShieldAlert size={16} color="#D97706" />}
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isWithPf ? '#065F46' : '#92400E' }}>
                        Salary Scheme: {isWithPf ? 'With PF & ESIC Deductions (Active)' : 'Without PF & ESIC (Probation / < 6 Months Policy)'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Formula: 40% Basic | 20% DA | 5% Conveyance | 35% HRA
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.82rem', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <div><strong>Employee Name:</strong> {selectedPayslip.employeeName}</div>
                    <div><strong>Employee ID:</strong> {selectedPayslip.employeeId}</div>
                    <div><strong>Department:</strong> {selectedPayslip.department}</div>
                    <div><strong>Designation:</strong> {selectedPayslip.designation}</div>
                    <div>
                      <strong>Attendance:</strong> {selectedPayslip.presentDays} / {selectedPayslip.workingDays} days
                      {selectedPayslip.presentDays === selectedPayslip.workingDays && (
                        <span style={{ marginLeft: '6px', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 600 }}>
                          100% Perfect Attendance
                        </span>
                      )}
                    </div>
                    <div><strong>Payment Status:</strong> <span className="status-pill approved">{selectedPayslip.status}</span></div>
                  </div>

                  <table className="payslip-table">
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ width: '35%' }}>Earnings & Allowances (100% CTC)</th>
                        <th style={{ width: '15%', textAlign: 'right' }}>Amount (₹)</th>
                        <th style={{ width: '35%' }}>Deductions & Recoveries</th>
                        <th style={{ width: '15%', textAlign: 'right' }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Basic Salary (40%)</td>
                        <td style={{ textAlign: 'right' }}>₹{basicSalary.toLocaleString('en-IN')}</td>
                        <td>
                          EPF Employee Contribution (12%)
                          {!isWithPf && <span style={{ display: 'block', fontSize: '0.7rem', color: '#D97706' }}>Exempt (&lt; 6 Months)</span>}
                        </td>
                        <td style={{ textAlign: 'right', color: isWithPf ? 'inherit' : '#94A3B8' }}>
                          ₹{epfDeduction.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td>Dearness Allowance (DA - 20%)</td>
                        <td style={{ textAlign: 'right' }}>₹{da.toLocaleString('en-IN')}</td>
                        <td>
                          ESIC Contribution (0.75%)
                          {!isWithPf && <span style={{ display: 'block', fontSize: '0.7rem', color: '#D97706' }}>Exempt (&lt; 6 Months)</span>}
                        </td>
                        <td style={{ textAlign: 'right', color: isWithPf && esiDeduction > 0 ? 'inherit' : '#94A3B8' }}>
                          ₹{esiDeduction.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td>Conveyance Allowance (5%)</td>
                        <td style={{ textAlign: 'right' }}>₹{conveyance.toLocaleString('en-IN')}</td>
                        <td>Professional Tax (PT)</td>
                        <td style={{ textAlign: 'right' }}>₹{ptDeduction.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td>House Rent Allowance (HRA - 35%)</td>
                        <td style={{ textAlign: 'right' }}>₹{hra.toLocaleString('en-IN')}</td>
                        <td>
                          Others (Advance Salary / Loan Recovery)
                          {advanceRecovery > 0 && (
                            <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B' }}>
                              Remaining Balance: ₹{
                                loanRecords.find(r => r.employeeId === selectedPayslip.employeeId && (r.status === 'Active' || r.status === 'Disbursed'))?.outstandingBalance.toLocaleString('en-IN') || '0'
                              }
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', color: advanceRecovery > 0 ? 'var(--accent-rose)' : 'inherit', fontWeight: advanceRecovery > 0 ? 600 : 400 }}>
                          -₹{advanceRecovery.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          Attendance Bonus (100% Attendance)
                          {attBonus > 0 && <span style={{ display: 'block', fontSize: '0.68rem', color: '#059669' }}>Awarded for 0 LOP in Month</span>}
                        </td>
                        <td style={{ textAlign: 'right', color: attBonus > 0 ? '#059669' : 'inherit', fontWeight: attBonus > 0 ? 700 : 400 }}>
                          ₹{attBonus.toLocaleString('en-IN')}
                        </td>
                        <td>Loss of Pay (Unpaid Leave Deduction)</td>
                        <td style={{ textAlign: 'right', color: leaveDeduction > 0 ? 'var(--accent-rose)' : 'inherit', fontWeight: leaveDeduction > 0 ? 600 : 400 }}>
                          -₹{leaveDeduction.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td>Overtime Earnings</td>
                        <td style={{ textAlign: 'right' }}>₹{otAmount.toLocaleString('en-IN')}</td>
                        <td>Late Attendance Penalty</td>
                        <td style={{ textAlign: 'right', color: lateDeduction > 0 ? 'var(--accent-rose)' : 'inherit', fontWeight: lateDeduction > 0 ? 600 : 400 }}>
                          -₹{lateDeduction.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td>Performance Bonus & Rewards</td>
                        <td style={{ textAlign: 'right' }}>₹{rewardBonus.toLocaleString('en-IN')}</td>
                        <td></td>
                        <td></td>
                      </tr>

                      <tr style={{ fontWeight: 800, backgroundColor: '#f8fafc' }}>
                        <td>Total Gross Earnings</td>
                        <td style={{ textAlign: 'right', color: '#0E7490' }}>₹{totalGross.toLocaleString('en-IN')}</td>
                        <td>Total Deductions</td>
                        <td style={{ textAlign: 'right', color: 'var(--accent-rose)' }}>₹{totalDeductions.toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ borderTop: '2px solid var(--primary-600)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1rem', fontWeight: 800 }}>NET PAYABLE SALARY:</span>
                      <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '2px 0 0 0' }}>
                        Direct Bank Transfer to Registered Account
                      </p>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      ₹{netSalary.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
