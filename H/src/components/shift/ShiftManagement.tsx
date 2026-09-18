import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Plus, CheckCircle2, ArrowRightLeft, Trash2, Lock, ShieldAlert, X } from 'lucide-react';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

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
  const isEmployee = currentUser.role === 'Employee';
  const canRequestSwap = !isHRorCEO;

  // Identify current employee record
  const currentEmp = employees.find(e => 
    (currentUser.employeeId && e.employeeId === currentUser.employeeId) ||
    (currentUser.id && (e.id === currentUser.id || e.employeeId === currentUser.id)) ||
    (currentUser.name && `${e.firstName} ${e.lastName}`.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
  );

  const userEmpId = (currentUser.employeeId || currentEmp?.employeeId || currentEmp?.id || 'EMP-008').trim().toLowerCase();
  const userName = (currentUser.name || (currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}`.trim() : 'Murugan Shanmugam')).trim().toLowerCase();
  const myAssignedShiftName = currentEmp?.workShift || 'Shift 1 (09:00 AM - 06:00 PM)';

  // Find employee's assigned shift object
  const myShift = shifts.find(s => 
    s.shiftName.toLowerCase() === myAssignedShiftName.toLowerCase() ||
    myAssignedShiftName.toLowerCase().includes(s.shiftName.toLowerCase()) ||
    s.shiftName.toLowerCase().includes(myAssignedShiftName.toLowerCase())
  ) || shifts[0];

  // Scoped shift swap requests: Employee sees only their own requests; HR/CEO sees all
  const myShiftRequests = shiftRequests.filter(r => {
    const reqEmpId = (r.employeeId || '').trim().toLowerCase();
    const reqEmpName = (r.employeeName || '').trim().toLowerCase();

    if (userEmpId && reqEmpId && userEmpId === reqEmpId) return true;
    if (userName && reqEmpName && (reqEmpName === userName || reqEmpName.includes(userName) || userName.includes(reqEmpName))) return true;
    return false;
  });

  const displayedShiftRequests = isEmployee ? myShiftRequests : shiftRequests;

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
    breakDurationMins: 45,
    workingHours: 8.25,
    gracePeriodMins: 15,
    color: '#0E7490'
  });

  const [swapForm, setSwapForm] = useState({
    currentShift: myAssignedShiftName,
    requestedShift: 'Shift 2 (09:30 AM - 06:30 PM)',
    requestedDate: new Date().toISOString().split('T')[0],
    reason: 'Personal schedule shift swap'
  });

  // Ensure swap form currentShift stays synced with user's assigned shift
  React.useEffect(() => {
    if (myAssignedShiftName) {
      setSwapForm(prev => ({
        ...prev,
        currentShift: myAssignedShiftName,
        requestedShift: shifts.find(s => s.shiftName !== myAssignedShiftName)?.shiftName || 'Shift 2 (09:30 AM - 06:30 PM)'
      }));
    }
  }, [myAssignedShiftName, shifts]);

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
      employeeId: userEmpId || currentUser.employeeId || 'EMP-008',
      employeeName: currentUser.name || (currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}`.trim() : 'Staff Member'),
      currentShift: swapForm.currentShift || myAssignedShiftName,
      requestedShift: swapForm.requestedShift,
      requestedDate: swapForm.requestedDate,
      reason: swapForm.reason
    });
    setShowSwapModal(false);
    triggerToast('Shift swap request submitted successfully!');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>{isEmployee ? 'My Shift' : 'Shift Management'}</h1>
          <p className="page-subtitle">
            {isEmployee 
              ? 'View your assigned shift timetable, working hours, and manage your shift swap requests' 
              : 'Configure shift rosters, working hours, grace periods, and employee shift change swap requests'}
          </p>
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

      {/* Shift Details Display: Scoped for Employee (No other employee details shown) vs Full Management for CEO/HR */}
      {isEmployee ? (
        <div style={{ marginBottom: '28px' }}>
          <div className="card" style={{ borderLeft: '6px solid #0E7490', padding: '20px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0E7490', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Assigned Shift
                </span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 2px 0', color: '#0F172A' }}>
                  {myShift.shiftName}
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B' }}>
                  Your official rostered timings for workdays
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Shift Timing</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{myShift.startTime} - {myShift.endTime}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Working Hours</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{myShift.workingHours === 8.25 ? '8h 15m' : `${myShift.workingHours} Hours`}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Meal / Break</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{myShift.breakDurationMins} Mins</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Grace Period</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{myShift.gracePeriodMins} Mins</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Active Shift Cards for CEO / HR Admin */}
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
                  <div><strong>Timing:</strong> {s.startTime} - {s.endTime}</div>
                  <div><strong>Working:</strong> {s.workingHours === 8.25 ? '8h 15m' : `${s.workingHours} Hours`}</div>
                  <div><strong>Break:</strong> {s.breakDurationMins} Mins</div>
                  <div><strong>Grace Period:</strong> {s.gracePeriodMins} Mins</div>
                  <div>
                    <strong>Assigned:</strong> {employees.filter(e => 
                      (e.workShift && (e.workShift === s.shiftName || e.workShift.toLowerCase().includes(s.shiftName.toLowerCase()))) ||
                      (s.assignments && s.assignments.some(a => a.employeeId === e.employeeId || a.employeeId === e.id))
                    ).length} Staff
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Shift Swap Requests: Employee sees ONLY their own requests */}
      <div className="card" style={{ marginTop: '28px' }}>
        <h3 className="card-title">
          {isEmployee ? `My Shift Swap Requests (${displayedShiftRequests.length})` : `Shift Swap Requests (${displayedShiftRequests.length})`}
        </h3>
        {displayedShiftRequests.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            {isEmployee ? 'You have no shift swap requests.' : 'No shift swap requests'}
          </p>
        ) : (
          <div className="table-responsive">
            <table className="hrms-table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', padding: '12px 16px' }}>Employee</th>
                  <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', padding: '12px 16px', whiteSpace: 'nowrap' }}>Current Shift</th>
                  <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', padding: '12px 16px', whiteSpace: 'nowrap' }}>Requested Shift</th>
                  <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', padding: '12px 16px', whiteSpace: 'nowrap' }}>Requested Date</th>
                  <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', padding: '12px 16px' }}>Reason</th>
                  <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', padding: '12px 16px' }}>Status</th>
                  <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedShiftRequests.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
                        {isEmployee ? (
                          <span>You ({r.employeeName})</span>
                        ) : (
                          r.employeeName
                        )}
                      </div>
                      {r.employeeId && (
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
                          {r.employeeId}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>
                        {r.currentShift}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#0E7490', 
                        fontWeight: 600, 
                        background: '#ECFEFF', 
                        border: '1px solid #CFFAFE', 
                        padding: '3px 8px', 
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {r.requestedShift}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>
                        {formatDateDDMMYYYY(r.requestedDate)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '380px' }}>
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 400, lineHeight: 1.45, display: 'block' }}>
                        {r.reason}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span className={`status-pill ${r.status.toLowerCase()}`} style={{ fontSize: '11.5px', fontWeight: 700 }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {r.status === 'Pending' ? (
                        canApprove ? (
                          <button 
                            className="btn btn-success btn-sm" 
                            onClick={() => approveShiftRequest(r.id, currentUser.name)}
                            style={{ 
                              fontSize: '11.5px', 
                              fontWeight: 600, 
                              padding: '5px 12px', 
                              borderRadius: '8px',
                              backgroundColor: '#22C55E',
                              border: 'none',
                              color: '#FFFFFF',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            Approve Swap
                          </button>
                        ) : (
                          <span className="status-pill pending" style={{ fontSize: '11px', fontWeight: 600 }}>
                            Pending HR Review
                          </span>
                        )
                      ) : (
                        <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
                          Approved by {r.approvedBy || 'HR Admin'}
                        </span>
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
