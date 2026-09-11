import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import {
  BENCHMARK_CONFIG,
  PRODUCT_INCENTIVE_RULES,
  INCENTIVE_SPLIT,
  KPI_WEIGHTS,
  INITIAL_EMPLOYEE_PERFORMANCE,
  INITIAL_DEPARTMENT_PERFORMANCE,
  INITIAL_PIP_RECORDS,
  INITIAL_GOALS,
  INITIAL_REVIEWS
} from '../../data/performanceInitialData';
import {
  EmployeePerformanceDetail,
  DepartmentPerformanceDetail,
  PipRecord,
  GoalItem,
  PerformanceReviewRecord,
  CompanyDepartment,
  PipStatus
} from '../../types/performance';
import { PerformanceDashboardView } from './PerformanceDashboardView';
import { DepartmentPerformanceView } from './DepartmentPerformanceView';
import { KraKpiManagementView } from './KraKpiManagementView';
import { GoalsManagementView } from './GoalsManagementView';
import { PerformanceReviewsView } from './PerformanceReviewsView';
import { PipManagementView } from './PipManagementView';
import { PerformanceReportsView } from './PerformanceReportsView';
import { PerformanceSettingsView } from './PerformanceSettingsView';
import { SinglePersonPerformanceView } from './SinglePersonPerformanceView';
import { EmployeeMyPerformanceView } from './EmployeeMyPerformanceView';
import { EvaluationModal } from './EvaluationModal';
import {
  TrendingUp,
  User,
  Building2,
  Table,
  AlertTriangle,
  Award,
  Target,
  IndianRupee,
  Layers,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Download,
  Clock,
  Briefcase,
  Sliders,
  FileText,
  Settings as SettingsIcon,
  ShieldCheck,
  RefreshCw,
  X,
  Edit2,
  Trash2,
  MoreHorizontal,
  Plus
} from 'lucide-react';

type HRPerformanceTab =
  | 'dashboard'
  | 'all_employees'
  | 'departments'
  | 'kra'
  | 'kpi'
  | 'reviews'
  | 'pip'
  | 'goals'
  | 'appraisal_cycles'
  | 'reports'
  | 'settings'
  | 'single_employee';

