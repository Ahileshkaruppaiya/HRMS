import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  CheckSquare, 
  Calendar, 
  User, 
  Building, 
  FileText, 
  Paperclip, 
  Users, 
  Link2, 
  Upload, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { TaskPriority, TaskSourceType, TaskAssignee, TaskAssigneeRole, TaskAssigneeStatus } from '../../types/tasks';

interface NewTaskFormProps {
  onTaskCreated: (taskId: string) => void;
  onCancel: () => void;
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({ onTaskCreated, onCancel }) => {
  const { employees, departments, enhancedTasks, currentUser, createEnhancedTask } = useHRMS();

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];

  // Section 1: Task Identification
  const [taskDate, setTaskDate] = useState<string>(today);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [sourceType, setSourceType] = useState<TaskSourceType>('Direct');
  const [sourceReference, setSourceReference] = useState<string>('');
  const [momNumber, setMomNumber] = useState<string>('');
  const [momItemNumber, setMomItemNumber] = useState<string>('');

  // Section 2: Ownership & Department
  const [responsiblePersonId, setResponsiblePersonId] = useState<string>(
    currentUser.employeeId || employees[0]?.employeeId || 'EMP-001'
  );
  const [department, setDepartment] = useState<string>(
    currentUser.department || departments[0]?.name || 'Engineering'
  );

