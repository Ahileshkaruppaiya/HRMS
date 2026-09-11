import React, { useState, useMemo } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Upload, 
  MessageSquare, 
  FileText, 
  Sliders, 
  ChevronRight,
  User,
  List,
  Columns,
  CalendarDays,
  X,
  Check
} from 'lucide-react';
import { TaskItemEnhanced, TaskAssigneeStatus, computeDueStatus } from '../../types/tasks';

interface MyTasksProps {
  onSelectTask: (taskId: string) => void;
}

export const MyTasks: React.FC<MyTasksProps> = ({ onSelectTask }) => {
  const { enhancedTasks, currentUser, updateAssigneeProgress } = useHRMS();

  const [activeSection, setActiveSection] = useState<'today' | 'upcoming' | 'in_progress' | 'completed' | 'overdue'>('in_progress');
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');

  // Modal for Employee to Update their own Assigned Task
  const [updatingTask, setUpdatingTask] = useState<TaskItemEnhanced | null>(null);
  const [myProgressInput, setMyProgressInput] = useState<number>(0);
  const [myStatusInput, setMyStatusInput] = useState<TaskAssigneeStatus>('In Progress');
  const [myRemarkInput, setMyRemarkInput] = useState<string>('');
  const [evidenceFileName, setEvidenceFileName] = useState<string>('');
  const [evidenceDesc, setEvidenceDesc] = useState<string>('');

  const currentEmpId = currentUser.employeeId || 'EMP-001';

  // Tasks assigned to the current employee
  const myAssignedTasks = useMemo(() => {
    return enhancedTasks.filter(task => 
      task.assignees.some(a => a.employeeId === currentEmpId) ||
      task.responsiblePersonId === currentEmpId
    );
  }, [enhancedTasks, currentEmpId]);

  const today = new Date().toISOString().split('T')[0];

  // Section categorization
  const sectionTasks = useMemo(() => {
    return myAssignedTasks.filter(task => {
      const myAssignee = task.assignees.find(a => a.employeeId === currentEmpId);
      const isCompleted = myAssignee?.individualStatus === 'Completed' || myAssignee?.progressPercentage === 100;
      const dueStatus = computeDueStatus(task.dueDate, task.overallStatus);

      if (activeSection === 'today') {
        return task.dueDate === today && !isCompleted;
      }
      if (activeSection === 'upcoming') {
        return task.dueDate > today && !isCompleted;
      }
      if (activeSection === 'in_progress') {
        return (myAssignee?.individualStatus === 'In Progress' || (myAssignee?.progressPercentage || 0) > 0) && !isCompleted;
      }
      if (activeSection === 'completed') {
        return isCompleted || task.overallStatus === 'COMPLETED' || task.overallStatus === 'CLOSED';
      }
      if (activeSection === 'overdue') {
        return dueStatus === 'Overdue' && !isCompleted;
      }
      return true;
    });
  }, [myAssignedTasks, activeSection, currentEmpId, today]);

  // Open the "Update My Status & Progress" modal
  const openUpdateModal = (task: TaskItemEnhanced) => {
    const myAssignee = task.assignees.find(a => a.employeeId === currentEmpId);
    setUpdatingTask(task);
    setMyProgressInput(myAssignee ? myAssignee.progressPercentage : 0);
    setMyStatusInput(myAssignee ? myAssignee.individualStatus : 'In Progress');
    setMyRemarkInput(myAssignee?.latestRemark || '');
    setEvidenceFileName(myAssignee?.completionEvidence?.fileName || '');
    setEvidenceDesc(myAssignee?.completionEvidence?.description || '');
  };

  const handleSaveMyProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingTask) return;

    const myAssignee = updatingTask.assignees.find(a => a.employeeId === currentEmpId);
    if (!myAssignee) return;

    const evidence = evidenceFileName.trim() ? {
      fileName: evidenceFileName.trim(),
      description: evidenceDesc.trim(),
      fileType: 'application/pdf',
      submittedAt: new Date().toISOString()
    } : undefined;

    updateAssigneeProgress(
      updatingTask.id,
      myAssignee.id,
      myProgressInput,
      myStatusInput,
      myRemarkInput.trim() || undefined,
      evidence
    );

    setUpdatingTask(null);
  };

  // Quick mark complete
  const handleQuickMarkComplete = (task: TaskItemEnhanced) => {
    const myAssignee = task.assignees.find(a => a.employeeId === currentEmpId);
    if (!myAssignee) return;

    updateAssigneeProgress(
      task.id,
      myAssignee.id,
      100,
      'Completed',
      'Marked as complete by assignee.',
      myAssignee.completionEvidence
    );
  };

  return (
    <div className="my-tasks-container">
      {/* Header & Sub-Nav */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#3b82f6" /> My Personal Task Workspace
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Track tasks assigned directly to you ({currentUser.name}). Update your individual progress, attach evidence, and submit deliverables.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="tab-container" style={{ margin: 0, borderBottom: 'none' }}>
              <button 
                className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <List size={14} /> List
              </button>
              <button 
                className={`tab-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Columns size={14} /> Kanban
              </button>
              <button 
                className={`tab-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CalendarDays size={14} /> Calendar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Section Quick Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'in_progress', label: 'In Progress', count: myAssignedTasks.filter(t => {
            const a = t.assignees.find(x => x.employeeId === currentEmpId);
            return (a?.individualStatus === 'In Progress' || (a?.progressPercentage || 0) > 0) && a?.progressPercentage !== 100;
          }).length },
          { id: 'today', label: "Today's Tasks", count: myAssignedTasks.filter(t => {
            const a = t.assignees.find(x => x.employeeId === currentEmpId);
            return t.dueDate === today && a?.progressPercentage !== 100;
          }).length },
          { id: 'overdue', label: 'Overdue', count: myAssignedTasks.filter(t => {
            const a = t.assignees.find(x => x.employeeId === currentEmpId);
            return computeDueStatus(t.dueDate, t.overallStatus) === 'Overdue' && a?.progressPercentage !== 100;
          }).length },
          { id: 'upcoming', label: 'Upcoming', count: myAssignedTasks.filter(t => {
            const a = t.assignees.find(x => x.employeeId === currentEmpId);
            return t.dueDate > today && a?.progressPercentage !== 100;
          }).length },
          { id: 'completed', label: 'Completed', count: myAssignedTasks.filter(t => {
            const a = t.assignees.find(x => x.employeeId === currentEmpId);
            return a?.individualStatus === 'Completed' || a?.progressPercentage === 100;
          }).length }
        ].map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as any)}
            className={`btn ${activeSection === sec.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '8px 16px', borderRadius: '8px' }}
          >
            {sec.label} <span style={{ opacity: 0.8, marginLeft: '6px', background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '99px' }}>{sec.count}</span>
          </button>
        ))}
      </div>

      {/* VIEW MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="hrms-table" style={{ width: '100%', minWidth: '920px' }}>
              <thead>
                <tr>
                  <th>Task No & Title</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>My Individual Status</th>
                  <th style={{ width: '180px' }}>My Progress</th>
                  <th>Latest Remark</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sectionTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={36} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                      <div style={{ fontWeight: 600 }}>No tasks in this section</div>
                      <div style={{ fontSize: '0.78rem' }}>You are all caught up!</div>
                    </td>
                  </tr>
                ) : (
                  sectionTasks.map(task => {
                    const myAssignee = task.assignees.find(a => a.employeeId === currentEmpId);
                    const myProgress = myAssignee?.progressPercentage || 0;
                    const myStatus = myAssignee?.individualStatus || 'Pending';
                    const dueStatus = computeDueStatus(task.dueDate, task.overallStatus);

                    return (
                      <tr key={task.id}>
                        <td>
                          <div 
                            style={{ fontWeight: 700, color: '#1e40af', cursor: 'pointer' }}
                            onClick={() => onSelectTask(task.id)}
                          >
                            {task.taskNumber}: {task.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Lead: {task.responsiblePersonName} • {task.department}
                          </div>
                        </td>

                        <td>
                          <span className={`priority-pill ${task.priority.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
                            {task.priority}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: '0.78rem', color: dueStatus === 'Overdue' ? '#dc2626' : 'inherit', fontWeight: dueStatus === 'Overdue' ? 700 : 400 }}>
                            {task.dueDate}
                          </span>
                        </td>

                        <td style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>
                          <span className={`status-pill ${
                            myStatus === 'Completed' ? 'present' :
                            myStatus === 'In Progress' ? 'late' : 'half-day'
                          }`} style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', display: 'inline-block' }}>
                            {myStatus}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  width: `${myProgress}%`, 
                                  height: '100%', 
                                  background: myProgress === 100 ? '#10b981' : myProgress > 50 ? '#3b82f6' : '#f59e0b',
                                  transition: 'width 0.3s ease'
                                }} 
                              />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, width: '35px', textAlign: 'right' }}>
                              {myProgress}%
                            </span>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {myAssignee?.latestRemark ? `"${myAssignee.latestRemark.slice(0, 30)}..."` : 'No remarks yet'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => openUpdateModal(task)}
                              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            >
                              Update Progress
                            </button>
                            {myProgress < 100 && (
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleQuickMarkComplete(task)}
                                title="Mark Complete"
                                style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#10b981' }}
                              >
                                <Check size={14} />
                              </button>
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
      )}

      {/* VIEW MODE 2: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { id: 'Pending', label: 'To Do / Pending', color: '#94a3b8' },
            { id: 'In Progress', label: 'In Progress', color: '#3b82f6' },
            { id: 'Under Review', label: 'Under Review', color: '#f59e0b' },
            { id: 'Completed', label: 'Completed (Done)', color: '#10b981' }
          ].map(col => {
            const colTasks = myAssignedTasks.filter(task => {
              const myAssignee = task.assignees.find(a => a.employeeId === currentEmpId);
              return myAssignee?.individualStatus === col.id || (col.id === 'Completed' && myAssignee?.progressPercentage === 100);
            });

            return (
              <div key={col.id} className="kanban-col" style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `3px solid ${col.color}`, paddingBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{col.label}</span>
                  <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.72rem', padding: '1px 6px', borderRadius: '99px', fontWeight: 700 }}>
                    {colTasks.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {colTasks.map(task => {
                    const myAssignee = task.assignees.find(a => a.employeeId === currentEmpId);
                    return (
                      <div key={task.id} className="kanban-card" style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span className={`priority-pill ${task.priority.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>{task.priority}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{task.dueDate}</span>
                        </div>
                        <h4 
                          style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px', cursor: 'pointer' }}
                          onClick={() => onSelectTask(task.id)}
                        >
                          {task.title}
                        </h4>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          {task.taskCategory} • {task.taskNumber}
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '3px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>My Progress:</span>
                            <span style={{ fontWeight: 700 }}>{myAssignee?.progressPercentage || 0}%</span>
                          </div>
                          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ width: `${myAssignee?.progressPercentage || 0}%`, height: '100%', background: col.color }} />
                          </div>
                        </div>

                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => openUpdateModal(task)}
                          style={{ width: '100%', fontSize: '0.75rem', padding: '4px' }}
                        >
                          Update Status
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 3: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>September 2026 Task Deadlines</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', paddingBottom: '6px' }}>
                {d}
              </div>
            ))}
            {Array.from({ length: 30 }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
              const dayTasks = myAssignedTasks.filter(t => t.dueDate === dateStr);

              return (
                <div 
                  key={dayNum}
                  style={{ 
                    minHeight: '80px', 
                    background: dayTasks.length > 0 ? '#eff6ff' : '#f8fafc', 
                    borderRadius: '6px', 
                    border: '1px solid var(--border-light)',
                    padding: '6px'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: dayTasks.length > 0 ? '#1e40af' : '#64748b' }}>
                    {dayNum}
                  </div>
                  {dayTasks.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => onSelectTask(t.id)}
                      style={{ 
                        background: '#3b82f6', 
                        color: '#fff', 
                        fontSize: '0.65rem', 
                        padding: '2px 4px', 
                        borderRadius: '3px', 
                        marginTop: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* UPDATE MY ASSIGNED TASK MODAL */}
      {updatingTask && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Update My Assigned Task Progress</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{updatingTask.taskNumber}: {updatingTask.title}</span>
              </div>
              <button onClick={() => setUpdatingTask(null)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveMyProgress} className="modal-body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>My Individual Status *</label>
                <select 
                  value={myStatusInput}
                  onChange={e => {
                    const newStat = e.target.value as TaskAssigneeStatus;
                    setMyStatusInput(newStat);
                    if (newStat === 'Completed') setMyProgressInput(100);
                  }}
                  className="form-control"
                  style={{ marginTop: '4px' }}
                  required
                >
                  <option value="Pending">Pending / Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Completed">Completed (100%)</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* Progress Slider (0 - 100%) */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Progress Percentage: {myProgressInput}%</label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: myProgressInput === 100 ? '#10b981' : '#3b82f6' }}>
                    {myProgressInput === 100 ? 'Completed' : myProgressInput > 0 ? 'Working' : 'Not Started'}
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={myProgressInput}
                  onChange={e => {
                    const p = Number(e.target.value);
                    setMyProgressInput(p);
                    if (p === 100) setMyStatusInput('Completed');
                    else if (p > 0 && myStatusInput === 'Pending') setMyStatusInput('In Progress');
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Latest Remark / Notes *</label>
                <textarea 
                  rows={3}
                  placeholder="Describe recent milestones achieved, current blockers, or deliverable status..."
                  value={myRemarkInput}
                  onChange={e => setMyRemarkInput(e.target.value)}
                  className="form-control"
                  style={{ marginTop: '4px' }}
                  required
                />
              </div>

              {/* Completion Evidence Upload Section */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} color="#3b82f6" /> Completion Evidence (Optional or for Verification)
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <input 
                    type="text"
                    placeholder="Evidence file name (e.g. Audit_Ledger_Final.pdf)..."
                    value={evidenceFileName}
                    onChange={e => setEvidenceFileName(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    placeholder="Brief description of submitted evidence..."
                    value={evidenceDesc}
                    onChange={e => setEvidenceDesc(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setUpdatingTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Save & Recalculate Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
