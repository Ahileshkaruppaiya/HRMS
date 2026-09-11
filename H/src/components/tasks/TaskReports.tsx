import React, { useState, useMemo } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  BarChart3, 
  Download, 
  Filter, 
  CheckSquare, 
  Calendar, 
  User, 
  Building, 
  AlertTriangle, 
  Clock, 
  FileText,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { computeDueStatus, calculateEmployeeTaskMetrics } from '../../types/tasks';
import { downloadCSV, downloadExcel, downloadPDF } from '../../utils/exportUtils';
import { ExportDropdown } from '../common/ExportDropdown';

export const TaskReports: React.FC = () => {
  const { enhancedTasks, departments, employees, momMeetings } = useHRMS();

  const [activeReport, setActiveReport] = useState<
    'summary' | 'employee_perf' | 'dept_breakdown' | 'overdue_analysis' | 'mom_tracking' | 'escalations' | 'closure_verification' | 'workload_capacity'
  >('summary');

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'q3_2026' | 'this_month'>('all');

  // Filtered tasks based on department
  const filteredTasks = useMemo(() => {
    return enhancedTasks.filter(t => {
      if (selectedDept !== 'All' && t.department !== selectedDept) return false;
      return true;
    });
  }, [enhancedTasks, selectedDept]);

  // Report 1: Department Summary
  const departmentSummaryData = useMemo(() => {
    return departments.map(d => {
      const dTasks = enhancedTasks.filter(t => t.department === d.name);
      const total = dTasks.length;
      const completed = dTasks.filter(t => t.overallStatus === 'COMPLETED' || t.overallStatus === 'CLOSED').length;
      const inProgress = dTasks.filter(t => t.overallStatus === 'IN PROGRESS' || t.overallStatus === 'PARTIALLY COMPLETED').length;
      const open = dTasks.filter(t => t.overallStatus === 'OPEN').length;
      const overdue = dTasks.filter(t => computeDueStatus(t.dueDate, t.overallStatus) === 'Overdue').length;
      const avgProgress = total > 0 ? Math.round(dTasks.reduce((sum, t) => sum + t.overallProgress, 0) / total) : 0;
      const compRate = total > 0 ? Math.round((completed / total) * 100) : 100;

      return {
        department: d.name,
        total,
        completed,
        inProgress,
        open,
        overdue,
        avgProgress,
        compRate
      };
    });
  }, [departments, enhancedTasks]);

  // Report 2: Employee Task Performance
  const employeePerfData = useMemo(() => {
    const list = selectedDept === 'All' ? employees : employees.filter(e => e.department === selectedDept);

    return list.map(emp => {
      const metrics = calculateEmployeeTaskMetrics(emp.employeeId, filteredTasks);
      return {
        employee: emp,
        metrics
      };
    });
  }, [employees, filteredTasks, selectedDept]);

  // Report 4: Overdue Task Analysis
  const overdueAnalysisData = useMemo(() => {
    const today = new Date();

    return filteredTasks.filter(t => {
      const due = computeDueStatus(t.dueDate, t.overallStatus);
      return due === 'Overdue' && t.overallStatus !== 'CLOSED';
    }).map(t => {
      const dueDate = new Date(t.dueDate);
      const daysOverdue = Math.max(1, Math.round((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24)));

      return {
        task: t,
        daysOverdue
      };
    });
  }, [filteredTasks]);

  // Report 7: Closure & Verification Report
  const closureData = useMemo(() => {
    return filteredTasks.filter(t => t.overallStatus === 'CLOSED' || t.closedAt);
  }, [filteredTasks]);

  // Export to CSV, Excel, and PDF
  const getStructuredTaskReportData = () => {
    let columns: { key: string; label: string }[] = [];
    let data: Record<string, any>[] = [];

    if (activeReport === 'summary') {
      columns = [
        { key: 'department', label: 'Department' },
        { key: 'total', label: 'Total Tasks' },
        { key: 'completed', label: 'Completed' },
        { key: 'inProgress', label: 'In Progress' },
        { key: 'open', label: 'Open' },
        { key: 'overdue', label: 'Overdue' },
        { key: 'avgProgress', label: 'Avg Progress %' },
        { key: 'compRate', label: 'Completion Rate %' }
      ];
      data = departmentSummaryData.map(d => ({
        department: d.department,
        total: d.total,
        completed: d.completed,
        inProgress: d.inProgress,
        open: d.open,
        overdue: d.overdue,
        avgProgress: `${d.avgProgress}%`,
        compRate: `${d.compRate}%`
      }));
    } else if (activeReport === 'employee_perf') {
      columns = [
        { key: 'name', label: 'Employee Name' },
        { key: 'department', label: 'Department' },
        { key: 'totalAssigned', label: 'Total Assigned' },
        { key: 'completed', label: 'Completed' },
        { key: 'inProgress', label: 'In Progress' },
        { key: 'overdue', label: 'Overdue' },
        { key: 'completionRate', label: 'Completion Rate %' },
        { key: 'workload', label: 'Workload' }
      ];
      data = employeePerfData.map(item => ({
        name: `${item.employee.firstName} ${item.employee.lastName}`,
        department: item.employee.department,
        totalAssigned: item.metrics.totalAssigned,
        completed: item.metrics.completedTasks,
        inProgress: item.metrics.inProgressTasks,
        overdue: item.metrics.overdueTasks,
        completionRate: `${item.metrics.completionRate}%`,
        workload: item.metrics.workloadLevel
      }));
    } else {
      columns = [
        { key: 'taskNumber', label: 'Task Number' },
        { key: 'title', label: 'Title' },
        { key: 'department', label: 'Department' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
        { key: 'progress', label: 'Progress %' }
      ];
      data = filteredTasks.map(t => ({
        taskNumber: t.taskNumber,
        title: t.title,
        department: t.department,
        priority: t.priority,
        status: t.overallStatus,
        progress: `${t.overallProgress}%`
      }));
    }

    return { columns, data };
  };

  const handleExportCSV = () => {
    const { columns, data } = getStructuredTaskReportData();
    downloadCSV(data, `Task_Report_${activeReport}_${new Date().toISOString().split('T')[0]}`, columns);
  };

  const handleExportExcel = () => {
    const { columns, data } = getStructuredTaskReportData();
    downloadExcel(data, `Task_Report_${activeReport}_${new Date().toISOString().split('T')[0]}`, columns);
  };

  const handleExportPDF = () => {
    const { columns, data } = getStructuredTaskReportData();
    downloadPDF(data, `Task Analytics Report (${activeReport.replace(/_/g, ' ').toUpperCase()})`, `Task_Report_${activeReport}_${new Date().toISOString().split('T')[0]}`, columns);
  };

  return (
    <div className="task-reports-container">
      {/* Header & Global Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={22} color="#3b82f6" /> Task Module Analytical Reports
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Comprehensive enterprise audit reports, departmental metrics, employee velocity scorecards, and capacity planning.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <select 
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="form-control"
              style={{ fontSize: '0.82rem', height: '36px' }}
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <ExportDropdown 
              onExportExcel={handleExportExcel}
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
              label="Download"
            />
          </div>
        </div>
      </div>

      {/* 8 Report Selection Tabs */}
      <div className="tab-container" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'summary', label: '1. Department Summary' },
          { id: 'employee_perf', label: '2. Employee Scorecard' },
          { id: 'overdue_analysis', label: '3. Overdue Deep-Dive' },
          { id: 'mom_tracking', label: '4. MOM Action Items' },
          { id: 'closure_verification', label: '5. Closure & Sign-Offs' },
          { id: 'workload_capacity', label: '6. Workload & Capacity' }
        ].map(r => (
          <button
            key={r.id}
            className={`tab-btn ${activeReport === r.id ? 'active' : ''}`}
            onClick={() => setActiveReport(r.id as any)}
            style={{ fontSize: '0.8rem' }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* REPORT 1: DEPARTMENT SUMMARY */}
      {activeReport === 'summary' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total Tasks</th>
                  <th>Completed</th>
                  <th>In Progress</th>
                  <th>Open</th>
                  <th>Overdue</th>
                  <th>Average Progress</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {departmentSummaryData.map(d => (
                  <tr key={d.department}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{d.department}</td>
                    <td style={{ fontWeight: 600 }}>{d.total}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{d.completed}</td>
                    <td style={{ color: '#3b82f6' }}>{d.inProgress}</td>
                    <td style={{ color: '#64748b' }}>{d.open}</td>
                    <td style={{ color: d.overdue > 0 ? '#dc2626' : 'inherit', fontWeight: d.overdue > 0 ? 700 : 400 }}>
                      {d.overdue}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${d.avgProgress}%`, height: '100%', background: '#3b82f6' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{d.avgProgress}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${d.compRate >= 80 ? 'present' : d.compRate >= 50 ? 'late' : 'rejected'}`} style={{ fontSize: '0.7rem' }}>
                        {d.compRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: EMPLOYEE TASK SCORECARD */}
      {activeReport === 'employee_perf' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Total Assigned</th>
                  <th>Completed</th>
                  <th>In Progress</th>
                  <th>Overdue</th>
                  <th>Completion Rate</th>
                  <th>Capacity Level</th>
                </tr>
              </thead>
              <tbody>
                {employeePerfData.map(({ employee, metrics }) => (
                  <tr key={employee.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {employee.avatar ? (
                          <img src={employee.avatar} alt={employee.firstName} style={{ width: '28px', height: '28px', borderRadius: '99px' }} />
                        ) : (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '99px',
                            backgroundColor: '#eff6ff',
                            color: '#155DFC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            flexShrink: 0,
                            border: '1px solid #dbeafe'
                          }}>
                            {employee.firstName?.[0] || ''}{employee.lastName?.[0] || ''}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{employee.firstName} {employee.lastName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{employee.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td>{employee.department}</td>
                    <td style={{ fontWeight: 700 }}>{metrics.totalAssigned}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{metrics.completedTasks}</td>
                    <td style={{ color: '#3b82f6' }}>{metrics.inProgressTasks}</td>
                    <td style={{ color: metrics.overdueTasks > 0 ? '#dc2626' : 'inherit', fontWeight: metrics.overdueTasks > 0 ? 700 : 400 }}>
                      {metrics.overdueTasks}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${metrics.completionRate}%`, height: '100%', background: metrics.completionRate >= 70 ? '#10b981' : '#f59e0b' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{metrics.completionRate}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${
                        metrics.workloadLevel === 'Overloaded' ? 'rejected' :
                        metrics.workloadLevel === 'High' ? 'late' : 'present'
                      }`} style={{ fontSize: '0.68rem' }}>
                        {metrics.workloadLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: OVERDUE DEEP-DIVE */}
      {activeReport === 'overdue_analysis' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Task No & Title</th>
                  <th>Department</th>
                  <th>Responsible Person</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Assignees Pending</th>
                  <th>Overall Progress</th>
                </tr>
              </thead>
              <tbody>
                {overdueAnalysisData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#10b981', fontWeight: 600 }}>
                      ✓ Zero overdue tasks found! Outstanding performance.
                    </td>
                  </tr>
                ) : (
                  overdueAnalysisData.map(({ task, daysOverdue }) => (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#dc2626' }}>{task.taskNumber}: {task.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{task.taskCategory}</div>
                      </td>
                      <td>{task.department}</td>
                      <td>{task.responsiblePersonName}</td>
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>{task.dueDate}</td>
                      <td>
                        <span style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                          +{daysOverdue} days
                        </span>
                      </td>
                      <td>
                        {task.assignees.filter(a => a.individualStatus !== 'Completed').map(a => a.employeeName).join(', ')}
                      </td>
                      <td>{task.overallProgress}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: MOM ACTION ITEM TRACKING */}
      {activeReport === 'mom_tracking' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Meeting No</th>
                  <th>Meeting Title</th>
                  <th>Action Item</th>
                  <th>Department</th>
                  <th>Due Date</th>
                  <th>Task Generated</th>
                  <th>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {momMeetings.flatMap(m => 
                  m.actionItems.map(item => {
                    const linked = item.linkedTaskId ? enhancedTasks.find(t => t.id === item.linkedTaskId) : null;
                    return (
                      <tr key={item.id}>
                        <td><code>{m.meetingNumber}</code></td>
                        <td>{m.meetingTitle}</td>
                        <td>
                          <strong>{item.itemNumber}:</strong> {item.title}
                        </td>
                        <td>{item.department}</td>
                        <td>{item.dueDate}</td>
                        <td>
                          {linked ? (
                            <span style={{ color: '#2563eb', fontWeight: 600 }}>{linked.taskNumber}</span>
                          ) : (
                            <span style={{ color: '#64748b' }}>None</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill ${item.status === 'Completed' ? 'present' : item.status === 'Task Created' ? 'late' : 'half-day'}`} style={{ fontSize: '0.7rem' }}>
                            {item.status}
                          </span>
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

      {/* REPORT 5: CLOSURE & SIGN-OFFS */}
      {activeReport === 'closure_verification' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Task No & Title</th>
                  <th>Responsible Person</th>
                  <th>Department</th>
                  <th>Closed On</th>
                  <th>Closed By</th>
                  <th>Sign-Off Remarks</th>
                </tr>
              </thead>
              <tbody>
                {closureData.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No verified closed tasks recorded yet.
                    </td>
                  </tr>
                ) : (
                  closureData.map(task => (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#15803d' }}>{task.taskNumber}: {task.title}</div>
                      </td>
                      <td>{task.responsiblePersonName}</td>
                      <td>{task.department}</td>
                      <td>{task.closedAt ? new Date(task.closedAt).toLocaleDateString() : 'N/A'}</td>
                      <td><strong>{task.closedBy || 'Responsible Person'}</strong></td>
                      <td>{task.closureRemarks || 'Verified and completed.'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 6: WORKLOAD & CAPACITY */}
      {activeReport === 'workload_capacity' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>Workload Distribution Spectrum</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {['Light', 'Normal', 'High', 'Overloaded'].map(level => {
              const matches = employeePerfData.filter(e => e.metrics.workloadLevel === level);
              return (
                <div key={level} className="card" style={{ padding: '16px', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{level} Capacity</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0', color: level === 'Overloaded' ? '#dc2626' : level === 'High' ? '#f59e0b' : '#10b981' }}>
                    {matches.length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Employees in band</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
