import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { IndianRupee, Plus, CheckCircle2, XCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { toNum } from '../../utils/numbers';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

interface ExpenseManagementProps {
  openAddModal?: boolean;
  onCloseQuickAdd?: () => void;
}

export const ExpenseManagement: React.FC<ExpenseManagementProps> = ({ openAddModal, onCloseQuickAdd }) => {
  const { expenses, addExpense, approveExpense, currentUser, employees, hasPermission } = useHRMS();
  const [showModal, setShowModal] = useState<boolean>(openAddModal || false);

  const canApprove = hasPermission('finance', 'approve');
  const isEmployeeRole = currentUser.role === 'Employee';

  const [expForm, setExpForm] = useState({
    employeeId: currentUser.employeeId || 'EMP-001',
    category: 'Travel' as any,
    amount: 1500,
    date: new Date().toISOString().split('T')[0],
    description: '',
    receiptUrl: ''
  });

  React.useEffect(() => {
    if (openAddModal) setShowModal(true);
  }, [openAddModal]);

  React.useEffect(() => {
    if (currentUser.employeeId) {
      setExpForm(prev => ({ ...prev, employeeId: currentUser.employeeId || 'EMP-001' }));
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmpId = isEmployeeRole ? (currentUser.employeeId || 'EMP-001') : expForm.employeeId;
    const emp = employees.find(e => e.employeeId === targetEmpId) || employees[0];
    addExpense({
      employeeId: targetEmpId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      category: expForm.category,
      amount: Number(expForm.amount),
      date: expForm.date,
      description: expForm.description || 'Business Expense Claim',
      receiptUrl: expForm.receiptUrl
    });
    setShowModal(false);
    if (onCloseQuickAdd) onCloseQuickAdd();
  };

  const totalClaimed = expenses.reduce((acc, curr) => acc + toNum(curr.amount), 0);
  const pendingFinance = expenses.filter(e => e.status === 'Pending Finance').length;
  const totalReimbursed = expenses.filter(e => e.status === 'Reimbursed').reduce((acc, curr) => acc + toNum(curr.amount), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Finance & Expense Reimbursements</h1>
          <p className="page-subtitle">Track business claims, receipt uploads, multi-stage manager & finance approval workflows, and reimbursement payouts</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Submit Expense Claim
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total Expense Claims</span>
            <div className="kpi-icon-wrapper blue"><IndianRupee size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">₹{totalClaimed.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Pending Finance Approval</span>
            <div className="kpi-icon-wrapper amber"><FileText size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{pendingFinance}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total Reimbursed</span>
            <div className="kpi-icon-wrapper emerald"><CheckCircle2 size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">₹{totalReimbursed.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <h3 className="card-title">Expense Claims Directory ({expenses.length})</h3>
        <div className="table-responsive">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Receipt</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td><strong>{exp.employeeName}</strong> ({exp.department})</td>
                  <td>{exp.category}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateDDMMYYYY(exp.date)}</td>
                  <td><strong>₹{toNum(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                  <td>{exp.description}</td>
                  <td>
                    {exp.receiptUrl ? (
                      <a href={exp.receiptUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-600)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ImageIcon size={14} /> Receipt
                      </a>
                    ) : '--'}
                  </td>
                  <td>
                    <span className="status-pill pending">{exp.status}</span>
                  </td>
                  <td>
                    {exp.status === 'Pending Finance' || exp.status === 'Pending Manager' ? (
                      canApprove ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-success btn-sm" onClick={() => approveExpense(exp.id, currentUser.name, 'Reimbursed')}>
                            Approve & Reimburse
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => approveExpense(exp.id, currentUser.name, 'Rejected')}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="status-pill pending" style={{ fontSize: '0.75rem' }}>
                          Pending HR Review
                        </span>
                      )
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Submit Expense Claim</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Employee Claimaint</label>
                  <select 
                    className="form-control" 
                    value={isEmployeeRole ? (currentUser.employeeId || 'EMP-001') : expForm.employeeId} 
                    onChange={e => setExpForm({ ...expForm, employeeId: e.target.value })}
                    disabled={isEmployeeRole}
                  >
                    {employees.map(e => <option key={e.id} value={e.employeeId}>{e.firstName} {e.lastName} ({e.department})</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value as any })}>
                      <option value="Travel">Travel</option>
                      <option value="Meals">Meals</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Training">Training</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input className="form-control" type="number" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: Number(e.target.value) })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={2} value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} placeholder="Details of expense..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