export const PerformanceTracking: React.FC = () => {
  const { currentUser } = useHRMS();

  // Role-Based Access Detection
  const isManager = currentUser.role === 'Department Head' || currentUser.role === 'Manager' || currentUser.role === 'Department Manager';
  const managerDept = currentUser.department || 'Sales';

  // Primary State
  const [employees, setEmployees] = useState<EmployeePerformanceDetail[]>(INITIAL_EMPLOYEE_PERFORMANCE);
  const [departments, setDepartments] = useState<DepartmentPerformanceDetail[]>(INITIAL_DEPARTMENT_PERFORMANCE);
  const [pipRecords, setPipRecords] = useState<PipRecord[]>(INITIAL_PIP_RECORDS);
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOALS);
  const [reviews, setReviews] = useState<PerformanceReviewRecord[]>(INITIAL_REVIEWS);

  // Active Navigation Tab for HR/CEO/Manager
  const [activeTab, setActiveTab] = useState<HRPerformanceTab>('dashboard');
  const [selectedDeptForView, setSelectedDeptForView] = useState<CompanyDepartment | string>(isManager ? managerDept : 'Sales');
  const [selectedEmpForProfile, setSelectedEmpForProfile] = useState<string>(INITIAL_EMPLOYEE_PERFORMANCE[0]?.employeeId || '');

  // Evaluation Modal State
  const [evalModalEmployee, setEvalModalEmployee] = useState<EmployeePerformanceDetail | null>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  // All Employees Table State (Standard Table Design System)
  const [tableSearch, setTableSearch] = useState('');
  const [tableDeptFilter, setTableDeptFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [goToPageInput, setGoToPageInput] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Visible employees filtered by Manager RBAC
  const visibleEmployees = isManager
    ? employees.filter(e => e.department.toLowerCase() === managerDept.toLowerCase() || e.department.toLowerCase().includes(managerDept.toLowerCase().split(' ')[0]))
    : employees;

  // ── STRICT RBAC: EMPLOYEE VIEW ──
  // If logged-in user is an Employee, render strictly their self-service portal
  if (currentUser.role === 'Employee') {
    return (
      <EmployeeMyPerformanceView
        employees={employees}
        pipRecords={pipRecords}
        goals={goals}
        reviews={reviews}
        onUpdateGoalProgress={(goalId, newProg) => {
          setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentProgress: newProg } : g));
        }}
      />
    );
  }

  // ── HR / CEO / MANAGER VIEW EVENT HANDLERS ──
  const handleSelectDepartment = (deptName: CompanyDepartment | string) => {
    if (isManager) {
      setSelectedDeptForView(managerDept);
    } else {
      setSelectedDeptForView(deptName);
    }
    setActiveTab('departments');
  };

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpForProfile(empId);
    setActiveTab('single_employee');
  };

  const handleOpenEvaluationModal = (emp: EmployeePerformanceDetail) => {
    setEvalModalEmployee(emp);
    setIsEvalModalOpen(true);
  };

  const handleSaveEvaluation = (updated: EmployeePerformanceDetail) => {
    setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
    setIsEvalModalOpen(false);
  };

  const handleAddPipRecord = (newPip: PipRecord) => {
    setPipRecords(prev => [newPip, ...prev]);
    setEmployees(prev => prev.map(e => 
      e.employeeId === newPip.employeeId 
        ? { ...e, hasActivePip: true, activePipId: newPip.id, performanceStatus: 'Needs Improvement' } 
        : e
    ));
  };

  const handleUpdatePipMilestone = (pipId: string, milestoneId: string, status: 'Completed' | 'In Progress' | 'Pending') => {
    setPipRecords(prev => prev.map(p => {
      if (p.id !== pipId) return p;
      const updatedMilestones = p.milestones.map(m => m.id === milestoneId ? { ...m, status } : m);
      const completedCount = updatedMilestones.filter(m => m.status === 'Completed').length;
      const progressPercentage = Math.round((completedCount / (updatedMilestones.length || 1)) * 100);
      return {
        ...p,
        milestones: updatedMilestones,
        progressPercentage,
        status: progressPercentage === 100 ? 'Successfully Completed' : p.status
      };
    }));
  };

  // ── CSV EXPORT HANDLER ──
  const handleExportCsv = () => {
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Overall Score', 'KRA Score', 'KPI Score', 'Attendance Percent', 'PIP Status'];
    const rows = visibleEmployees.map(e => [
      `"${e.employeeId}"`,
      `"${e.employeeName}"`,
      `"${e.department}"`,
      `"${e.designation}"`,
      `"${e.overallScore}%"`,
      `"${e.kraScore}%"`,
      `"${e.kpiScore}%"`,
      `"${e.attendanceImpact.attendancePercent}%"`,
      `"${e.hasActivePip ? 'Active PIP' : 'Normal'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VRM_Performance_${isManager ? managerDept : 'Company'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── TABLE PAGINATION & SELECTION CALCULATIONS ──
  const deptList = isManager ? [managerDept] : ['ALL', ...Array.from(new Set(employees.map(e => e.department)))];

  const filteredEmployees = visibleEmployees.filter(e => {
    const matchesSearch =
      e.employeeName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(tableSearch.toLowerCase()) ||
      e.designation.toLowerCase().includes(tableSearch.toLowerCase());
    const matchesDept = tableDeptFilter === 'ALL' || e.department.toLowerCase() === tableDeptFilter.toLowerCase();
    return matchesSearch && matchesDept;
  });

  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + rowsPerPage);

  const toggleSelectAll = () => {
    if (selectedRowIds.length === paginatedEmployees.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(paginatedEmployees.map(e => e.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRowIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPageInput('');
    }
  };

  const navTabs: { id: HRPerformanceTab; label: string; icon: any }[] = isManager ? [
    { id: 'dashboard', label: 'Team Dashboard', icon: TrendingUp },
    { id: 'departments', label: `${managerDept} Dept Portal`, icon: Building2 },
    { id: 'all_employees', label: 'Team Members', icon: User },
    { id: 'goals', label: 'Team Goals', icon: CheckCircle2 },
    { id: 'reviews', label: 'Performance Reviews', icon: Award },
    { id: 'pip', label: 'PIP Coaching', icon: AlertTriangle },
    { id: 'reports', label: 'Performance Reports', icon: FileText }
  ] : [
    { id: 'dashboard', label: 'Performance Dashboard', icon: TrendingUp },
    { id: 'all_employees', label: 'All Employees', icon: User },
    { id: 'departments', label: 'Department Performance', icon: Building2 },
    { id: 'kra', label: 'KRA Management', icon: Layers },
    { id: 'kpi', label: 'KPI Management', icon: Target },
    { id: 'reviews', label: 'Performance Reviews', icon: Award },
    { id: 'pip', label: 'PIP Management', icon: AlertTriangle },
    { id: 'goals', label: 'Goals', icon: CheckCircle2 },
    { id: 'appraisal_cycles', label: 'Appraisal Cycles', icon: RefreshCw },
    { id: 'reports', label: 'Performance Reports', icon: FileText },
    { id: 'settings', label: 'Performance Settings', icon: SettingsIcon }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* ── TOP HEADER (MATCHING ADVANCE SALARY MANAGEMENT) ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="page-title-group">
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Performance Management
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {isManager 
              ? `Team Performance Tracking, KRAs, KPIs, Goals & Coaching for ${managerDept} Department` 
              : 'Strategic KRAs, KPIs, Goals, 8 Departmental Portals, Appraisals & Structured PIP Coaching'}
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '12px',
              padding: '9px 16px',
              fontWeight: 600,
              fontSize: '0.84rem'
            }}
            title="Download CSV report of active performance data"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (visibleEmployees[0]) handleOpenEvaluationModal(visibleEmployees[0]);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '12px',
              padding: '9px 18px',
              fontWeight: 700,
              fontSize: '0.84rem',
              backgroundColor: '#0E7490',
              borderColor: '#0E7490',
              boxShadow: '0 2px 8px rgba(14, 116, 144, 0.2)'
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Evaluation</span>
          </button>
        </div>
      </div>

      {/* ── TOP HORIZONTAL SUB-NAV TABS (PILLS MATCHING ADVANCE SALARY MANAGEMENT) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '2px',
        scrollbarWidth: 'none'
      }}>
        {navTabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: isActive ? 700 : 500,
                border: isActive ? '1px solid #0E7490' : '1px solid #E2E8F0',
                backgroundColor: isActive ? '#0E7490' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 8px rgba(14, 116, 144, 0.2)' : 'none'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── ACTIVE TAB CONTENT ROUTING ── */}
      
      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <PerformanceDashboardView
          employees={employees}
          departments={departments}
          onSelectDepartment={handleSelectDepartment}
          onSelectEmployee={handleSelectEmployee}
          onNavigateTab={(tab) => setActiveTab(tab)}
          isManager={isManager}
          managerDepartment={managerDept}
          onOpenEvaluationModal={handleOpenEvaluationModal}
        />
      )}

      {/* 2. ALL EMPLOYEES MASTER DIRECTORY (STANDARD TABLE DESIGN SYSTEM) */}
      {activeTab === 'all_employees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Table Search & Filter Bar (Matching AdvanceSalaryManagement Toolbar) */}
          <div className="card" style={{
            padding: '12px 18px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '380px' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search employee, ID, designation..."
                value={tableSearch}
                onChange={e => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 38px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.82rem',
                  backgroundColor: '#F8FAFC',
                  outline: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={tableDeptFilter}
                onChange={e => {
                  setTableDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.82rem',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                {deptList.map(d => (
                  <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>
                ))}
              </select>

              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Showing {paginatedEmployees.length} of {filteredEmployees.length} records
              </span>
            </div>
          </div>

          {/* Standard VRM Table */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E7ECF3',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ width: '44px', padding: '14px 16px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedRowIds.length === paginatedEmployees.length && paginatedEmployees.length > 0}
                        onChange={toggleSelectAll}
                        style={{ accentColor: '#0E7490', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </th>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Employee</th>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Department</th>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Designation</th>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Overall Score</th>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>KRA Score</th>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>KPI Score</th>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Attendance</th>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map(emp => {
                    const isSelected = selectedRowIds.includes(emp.id);
                    return (
                      <tr
                        key={emp.id}
                        onClick={() => toggleSelectRow(emp.id)}
                        style={{
                          borderBottom: '1px solid #E7ECF3',
                          backgroundColor: isSelected ? '#ECFEFF' : '#FFFFFF',
                          borderLeft: isSelected ? '4px solid #0E7490' : '4px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(emp.id)}
                            style={{ accentColor: '#0E7490', cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: '#0E7490',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 750
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

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                            {emp.department}
                          </span>
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

                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                          {emp.kpiScore}%
                        </td>

                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                          {emp.attendanceImpact.attendancePercent}%
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {emp.hasActivePip ? (
                            <span style={{ padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: 700 }}>
                              Active PIP
                            </span>
                          ) : (
                            <span style={{ padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 700 }}>
                              {emp.performanceStatus}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleSelectEmployee(emp.employeeId)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '8px',
                                backgroundColor: '#ECFEFF',
                                border: '1px solid #A5F3FC',
                                color: '#0E7490',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Profile ›
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEvaluationModal(emp)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '8px',
                                backgroundColor: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                color: '#334155',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Evaluate
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Standardized Pagination Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderTop: '1px solid #E7ECF3',
              backgroundColor: '#FAFCFE',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Left: Rows Per Page Restricted to [5, 10] */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={e => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontWeight: 700
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                  </select>
                </div>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Showing {filteredEmployees.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries
                </span>
              </div>

              {/* Right: Page Navigation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: currentPage === 1 ? '#CBD5E1' : '#334155',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                  title="First Page"
                >
                  <ChevronsLeft size={14} />
                </button>

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: currentPage === 1 ? '#CBD5E1' : '#334155',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0E7490', padding: '4px 8px' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: currentPage === totalPages ? '#CBD5E1' : '#334155',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: currentPage === totalPages ? '#CBD5E1' : '#334155',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                  title="Last Page"
                >
                  <ChevronsRight size={14} />
                </button>

                {/* Go To Page Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Go to</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={goToPageInput}
                    onChange={e => setGoToPageInput(e.target.value)}
                    placeholder="#"
                    style={{ width: '42px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', textAlign: 'center' }}
                  />
                  <button
                    type="button"
                    onClick={handleGoToPage}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#ECFEFF',
                      border: '1px solid #A5F3FC',
                      color: '#0E7490',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Go ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Bar (When rows are checked) */}
          {selectedRowIds.length > 0 && (
            <div style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              borderRadius: '9999px',
              padding: '10px 22px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              zIndex: 900
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>
                {selectedRowIds.length} Selected
              </span>

              <div style={{ height: '16px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

              <button
                type="button"
                onClick={() => {
                  const firstSelected = employees.find(e => selectedRowIds.includes(e.id));
                  if (firstSelected) handleOpenEvaluationModal(firstSelected);
                }}
                style={{ background: 'none', border: 'none', color: '#CFFAFE', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit2 size={14} />
                <span>Evaluate</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRowIds([])}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <X size={15} />
                <span>Clear</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* 3. DEPARTMENT PERFORMANCE (8 DEPARTMENTS) */}
      {activeTab === 'departments' && (
        <DepartmentPerformanceView
          departments={departments}
          employees={employees}
          selectedDepartmentName={isManager ? managerDept : selectedDeptForView}
          onSelectDepartmentName={(name) => {
            if (!isManager) setSelectedDeptForView(name);
          }}
          onSelectEmployee={handleSelectEmployee}
          isManager={isManager}
          managerDepartment={managerDept}
        />
      )}

      {/* 4. KRA & KPI MANAGEMENT */}
      {(activeTab === 'kra' || activeTab === 'kpi') && (
        <KraKpiManagementView
          employees={employees}
          onUpdateEmployees={(updated) => setEmployees(updated)}
        />
      )}

      {/* 5. REVIEWS */}
      {activeTab === 'reviews' && (
        <PerformanceReviewsView
          employees={employees}
          initialReviews={reviews}
          onSelectEmployee={handleSelectEmployee}
        />
      )}

      {/* 6. PIP MANAGEMENT */}
      {activeTab === 'pip' && (
        <PipManagementView
          pipRecords={pipRecords}
          employees={employees}
          onAddPipRecord={handleAddPipRecord}
          onUpdatePipMilestone={handleUpdatePipMilestone}
          onSelectEmployee={handleSelectEmployee}
        />
      )}

      {/* 7. GOALS */}
      {activeTab === 'goals' && (
        <GoalsManagementView
          employees={employees}
          initialGoals={goals}
        />
      )}

      {/* 8. APPRAISAL CYCLES */}
      {activeTab === 'appraisal_cycles' && (
        <PerformanceReviewsView
          employees={employees}
          initialReviews={reviews}
          onSelectEmployee={handleSelectEmployee}
        />
      )}

      {/* 9. REPORTS */}
      {activeTab === 'reports' && (
        <PerformanceReportsView
          employees={employees}
          departments={departments}
          pipRecords={pipRecords}
          goals={goals}
        />
      )}

      {/* 10. SETTINGS */}
      {activeTab === 'settings' && (
        <PerformanceSettingsView />
      )}

      {/* 11. SINGLE EMPLOYEE PROFILE VIEW */}
      {activeTab === 'single_employee' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('all_employees')}
            style={{
              alignSelf: 'flex-start',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#ECFEFF',
              border: '1px solid #A5F3FC',
              color: '#0E7490',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ChevronLeft size={14} />
            <span>Back to All Employees Directory</span>
          </button>

          <SinglePersonPerformanceView
            employees={employees}
            pipRecords={pipRecords}
            selectedEmployeeId={selectedEmpForProfile}
            onOpenEvaluationModal={handleOpenEvaluationModal}
            onOpenPipTracker={() => setActiveTab('pip')}
          />
        </div>
      )}

      {/* Evaluation Modal */}
      {isEvalModalOpen && evalModalEmployee && (
        <EvaluationModal
          isOpen={isEvalModalOpen}
          employee={evalModalEmployee}
          onClose={() => setIsEvalModalOpen(false)}
          onSaveEvaluation={handleSaveEvaluation}
        />
      )}

    </div>
  );
};
