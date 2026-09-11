import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  X, 
  CheckSquare, 
  Calendar, 
  User, 
  Building, 
  FileText, 
  MessageSquare, 
  Paperclip, 
  History, 
  Link2, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Send, 
  Upload, 
  FileCheck,
  Check,
  TrendingUp,
  Award
} from 'lucide-react';
import { TaskItemEnhanced, TaskAssigneeStatus, computeDueStatus } from '../../types/tasks';

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, onClose }) => {
  const { 
    enhancedTasks, 
    currentUser, 
    closeTask, 
    reopenTask, 
    addTaskComment, 
    addTaskAttachment,
    updateAssigneeProgress 
  } = useHRMS();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'assignees' | 'updates' | 'comments' | 'attachments' | 'timeline' | 'linked' | 'audit'
  >('overview');

  // Comment input
  const [commentText, setCommentText] = useState<string>('');

  // Attachment input
  const [newFileName, setNewFileName] = useState<string>('');

  // Reopen reason modal
  const [showReopenPrompt, setShowReopenPrompt] = useState<boolean>(false);
  const [reopenReason, setReopenReason] = useState<string>('');

  // Close task confirmation modal
  const [showClosePrompt, setShowClosePrompt] = useState<boolean>(false);
  const [closeRemarks, setCloseRemarks] = useState<string>('');

  // Inline update my progress state
  const [showMyUpdateForm, setShowMyUpdateForm] = useState<boolean>(false);
  const [myProgressInput, setMyProgressInput] = useState<number>(0);
  const [myStatusInput, setMyStatusInput] = useState<TaskAssigneeStatus>('In Progress');
  const [myRemarkInput, setMyRemarkInput] = useState<string>('');

  const task = enhancedTasks.find(t => t.id === taskId);
  if (!task) return null;

  const currentEmpId = currentUser.employeeId || 'EMP-001';
  const myAssignee = task.assignees.find(a => a.employeeId === currentEmpId);

  const isResponsiblePerson = task.responsiblePersonId === currentEmpId;
  const isSuperOrHrAdmin = currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin' || currentUser.role === 'ERP Administrator';
  const canClose = (isResponsiblePerson || isSuperOrHrAdmin) && task.overallStatus !== 'CLOSED';
  const canReopen = (isResponsiblePerson || isSuperOrHrAdmin) && task.overallStatus === 'CLOSED';

  const dueStatus = computeDueStatus(task.dueDate, task.overallStatus);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addTaskComment(task.id, commentText.trim());
    setCommentText('');
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const name = newFileName.endsWith('.pdf') || newFileName.endsWith('.docx') ? newFileName : `${newFileName}.pdf`;
    addTaskAttachment(task.id, {
      fileName: name,
      fileSize: '1.2 MB',
      fileType: 'PDF Document',
      fileUrl: '#',
      uploadedBy: currentUser.name
    });
    setNewFileName('');
  };

  const handleExecuteClose = (e: React.FormEvent) => {
    e.preventDefault();
    closeTask(task.id, currentUser.name, closeRemarks.trim() || 'Verified and approved.');
    setShowClosePrompt(false);
  };

  const handleExecuteReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    reopenTask(task.id, currentUser.name, reopenReason.trim());
    setShowReopenPrompt(false);
  };

  const handleSaveMyProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myAssignee) return;
    updateAssigneeProgress(
      task.id,
      myAssignee.id,
      myProgressInput,
      myStatusInput,
      myRemarkInput.trim() || undefined,
      myAssignee.completionEvidence
    );
    setShowMyUpdateForm(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header Summary Banner */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', padding: '18px 24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#60a5fa' }}>
                {task.taskNumber}
              </span>
              <span className={`status-pill ${
                task.overallStatus === 'COMPLETED' ? 'present' :
                task.overallStatus === 'CLOSED' ? 'present' :
                task.overallStatus === 'OVERDUE' ? 'rejected' :
                task.overallStatus === 'IN PROGRESS' ? 'late' : 'half-day'
              }`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                {task.overallStatus}
              </span>
              <span className={`priority-pill ${task.priority.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
                {task.priority}
              </span>
              {task.sourceType === 'MOM' && (
                <span style={{ background: 'rgba(139, 92, 246, 0.3)', color: '#c4b5fd', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Link2 size={11} /> {task.momId}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              {task.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {canClose && (
              <button 
                className="btn btn-sm"
                onClick={() => setShowClosePrompt(true)}
                style={{ background: '#10b981', color: '#fff', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckCircle2 size={14} /> Verify & Close
              </button>
            )}
            {canReopen && (
              <button 
                className="btn btn-sm"
                onClick={() => setShowReopenPrompt(true)}
                style={{ background: '#f59e0b', color: '#fff', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={14} /> Reopen Task
              </button>
            )}
            <button onClick={onClose} style={{ color: '#fff' }}><X size={22} /></button>
          </div>
        </div>

        {/* 8 Tabs Navigation Bar */}
        <div className="tab-container" style={{ padding: '0 24px', background: '#f8fafc', margin: 0, borderBottom: '1px solid var(--border-light)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'assignees', label: `Assignees (${task.assignees.length})`, icon: User },
            { id: 'updates', label: `Updates (${task.updates.length})`, icon: TrendingUp },
            { id: 'comments', label: `Comments (${task.comments.length})`, icon: MessageSquare },
            { id: 'attachments', label: `Attachments (${task.attachments.length})`, icon: Paperclip },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'linked', label: 'Linked Records', icon: Link2 },
            { id: 'audit', label: `Audit Trail (${task.auditLogs.length})`, icon: ShieldCheck }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id as any)}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', padding: '12px 14px' }}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body" style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Progress Summary Card */}
              <div className="card" style={{ padding: '18px', marginBottom: '20px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>System-Derived Overall Progress:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: task.overallProgress === 100 ? '#10b981' : '#2563eb' }}>
                    {task.overallProgress}%
                  </span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${task.overallProgress}%`, 
                      height: '100%', 
                      background: task.overallProgress === 100 ? '#10b981' : '#3b82f6',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Derived from {task.assignees.length} assigned employee records.
                </div>
              </div>

              {/* Attributes Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Responsible Person</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>{task.responsiblePersonName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>{task.department}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Task Category</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>{task.taskCategory}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Start Date</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>{task.startDate || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: dueStatus === 'Overdue' ? '#dc2626' : 'inherit', marginTop: '2px' }}>
                    {task.dueDate} ({dueStatus})
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned By</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>{task.assignedBy}</div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Task Description</h4>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', fontSize: '0.82rem', lineHeight: '1.6', color: '#334155' }}>
                  {task.description}
                </div>
              </div>

              {/* Expected Output */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Expected Output / Deliverables</h4>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#166534' }}>
                  {task.expectedOutput}
                </div>
              </div>

              {/* Closure Remarks (if closed) */}
              {task.closedAt && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '14px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} /> Verified & Closed on {new Date(task.closedAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '4px' }}>
                    Closed By: <strong>{task.closedBy}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '2px' }}>
                    Remarks: {task.closureRemarks}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ASSIGNEES (MULTI-EMPLOYEE PROGRESS) */}
          {activeTab === 'assignees' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Assigned Employees & Independent Progress</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Every assignee maintains an isolated status and deliverable evidence record.
                  </span>
                </div>

                {myAssignee && !showMyUpdateForm && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setShowMyUpdateForm(true);
                      setMyProgressInput(myAssignee.progressPercentage);
                      setMyStatusInput(myAssignee.individualStatus);
                      setMyRemarkInput(myAssignee.latestRemark || '');
                    }}
                    style={{ fontSize: '0.75rem' }}
                  >
                    Update My Status
                  </button>
                )}
              </div>

              {/* Inline Update Form for Logged In Assignee */}
              {showMyUpdateForm && myAssignee && (
                <form onSubmit={handleSaveMyProgress} className="card" style={{ padding: '16px', marginBottom: '20px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af', marginBottom: '10px' }}>
                    Update My Progress ({currentUser.name})
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Status</label>
                      <select 
                        value={myStatusInput}
                        onChange={e => setMyStatusInput(e.target.value as any)}
                        className="form-control"
                        style={{ height: '34px', fontSize: '0.8rem', marginTop: '2px' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Completed">Completed (100%)</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span>Progress: {myProgressInput}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={myProgressInput}
                        onChange={e => setMyProgressInput(Number(e.target.value))}
                        style={{ width: '100%', marginTop: '6px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Remark / Notes</label>
                    <input 
                      type="text"
                      placeholder="Latest update notes..."
                      value={myRemarkInput}
                      onChange={e => setMyRemarkInput(e.target.value)}
                      className="form-control"
                      style={{ fontSize: '0.8rem', height: '34px', marginTop: '2px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowMyUpdateForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save & Recalculate
                    </button>
                  </div>
                </form>
              )}

              {/* Assignees Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {task.assignees.map(asn => (
                  <div key={asn.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {asn.employeeAvatar ? (
                        <img 
                          src={asn.employeeAvatar} 
                          alt={asn.employeeName} 
                          style={{ width: '44px', height: '44px', borderRadius: '99px', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '99px',
                          backgroundColor: '#eff6ff',
                          color: '#155DFC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          border: '1px solid #dbeafe',
                          flexShrink: 0
                        }}>
                          {asn.employeeName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{asn.employeeName}</span>
                          <span style={{ 
                            fontSize: '0.68rem', 
                            padding: '1px 6px', 
                            borderRadius: '4px',
                            background: asn.role === 'RESPONSIBLE' ? '#dbeafe' : '#f1f5f9',
                            color: asn.role === 'RESPONSIBLE' ? '#1e40af' : '#475569',
                            fontWeight: 700 
                          }}>
                            {asn.role}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {asn.employeeDepartment} • {asn.employeeEmail}
                        </div>
                        {asn.latestRemark && (
                          <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '4px', fontStyle: 'italic' }}>
                            "{asn.latestRemark}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                          <span className={`status-pill ${asn.individualStatus === 'Completed' ? 'present' : asn.individualStatus === 'In Progress' ? 'late' : 'half-day'}`} style={{ fontSize: '0.68rem' }}>
                            {asn.individualStatus}
                          </span>
                          <span style={{ fontWeight: 700 }}>{asn.progressPercentage}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${asn.progressPercentage}%`, 
                              height: '100%', 
                              background: asn.progressPercentage === 100 ? '#10b981' : '#3b82f6' 
                            }} 
                          />
                        </div>
                      </div>

                      {asn.completionEvidence && (
                        <div title={`Evidence: ${asn.completionEvidence.fileName}`} style={{ background: '#ecfdf5', color: '#059669', padding: '6px 8px', borderRadius: '6px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileCheck size={14} /> Evidence Attached
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: UPDATES HISTORY */}
          {activeTab === 'updates' && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>Progress Update Log</h3>
              {task.updates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No historical progress updates recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {task.updates.map(upd => (
                    <div key={upd.id} className="card" style={{ padding: '14px', borderLeft: '4px solid #3b82f6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {upd.employeeAvatar ? (
                            <img src={upd.employeeAvatar} alt={upd.employeeName} style={{ width: '24px', height: '24px', borderRadius: '99px' }} />
                          ) : (
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '99px',
                              backgroundColor: '#155DFC',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {upd.employeeName.charAt(0)}
                            </div>
                          )}
                          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{upd.employeeName}</span>
                          <span style={{ fontSize: '0.72rem', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>{upd.status}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(upd.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '6px' }}>
                        {upd.remarks}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>
                        Progress: {upd.progressPercentage}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMMENTS */}
          {activeTab === 'comments' && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>Discussion Thread</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {task.comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No comments yet. Start the conversation below.
                  </div>
                ) : (
                  task.comments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                      {c.userAvatar ? (
                        <img src={c.userAvatar} alt={c.userName} style={{ width: '32px', height: '32px', borderRadius: '99px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '99px',
                          backgroundColor: '#155DFC',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {c.userName.charAt(0)}
                        </div>
                      )}
                      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', flex: 1, border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div>
                            <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{c.userName}</strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({c.userRole})</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Write a comment or mention team members..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Send size={14} /> Send
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Deliverables & Supporting Documents</h3>
              </div>

              <form onSubmit={handleAddAttachment} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  type="text"
                  placeholder="File name to upload (e.g. Audit_Ledger_v3.pdf)..."
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                />
                <button type="submit" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                  <Upload size={14} /> Upload
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {task.attachments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No attachments uploaded.
                  </div>
                ) : (
                  task.attachments.map(att => (
                    <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Paperclip size={16} color="#3b82f6" />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{att.fileName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {att.fileSize} • Uploaded by {att.uploadedBy}
                          </div>
                        </div>
                      </div>
                      <a href={att.fileUrl} download className="btn btn-secondary btn-sm" style={{ fontSize: '0.72rem' }}>
                        Download
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: TIMELINE */}
          {activeTab === 'timeline' && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Milestone Chronology</h3>
              <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'absolute', left: '8px', top: '4px', bottom: '4px', width: '2px', background: '#e2e8f0' }} />
                {task.timeline.map((event, idx) => (
                  <div key={event.id || idx} style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-24px', 
                      top: '2px', 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '99px', 
                      background: event.iconType === 'closed' ? '#10b981' : event.iconType === 'escalated' ? '#ef4444' : '#3b82f6',
                      border: '3px solid #fff' 
                    }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{event.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>{event.description}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {event.timestamp} • {event.actorName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: LINKED RECORDS */}
          {activeTab === 'linked' && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>Linked Enterprise Records</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="card" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source Reference</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px' }}>
                    {task.sourceType} {task.sourceReference ? `— ${task.sourceReference}` : ''}
                  </div>
                  {task.momId && (
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6d28d9', background: '#f5f3ff', padding: '6px 10px', borderRadius: '6px' }}>
                      Linked MOM Meeting: <strong>{task.momId}</strong> (Item: {task.momItemNumber || 'AI-01'})
                    </div>
                  )}
                </div>

                <div className="card" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Related Project</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px' }}>
                    {task.relatedProject || 'General Operations'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Immutable Audit Log</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tamper-proof history</span>
              </div>

              <div className="table-responsive">
                <table className="hrms-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Module</th>
                      <th>Performed By</th>
                      <th>Old Value</th>
                      <th>New Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {task.auditLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                        <td style={{ fontWeight: 700, fontSize: '0.78rem' }}>{log.action}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.module}</td>
                        <td style={{ fontSize: '0.78rem' }}>
                          {log.performedBy} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({log.performedByRole})</span>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.oldValue}</td>
                        <td style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 600 }}>{log.newValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* REOPEN PROMPT MODAL */}
        {showReopenPrompt && (
          <div className="modal-overlay" style={{ zIndex: 60 }}>
            <div className="modal-content" style={{ maxWidth: '450px' }}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Reopen Task</h3>
                <button onClick={() => setShowReopenPrompt(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleExecuteReopen} className="modal-body" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Please provide a mandatory justification for reopening this closed task. This action will be audited.
                </p>
                <textarea 
                  rows={3}
                  placeholder="Reason for reopening task..."
                  value={reopenReason}
                  onChange={e => setReopenReason(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: '16px' }}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReopenPrompt(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#f59e0b', border: 'none' }}>
                    Confirm Reopen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CLOSE CONFIRMATION PROMPT MODAL */}
        {showClosePrompt && (
          <div className="modal-overlay" style={{ zIndex: 60 }}>
            <div className="modal-content" style={{ maxWidth: '450px' }}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Verify & Close Task</h3>
                <button onClick={() => setShowClosePrompt(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleExecuteClose} className="modal-body" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Confirm that all deliverables and assignee evidence have been reviewed and accepted.
                </p>
                <textarea 
                  rows={3}
                  placeholder="Verification sign-off remarks (e.g. Approved deliverables without exception)..."
                  value={closeRemarks}
                  onChange={e => setCloseRemarks(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: '16px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowClosePrompt(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#10b981', border: 'none' }}>
                    Sign Off & Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
