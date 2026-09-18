import React, { useState, useMemo } from 'react';
import { 
  ComputedEmployeePerformance, 
  CompanyPerformanceSummary 
} from './performanceEngine';
import { PerformancePillarBarChart } from './charts/PerformancePillarBarChart';
import { PerformanceSpeedometerGauge } from './charts/PerformanceSpeedometerGauge';
import { DEPARTMENT_TEMPLATES } from '../../data/performanceInitialData';
import { 
  Award, 
  CalendarCheck, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Eye, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Download,
  Filter,
  Target,
  Clock,
  Briefcase,
  Layers,
  ChevronDown
} from 'lucide-react';

interface Props {
  companySummary: CompanyPerformanceSummary;
  employeeProfiles: ComputedEmployeePerformance[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  selectedEmployeeId: string;
  onEmployeeChange: (empId: string) => void;
  onViewEmployeeDetail: (empId: string) => void;
}

export const PerformanceDashboardView: React.FC<Props> = ({
  companySummary,
  employeeProfiles,
  selectedMonth,
  onMonthChange,
  selectedDepartment,
  onDepartmentChange,
  selectedEmployeeId,
  onEmployeeChange,
  onViewEmployeeDetail
}) => {
  // Sub-tabs: 1. Employee KPI, 2. Attendance, 3. KRI / KRA, 4. Team Leaderboard
  const [activeSubTab, setActiveSubTab] = useState<'kpi' | 'attendance' | 'kri' | 'leaderboard'>('kpi');
  
  // Table search & pagination state (strict [5, 10] per design system)
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [goToPageInput, setGoToPageInput] = useState<string>('');

  // Department options
  const departmentOptions = useMemo(() => {
    return ['ALL', 'Sales', 'Accounts', 'Procurement', 'Dispatch', 'Design', 'Finance', 'Technical Support', 'HR'];
  }, []);

  // Filtered employees for table
  const filteredEmployees = useMemo(() => {
    return employeeProfiles.filter(emp => {
      // Department filter
      if (selectedDepartment !== 'ALL' && emp.department.toLowerCase() !== selectedDepartment.toLowerCase()) {
        return false;
      }
      // Employee filter (from top bar if selected)
      if (selectedEmployeeId !== 'ALL' && emp.employeeId !== selectedEmployeeId) {
        return false;
      }
      // Search
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim();
        const matchName = emp.name.toLowerCase().includes(q);
        const matchId = emp.employeeId.toLowerCase().includes(q);
        const matchDept = emp.department.toLowerCase().includes(q);
        const matchDesig = emp.designation.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDept && !matchDesig) return false;
      }
      return true;
    });
  }, [employeeProfiles, selectedDepartment, selectedEmployeeId, tableSearch]);

  // Pagination logic
  const totalEntries = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(goToPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setGoToPageInput('');
    }
  };

  // Get department KPI/KRI data
  const currentDeptTemplate = useMemo(() => {
    const targetDept = selectedDepartment === 'ALL' ? 'Sales' : selectedDepartment;
    return DEPARTMENT_TEMPLATES.find(d => d.department.toLowerCase() === targetDept.toLowerCase()) || DEPARTMENT_TEMPLATES[1];
  }, [selectedDepartment]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ======================================================== */}
      {/* TOP HEADER SECTION (Matching Reference Image)            */}
      {/* ======================================================== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Performance Overview
          </h1>
          <p style={{
            fontSize: '0.84rem',
            color: '#64748B',
            fontWeight: 500,
            margin: '3px 0 0'
          }}>
            Your current employee KPI, attendance summary and KRI activity
          </p>
        </div>

        {/* Action Controls Right: Period Selector, Export & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Time Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedMonth}
              onChange={e => onMonthChange(e.target.value)}
              style={{
                padding: '8px 32px 8px 14px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                background: '#FFFFFF',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              <option value="September 2026">This Month (Sep 2026)</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
              <option value="Q3 2026">Q3 2026</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#64748B'
              }}
            />
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={() => alert(`Exporting Performance & KPI Report for ${selectedMonth}...`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
          >
            <Download size={15} />
            <span>Export</span>
          </button>

          {/* Department Filter Selector */}
          <select
            value={selectedDepartment}
            onChange={e => {
              onDepartmentChange(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#334155',
              background: '#FFFFFF',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <option value="ALL">All Departments</option>
            {departmentOptions.filter(d => d !== 'ALL').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Quick Employee Selector Dropdown */}
          <select
            value={selectedEmployeeId}
            onChange={e => {
              const val = e.target.value;
              onEmployeeChange(val);
              if (val !== 'ALL') {
                onViewEmployeeDetail(val);
              }
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#334155',
              background: '#FFFFFF',
              outline: 'none',
              cursor: 'pointer',
              maxWidth: '180px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <option value="ALL">All Employees</option>
            {employeeProfiles.map(emp => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 HERO KPI CARDS (Compact Sizing)                        */}
      {/* ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px'
      }}>
        {/* CARD 1: PRIMARY TEAL HERO CARD (Matching Blue Hero Card in Image) */}
        <div style={{
          background: 'linear-gradient(135deg, #0E7490 0%, #0891B2 100%)',
          borderRadius: '14px',
          padding: '14px 18px',
          color: '#FFFFFF',
          boxShadow: '0 6px 18px -4px rgba(14, 116, 144, 0.25), 0 2px 6px -2px rgba(14, 116, 144, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Row: Title & Circular White Icon Pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#E0F2FE' }}>
              Overall KRI Score
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#FFFFFF',
              color: '#0E7490',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)'
            }}>
              <Award size={16} />
            </div>
          </div>

          {/* Big Number & Trend Badge */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {companySummary.overallScore}%
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 750,
              background: 'rgba(255, 255, 255, 0.22)',
              color: '#FFFFFF',
              padding: '2px 7px',
              borderRadius: '9999px',
              backdropFilter: 'blur(4px)'
            }}>
              ↑ 4.9%
            </span>
          </div>

          {/* Footer Meta */}
          <div style={{ fontSize: '0.72rem', color: '#CFFAFE', fontWeight: 500 }}>
            Last month: 84.5% • Grade A+
          </div>
        </div>

        {/* CARD 2: EMPLOYEE KPI TARGET (White Card with Dark Pill) */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '14px 18px',
          border: '1px solid #E7ECF3',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
              Employee KPI Met
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#0F172A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={16} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
              110
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 750,
              background: '#EFF6FF',
              color: '#2563EB',
              padding: '2px 7px',
              borderRadius: '9999px'
            }}>
              ↑ 7.5%
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
            Last month: 89 completed targets
          </div>
        </div>

        {/* CARD 3: ATTENDANCE & PUNCTUALITY (White Card with Blue Pill) */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '14px 18px',
          border: '1px solid #E7ECF3',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
              Attendance Rate
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#0284C7',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CalendarCheck size={16} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {companySummary.averageAttendance}%
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 750,
              background: '#DCFCE7',
              color: '#15803D',
              padding: '2px 7px',
              borderRadius: '9999px'
            }}>
              ↑ 2.1%
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
            Avg 24.2 days present • 98% on-time
          </div>
        </div>

        {/* CARD 4: KRA / KRI RATING (White Card with Teal Circular Pill) */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '14px 18px',
          border: '1px solid #E7ECF3',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
              KRI / KRA Rating
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#0E7490',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={16} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
              4.8 <span style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 600 }}>/ 5.0</span>
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 750,
              background: '#ECFEFF',
              color: '#0E7490',
              padding: '2px 7px',
              borderRadius: '9999px'
            }}>
              Top Tier
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
            Benchmark: 4.2 / 5.0 • High delivery
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TWO-COLUMN ANALYTICS GRID (Matching Reference Layout)     */}
      {/* ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.15fr)',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Left Column: Rounded Pillar Bar Chart with Tooltip */}
        <div style={{ minHeight: '340px' }}>
          <PerformancePillarBarChart
            selectedMonth={selectedMonth}
            onSelectMonth={onMonthChange}
            title="Performance Overview"
          />
        </div>

        {/* Right Column: Semi-Circular Radial Speedometer Gauge */}
        <div style={{ minHeight: '340px' }}>
          <PerformanceSpeedometerGauge
            percentage={companySummary.overallScore}
            label="Goal & KRI Achievement"
            leftStat={{
              label: 'Completed KPIs',
              value: '110 / 125',
              trend: '4.5%',
              isPositive: true
            }}
            rightStat={{
              label: 'Attendance Score',
              value: `${companySummary.averageAttendance}%`,
              trend: '2.1%',
              isPositive: true
            }}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3 USER-REQUESTED DEDICATED SECTIONS / TABS               */}
      {/* 1. Employee KPI | 2. Attendance | 3. KRI | 4. Roster     */}
      {/* ======================================================== */}
      <div className="card" style={{
        borderRadius: '18px',
        padding: '24px',
        border: '1px solid #E7ECF3',
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Navigation Tabs Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '14px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveSubTab('kpi')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: activeSubTab === 'kpi' ? '1px solid #0E7490' : '1px solid transparent',
                background: activeSubTab === 'kpi' ? '#ECFEFF' : 'transparent',
                color: activeSubTab === 'kpi' ? '#0E7490' : '#64748B'
              }}
            >
              <Target size={15} />
              <span>1. Employee KPI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('attendance')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: activeSubTab === 'attendance' ? '1px solid #0E7490' : '1px solid transparent',
                background: activeSubTab === 'attendance' ? '#ECFEFF' : 'transparent',
                color: activeSubTab === 'attendance' ? '#0E7490' : '#64748B'
              }}
            >
              <CalendarCheck size={15} />
              <span>2. Attendance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('kri')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: activeSubTab === 'kri' ? '1px solid #0E7490' : '1px solid transparent',
                background: activeSubTab === 'kri' ? '#ECFEFF' : 'transparent',
                color: activeSubTab === 'kri' ? '#0E7490' : '#64748B'
              }}
            >
              <Award size={15} />
              <span>3. Key Result Indicators (KRI)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('leaderboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: activeSubTab === 'leaderboard' ? '1px solid #0E7490' : '1px solid transparent',
                background: activeSubTab === 'leaderboard' ? '#ECFEFF' : 'transparent',
                color: activeSubTab === 'leaderboard' ? '#0E7490' : '#64748B'
              }}
            >
              <Users size={15} />
              <span>Team Leaderboard</span>
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            Showing: <strong style={{ color: '#0E7490' }}>{selectedDepartment === 'ALL' ? 'Company All Departments' : selectedDepartment}</strong>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SUBTAB 1: EMPLOYEE KPI SECTION                           */}
        {/* ======================================================== */}
        {activeSubTab === 'kpi' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Active Key Performance Indicators (KPIs)
                </h3>
                <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0' }}>
                  Core operational and functional KPI targets tracked against real delivery benchmarks
                </p>
              </div>
              <span style={{ fontSize: '0.74rem', background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, color: '#475569' }}>
                Weightage Model: Standard 100%
              </span>
            </div>

            <div className="table-responsive">
              <table className="hrms-table" style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>KPI Title</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Department</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Target</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Weightage</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px', width: '220px' }}>Achievement Progress</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDeptTemplate.kpis.map((kpi, idx) => {
                    const mockProgress = [92, 88, 100, 78, 95][idx % 5];
                    const isExceeded = mockProgress >= 95;
                    const isOnTrack = mockProgress >= 80 && mockProgress < 95;

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>{kpi.title}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 500 }}>
                          {selectedDepartment === 'ALL' ? currentDeptTemplate.department : selectedDepartment}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0E7490' }}>
                          {kpi.target}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748B' }}>
                          {kpi.weightage}%
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '8px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${mockProgress}%`,
                                height: '100%',
                                background: isExceeded ? '#10B981' : isOnTrack ? '#0E7490' : '#F59E0B',
                                borderRadius: '9999px'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.74rem', fontWeight: 750, color: '#0F172A', minWidth: '34px' }}>
                              {mockProgress}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: isExceeded ? '#DCFCE7' : isOnTrack ? '#ECFEFF' : '#FEF3C7',
                            color: isExceeded ? '#15803D' : isOnTrack ? '#0E7490' : '#B45309'
                          }}>
                            {isExceeded ? 'Exceeded' : isOnTrack ? 'On Track' : 'In Progress'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBTAB 2: ATTENDANCE & PUNCTUALITY SECTION               */}
        {/* ======================================================== */}
        {activeSubTab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Attendance & Punctuality Reliability
                </h3>
                <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0' }}>
                  Biometric punch records, shift regularity, and punctuality scores for {selectedMonth}
                </p>
              </div>
              <span style={{ fontSize: '0.74rem', background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
                Company Punctuality: 96.4%
              </span>
            </div>

            {/* Attendance Metric Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              marginBottom: '20px'
            }}>
              <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Total Working Days</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>26 Days</div>
                <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '2px', fontWeight: 600 }}>Calendar Scheduled</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Present & Regular</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>24.2 Days</div>
                <div style={{ fontSize: '0.7rem', color: '#15803D', marginTop: '2px', fontWeight: 600 }}>93.1% Attendance Rate</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>On-Time Punches</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0E7490', marginTop: '4px' }}>96.4%</div>
                <div style={{ fontSize: '0.7rem', color: '#0E7490', marginTop: '2px', fontWeight: 600 }}>Within 15m Grace Period</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Leaves / WFH Approved</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7E22CE', marginTop: '4px' }}>1.8 Days</div>
                <div style={{ fontSize: '0.7rem', color: '#7E22CE', marginTop: '2px', fontWeight: 600 }}>100% Authorized</div>
              </div>
            </div>

            {/* Department Breakdown Table */}
            <div className="table-responsive">
              <table className="hrms-table" style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Department</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Staff Count</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Attendance Rate</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>On-Time Rate</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px', textAlign: 'right' }}>Attendance Score</th>
                  </tr>
                </thead>
                <tbody>
                  {companySummary.departmentPerformances.map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>{d.department}</td>
                      <td style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>{d.employeeCount} Members</td>
                      <td style={{ padding: '12px 16px', color: '#15803D', fontWeight: 700 }}>{d.attendanceRate}%</td>
                      <td style={{ padding: '12px 16px', color: '#0E7490', fontWeight: 700 }}>{(d.attendanceRate - 2)}%</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#ECFEFF',
                          color: '#0E7490',
                          border: '1px solid #CFFAFE'
                        }}>
                          {d.attendanceRate >= 90 ? 'Grade A+' : 'Grade A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBTAB 3: KEY RESULT INDICATORS (KRI / KRA) SECTION      */}
        {/* ======================================================== */}
        {activeSubTab === 'kri' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Key Result Indicators (KRI) &amp; Strategic Objectives
                </h3>
                <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0' }}>
                  High-impact organizational deliverables and KRA targets aligned to company milestones
                </p>
              </div>
              <span style={{ fontSize: '0.74rem', background: '#ECFEFF', color: '#0E7490', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
                Quarterly Review Model
              </span>
            </div>

            <div className="table-responsive">
              <table className="hrms-table" style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Key Result Area (KRA)</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Description</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Target Deliverable</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Weightage</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px', textAlign: 'right' }}>KRI Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDeptTemplate.kras.map((kra, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>{kra.title}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '12px', lineHeight: 1.4, maxWidth: '300px' }}>
                        {kra.description}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0E7490' }}>
                        {kra.targetMetric}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>
                        {kra.weightage}%
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#ECFEFF',
                          color: '#0E7490',
                          border: '1px solid #A5F3FC'
                        }}>
                          4.8 / 5.0
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBTAB 4: EMPLOYEE LEADERBOARD & ROSTER                  */}
        {/* ======================================================== */}
        {activeSubTab === 'leaderboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Employee Performance Roster
                </h3>
                <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0' }}>
                  Select any employee to view their full KPI, Attendance, and KRI analytics
                </p>
              </div>

              {/* Search input */}
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={e => {
                    setTableSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search employee..."
                  style={{
                    width: '100%',
                    padding: '7px 12px 7px 30px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="hrms-table" style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Employee</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Department</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Attendance</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>KPI Completion</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px' }}>Overall Score</th>
                    <th style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '12px 16px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map(emp => (
                    <tr key={emp.employeeId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>{emp.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{emp.employeeId} • {emp.designation}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 500 }}>
                        {emp.department}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#15803D' }}>
                        {emp.attendanceRate}%
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0E7490' }}>
                        {emp.taskCompletionRate}%
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: emp.status.bg,
                          color: emp.status.color,
                          border: `1px solid ${emp.status.borderColor}`
                        }}>
                          {emp.overallScore}% ({emp.status.tier})
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => onViewEmployeeDetail(emp.employeeId)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '8px',
                            border: '1px solid #0E7490',
                            background: '#ECFEFF',
                            color: '#0E7490',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          View Analytics →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #F1F5F9',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748B' }}>
                <span>Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalEntries)} of {totalEntries} employees</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: '0.78rem', padding: '0 8px', fontWeight: 600, color: '#0E7490' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PerformanceDashboardView;