  // Section 3: Task Planning
  const [taskCategory, setTaskCategory] = useState<string>('Technical');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [startDate, setStartDate] = useState<string>(today);
  const [dueDate, setDueDate] = useState<string>(nextWeek);
  const [reviewDate, setReviewDate] = useState<string>('');
  const [relatedProject, setRelatedProject] = useState<string>('');
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);

  // Section 4: Task Description
  const [description, setDescription] = useState<string>('');
  const [expectedOutput, setExpectedOutput] = useState<string>('');

  // Section 5: Attachments
  const [attachmentsList, setAttachmentsList] = useState<{ fileName: string; fileSize: string; fileType: string; fileUrl: string; uploadedBy: string }[]>([]);
  const [newFileName, setNewFileName] = useState<string>('');

  // Section 6: Multi-Employee Assignment
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([
    currentUser.employeeId || 'EMP-001'
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill department when responsible person changes
  const handleResponsibleChange = (empId: string) => {
    setResponsiblePersonId(empId);
    const emp = employees.find(e => e.employeeId === empId);
    if (emp && emp.department) {
      setDepartment(emp.department);
    }
    if (!assignedEmployeeIds.includes(empId)) {
      setAssignedEmployeeIds(prev => [...prev, empId]);
    }
  };

  // Toggle employee in multi-assignee list
  const toggleAssignee = (empId: string) => {
    setAssignedEmployeeIds(prev => {
      if (prev.includes(empId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(id => id !== empId);
      } else {
        return [...prev, empId];
      }
    });
  };

  const handleAddMockAttachment = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.endsWith('.pdf') || newFileName.endsWith('.docx') ? newFileName : `${newFileName}.pdf`;
    setAttachmentsList(prev => [
      ...prev,
      {
        fileName: name,
        fileSize: '1.4 MB',
        fileType: 'PDF Document',
        fileUrl: '#',
        uploadedBy: currentUser.name
      }
    ]);
    setNewFileName('');
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachmentsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!taskTitle.trim()) newErrors.taskTitle = 'Task title is required.';
    if (!description.trim()) newErrors.description = 'Task description is required.';
    if (!expectedOutput.trim()) newErrors.expectedOutput = 'Expected output criteria is required.';
    if (!dueDate) newErrors.dueDate = 'Due date is required.';
    if (assignedEmployeeIds.length === 0) newErrors.assignees = 'At least one employee must be assigned.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const respEmp = employees.find(e => e.employeeId === responsiblePersonId);

    // Build assignee records
    const assignees: TaskAssignee[] = assignedEmployeeIds.map((empId, idx): TaskAssignee => {
      const emp = employees.find(e => e.employeeId === empId);
      const isResp = empId === responsiblePersonId;
      return {
        id: `ASN-${Date.now()}-${idx}`,
        taskId: '',
        employeeId: empId,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'ASSIGNEE',
        employeeEmail: emp?.email || '',
        employeeDepartment: emp?.department || department,
        employeeAvatar: emp?.avatar || '',
        role: (isResp ? 'RESPONSIBLE' : 'ASSIGNEE') as TaskAssigneeRole,
        individualStatus: 'Pending' as TaskAssigneeStatus,
        progressPercentage: 0,
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    // Create enhanced task
    const created = createEnhancedTask({
      title: taskTitle.trim(),
      taskDate,
      sourceType,
      sourceReference: sourceReference.trim() || undefined,
      momId: sourceType === 'MOM' ? momNumber : undefined,
      momItemNumber: sourceType === 'MOM' ? momItemNumber : undefined,
      createdBy: currentUser.name,
      assignedBy: `${currentUser.name} (${currentUser.role})`,
      responsiblePersonId,
      responsiblePersonName: respEmp ? `${respEmp.firstName} ${respEmp.lastName}` : currentUser.name,
      department,
      taskCategory,
      priority,
      startDate,
      dueDate,
      reviewDate: reviewDate || undefined,
      relatedProject: relatedProject.trim() || undefined,
      dependencyIds: selectedDependencies,
      description: description.trim(),
      expectedOutput: expectedOutput.trim(),
      assignees,
      attachments: attachmentsList as any
    });

    onTaskCreated(created.id);
  };

  return (
    <form onSubmit={handleSubmit} className="new-task-form-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Create New Enterprise Task</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Configure multi-assignee ownership, planning milestones, deliverables, and automated dispatch.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ fontSize: '0.85rem' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={16} /> Create Task
          </button>
        </div>
      </div>

      {/* SECTION 1: TASK IDENTIFICATION */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '99px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
            1
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Section A: Task Identification</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Task Date *</label>
            <input 
              type="date"
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              className="form-control"
              style={{ marginTop: '4px' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Auto Generated Task Number</label>
            <input 
              type="text"
              value={`TSK-2026-${(enhancedTasks.length + 1).toString().padStart(3, '0')}`}
              disabled
              className="form-control"
              style={{ marginTop: '4px', background: '#f8fafc', color: '#1e40af', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Source Type</label>
            <select 
              value={sourceType}
              onChange={e => setSourceType(e.target.value as any)}
              className="form-control"
              style={{ marginTop: '4px' }}
            >
              <option value="Direct">Direct Task</option>
              <option value="MOM">MOM / Meeting Minutes</option>
              <option value="Project">Project Milestone</option>
              <option value="Audit">Audit Finding</option>
              <option value="Incident">Incident Remediation</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Task Title *</label>
          <input 
            type="text"
            placeholder="e.g. Q3 Financial Audit Preparation & Verification"
            value={taskTitle}
            onChange={e => { setTaskTitle(e.target.value); setErrors(prev => ({ ...prev, taskTitle: '' })); }}
            className={`form-control ${errors.taskTitle ? 'is-invalid' : ''}`}
            style={{ marginTop: '4px', fontSize: '0.9rem', fontWeight: 600 }}
            required
          />
          {errors.taskTitle && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.taskTitle}</span>}
        </div>

        {sourceType === 'MOM' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: '#f5f3ff', padding: '12px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6d28d9' }}>MOM Meeting Number</label>
              <input 
                type="text" 
                placeholder="e.g. MOM-2026-04" 
                value={momNumber} 
                onChange={e => setMomNumber(e.target.value)}
                className="form-control"
                style={{ marginTop: '4px', fontSize: '0.8rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6d28d9' }}>MOM Item Number</label>
              <input 
                type="text" 
                placeholder="e.g. AI-02" 
                value={momItemNumber} 
                onChange={e => setMomItemNumber(e.target.value)}
                className="form-control"
                style={{ marginTop: '4px', fontSize: '0.8rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6d28d9' }}>Source Meeting Reference</label>
              <input 
                type="text" 
                placeholder="e.g. Executive Board Strategy Sync" 
                value={sourceReference} 
                onChange={e => setSourceReference(e.target.value)}
                className="form-control"
                style={{ marginTop: '4px', fontSize: '0.8rem' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: OWNERSHIP & CLASSIFICATION */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '99px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
            2
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Section B: Ownership & Department</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Assigned By (Creator)</label>
            <input 
              type="text"
              value={`${currentUser.name} (${currentUser.role})`}
              disabled
              className="form-control"
              style={{ marginTop: '4px', background: '#f8fafc', color: 'var(--text-muted)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Responsible Person (Lead Reviewer) *</label>
            <select 
              value={responsiblePersonId}
              onChange={e => handleResponsibleChange(e.target.value)}
              className="form-control"
              style={{ marginTop: '4px' }}
              required
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.employeeId}>
                  {emp.firstName} {emp.lastName} ({emp.department} - {emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Department *</label>
            <select 
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="form-control"
              style={{ marginTop: '4px' }}
              required
            >
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: TASK PLANNING */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '99px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
            3
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Section C: Task Planning & Milestones</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Task Category</label>
            <select 
              value={taskCategory} 
              onChange={e => setTaskCategory(e.target.value)}
              className="form-control"
              style={{ marginTop: '4px' }}
            >
              <option value="Compliance">Compliance & Audit</option>
              <option value="Technical">Technical & Engineering</option>
              <option value="Operations">Operations & Facilities</option>
              <option value="Strategy">Strategic Initiatives</option>
              <option value="HR">Human Resources</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Priority *</label>
            <select 
              value={priority} 
              onChange={e => setPriority(e.target.value as any)}
              className="form-control"
              style={{ marginTop: '4px', fontWeight: 600 }}
              required
            >
              <option value="Urgent">Urgent / Critical</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Start Date</label>
            <input 
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="form-control"
              style={{ marginTop: '4px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Due Date *</label>
            <input 
              type="date"
              value={dueDate}
              onChange={e => { setDueDate(e.target.value); setErrors(prev => ({ ...prev, dueDate: '' })); }}
              className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
              style={{ marginTop: '4px', fontWeight: 600 }}
              required
            />
            {errors.dueDate && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.dueDate}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Review / Sign-Off Date</label>
            <input 
              type="date"
              value={reviewDate}
              onChange={e => setReviewDate(e.target.value)}
              className="form-control"
              style={{ marginTop: '4px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Related Project</label>
            <input 
              type="text"
              placeholder="e.g. Core Portal Upgrade, Annual External Audit"
              value={relatedProject}
              onChange={e => setRelatedProject(e.target.value)}
              className="form-control"
              style={{ marginTop: '4px' }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: TASK DESCRIPTION & DELIVERABLES */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '99px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
            4
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Section D: Description & Expected Output</h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Detailed Task Description *</label>
          <textarea 
            rows={4}
            placeholder="Explain background, operational requirements, dependencies, and steps to fulfill..."
            value={description}
            onChange={e => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: '' })); }}
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            style={{ marginTop: '4px', resize: 'vertical' }}
            required
          />
          {errors.description && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.description}</span>}
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expected Output / Acceptance Criteria *</label>
          <textarea 
            rows={2}
            placeholder="e.g. Signed verification PDF, zero CVE warnings report, certified audit ledger..."
            value={expectedOutput}
            onChange={e => { setExpectedOutput(e.target.value); setErrors(prev => ({ ...prev, expectedOutput: '' })); }}
            className={`form-control ${errors.expectedOutput ? 'is-invalid' : ''}`}
            style={{ marginTop: '4px', resize: 'vertical' }}
            required
          />
          {errors.expectedOutput && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.expectedOutput}</span>}
        </div>
      </div>

      {/* SECTION 5: ATTACHMENTS */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '99px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
            5
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Section E: Supporting Attachments</h3>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <input 
            type="text" 
            placeholder="File name to attach (e.g. Audit_Requirements_2026.pdf)..."
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            className="form-control"
            style={{ fontSize: '0.85rem' }}
          />
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleAddMockAttachment}
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Upload size={14} /> Add File
          </button>
        </div>

        {attachmentsList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attachmentsList.map((file, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Paperclip size={14} color="#3b82f6" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{file.fileName}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({file.fileSize})</span>
                </div>
                <button type="button" onClick={() => handleRemoveAttachment(idx)} style={{ color: '#ef4444' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 6: MULTI-EMPLOYEE TASK ASSIGNMENT */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '99px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
            6
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Section F: Multi-Employee Assignment ⭐</h3>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Select one or multiple employees from the HRMS directory. Each assignee will receive an independent tracking record with private remarks and evidence submission.
        </p>

        {errors.assignees && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px' }}>
            {errors.assignees}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {employees.map(emp => {
            const isAssigned = assignedEmployeeIds.includes(emp.employeeId);
            const isResponsible = emp.employeeId === responsiblePersonId;

            return (
              <div 
                key={emp.id} 
                onClick={() => toggleAssignee(emp.employeeId)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  border: isAssigned ? '2px solid #3b82f6' : '1px solid var(--border-light)',
                  background: isAssigned ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={emp.avatar} 
                    alt={emp.firstName} 
                    style={{ width: '36px', height: '36px', borderRadius: '99px', objectFit: 'cover' }} 
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                      {emp.firstName} {emp.lastName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {emp.designation} • {emp.department}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    background: isResponsible ? '#dbeafe' : isAssigned ? '#e2e8f0' : '#f1f5f9',
                    color: isResponsible ? '#1e40af' : isAssigned ? '#334155' : '#94a3b8'
                  }}>
                    {isResponsible ? 'Responsible' : isAssigned ? 'Assignee' : 'Unassigned'}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={isAssigned}
                    onChange={() => {}} // Handled by parent div
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Actions Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '30px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ fontSize: '0.9rem', padding: '10px 20px' }}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> Create & Dispatch Task
        </button>
      </div>
    </form>
  );
};
