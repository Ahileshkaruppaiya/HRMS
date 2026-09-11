import React, { useState, useMemo } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  User, 
  Building, 
  Layers, 
  CheckSquare, 
  Trash2, 
  AlertTriangle, 
  Link2,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { TaskItemEnhanced, TaskOverallStatus, TaskPriority, computeDueStatus } from '../../types/tasks';
import { TaskFilterModal, TaskFiltersState, initialTaskFiltersState } from './TaskFilterModal';
import { downloadCSV, downloadExcel, downloadPDF } from '../../utils/exportUtils';
import { ExportDropdown } from '../common/ExportDropdown';

interface TaskRegisterProps {
  onSelectTask: (taskId: string) => void;
  onOpenNewTask: () => void;
}

export const TaskRegister: React.FC<TaskRegisterProps> = ({ onSelectTask, onOpenNewTask }) => {
  const { 
    enhancedTasks, 
    employees, 
    departments, 
    currentUser, 
    deleteEnhancedTask,
    closeTask
  } = useHRMS();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterFromDate, setFilterFromDate] = useState<string>('');
  const [filterToDate, setFilterToDate] = useState<string>('');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('All');
  const [filterResponsible, setFilterResponsible] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSource, setFilterSource] = useState<string>('All');
  const [filterDueStatus, setFilterDueStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Dedicated Filter Modal State
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [modalFilters, setModalFilters] = useState<TaskFiltersState>(initialTaskFiltersState);

  const activeModalFilterCount = 
    modalFilters.departments.length +
    modalFilters.priorities.length +
    modalFilters.statuses.length +
    modalFilters.sources.length +
    (modalFilters.dateRange !== 'all' ? 1 : 0);

  // Sorting & Pagination
  const [sortColumn, setSortColumn] = useState<string>('taskNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);



  // Column Visibility Customization
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    taskNumber: true,
    title: true,
    assignees: true,
    responsible: true,
    department: true,
    dueDate: true,
    priority: true,
    overallStatus: true,
    overallProgress: true,
    dueStatus: true,
    actions: true
});

  // Role scoping: Employees view assigned tasks; Managers view department tasks
  const isEmployee = currentUser.role === 'Employee' || currentUser.role === 'Assignee';
  const isManager = currentUser.role === 'Department Manager' || currentUser.role === 'Department Head' || currentUser.role === 'Manager';

  const roleScopedTasks = useMemo(() => {
    if (isEmployee) {
      return enhancedTasks.filter(t => 
        t.assignees.some(a => a.employeeId === (currentUser.employeeId || 'EMP-001')) ||
        t.responsiblePersonId === (currentUser.employeeId || 'EMP-001')
      );
    }
    if (isManager && currentUser.department) {
      return enhancedTasks.filter(t => t.department === currentUser.department);
    }
    return enhancedTasks;
  }, [enhancedTasks, currentUser, isEmployee, isManager]);

  // Comprehensive Filtering & Global Search
  const filteredTasks = useMemo(() => {
    return roleScopedTasks.filter(task => {
      // Global Search: Task No, Title, Employee Name, Department, MOM Number
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesNo = task.taskNumber.toLowerCase().includes(query);
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDept = task.department.toLowerCase().includes(query);
        const matchesMOM = Boolean(task.momId && task.momId.toLowerCase().includes(query));
        const matchesAssignee = task.assignees.some(a => a.employeeName.toLowerCase().includes(query));
        const matchesResp = task.responsiblePersonName.toLowerCase().includes(query);

        if (!matchesNo && !matchesTitle && !matchesDept && !matchesMOM && !matchesAssignee && !matchesResp) {
          return false;
        }
      }

      // Date Range Filters
      if (filterFromDate && task.dueDate && task.dueDate < filterFromDate) return false;
      if (filterToDate && task.dueDate && task.dueDate > filterToDate) return false;

      // Assignee Filter
      if (filterAssignedTo !== 'All') {
        const isAssigned = task.assignees.some(a => a.employeeId === filterAssignedTo);
        if (!isAssigned) return false;
      }

      // Responsible Person Filter
      if (filterResponsible !== 'All' && task.responsiblePersonId !== filterResponsible) return false;

      // Department Filter
      if (filterDept !== 'All' && task.department !== filterDept) return false;

      // Priority Filter
      if (filterPriority !== 'All' && task.priority !== filterPriority) return false;

      // Status Filter
      if (filterStatus !== 'All' && task.overallStatus !== filterStatus) return false;

      // Source Filter
      if (filterSource !== 'All' && task.sourceType !== filterSource) return false;

      // Modal Filters Integration
      if (modalFilters.departments.length > 0 && !modalFilters.departments.includes(task.department)) return false;
      if (modalFilters.priorities.length > 0 && !modalFilters.priorities.includes(task.priority)) return false;
      if (modalFilters.statuses.length > 0 && !modalFilters.statuses.includes(task.overallStatus)) return false;
      if (modalFilters.sources.length > 0 && !modalFilters.sources.includes(task.sourceType)) return false;

      // Due Status Filter
      if (filterDueStatus !== 'All') {
        const dueStat = computeDueStatus(task.dueDate, task.overallStatus);
        if (dueStat !== filterDueStatus) return false;
      }

      // Category Filter
      if (filterCategory !== 'All' && task.taskCategory !== filterCategory) return false;

      return true;
    });
  }, [
    roleScopedTasks,
    searchTerm,
    filterFromDate,
    filterToDate,
    filterAssignedTo,
    filterResponsible,
    filterDept,
    filterPriority,
    filterStatus,
    filterSource,
    filterDueStatus,
    filterCategory
  ]);

  // Sorting
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let valA: any = (a as any)[sortColumn] || '';
      let valB: any = (b as any)[sortColumn] || '';

      if (sortColumn === 'overallProgress') {
        valA = a.overallProgress;
        valB = b.overallProgress;
      } else if (sortColumn === 'assignees') {
        valA = a.assignees.length;
        valB = b.assignees.length;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTasks, sortColumn, sortDirection]);

  // Display all sorted tasks (pagination bar removed)
  const paginatedTasks = sortedTasks;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };


  // Export to Excel, CSV, and PDF
  const getStructuredTaskData = () => {
    const columns = [
      { key: 'taskNumber', label: 'Task Number' },
      { key: 'title', label: 'Title' },
      { key: 'source', label: 'Source' },
      { key: 'department', label: 'Department' },
      { key: 'responsible', label: 'Responsible Person' },
      { key: 'assignees', label: 'Assignees' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' },
      { key: 'progress', label: 'Progress %' },
      { key: 'dueStatus', label: 'Due Status' }
    ];

    const data = filteredTasks.map(t => ({
      taskNumber: t.taskNumber,
      title: t.title,
      source: `${t.sourceType} ${t.momId || ''}`.trim(),
      department: t.department,
      responsible: t.responsiblePersonName,
      assignees: t.assignees.map(a => a.employeeName).join(', '),
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.overallStatus,
      progress: `${t.overallProgress}%`,
      dueStatus: computeDueStatus(t.dueDate, t.overallStatus)
    }));

    return { columns, data };
  };

  const handleExportCSV = () => {
    const { columns, data } = getStructuredTaskData();
    downloadCSV(data, `Task_Register_${new Date().toISOString().split('T')[0]}`, columns);
  };

  const handleExportExcel = () => {
    const { columns, data } = getStructuredTaskData();
    downloadExcel(data, `Task_Register_${new Date().toISOString().split('T')[0]}`, columns);
  };

  const handleExportPDF = () => {
    const { columns, data } = getStructuredTaskData();
    downloadPDF(data, 'Enterprise Task Register Report', `Task_Register_${new Date().toISOString().split('T')[0]}`, columns);
  };

  return (
    <div className="task-register-container">


      {/* Action Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => setShowFilterModal(true)}
            style={{ 
              height: '36px', 
              padding: '0 14px', 
              borderRadius: '10px', 
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '7px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
            }}
          >
            <Filter size={14} color="#0E7490" />
            <span>Filter</span>
            <span style={{ 
              background: activeModalFilterCount > 0 ? '#0E7490' : '#F1F5F9', 
              color: activeModalFilterCount > 0 ? '#ffffff' : '#64748B', 
              fontSize: '0.68rem', 
              fontWeight: 700, 
              padding: '1px 6px', 
              borderRadius: '9999px' 
            }}>
              {activeModalFilterCount}
            </span>
          </button>
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ 
              height: '36px', 
              padding: '0 14px', 
              borderRadius: '10px', 
              border: showAdvancedFilters ? '1px solid #0E7490' : '1px solid #E2E8F0',
              background: showAdvancedFilters ? '#ECFEFF' : '#ffffff',
              color: showAdvancedFilters ? '#0E7490' : '#334155',
              fontSize: '0.8rem', 
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
            }}
          >
            <SlidersHorizontal size={14} /> 
            <span>{showAdvancedFilters ? 'Hide Filters' : 'More Filters'}</span>
          </button>
          <ExportDropdown 
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            label="Download"
          />
        </div>
      </div>

      {/* Global Search & Sticky Primary Filters */}
      <div style={{ 
        padding: '16px 20px', 
        marginBottom: '20px', 
        borderRadius: '14px', 
        border: '1px solid #E2E8F0', 
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
          {/* Global Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text"
              placeholder="Search by Task No, Title, Assignee, MOM#, Dept..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ 
                width: '100%',
                paddingLeft: '38px', 
                paddingRight: '12px',
                height: '40px', 
                fontSize: '0.84rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                color: '#1E293B',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Department Filter */}
          <select 
            value={filterDept} 
            onChange={e => { setFilterDept(e.target.value); setCurrentPage(1); }}
            style={{ 
              width: '100%',
              height: '40px', 
              fontSize: '0.82rem',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#334155',
              padding: '0 12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          {/* Overall Status Filter */}
          <select 
            value={filterStatus} 
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={{ 
              width: '100%',
              height: '40px', 
              fontSize: '0.82rem',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#334155',
              padding: '0 12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          >
            <option value="All">All Overall Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="PARTIALLY COMPLETED">PARTIALLY COMPLETED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>

          {/* Priority Filter */}
          <select 
            value={filterPriority} 
            onChange={e => { setFilterPriority(e.target.value); setCurrentPage(1); }}
            style={{ 
              width: '100%',
              height: '40px', 
              fontSize: '0.82rem',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#334155',
              padding: '0 12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Collapsible Advanced Filters Bar */}
        {showAdvancedFilters && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', 
            gap: '14px', 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: '1px solid #F1F5F9' 
          }}>
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '5px', display: 'block' }}>Assigned To</label>
              <select 
                value={filterAssignedTo} 
                onChange={e => { setFilterAssignedTo(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', height: '38px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#334155', padding: '0 10px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="All">All Assignees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.employeeId}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '5px', display: 'block' }}>Responsible Person</label>
              <select 
                value={filterResponsible} 
                onChange={e => { setFilterResponsible(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', height: '38px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#334155', padding: '0 10px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="All">All Responsible</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.employeeId}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '5px', display: 'block' }}>Source Type</label>
              <select 
                value={filterSource} 
                onChange={e => { setFilterSource(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', height: '38px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#334155', padding: '0 10px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="All">All Sources</option>
                <option value="Direct">Direct</option>
                <option value="MOM">MOM Action Item</option>
                <option value="Project">Project Milestone</option>
                <option value="Audit">Audit Finding</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '5px', display: 'block' }}>Due Status</label>
              <select 
                value={filterDueStatus} 
                onChange={e => { setFilterDueStatus(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', height: '38px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#334155', padding: '0 10px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="All">All Due Statuses</option>
                <option value="On Track">On Track</option>
                <option value="Due Today">Due Today</option>
                <option value="Due Tomorrow">Due Tomorrow</option>
                <option value="Overdue">Overdue</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '5px', display: 'block' }}>From Due Date</label>
              <input 
                type="date" 
                value={filterFromDate} 
                onChange={e => { setFilterFromDate(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', height: '38px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#334155', padding: '0 10px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '5px', display: 'block' }}>To Due Date</label>
              <input 
                type="date" 
                value={filterToDate} 
                onChange={e => { setFilterToDate(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', height: '38px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#334155', padding: '0 10px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Enterprise Task Register Table */}
      <div className="table-responsive no-scrollbar" style={{ 
        background: '#ffffff', 
        borderRadius: '14px', 
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        <table className="hrms-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
              {visibleColumns.taskNumber && (
                <th onClick={() => handleSort('taskNumber')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', width: '95px', minWidth: '95px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left' }}>
                  Task No {sortColumn === 'taskNumber' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
              )}
              {visibleColumns.title && (
                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer', minWidth: '190px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left' }}>
                  Task Title {sortColumn === 'title' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
              )}
              {visibleColumns.assignees && (
                <th style={{ width: '95px', minWidth: '95px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  Assigned To
                </th>
              )}
              {visibleColumns.responsible && (
                <th style={{ width: '115px', minWidth: '115px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  Responsible
                </th>
              )}
              {visibleColumns.department && (
                <th style={{ width: '115px', minWidth: '115px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  Department
                </th>
              )}
              {visibleColumns.dueDate && (
                <th onClick={() => handleSort('dueDate')} style={{ cursor: 'pointer', width: '100px', minWidth: '100px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  Due Date {sortColumn === 'dueDate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
              )}
              {visibleColumns.priority && (
                <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer', width: '85px', minWidth: '85px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  Priority {sortColumn === 'priority' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
              )}
              {visibleColumns.overallStatus && (
                <th onClick={() => handleSort('overallStatus')} style={{ cursor: 'pointer', width: '185px', minWidth: '185px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  Overall Status {sortColumn === 'overallStatus' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
              )}
              {visibleColumns.overallProgress && (
                <th onClick={() => handleSort('overallProgress')} style={{ cursor: 'pointer', width: '105px', minWidth: '105px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  Progress {sortColumn === 'overallProgress' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
              )}
              {visibleColumns.dueStatus && (
                <th style={{ width: '95px', minWidth: '95px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  Due Status
                </th>
              )}
              {visibleColumns.actions && (
                <th style={{ width: '75px', minWidth: '75px', padding: '12px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '56px 16px', color: '#64748B' }}>
                  <CheckSquare size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B' }}>No tasks match current filters</div>
                  <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Try clearing search keywords or preset filters</div>
                </td>
              </tr>
            ) : (
              paginatedTasks.map(task => {
                const dueStatus = computeDueStatus(task.dueDate, task.overallStatus);

                return (
                  <tr 
                    key={task.id} 
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onClick={(e) => {
                      // Don't open modal if action button clicked
                      const target = e.target as HTMLElement;
                      if (target.closest('button')) return;
                      onSelectTask(task.id);
                    }}
                  >
                    {visibleColumns.taskNumber && (
                      <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '12px 10px', textAlign: 'left', minWidth: '95px' }}>
                        <span style={{ 
                          fontWeight: 700, 
                          fontFamily: 'monospace', 
                          fontSize: '0.82rem', 
                          color: '#0E7490',
                          background: '#ECFEFF',
                          padding: '3px 7px',
                          borderRadius: '6px',
                          border: '1px solid #CFFAFE',
                          letterSpacing: '0.02em',
                          display: 'inline-block'
                        }}>
                          {task.taskNumber}
                        </span>
                      </td>
                    )}

                    {visibleColumns.title && (
                      <td style={{ verticalAlign: 'middle', padding: '12px 10px', textAlign: 'left', minWidth: '190px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0F172A', marginBottom: '3px', lineHeight: 1.35 }}>
                          {task.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748B', background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>
                            {task.taskCategory}
                          </span>
                          {task.momId && (
                            <span style={{ fontSize: '0.7rem', color: '#7E22CE', background: '#FAF5FF', border: '1px solid #F3E8FF', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
                              <Link2 size={11} /> {task.momId}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {visibleColumns.assignees && (
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '12px 10px', textAlign: 'left', minWidth: '95px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {task.assignees.slice(0, 3).map((a, idx) => (
                            a.employeeAvatar ? (
                              <img 
                                key={a.id || idx}
                                src={a.employeeAvatar}
                                alt={a.employeeName}
                                title={`${a.employeeName} (${a.progressPercentage}% - ${a.individualStatus})`}
                                style={{ 
                                  width: '26px', 
                                  height: '26px', 
                                  borderRadius: '50%', 
                                  border: '2px solid #fff', 
                                  marginLeft: idx > 0 ? '-7px' : '0',
                                  objectFit: 'cover',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                              />
                            ) : (
                              <div 
                                key={a.id || idx}
                                title={`${a.employeeName} (${a.progressPercentage}% - ${a.individualStatus})`}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  backgroundColor: ['#0E7490', '#3B82F6', '#6366F1', '#8B5CF6'][idx % 4],
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  border: '2px solid #fff',
                                  marginLeft: idx > 0 ? '-7px' : '0',
                                  flexShrink: 0,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                              >
                                {a.employeeName.charAt(0)}
                              </div>
                            )
                          ))}
                          {task.assignees.length > 3 && (
                            <span style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              background: '#E2E8F0', 
                              color: '#475569', 
                              fontSize: '0.65rem', 
                              fontWeight: 700, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              marginLeft: '-7px',
                              border: '2px solid #fff'
                            }}>
                              +{task.assignees.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {visibleColumns.responsible && (
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '12px 10px', textAlign: 'left', minWidth: '115px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#1E293B' }}>
                          {task.responsiblePersonName}
                        </span>
                      </td>
                    )}

                    {visibleColumns.department && (
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '12px 10px', textAlign: 'left', minWidth: '115px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
                          {task.department}
                        </span>
                      </td>
                    )}

                    {visibleColumns.dueDate && (
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '12px 10px', textAlign: 'left', minWidth: '100px' }}>
                        <span style={{ 
                          fontSize: '0.82rem', 
                          fontVariantNumeric: 'tabular-nums',
                          color: dueStatus === 'Overdue' ? '#DC2626' : '#334155', 
                          fontWeight: dueStatus === 'Overdue' ? 700 : 500,
                          background: dueStatus === 'Overdue' ? '#FEE2E2' : '#F8FAFC',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: dueStatus === 'Overdue' ? '1px solid #FECACA' : '1px solid #E2E8F0',
                          display: 'inline-block'
                        }}>
                          {task.dueDate}
                        </span>
                      </td>
                    )}

                    {visibleColumns.priority && (
                      <td style={{ verticalAlign: 'middle', textAlign: 'left', whiteSpace: 'nowrap', padding: '12px 10px', minWidth: '85px' }}>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          display: 'inline-block',
                          letterSpacing: '0.03em',
                          background: 
                            task.priority === 'Urgent' ? '#FEE2E2' :
                            task.priority === 'High' ? '#FFEDD5' :
                            task.priority === 'Medium' ? '#EFF6FF' : '#DCFCE7',
                          color: 
                            task.priority === 'Urgent' ? '#DC2626' :
                            task.priority === 'High' ? '#C2410C' :
                            task.priority === 'Medium' ? '#2563EB' : '#15803D',
                          border: 
                            task.priority === 'Urgent' ? '1px solid #FECACA' :
                            task.priority === 'High' ? '1px solid #FED7AA' :
                            task.priority === 'Medium' ? '1px solid #BFDBFE' : '1px solid #BBF7D0'
                        }}>
                          {task.priority.toUpperCase()}
                        </span>
                      </td>
                    )}

                    {visibleColumns.overallStatus && (
                      <td style={{ verticalAlign: 'middle', textAlign: 'left', whiteSpace: 'nowrap', padding: '12px 10px', minWidth: '185px' }}>
                        <span style={{ 
                          fontSize: '0.69rem', 
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          whiteSpace: 'nowrap',
                          letterSpacing: '0.01em',
                          background: 
                            task.overallStatus === 'COMPLETED' || task.overallStatus === 'CLOSED' ? '#DCFCE7' :
                            task.overallStatus === 'OVERDUE' ? '#FEE2E2' :
                            task.overallStatus === 'IN PROGRESS' ? '#EFF6FF' : '#F1F5F9',
                          color: 
                            task.overallStatus === 'COMPLETED' || task.overallStatus === 'CLOSED' ? '#15803D' :
                            task.overallStatus === 'OVERDUE' ? '#DC2626' :
                            task.overallStatus === 'IN PROGRESS' ? '#1D4ED8' : '#475569',
                          border: 
                            task.overallStatus === 'COMPLETED' || task.overallStatus === 'CLOSED' ? '1px solid #BBF7D0' :
                            task.overallStatus === 'OVERDUE' ? '1px solid #FECACA' :
                            task.overallStatus === 'IN PROGRESS' ? '1px solid #BFDBFE' : '1px solid #E2E8F0'
                        }}>
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            flexShrink: 0,
                            backgroundColor: 
                              task.overallStatus === 'COMPLETED' || task.overallStatus === 'CLOSED' ? '#22C55E' :
                              task.overallStatus === 'OVERDUE' ? '#EF4444' :
                              task.overallStatus === 'IN PROGRESS' ? '#3B82F6' : '#94A3B8'
                          }} />
                          <span style={{ whiteSpace: 'nowrap' }}>
                            {task.overallStatus}
                          </span>
                        </span>
                      </td>
                    )}

                    {visibleColumns.overallProgress && (
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '12px 10px', textAlign: 'left', minWidth: '105px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '55px', height: '6px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${task.overallProgress}%`, 
                                height: '100%', 
                                borderRadius: '9999px',
                                background: task.overallProgress === 100 ? '#10B981' : task.overallProgress > 50 ? '#0E7490' : '#F59E0B' 
                              }} 
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', width: '30px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {task.overallProgress}%
                          </span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.dueStatus && (
                      <td style={{ verticalAlign: 'middle', textAlign: 'left', whiteSpace: 'nowrap', padding: '12px 10px', minWidth: '95px' }}>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 600, 
                          padding: '3px 8px', 
                          borderRadius: '6px',
                          background: dueStatus === 'Overdue' ? '#FEE2E2' : dueStatus === 'Due Today' ? '#FFEDD5' : '#ECFEFF',
                          color: dueStatus === 'Overdue' ? '#DC2626' : dueStatus === 'Due Today' ? '#C2410C' : '#0E7490',
                          border: dueStatus === 'Overdue' ? '1px solid #FECACA' : dueStatus === 'Due Today' ? '1px solid #FED7AA' : '1px solid #CFFAFE',
                          display: 'inline-block'
                        }}>
                          {dueStatus}
                        </span>
                      </td>
                    )}

                    {visibleColumns.actions && (
                      <td style={{ textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap', padding: '12px 10px', minWidth: '75px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button 
                            className="btn btn-sm"
                            onClick={() => onSelectTask(task.id)}
                            title="View Details"
                            style={{ 
                              padding: '4px 7px', 
                              borderRadius: '6px', 
                              border: '1px solid #E2E8F0', 
                              background: '#F8FAFC', 
                              color: '#0E7490',
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          {!isEmployee && (
                            <button 
                              className="btn btn-sm"
                              onClick={() => {
                                if (window.confirm(`Delete task ${task.taskNumber}?`)) {
                                  deleteEnhancedTask(task.id);
                                }
                              }}
                              title="Delete Task"
                              style={{ 
                                padding: '4px 7px', 
                                borderRadius: '6px', 
                                border: '1px solid #FEE2E2', 
                                background: '#FEF2F2', 
                                color: '#DC2626',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>


      {/* Task Filter Modal */}
      <TaskFilterModal 
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        currentFilters={modalFilters}
        onApply={(f) => { setModalFilters(f); setCurrentPage(1); }}
        onReset={() => { setModalFilters(initialTaskFiltersState); setCurrentPage(1); }}
      />
    </div>
  );
};
