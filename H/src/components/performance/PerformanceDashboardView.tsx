import React from 'react';
import {
  EmployeePerformanceDetail,
  DepartmentPerformanceDetail,
  CompanyDepartment
} from '../../types/performance';
import { PerformanceTerminologyTooltip } from './PerformanceTerminologyTooltip';
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  Target,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  BarChart3
} from 'lucide-react';

interface PerformanceDashboardViewProps {
  employees: EmployeePerformanceDetail[];
  departments: DepartmentPerformanceDetail[];
  onSelectDepartment: (deptName: CompanyDepartment | string) => void;
  onSelectEmployee: (empId: string) => void;
  onNavigateTab: (tab: any) => void;
  isManager?: boolean;
  managerDepartment?: string;
  onOpenEvaluationModal?: (emp: EmployeePerformanceDetail) => void;
}

export const PerformanceDashboardView: React.FC<PerformanceDashboardViewProps> = ({
  employees,
  departments,
  onSelectDepartment,
  onSelectEmployee,
  onNavigateTab,
  isManager = false,
  managerDepartment = 'Sales',
  onOpenEvaluationModal
}) => {
  // Filter employees if manager
  const visibleEmployees = isManager
    ? employees.filter(e => e.department.toLowerCase() === managerDepartment.toLowerCase() || e.department.toLowerCase().includes(managerDepartment.toLowerCase().split(' ')[0]))
    : employees;

  // Aggregate Metrics
  const totalEmployees = visibleEmployees.length;
  const employeesReviewed = visibleEmployees.filter(e => e.lastEvaluationDate).length;
  const avgPerformance = (visibleEmployees.reduce((acc, e) => acc + e.overallScore, 0) / (totalEmployees || 1)).toFixed(1);
  const avgGoalAchievement = (visibleEmployees.reduce((acc, e) => acc + e.goalScore, 0) / (totalEmployees || 1)).toFixed(1);
  const employeesOnPip = visibleEmployees.filter(e => e.hasActivePip).length;
  const topPerformers = visibleEmployees.filter(e => e.overallScore >= 90);
  const needingImprovement = visibleEmployees.filter(e => e.overallScore < 75 || e.hasActivePip);

  // Auto-flagged employees: scored below target (< 75%) or on PIP across consecutive periods
  const flaggedEmployees = visibleEmployees.filter(e => {
    const isLowRecent = e.overallScore < 75 || e.kpiScore < 75;
    const historyLowCount = (e.monthlyHistory || []).filter(h => h.score < 75).length;
    return isLowRecent && (historyLowCount >= 1 || e.hasActivePip);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* ── AUTO-FLAG NOTIFICATION BANNER (POTENTIAL PIP REVIEW) ── */}
      {flaggedEmployees.length > 0 && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FCD34D',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 6px rgba(245, 158, 11, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#92400E' }}>
                  Auto-Flagged for PIP Review ({flaggedEmployees.length} {flaggedEmployees.length === 1 ? 'Employee' : 'Employees'})
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#FEE2E2',
                  color: '#B91C1C',
                  fontSize: '11px',
                  fontWeight: 750
                }}>
                  Below Target 2+ Cycles
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#B45309', lineHeight: 1.5 }}>
                System alert: <strong>{flaggedEmployees.map(e => `${e.employeeName} (${e.department} - Score ${e.overallScore}%)`).join(', ')}</strong> {flaggedEmployees.length === 1 ? 'has' : 'have'} fallen below KPI target across multiple review periods.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onNavigateTab('pip')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
              }}
            >
              <span>Review & Manage PIP</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── MANAGER TEAM BANNER (IF MANAGER ROLE) ── */}
      {isManager && (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E7ECF3',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#ECFEFF',
              color: '#0E7490',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {managerDepartment} Team Performance Dashboard
                </h2>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#ECFEFF',
                  color: '#0E7490',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  Manager View
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Direct team summary, individual snapshot metrics, goal achievement, and evaluation controls for {managerDepartment} staff.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('departments')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: '#0E7490',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(14, 116, 144, 0.2)'
            }}
          >
            <span>Open Department Page</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
      
      {/* ── 1. TOP SUMMARY CARDS (6 CARDS - MATCHING ADVANCE SALARY MANAGEMENT) ── */}
      <div 
        className="kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '8px'
        }}
      >
        {/* Total Employees */}
        <div 
          className="kpi-card"
          onClick={() => onNavigateTab('all_employees')}
          title="Click to view all employees"
        >
          <div className="kpi-card-header">
            <span>TOTAL EMPLOYEES</span>
            <Users size={20} color="#0E7490" />
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{totalEmployees}</div>
            <div className="kpi-caption" style={{ color: '#0E7490', fontWeight: 600 }}>
              Across 8 Active Departments
            </div>
          </div>
        </div>

        {/* Employees Reviewed */}
        <div 
          className="kpi-card"
          onClick={() => onNavigateTab('reviews')}
          title="Click to view performance reviews"
        >
          <div className="kpi-card-header">
            <span>REVIEWS COMPLETED</span>
            <CheckCircle2 size={20} color="#16A34A" />
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">
              {employeesReviewed} <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 600 }}>/ {totalEmployees}</span>
            </div>
            <div className="kpi-caption" style={{ color: '#16A34A', fontWeight: 600 }}>
              {Math.round((employeesReviewed / totalEmployees) * 100)}% Appraisal Complete
            </div>
          </div>
        </div>

        {/* Average Performance */}
        <div 
          className="kpi-card"
          onClick={() => onNavigateTab('departments')}
          title="Click to view department comparison"
        >
          <div className="kpi-card-header">
            <span>AVG PERFORMANCE SCORE</span>
            <TrendingUp size={20} color="#0E7490" />
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value" style={{ color: '#0E7490' }}>
              {avgPerformance}%
            </div>
            <div className="kpi-caption">
              Benchmark company target: 80%
            </div>
          </div>
        </div>

        {/* Goal Achievement */}
        <div 
          className="kpi-card"
          onClick={() => onNavigateTab('goals')}
          title="Click to view active goals"
        >
          <div className="kpi-card-header">
            <span>GOAL ACHIEVEMENT</span>
            <Target size={20} color="#7C3AED" />
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{avgGoalAchievement}%</div>
            <div className="kpi-caption" style={{ color: '#16A34A', fontWeight: 600 }}>
              On track this cycle
            </div>
          </div>
        </div>

        {/* Employees on PIP */}
        <div 
          className="kpi-card"
          onClick={() => onNavigateTab('pip')}
          title="Click to view PIP coaching"
        >
          <div className="kpi-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>ACTIVE PIP CASES</span>
              <PerformanceTerminologyTooltip term="PIP" />
            </div>
            <AlertTriangle size={20} color={employeesOnPip > 0 ? '#D97706' : '#64748B'} />
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value" style={{ color: employeesOnPip > 0 ? '#B45309' : 'inherit' }}>
              {employeesOnPip}
            </div>
            <div className="kpi-caption">
              Structured weekly coaching
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div 
          className="kpi-card"
          onClick={() => onNavigateTab('all_employees')}
          title="Click to view star performers"
        >
          <div className="kpi-card-header">
            <span>TOP PERFORMERS</span>
            <Award size={20} color="#CA8A04" />
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value" style={{ color: '#16A34A' }}>
              {topPerformers.length}
            </div>
            <div className="kpi-caption">
              Overall score ≥ 90%
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. DEPARTMENT PERFORMANCE COMPARISON (8 DEPARTMENTS) OR MANAGER TEAM SNAPSHOT ── */}
      {!isManager ? (
        <div className="card" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#0E7490" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Department Performance Comparison
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Live evaluation summary across all 8 company departments. Click any department to view full details.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('departments')}
              className="btn btn-secondary"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '0.84rem', 
                fontWeight: 600,
                borderRadius: '12px',
                padding: '8px 16px',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              <span>View All Departments</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Comparison Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Staff</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Overall Score</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>KPI Score</span>
                      <PerformanceTerminologyTooltip term="KPI" />
                    </div>
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>KRA Score</span>
                      <PerformanceTerminologyTooltip term="KRA" />
                    </div>
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Goal Progress</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attendance</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>PIP Staff</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, idx) => (
                  <tr
                    key={dept.id}
                    onClick={() => onSelectDepartment(dept.departmentName)}
                    style={{
                      borderBottom: '1px solid #E7ECF3',
                      cursor: 'pointer',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFCFE',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ECFEFF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#FAFCFE'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#ECFEFF',
                          color: '#0E7490',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '12px'
                        }}>
                          {dept.departmentName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#1E293B', display: 'block' }}>
                            {dept.departmentName}
                          </strong>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            Head: {dept.headName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                      {dept.headcount} members
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          fontWeight: 800,
                          fontSize: '14px',
                          color: dept.avgOverallScore >= 90 ? '#16A34A' : dept.avgOverallScore >= 80 ? '#0E7490' : '#D97706'
                        }}>
                          {dept.avgOverallScore}%
                        </div>
                        <div style={{ width: '60px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(dept.avgOverallScore, 100)}%`,
                            height: '100%',
                            backgroundColor: dept.avgOverallScore >= 90 ? '#16A34A' : dept.avgOverallScore >= 80 ? '#0E7490' : '#D97706',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                      {dept.avgKpiScore}%
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                      {dept.avgKraScore}%
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                      {dept.goalCompletionRate}%
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                      {dept.attendanceImpactScore}%
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {dept.pipCount > 0 ? (
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {dept.pipCount} on PIP
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>None</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDepartment(dept.departmentName);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#ECFEFF',
                          border: '1px solid #A5F3FC',
                          color: '#0E7490',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>View</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* MANAGER VIEW: Team Members Performance Snapshot */
        <div className="card" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#0E7490" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {managerDepartment} Team Roster & Performance Snapshots
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Direct evaluation summary for your team members. Click View Profile to inspect full individual performance profile.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('departments')}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: '12px',
                padding: '8px 16px',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              <span>Detailed Dept Portal</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Team Member</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Designation</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Overall Score</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>KRA Score</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>KPI Score</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Attendance</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleEmployees.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp.employeeId)}
                    style={{
                      borderBottom: '1px solid #E7ECF3',
                      cursor: 'pointer',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFCFE',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ECFEFF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#FAFCFE'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#0E7490',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 750,
                          fontSize: '12px'
                        }}>
                          {emp.employeeName.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '13px', color: '#1E293B', display: 'block' }}>
                            {emp.employeeName}
                          </strong>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            {emp.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                      {emp.designation}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{
                          fontSize: '14px',
                          color: emp.overallScore >= 90 ? '#16A34A' : emp.overallScore >= 80 ? '#0E7490' : '#D97706'
                        }}>
                          {emp.overallScore}%
                        </strong>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          ({emp.performanceGrade})
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                      {emp.kraScore}%
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>
                      {emp.kpiScore}%
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                      {emp.attendanceImpact.attendancePercent}%
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {emp.hasActivePip ? (
                        <span style={{ padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#FEE2E2', color: '#B91C1C', fontSize: '11px', fontWeight: 750 }}>
                          Active PIP
                        </span>
                      ) : (
                        <span style={{ padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 700 }}>
                          {emp.performanceStatus}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEmployee(emp.employeeId);
                        }}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#ECFEFF',
                          border: '1px solid #A5F3FC',
                          color: '#0E7490',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Profile</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3. DUAL COLUMN: TOP PERFORMERS & EMPLOYEES NEEDING IMPROVEMENT ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* Top Performers Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E7ECF3',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Top Performers (Score ≥ 90%)
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16A34A' }}>
              {topPerformers.length} Star Performers
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topPerformers.slice(0, 4).map(emp => (
              <div
                key={emp.id}
                onClick={() => onSelectEmployee(emp.employeeId)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ECFEFF'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#0E7490',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {emp.employeeName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      {emp.employeeName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {emp.designation} • {emp.department}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    fontSize: '12px',
                    fontWeight: 800
                  }}>
                    {emp.overallScore}%
                  </span>
                  <span style={{ display: 'block', fontSize: '10px', color: '#64748B' }}>
                    {emp.performanceGrade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attention & PIP List */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E7ECF3',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Employees Needing Attention / PIP
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('pip')}
              style={{ background: 'none', border: 'none', color: '#0E7490', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Open PIP Tracker ›
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {needingImprovement.map(emp => (
              <div
                key={emp.id}
                onClick={() => onSelectEmployee(emp.employeeId)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF3C7'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFBEB'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {emp.employeeName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      {emp.employeeName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {emp.designation} • {emp.department}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#FEE2E2',
                    color: '#B91C1C',
                    fontSize: '12px',
                    fontWeight: 800
                  }}>
                    {emp.overallScore}%
                  </span>
                  <span style={{ display: 'block', fontSize: '10px', color: '#D97706', fontWeight: 700 }}>
                    {emp.hasActivePip ? 'Active PIP' : 'Needs Support'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
