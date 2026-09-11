import React, { useState, useMemo } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  Users, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  BellRing, 
  ChevronRight,
  Filter,
  UserCheck
} from 'lucide-react';
import { calculateEmployeeTaskMetrics, computeDueStatus } from '../../types/tasks';

interface TeamTasksProps {
  onSelectTask: (taskId: string) => void;
}

export const TeamTasks: React.FC<TeamTasksProps> = ({ onSelectTask }) => {
  const { enhancedTasks, employees, departments, currentUser, addNotification } = useHRMS();

  const isManager = currentUser.role === 'Department Manager' || currentUser.role === 'Department Head' || currentUser.role === 'Manager';
  const targetDept = isManager ? currentUser.department : 'All';

  const [selectedDept, setSelectedDept] = useState<string>(targetDept || 'All');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('All');

  // Scoped team members
  const teamMembers = useMemo(() => {
    if (selectedDept !== 'All') {
      return employees.filter(e => e.department === selectedDept);
    }
    if (isManager && currentUser.department) {
      return employees.filter(e => e.department === currentUser.department);
    }
    return employees;
  }, [employees, selectedDept, isManager, currentUser]);

  // Scoped tasks
  const departmentTasks = useMemo(() => {
    return enhancedTasks.filter(t => {
      if (selectedDept !== 'All' && t.department !== selectedDept) return false;
      if (isManager && currentUser.department && t.department !== currentUser.department) return false;
      return true;
    });
  }, [enhancedTasks, selectedDept, isManager, currentUser]);

  // Calculate metrics per team member
  const membersMetrics = useMemo(() => {
    return teamMembers.map(emp => {
      const metrics = calculateEmployeeTaskMetrics(emp.employeeId, departmentTasks);
      return {
        employee: emp,
        metrics
      };
    });
  }, [teamMembers, departmentTasks]);

  // Tasks to display based on selected team member
  const displayedTasks = useMemo(() => {
    if (selectedMemberId === 'All') return departmentTasks;
    return departmentTasks.filter(t => 
      t.assignees.some(a => a.employeeId === selectedMemberId) || t.responsiblePersonId === selectedMemberId
    );
  }, [departmentTasks, selectedMemberId]);

  const handleSendNudge = (empName: string, empId: string) => {
    addNotification({
      title: 'Manager Task Follow-Up Nudge',
      message: `${currentUser.name} requested an expedited progress update on your open tasks.`,
      priority: 'Important',
      category: 'Task'
    });
    alert(`Follow-up notification sent to ${empName} (${empId}).`);
  };

  return (
    <div className="team-tasks-container">
      {/* Header & Department Scope */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} color="#3b82f6" /> Team Tasks & Department Workload
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Monitor team capacity, active assignments, completion rates, and bottlenecks across {selectedDept === 'All' ? 'all authorized teams' : `${selectedDept} department`}.
            </p>
          </div>

          {!isManager && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Department:</span>
              <select 
                value={selectedDept} 
                onChange={e => { setSelectedDept(e.target.value); setSelectedMemberId('All'); }}
                className="form-control"
                style={{ fontSize: '0.82rem', height: '36px' }}
              >
                <option value="All">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Team Members Workload Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {membersMetrics.map(({ employee, metrics }) => {
          const isSelected = selectedMemberId === employee.employeeId;

          return (
            <div 
              key={employee.id} 
              className="card"
              onClick={() => setSelectedMemberId(prev => prev === employee.employeeId ? 'All' : employee.employeeId)}
              style={{ 
                padding: '16px', 
                border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-light)',
                background: isSelected ? '#f8fafc' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {employee.avatar ? (
                    <img 
                      src={employee.avatar} 
                      alt={employee.firstName} 
                      style={{ width: '42px', height: '42px', borderRadius: '99px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '99px',
                      backgroundColor: '#eff6ff',
                      color: '#155DFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: '1px solid #dbeafe',
                      flexShrink: 0
                    }}>
                      {employee.firstName?.[0] || ''}{employee.lastName?.[0] || ''}
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      {employee.firstName} {employee.lastName}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {employee.designation}
                    </span>
                  </div>
                </div>

                <span className={`status-pill ${
                  metrics.workloadLevel === 'Overloaded' ? 'rejected' :
                  metrics.workloadLevel === 'High' ? 'late' : 'present'
                }`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                  {metrics.workloadLevel}
                </span>
              </div>

              {/* Task Counts Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', background: '#f8fafc', padding: '8px', borderRadius: '6px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af' }}>{metrics.totalAssigned}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Assigned</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6' }}>{metrics.inProgressTasks + metrics.openTasks}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Active</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>{metrics.completedTasks}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Done</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: metrics.overdueTasks > 0 ? '#dc2626' : '#64748b' }}>
                    {metrics.overdueTasks}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Overdue</div>
                </div>
              </div>

              {/* Progress & Completion Rate */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Task Completion Rate:</span>
                  <span style={{ fontWeight: 700 }}>{metrics.completionRate}%</span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${metrics.completionRate}%`, 
                      height: '100%', 
                      background: metrics.completionRate > 70 ? '#10b981' : metrics.completionRate > 40 ? '#3b82f6' : '#f59e0b' 
                    }} 
                  />
                </div>
              </div>

              {/* Follow-up button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: isSelected ? '#2563eb' : 'var(--text-muted)', fontWeight: 600 }}>
                  {isSelected ? '✓ Filtered' : 'Click to filter'}
                </span>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendNudge(`${employee.firstName} ${employee.lastName}`, employee.employeeId);
                  }}
                  style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <BellRing size={12} /> Nudge
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actionable Team Tasks Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
            {selectedMemberId === 'All' ? 'All Team Tasks' : `Tasks for Selected Member (${selectedMemberId})`} ({displayedTasks.length})
          </h3>
          {selectedMemberId !== 'All' && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedMemberId('All')}
              style={{ fontSize: '0.75rem' }}
            >
              Clear Member Filter
            </button>
          )}
        </div>

        <div className="table-responsive no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <table className="hrms-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Task Number & Title</th>
                <th>Assignees</th>
                <th>Responsible Lead</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Status</th>
                <th>Progress</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No tasks found for this selection.
                  </td>
                </tr>
              ) : (
                displayedTasks.map(task => {
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
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {task.taskCategory} • {task.department}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {task.assignees.map((a, idx) => (
                            a.employeeAvatar ? (
                              <img 
                                key={a.id || idx}
                                src={a.employeeAvatar}
                                alt={a.employeeName}
                                title={`${a.employeeName} (${a.progressPercentage}% - ${a.individualStatus})`}
                                style={{ 
                                  width: '24px', 
                                  height: '24px', 
                                  borderRadius: '99px', 
                                  border: '2px solid #fff', 
                                  marginLeft: idx > 0 ? '-6px' : '0',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div
                                key={a.id || idx}
                                title={`${a.employeeName} (${a.progressPercentage}% - ${a.individualStatus})`}
                                style={{
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
                                  border: '2px solid #fff',
                                  marginLeft: idx > 0 ? '-6px' : '0',
                                  flexShrink: 0
                                }}
                              >
                                {a.employeeName.charAt(0)}
                              </div>
                            )
                          ))}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#1e293b' }}>
                          {task.responsiblePersonName}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.78rem', color: dueStatus === 'Overdue' ? '#dc2626' : 'inherit', fontWeight: dueStatus === 'Overdue' ? 700 : 400 }}>
                          {task.dueDate}
                        </span>
                      </td>

                      <td>
                        <span className={`priority-pill ${task.priority.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
                          {task.priority}
                        </span>
                      </td>

                      <td style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>
                        <span className={`status-pill ${
                          task.overallStatus === 'COMPLETED' ? 'present' :
                          task.overallStatus === 'CLOSED' ? 'present' :
                          task.overallStatus === 'OVERDUE' ? 'rejected' :
                          task.overallStatus === 'IN PROGRESS' ? 'late' : 'half-day'
                        }`} style={{ fontSize: '0.70rem', padding: '3px 8px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                          {task.overallStatus}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ width: `${task.overallProgress}%`, height: '100%', background: task.overallProgress === 100 ? '#10b981' : '#3b82f6' }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{task.overallProgress}%</span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectTask(task.id)}
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
