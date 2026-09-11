import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { CreditCard, IndianRupee, CheckCircle2, FileText, Download, X } from 'lucide-react';
import { PayrollRecord } from '../../types/hrms';
import { toNum } from '../../utils/numbers';
import { downloadElementAsPDF } from '../../utils/exportUtils';

export const PayrollManagement: React.FC = () => {
  const { 
    payrollRecords, 
    processPayrollBatch, 
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

  const totalPayout = visibleRecords.reduce((acc, curr) => acc + toNum(curr.netSalary), 0);
  const processedCount = visibleRecords.filter(p => p.status === 'Processed' || p.status === 'Paid').length;

  // Active Policy visibility flags
  const activeAttPolicy = masterAttendancePolicies.find(p => p.status === 'Active');
  const activeLeavePolicy = masterLeavePolicies.find(p => p.status === 'Active');
  const activeLoanPol = activeLoanPolicy || loanPolicies.find(p => p.status === 'Active');
  const isAttGeneric = activeAttPolicy ? activeAttPolicy.deductionVisibility === 'GENERIC' : true;
  const isLeaveGeneric = activeLeavePolicy ? activeLeavePolicy.deductionVisibility === 'GENERIC' : true;
  const isLoanGeneric = activeLoanPol ? activeLoanPol.payslipVisibility === 'GENERIC' : true;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Payroll Management & Payslips</h1>
          <p className="page-subtitle">Salary calculation based on basic pay, allowances, attendance working days, tax deductions, and printable payslips</p>
        </div>
        <div className="header-actions">
          {canProcessPayroll && (
            <button className="btn btn-primary btn-sm" onClick={processPayrollBatch}>
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
        <h3 className="card-title">{isEmployeeRole ? 'My Payslips History' : 'August 2026 Processed Salary Batch'}</h3>
        <div className="table-responsive">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Basic Pay</th>
                <th>Allowances</th>
                <th>Tax & Deductions</th>
                <th>Working Days</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.employeeName}</strong></td>
                  <td>{p.department}</td>
                  <td>₹{toNum(p.basicSalary).toLocaleString('en-IN')}</td>
                  <td>+₹{toNum(p.allowances).toLocaleString('en-IN')}</td>
                  <td style={{ color: 'var(--accent-rose)' }}>
                    -₹{(toNum(p.taxDeduction) + toNum(p.leaveDeduction) + toNum(p.advanceDeduction) + toNum(p.epfDeduction) + toNum(p.esiDeduction) + toNum(p.professionalTax)).toLocaleString('en-IN')}
                  </td>
                  <td>{p.presentDays} / {p.workingDays} days</td>
                  <td><strong style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>₹{toNum(p.netSalary).toLocaleString('en-IN')}</strong></td>
                  <td><span className="status-pill approved">{p.status}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPayslip(p)}>
                      <FileText size={14} /> View Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Payslip Modal */}
      {selectedPayslip && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
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
                      {businessSettings?.businessName || 'VRM Industrial Structures Private Limited'}
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.82rem', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div><strong>Employee Name:</strong> {selectedPayslip.employeeName}</div>
                  <div><strong>Employee ID:</strong> {selectedPayslip.employeeId}</div>
                  <div><strong>Department:</strong> {selectedPayslip.department}</div>
                  <div><strong>Designation:</strong> {selectedPayslip.designation}</div>
                  <div><strong>Days Present:</strong> {selectedPayslip.presentDays} / {selectedPayslip.workingDays}</div>
                  <div><strong>Payment Status:</strong> <span className="status-pill approved">{selectedPayslip.status}</span></div>
                </div>

                <table className="payslip-table">
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th>Earnings & Allowances</th>
                      <th>Amount (₹)</th>
                      <th>Deductions</th>
                      <th>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Basic Salary</td>
                      <td>₹{toNum(selectedPayslip.basicSalary).toLocaleString('en-IN')}</td>
                      <td>EPF Employee Contribution (12%)</td>
                      <td>₹{toNum(selectedPayslip.epfDeduction || selectedPayslip.taxDeduction).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td>HRA & Special Allowances</td>
                      <td>₹{toNum(selectedPayslip.allowances).toLocaleString('en-IN')}</td>
                      <td>ESI Contribution</td>
                      <td>₹{toNum(selectedPayslip.esiDeduction || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td>Performance Bonus</td>
                      <td>₹{toNum(selectedPayslip.bonus).toLocaleString('en-IN')}</td>
                      <td>Professional Tax (PT)</td>
                      <td>₹{toNum(selectedPayslip.professionalTax || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td>Recognition Award Earnings</td>
                      <td style={{ color: toNum(selectedPayslip.rewardEarnings) > 0 ? '#0E7490' : 'inherit', fontWeight: toNum(selectedPayslip.rewardEarnings) > 0 ? 700 : 400 }}>
                        ₹{toNum(selectedPayslip.rewardEarnings || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        {isPrivilegedViewer 
                          ? 'Employee Loan Recovery' 
                          : (isLoanGeneric ? 'OTHERS (Loan Recovery)' : 'Employee Loan Recovery')}
                        {toNum(selectedPayslip.advanceDeduction) > 0 && (
                          <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B' }}>
                            Remaining Balance: ₹{
                              loanRecords.find(r => r.employeeId === selectedPayslip.employeeId && (r.status === 'Active' || r.status === 'Disbursed'))?.outstandingBalance.toLocaleString('en-IN') || '0'
                            }
                          </span>
                        )}
                      </td>
                      <td style={{ color: toNum(selectedPayslip.advanceDeduction) > 0 ? 'var(--accent-rose)' : 'inherit', fontWeight: toNum(selectedPayslip.advanceDeduction) > 0 ? 600 : 400 }}>
                        -₹{toNum(selectedPayslip.advanceDeduction || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Attendance & Leave Deductions based on Role and Privacy Policy */}
                    {isPrivilegedViewer ? (
                      <>
                        <tr>
                          <td></td>
                          <td></td>
                          <td>Late Attendance Deduction (Late Coming)</td>
                          <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                            -₹{toNum(selectedPayslip.lateAttendanceDeduction || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td>Unpaid Leave Penalty (Loss of Pay)</td>
                          <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                            -₹{toNum(selectedPayslip.leaveDeduction).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </>
                    ) : (
                      /* Employee View: If confidential, masked into generic OTHERS */
                      <tr>
                        <td></td>
                        <td></td>
                        <td>
                          {isAttGeneric || isLeaveGeneric ? (activeAttPolicy?.genericCategoryLabel || 'OTHERS') : 'Attendance & Leave Penalty'}
                        </td>
                        <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                          -₹{(toNum(selectedPayslip.lateAttendanceDeduction || 0) + toNum(selectedPayslip.leaveDeduction)).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}

                    <tr style={{ fontWeight: 800, backgroundColor: '#f8fafc' }}>
                      <td>Total Gross Earnings</td>
                      <td>₹{(toNum(selectedPayslip.basicSalary) + toNum(selectedPayslip.allowances) + toNum(selectedPayslip.bonus) + toNum(selectedPayslip.rewardEarnings || 0)).toLocaleString('en-IN')}</td>
                      <td>Total Deductions</td>
                      <td>
                        ₹{(
                          toNum(selectedPayslip.epfDeduction || selectedPayslip.taxDeduction) +
                          toNum(selectedPayslip.esiDeduction || 0) +
                          toNum(selectedPayslip.professionalTax || 0) +
                          toNum(selectedPayslip.advanceDeduction || 0) +
                          toNum(selectedPayslip.leaveDeduction || 0) +
                          toNum(selectedPayslip.lateAttendanceDeduction || 0)
                        ).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ borderTop: '2px solid var(--primary-600)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800 }}>NET PAYABLE SALARY:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    ₹{toNum(selectedPayslip.netSalary).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
