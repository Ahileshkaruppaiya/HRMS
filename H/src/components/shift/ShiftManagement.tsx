import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Clock, Plus, Users, CheckCircle2, ArrowRightLeft, Trash2, Lock, ShieldAlert, X } from 'lucide-react';

export const ShiftManagement: React.FC = () => {
  const { shifts, addShift, deleteShift, shiftRequests, requestShiftChange, approveShiftRequest, employees, currentUser, hasPermission } = useHRMS();
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ shiftId: string; shiftName: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canApprove = hasPermission('shifts', 'approve');
  const canCreateShift = hasPermission('shifts', 'create') && currentUser.role !== 'Employee';
  const canDeleteShift = currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin';
  const isHRorCEO = currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin' || currentUser.role === 'Management' || currentUser.role === 'ERP Administrator';
  const canRequestSwap = !isHRorCEO;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmModal || !canDeleteShift) return;
    deleteShift(deleteConfirmModal.shiftId);
    triggerToast(`Deleted shift "${deleteConfirmModal.shiftName}" successfully!`);
    setDeleteConfirmModal(null);
  };

  const [shiftForm, setShiftForm] = useState({
    shiftName: '',
    startTime: '09:00',
    endTime: '18:00',
    breakDurationMins: 60,
    workingHours: 8,
    gracePeriodMins: 15,
    color: '#2563eb'
  });

  const [swapForm, setSwapForm] = useState({
    currentShift: 'General Morning Shift',
    requestedShift: 'US Evening Shift',
    requestedDate: new Date().toISOString().split('T')[0],
    reason: 'Personal medical schedule shift swap'
  });

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.shiftName) return;
    addShift({
      shiftName: shiftForm.shiftName,
      startTime: shiftForm.startTime,
      endTime: shiftForm.endTime,
      breakDurationMins: Number(shiftForm.breakDurationMins),
      workingHours: Number(shiftForm.workingHours),
      gracePeriodMins: Number(shiftForm.gracePeriodMins),
      assignments: [],
      color: shiftForm.color
    });
    setShowAddShiftModal(false);
  };

  const handleRequestSwap = (e: React.FormEvent) => {
    e.preventDefault();
    requestShiftChange({
      employeeId: currentUser.employeeId || 'EMP-001',
      employeeName: currentUser.name,
      currentShift: swapForm.currentShift,
      requestedShift: swapForm.requestedShift,
      requestedDate: swapForm.requestedDate,
      reason: swapForm.reason
    });
    setShowSwapModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Shift Schedule Management</h1>
          <p className="page-subtitle">Configure shift rosters, working hours, grace periods, and employee shift change swap requests</p>
        </div>
        <div className="header-actions">
          {canRequestSwap && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowSwapModal(true)}>
              <ArrowRightLeft size={16} /> Request Shift Swap
            </button>
          )}
          {canCreateShift && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddShiftModal(true)}>
              <Plus size={16} /> Add New Shift
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          fontWeight: 700,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Active Shift Cards */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Active System Shifts ({shifts.length})</h3>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {shifts.map(s => (
          <div key={s.id} className="card" style={{ borderLeft: `4px solid ${s.color}`, marginBottom: 0, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{s.shiftName}</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="status-pill active" style={{ fontSize: '0.65rem' }}>Active</span>

                {/* Delete Option Restricted to Super Admin & HR Admin Only */}
                {canDeleteShift ? (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteConfirmModal({ shiftId: s.id, shiftName: s.shiftName })}
                    style={{
                      padding: '4px 7px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete Shift (Super Admin & HR Admin Only)"
                    aria-label="Delete Shift"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : (
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }} title="Only Super Admin and HR Admin can delete shifts">
                    <Lock size={11} /> Locked
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div><Clock size={14} /> <strong>Timing:</strong> {s.startTime} - {s.endTime}</div>
              <div><strong>Working:</strong> {s.workingHours} Hours</div>
              <div><strong>Break:</strong> {s.breakDurationMins} Mins</div>
              <div><strong>Grace Period:</strong> {s.gracePeriodMins} Mins</div>
              <div><Users size={14} /> <strong>Assigned:</strong> {s.assignedEmployeeCount || 10} Staff</div>
            </div>
          </div>
        ))}
      </div>

      {/* Shift Swap Requests */}
      <div className="card" style={{ marginTop: '28px' }}>
        <h3 className="card-title">Shift Swap Requests ({shiftRequests.length})</h3>
        {shiftRequests.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No shift swap requests</p>
        ) : (
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Current Shift</th>
                  <th>Requested Shift</th>
                  <th>Requested Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shiftRequests.map(r => (
                  <tr key={r.id}>
                    <td>{r.employeeName}</td>
                    <td>{r.currentShift}</td>
                    <td>{r.requestedShift}</td>
                    <td>{r.requestedDate}</td>
                    <td>{r.reason}</td>
                    <td><span className={`status-pill ${r.status.toLowerCase()}`}>{r.status}</span></td>
                    <td>
                      {r.status === 'Pending' ? (
                        canApprove ? (
                          <button className="btn btn-success btn-sm" onClick={() => approveShiftRequest(r.id, currentUser.name)}>
                            Approve Swap
                          </button>
                        ) : (
                          <span className="status-pill pending" style={{ fontSize: '0.75rem' }}>
                            Pending HR Review
                          </span>
                        )
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved by {r.approvedBy || 'HR Admin'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Shift Modal */}
      {showAddShiftModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Shift Schedule</h2>
              <button onClick={() => setShowAddShiftModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddShift}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Shift Title *</label>
                  <input className="form-control" value={shiftForm.shiftName} onChange={e => setShiftForm({ ...shiftForm, shiftName: e.target.value })} placeholder="e.g. EU Morning Shift" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input className="form-control" type="time" value={shiftForm.startTime} onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input className="form-control" type="time" value={shiftForm.endTime} onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Grace Period (Minutes)</label>
                    <input className="form-control" type="number" value={shiftForm.gracePeriodMins} onChange={e => setShiftForm({ ...shiftForm, gracePeriodMins: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Break Duration (Minutes)</label>
                    <input className="form-control" type="number" value={shiftForm.breakDurationMins} onChange={e => setShiftForm({ ...shiftForm, breakDurationMins: Number(e.target.value) })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddShiftModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Create Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Swap Modal */}
      {showSwapModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Request Shift Swap</h2>
              <button onClick={() => setShowSwapModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRequestSwap}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Current Shift</label>
                  <input className="form-control" value={swapForm.currentShift} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Shift Requested</label>
                  <select className="form-control" value={swapForm.requestedShift} onChange={e => setSwapForm({ ...swapForm, requestedShift: e.target.value })}>
                    {shifts.map(s => <option key={s.id} value={s.shiftName}>{s.shiftName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Effective Swap Date</label>
                  <input className="form-control" type="date" value={swapForm.requestedDate} onChange={e => setSwapForm({ ...swapForm, requestedDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea className="form-control" rows={2} value={swapForm.reason} onChange={e => setSwapForm({ ...swapForm, reason: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSwapModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit Swap Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                <ShieldAlert size={20} /> Delete Shift Confirmation
              </h2>
              <button onClick={() => setDeleteConfirmModal(null)}><X size={18} /></button>
            </div>
            
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={24} />
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px' }}>
                Delete "{deleteConfirmModal.shiftName}"?
              </h4>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Are you sure you want to remove this shift schedule? Any assigned employees will need to be reallocated.
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setDeleteConfirmModal(null)}
              >
                Cancel
              </button>
              
              <button 
                type="button" 
                className="btn btn-danger btn-sm"
                onClick={handleConfirmDelete}
                style={{ padding: '8px 20px', fontWeight: 700 }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
