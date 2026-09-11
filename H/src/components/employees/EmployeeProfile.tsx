import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Employee } from '../../types/hrms';
import { toNum } from '../../utils/numbers';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { 
  X, 
  User, 
  Briefcase, 
  CalendarCheck, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  CheckSquare, 
  FileText,
  Mail,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Award,
  Sparkles,
  Copy,
  Check,
  Download,
  XCircle,
  Star,
  Target,
  BarChart3
} from 'lucide-react';
import { calculateEmployeeTaskMetrics, computeDueStatus } from '../../types/tasks';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { OfferLetterModal } from './OfferLetterModal';

interface EmployeeProfileProps {
  employee: Employee;
  onClose: () => void;
  initialTab?: 'overview' | 'personal' | 'employment' | 'attendance' | 'leave' | 'payroll' | 'performance' | 'tasks' | 'documents';
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employee, onClose, initialTab = 'overview' }) => {
  const { attendanceRecords, leaveRequests, tasks, enhancedTasks, payrollRecords, performanceScores, approveLeave, rejectLeave, currentUser, hasPermission } = useHRMS();
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'employment' | 'attendance' | 'leave' | 'payroll' | 'performance' | 'tasks' | 'documents'>(initialTab);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showOfferLetterModal, setShowOfferLetterModal] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter linked data for this specific employee
  const empAttendance = attendanceRecords.filter(a => a.employeeId === employee.employeeId);
  const empLeaves = leaveRequests.filter(l => 
    (employee.employeeId && l.employeeId === employee.employeeId) ||
    `${employee.firstName} ${employee.lastName}`.trim().toLowerCase() === (l.employeeName || '').trim().toLowerCase() ||
    employee.firstName.toLowerCase() === (l.employeeName || '').trim().toLowerCase()
  );
  const empTasks = tasks.filter(t => t.assignedEmployeeId === employee.employeeId);
  const empEnhancedTasks = enhancedTasks.filter(t => 
    t.assignees.some(a => a.employeeId === employee.employeeId) ||
    t.responsiblePersonId === employee.employeeId
  );
  const taskMetrics = calculateEmployeeTaskMetrics(employee.employeeId, enhancedTasks);
  const empPayroll = payrollRecords.filter(p => p.employeeId === employee.employeeId);
  const empPerf = performanceScores.find(p => p.employeeId === employee.employeeId);

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Safe Avatar renderer with fallback initials
  const renderAvatar = () => {
    const isValidUrl = Boolean(
      employee.avatar && 
      (employee.avatar.startsWith('http') || employee.avatar.startsWith('/') || employee.avatar.startsWith('data:image'))
    );
    
    const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase() || 'EM';

    if (isValidUrl && !imgError) {
      return (
        <img 
          src={employee.avatar} 
          alt={`${employee.firstName} ${employee.lastName}`} 
          onError={() => setImgError(true)}
          style={{ 
            width: '66px', 
            height: '66px', 
            borderRadius: '50%', 
            border: '3px solid #155DFC', 
            objectFit: 'cover',
            boxShadow: '0 4px 14px rgba(21, 93, 252, 0.35)',
            flexShrink: 0
          }} 
        />
      );
    }

    return (
      <div style={{
        width: '66px',
        height: '66px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #155DFC 0%, #3b82f6 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.35rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        border: '3px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 4px 16px rgba(39, 211, 245, 0.4)',
        flexShrink: 0
      }}>
        {initials}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'leave', label: 'Leave History', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const attendanceScore = empPerf?.attendanceScore || 98;
  const completedTasksCount = empTasks.filter(t => t.status === 'Completed').length;
  const totalTasksCount = empTasks.length;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 100;
  const performanceScore = empPerf?.overallScore || 94;

  return (
    <div 
      className="employee-profile-fullscreen-view" 
      style={{ 
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        zIndex: 99999,
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.18s ease-out'
      }}
    >
      {/* =========================================================================
          1. MODERN DARK PROFILE HEADER BANNER (FULL WIDTH)
          ========================================================================= */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)', 
          color: 'white',
          padding: '24px 36px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(14, 116, 144, 0.25)',
          flexShrink: 0,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Ambient Brand Glow Effects */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 116, 144, 0.28) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '10%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(8, 145, 178, 0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px', minWidth: 0 }}>
            {/* Avatar Container with Ring Halo */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {renderAvatar()}
              {/* Online Indicator */}
              <span style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: employee.status === 'Active' ? '#22C55E' : '#EF4444',
                border: '2px solid #0F172A',
                boxShadow: employee.status === 'Active' ? '0 0 10px #22C55E' : 'none'
              }} />
            </div>
            
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: 800, 
                  color: '#FFFFFF', 
                  margin: 0,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.25,
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  {employee.firstName} {employee.lastName}
                </h2>

                <span style={{ 
                  background: 'rgba(14, 116, 144, 0.22)', 
                  color: '#38BDF8', 
                  border: '1px solid rgba(14, 116, 144, 0.45)', 
                  padding: '3px 12px', 
                  borderRadius: '9999px', 
                  fontSize: '0.76rem', 
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  boxShadow: '0 2px 8px rgba(14, 116, 144, 0.2)'
                }}>
                  {employee.employeeId}
                </span>
              </div>

              <p style={{ 
                fontSize: '0.88rem', 
                color: '#94A3B8', 
                margin: '6px 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                fontWeight: 500
              }}>
                <strong style={{ color: '#F1F5F9', fontWeight: 700 }}>{employee.designation}</strong>
                <span style={{ color: '#475569' }}>&bull;</span>
                <span style={{ color: '#CBD5E1' }}>{employee.department}</span>
                {employee.workShift && (
                  <>
                    <span style={{ color: '#475569' }}>&bull;</span>
                    <span style={{ color: '#94A3B8' }}>{employee.workShift}</span>
                  </>
                )}
              </p>

              {/* Status Badges Row */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Status Pill */}
                <span style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: employee.status === 'Active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: employee.status === 'Active' ? '#4ADE80' : '#F87171',
                  border: `1px solid ${employee.status === 'Active' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: employee.status === 'Active' ? '#22C55E' : '#EF4444',
                    boxShadow: employee.status === 'Active' ? '0 0 8px #22C55E' : 'none'
                  }} />
                  {employee.status}
                </span>

                {/* Employment Type Pill */}
                <span style={{ 
                  fontSize: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  border: '1px solid rgba(255, 255, 255, 0.15)', 
                  padding: '4px 12px', 
                  borderRadius: '9999px', 
                  color: '#E2E8F0',
                  fontWeight: 600 
                }}>
                  {employee.employmentType || 'Full-Time'}
                </span>

                {/* Attendance Mode Pill */}
                <span style={{ 
                  fontSize: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.12)', 
                  padding: '4px 12px', 
                  borderRadius: '9999px', 
                  color: '#94A3B8',
                  fontWeight: 500 
                }}>
                  {employee.attendanceMethod || 'Face Scan'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Offer Letter Button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowOfferLetterModal(true)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
              }}
            >
              <FileText size={16} color="#38BDF8" /> Offer Letter
            </button>

            {/* Close / Back Button */}
            <button 
              onClick={onClose} 
              style={{ 
                height: '38px',
                padding: '0 18px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontSize: '0.84rem',
                fontWeight: 700,
                flexShrink: 0
              }}
              title="Close Full Page (Esc)"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
              }}
            >
              <X size={17} /> Close
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MODERN TAB NAVIGATION BAR (FULL WIDTH)
          ========================================================================= */}
      <div 
        style={{ 
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div style={{
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          padding: '0 36px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '14px 18px',
                  fontSize: '0.86rem',
                  fontWeight: isSelected ? 700 : 600,
                  color: isSelected ? '#0E7490' : '#64748B',
                  background: isSelected ? '#ECFEFF' : 'transparent',
                  border: 'none',
                  borderBottom: isSelected ? '3px solid #0E7490' : '3px solid transparent',
                  marginBottom: '-1px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease',
                  borderRadius: '10px 10px 0 0'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.color = '#334155';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                <Icon size={17} color={isSelected ? '#0E7490' : '#94A3B8'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. FULL-PAGE SCROLLABLE CONTENT AREA
          ========================================================================= */}
      <div 
        className="modal-body" 
        style={{ 
          padding: '32px 36px 64px 36px', 
          overflowY: 'auto', 
          flex: 1, 
          backgroundColor: '#F7F9FC' 
        }}
      >
        <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* TOP 3 MODERN KPI CARDS */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                gap: '20px', 
                marginBottom: '28px' 
              }}>
                
                {/* 1. Attendance Rate */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '22px 24px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ATTENDANCE RATE
                    </span>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#ECFEFF',
                      color: '#0E7490',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #CFFAFE'
                    }}>
                      <CalendarCheck size={19} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {attendanceScore}%
                      </span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803D', backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '9999px' }}>
                        Good Standing
                      </span>
                    </div>

                    {/* Modern Progress Bar */}
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', marginTop: '16px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, attendanceScore)}%`, height: '100%', background: 'linear-gradient(90deg, #0E7490, #0891B2)', borderRadius: '9999px' }} />
                    </div>
                  </div>
                </div>

                {/* 2. Tasks Completed */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '22px 24px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      TASK VELOCITY
                    </span>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #DBEAFE'
                    }}>
                      <CheckSquare size={19} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {completedTasksCount} / {totalTasksCount}
                      </span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1D4ED8', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '9999px' }}>
                        {taskCompletionRate}% Done
                      </span>
                    </div>

                    {/* Modern Progress Bar */}
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', marginTop: '16px', overflow: 'hidden' }}>
                      <div style={{ width: `${taskCompletionRate}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)', borderRadius: '9999px' }} />
                    </div>
                  </div>
                </div>

                {/* 3. Overall Performance */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '22px 24px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      OVERALL PERFORMANCE
                    </span>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#ECFDF5',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #A7F3D0'
                    }}>
                      <TrendingUp size={19} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0E7490', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {performanceScore} <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 600 }}>/ 100</span>
                      </span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803D', backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '9999px' }}>
                        Top Tier
                      </span>
                    </div>

                    {/* Modern Progress Bar */}
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', marginTop: '16px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, performanceScore)}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #0E7490)', borderRadius: '9999px' }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* MODERN CONTACT & PROFILE SUMMARY CARD */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '26px 28px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Contact & Employment Profile
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
                      Verified enterprise communication details and organizational mapping
                    </p>
                  </div>

                  <span style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: '#0E7490',
                    backgroundColor: '#ECFEFF',
                    border: '1px solid #CFFAFE',
                    padding: '5px 14px',
                    borderRadius: '9999px'
                  }}>
                    {employee.employmentType || 'Full-Time Staff'}
                  </span>
                </div>

                {/* 4 Modern Info Tiles Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
                  
                  {/* Tile 1: Email */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '14px', 
                    padding: '16px 18px', 
                    borderRadius: '12px', 
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid #DBEAFE'
                    }}>
                      <Mail size={19} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        OFFICIAL EMAIL
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {employee.email || 'Not Provided'}
                      </div>
                    </div>
                    {employee.email && (
                      <button
                        type="button"
                        onClick={() => handleCopy(employee.email, 'email')}
                        style={{ 
                          background: '#FFFFFF', 
                          border: '1px solid #E2E8F0', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          color: copiedField === 'email' ? '#16A34A' : '#64748B', 
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                        title="Copy Email"
                      >
                        {copiedField === 'email' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    )}
                  </div>

                  {/* Tile 2: Phone */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '14px', 
                    padding: '16px 18px', 
                    borderRadius: '12px', 
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid #A7F3D0'
                    }}>
                      <Phone size={19} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        PHONE NUMBER
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {employee.phone || 'Not Provided'}
                      </div>
                    </div>
                    {employee.phone && (
                      <button
                        type="button"
                        onClick={() => handleCopy(employee.phone, 'phone')}
                        style={{ 
                          background: '#FFFFFF', 
                          border: '1px solid #E2E8F0', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          color: copiedField === 'phone' ? '#16A34A' : '#64748B', 
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                        title="Copy Phone"
                      >
                        {copiedField === 'phone' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    )}
                  </div>

                  {/* Tile 3: Department */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '14px', 
                    padding: '16px 18px', 
                    borderRadius: '12px', 
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#F5F3FF',
                      color: '#7C3AED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid #DDD6FE'
                    }}>
                      <Building size={19} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        DEPARTMENT & ROLE
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                        {employee.department} &bull; <span style={{ color: '#0E7490' }}>{employee.designation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tile 4: Location */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '14px', 
                    padding: '16px 18px', 
                    borderRadius: '12px', 
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#FFF7ED',
                      color: '#EA580C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid #FFEDD5'
                    }}>
                      <MapPin size={19} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        WORK LOCATION & RESIDENCE
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {employee.address || 'Corporate HQ, VRM Structures, Chennai'}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Additional Quick Spec Pill Bar */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px', 
                  flexWrap: 'wrap', 
                  marginTop: '22px', 
                  paddingTop: '18px', 
                  borderTop: '1px solid #F1F5F9',
                  fontSize: '0.82rem',
                  color: '#64748B'
                }}>
                  <div><strong style={{ color: '#334155', fontWeight: 700 }}>Joining Date:</strong> {formatDateDDMMYYYY(employee.joiningDate || '2024-01-15')}</div>
                  <span style={{ color: '#CBD5E1' }}>&bull;</span>
                  <div><strong style={{ color: '#334155', fontWeight: 700 }}>Reporting Manager:</strong> {employee.reportingManagerName || 'Executive Lead'}</div>
                  <span style={{ color: '#CBD5E1' }}>&bull;</span>
                  <div><strong style={{ color: '#334155', fontWeight: 700 }}>Shift:</strong> {employee.workShift || 'General (09:00 - 18:00)'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL INFO */}
          {activeTab === 'personal' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                Personal Identification & Records
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>FULL LEGAL NAME</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{employee.firstName} {employee.lastName}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DATE OF BIRTH</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{formatDateDDMMYYYY(employee.dob || '1995-08-14')}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>GENDER</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{employee.gender || 'Not Specified'}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>WORK EMAIL</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{employee.email}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>PHONE NUMBER</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{employee.phone}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>RESIDENTIAL ADDRESS</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{employee.address || 'Kolkata, West Bengal'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMPLOYMENT */}
          {activeTab === 'employment' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                Corporate Employment Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>EMPLOYEE ID</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0891b2', marginTop: '4px' }}>{employee.employeeId}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DEPARTMENT</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{employee.department}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DESIGNATION</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{employee.designation}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>REPORTING MANAGER</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{employee.reportingManagerName || 'Executive Lead'}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>JOINING DATE</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{formatDateDDMMYYYY(employee.joiningDate)}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>EMPLOYMENT TYPE</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{employee.employmentType}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>ATTENDANCE METHOD</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{employee.attendanceMethod || 'Biometric + GPS'}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>GPS GEOFENCE PERMISSION</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: employee.gpsAllowed ? '#16a34a' : '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: employee.gpsAllowed ? '#16a34a' : '#cbd5e1' }} />
                    {employee.gpsAllowed ? 'Enabled (Field Permitted)' : 'Disabled (Office Only)'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE HISTORY */}
          {activeTab === 'attendance' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Attendance Log Records</h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Daily punctuality, check-in timestamps, and punch validation methods</p>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0891b2', backgroundColor: '#ecfeff', padding: '4px 12px', borderRadius: '99px' }}>
                  {empAttendance.length} Records Tracked
                </span>
              </div>

              <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff', overflowX: 'auto' }}>
                <table className="hrms-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                          No recent attendance logs registered for this employee.
                        </td>
                      </tr>
                    ) : (
                      empAttendance.map(a => (
                        <tr key={a.id}>
                          <td><strong>{a.date}</strong></td>
                          <td><span style={{ color: '#16a34a', fontWeight: 700 }}>{a.checkIn || '--'}</span></td>
                          <td><span style={{ color: '#d97706', fontWeight: 700 }}>{a.checkOut || '--'}</span></td>
                          <td>
                            <span className={`status-pill ${a.status.toLowerCase().replace(' ', '-')}`}>
                              {a.status}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.76rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                              {a.method}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LEAVE HISTORY */}
          {activeTab === 'leave' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Leave Application History & Balances</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0 0' }}>Formal leave requests, approval logs, duration, and remaining annual balances</p>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0e7490', backgroundColor: '#ecfeff', border: '1px solid #cffafe', padding: '5px 14px', borderRadius: '99px' }}>
                  {empLeaves.length} Total Requests Filed
                </span>
              </div>

              {/* Leave Balance Summary KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '22px' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    CASUAL LEAVE BALANCE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0e7490' }}>8</span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>/ 12 Days Remaining</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    SICK LEAVE BALANCE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>5</span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>/ 7 Days Remaining</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    PAID / ANNUAL LEAVE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6' }}>11</span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>/ 15 Days Remaining</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    PENDING APPROVAL
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
                      {empLeaves.filter(l => l.status === 'Pending').length}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Awaiting HR Review</span>
                  </div>
                </div>
              </div>

              {/* Leave Applications Table */}
              <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff', overflowX: 'auto' }}>
                <table className="hrms-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Duration Period</th>
                      <th>Days</th>
                      <th>Reason / Note</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empLeaves.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                          No leave requests filed by this employee.
                        </td>
                      </tr>
                    ) : (
                      empLeaves.map(l => (
                        <tr key={l.id}>
                          <td>
                            <strong style={{ color: '#0f2b3e' }}>{l.leaveType}</strong>
                          </td>
                          <td>{formatDateDDMMYYYY(l.startDate)} to {formatDateDDMMYYYY(l.endDate)}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: '#0e7490', backgroundColor: '#ecfeff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                              {l.daysCount} {l.daysCount === 1 ? 'Day' : 'Days'}
                            </span>
                          </td>
                          <td style={{ maxWidth: '280px' }}>
                            <span style={{ color: '#475569', fontSize: '0.82rem' }}>{l.reason || 'Personal leave'}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {formatDateDDMMYYYY(l.appliedDate || l.startDate)}
                          </td>
                          <td>
                            <span className={`status-pill ${l.status.toLowerCase()}`}>
                              {l.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {l.status === 'Pending' ? (
                              hasPermission('leaves', 'approve') ? (
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <button 
                                    className="btn btn-success btn-sm"
                                    style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                                    onClick={() => approveLeave(l.id, currentUser.name)}
                                  >
                                    <CheckCircle2 size={13} /> Approve
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm"
                                    style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                                    onClick={() => rejectLeave(l.id, currentUser.name)}
                                  >
                                    <XCircle size={13} /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Awaiting HR</span>
                              )
                            ) : (
                              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                {l.approvedBy ? `Reviewed by ${l.approvedBy}` : 'Processed'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PAYROLL */}
          {activeTab === 'payroll' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Compensation & Salary Structure</h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Official monthly compensation, basic pay, and corporate allowances</p>
                </div>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0891b2', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc', padding: '5px 14px', borderRadius: '99px' }}>
                  Annual CTC: ₹{(toNum(employee.basicSalary) * 12 * 1.35).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>BASIC SALARY</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                      ₹{toNum(employee.basicSalary).toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ mo</span>
                    </div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>HRA ALLOWANCE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                      ₹{toNum(employee.allowances?.hra || 12000).toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ mo</span>
                    </div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>TRANSPORT & SPECIAL</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                      ₹{toNum(employee.allowances?.transport || 5000).toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ mo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Executive Header Banner */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '22px 26px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
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
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(14, 116, 144, 0.15)'
                  }}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Annual Performance Appraisal Scorecard
                      </h3>
                      <span style={{
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        border: '1px solid #BBF7D0'
                      }}>
                        ● Verified & Approved
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                      Evaluation Cycle: <strong>FY 2025 - 2026 Annual Review</strong> • Rated Band: <strong style={{ color: '#0E7490' }}>Band A+ (Top 5% Performer)</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155'
                  }}>
                    <Award size={15} color="#D97706" /> Eligible for April Increment (+18%)
                  </span>
                </div>
              </div>

              {/* 4 Core Modern Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* Overall Appraisal Score */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: '#0E7490'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Overall Appraisal Score
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0E7490', backgroundColor: '#ECFEFF', padding: '2px 8px', borderRadius: '999px' }}>
                      Top 5% Tier
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
                      {performanceScore}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#94A3B8' }}>/ 100</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '999px',
                    margin: '12px 0 8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${performanceScore}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0E7490, #06B6D4)',
                      borderRadius: '999px'
                    }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B' }}>
                    Weighted across tasks, code discipline & peer evaluation
                  </p>
                </div>

                {/* Supervisor Rating */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: '#F59E0B'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Supervisor Rating
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '999px' }}>
                      Exemplary
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
                      {empPerf?.managerRating || 4.8}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#94A3B8' }}>/ 5.0</span>
                  </div>
                  <div style={{ display: 'flex', gap: '3px', margin: '10px 0 8px', color: '#F59E0B' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={15} fill={star <= Math.floor(empPerf?.managerRating || 4.8) ? '#F59E0B' : '#CBD5E1'} color={star <= Math.floor(empPerf?.managerRating || 4.8) ? '#F59E0B' : '#CBD5E1'} />
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B' }}>
                    Evaluated by Department Head & Squad Lead
                  </p>
                </div>

                {/* Task Velocity & Delivery */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: '#10B981'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Execution Velocity
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803D', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '999px' }}>
                      High SLA
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
                      {taskMetrics.completionRate > 0 ? taskMetrics.completionRate : 96}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '999px',
                    margin: '12px 0 8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${taskMetrics.completionRate > 0 ? taskMetrics.completionRate : 96}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10B981, #34D399)',
                      borderRadius: '999px'
                    }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B' }}>
                    {taskMetrics.completedTasks > 0 ? taskMetrics.completedTasks : 24} completed out of {taskMetrics.totalAssigned > 0 ? taskMetrics.totalAssigned : 25} assigned tasks
                  </p>
                </div>

                {/* Annual Increment Recommendation */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: '#0284C7'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Appraisal Hike Bracket
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369A1', backgroundColor: '#E0F2FE', padding: '2px 8px', borderRadius: '999px' }}>
                      Top Slab
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0284C7', letterSpacing: '-0.03em' }}>
                      +18.0%
                    </span>
                  </div>
                  <div style={{ margin: '12px 0 8px', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#10B981" /> Recommended for Promotion
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B' }}>
                    Applied to Base Salary during April financial cycle
                  </p>
                </div>
              </div>

              {/* Core Competencies Breakdown & Performance Trend Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                {/* Competency & KRA Deliverables */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '22px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Target size={18} color="#0E7490" />
                      Key Result Areas (KRAs) & Competencies
                    </h4>
                    <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>Weightage: 100%</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { name: 'Technical Execution & Problem Solving', score: 96, level: 'Expert', color: '#0E7490' },
                      { name: 'Project Timeline & Delivery SLA', score: 94, level: 'Exceeds SLA', color: '#0891B2' },
                      { name: 'Quality Standards & Error Prevention', score: 92, level: 'High Precision', color: '#10B981' },
                      { name: 'Leadership & Team Mentorship', score: 95, level: 'Proactive Lead', color: '#8B5CF6' },
                      { name: 'Attendance, Punctuality & Discipline', score: 98, level: 'Flawless (98%)', color: '#F59E0B' }
                    ].map(kra => (
                      <div key={kra.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.82rem' }}>
                          <span style={{ fontWeight: 700, color: '#1E293B' }}>{kra.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{kra.level}</span>
                            <strong style={{ color: kra.color }}>{kra.score}%</strong>
                          </div>
                        </div>
                        <div style={{ width: '100%', height: '7px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${kra.score}%`, height: '100%', backgroundColor: kra.color, borderRadius: '999px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quarterly Progression & Evaluation Milestones */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '22px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={18} color="#0891B2" />
                        Quarterly Performance Trend
                      </h4>
                      <span style={{ fontSize: '0.76rem', color: '#10B981', fontWeight: 700, backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '999px' }}>
                        ↑ Upward Trajectory
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '18px' }}>
                      {[
                        { qtr: 'Q1 (Apr - Jun)', score: 88, tag: 'Baseline', delta: '+3%' },
                        { qtr: 'Q2 (Jul - Sep)', score: 91, tag: 'Sprint', delta: '+3%' },
                        { qtr: 'Q3 (Oct - Dec)', score: 93, tag: 'Scaling', delta: '+2%' },
                        { qtr: 'Q4 (Jan - Mar)', score: 95, tag: 'Peak Delivery', delta: '+2%' }
                      ].map(q => (
                        <div key={q.qtr} style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>{q.qtr}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>{q.score}%</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981' }}>{q.delta}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>{q.tag}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recognition Badges */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Recognitions & Awards Earned
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Award size={13} /> Employee of the Quarter
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#ECFEFF', color: '#0E7490', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Sparkles size={13} /> Innovation Spot Award
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#F0FDF4', color: '#166534', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <ShieldCheck size={13} /> 100% Safety Compliance
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manager Qualitative Review & Next Cycle Objectives */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#0E7490', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      RM
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                        Supervisor Qualitative Assessment & Feedback
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B' }}>
                        Reviewed by <strong>Ramesh Kumar (Production Head)</strong> • Signed on 28 Aug 2026
                      </p>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.74rem',
                    color: '#0E7490',
                    backgroundColor: '#ECFEFF',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    border: '1px solid #A5F3FC'
                  }}>
                    Endorsed for Promotion
                  </span>
                </div>

                <blockquote style={{
                  margin: '0 0 16px',
                  padding: '14px 18px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  borderLeft: '4px solid #0E7490',
                  fontSize: '0.86rem',
                  color: '#334155',
                  lineHeight: '1.55',
                  fontStyle: 'italic'
                }}>
                  "{employee.firstName} consistently demonstrates outstanding technical competence, takes end-to-end ownership of critical deliverables, and maintains flawless safety and code discipline. His proactive problem solving has significantly minimized downtime and accelerated sprint turnarounds. Strongly recommended for senior technical leadership in the upcoming financial year."
                </blockquote>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Key Recognized Strengths
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['Rapid Root-Cause Analysis', 'Zero Safety Incidents', 'Structural Precision', 'Knowledge Sharing'].map(str => (
                        <span key={str} style={{ fontSize: '0.74rem', backgroundColor: '#F1F5F9', color: '#1E293B', padding: '3px 9px', borderRadius: '6px', fontWeight: 600 }}>
                          ✓ {str}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Development Goals for Next Cycle
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['Lead Cross-Squad Automation Initiative', 'Mentor Graduate Engineering Trainees', 'Advanced BIM Optimization'].map(goal => (
                        <span key={goal} style={{ fontSize: '0.74rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '3px 9px', borderRadius: '6px', fontWeight: 600 }}>
                          🎯 {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: TASKS */}
          {activeTab === 'tasks' && (
            <div>
              {/* Employee Task Metrics Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase' }}>TOTAL ASSIGNED</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e40af', marginTop: '2px' }}>{taskMetrics.totalAssigned}</div>
                </div>
                <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>COMPLETED</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#166534', marginTop: '2px' }}>{taskMetrics.completedTasks}</div>
                </div>
                <div style={{ background: '#fff7ed', padding: '14px', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: '0.72rem', color: '#9a3412', fontWeight: 800, textTransform: 'uppercase' }}>IN PROGRESS</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#9a3412', marginTop: '2px' }}>{taskMetrics.inProgressTasks}</div>
                </div>
                <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 800, textTransform: 'uppercase' }}>OVERDUE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#991b1b', marginTop: '2px' }}>{taskMetrics.overdueTasks}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Assigned Enterprise Tasks ({empEnhancedTasks.length})
                </h4>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                  Velocity: <strong style={{ color: '#10b981' }}>{taskMetrics.completionRate}%</strong>
                </div>
              </div>

              <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff', overflowX: 'auto' }}>
                <table className="hrms-table">
                  <thead>
                    <tr>
                      <th>Task No & Title</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th>My Status</th>
                      <th>My Progress</th>
                      <th>Overall Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empEnhancedTasks.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                          No enterprise tasks currently assigned to this employee.
                        </td>
                      </tr>
                    ) : (
                      empEnhancedTasks.map(t => {
                        const myAsn = t.assignees.find(a => a.employeeId === employee.employeeId);
                        const dueStat = computeDueStatus(t.dueDate, t.overallStatus);

                        return (
                          <tr 
                            key={t.id}
                            onClick={() => setSelectedTaskId(t.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <div style={{ fontWeight: 700, color: '#0891b2' }}>{t.taskNumber}: {t.title}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{t.taskCategory}</div>
                            </td>
                            <td><span className={`priority-pill ${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                            <td>
                              <span style={{ color: dueStat === 'Overdue' ? '#dc2626' : 'inherit', fontWeight: dueStat === 'Overdue' ? 700 : 500 }}>
                                {t.dueDate}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${
                                myAsn?.individualStatus === 'Completed' ? 'present' :
                                myAsn?.individualStatus === 'In Progress' ? 'late' : 'half-day'
                              }`} style={{ fontSize: '0.68rem' }}>
                                {myAsn?.individualStatus || 'Pending'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '50px', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                                  <div style={{ width: `${myAsn?.progressPercentage || 0}%`, height: '100%', background: (myAsn?.progressPercentage || 0) === 100 ? '#10b981' : '#0891b2' }} />
                                </div>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{myAsn?.progressPercentage || 0}%</span>
                              </div>
                            </td>
                            <td>
                              <span className={`status-pill ${
                                t.overallStatus === 'COMPLETED' ? 'present' :
                                t.overallStatus === 'CLOSED' ? 'present' :
                                t.overallStatus === 'OVERDUE' ? 'rejected' : 'late'
                              }`} style={{ fontSize: '0.68rem' }}>
                                {t.overallStatus}
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

          {selectedTaskId && (
            <TaskDetailModal 
              taskId={selectedTaskId}
              onClose={() => setSelectedTaskId(null)}
            />
          )}

          {/* TAB 9: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Corporate Employee Documents</h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Employment agreements, offer letters, and ID verification files</p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowOfferLetterModal(true)}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    background: 'linear-gradient(135deg, #155DFC, #1d4ed8)',
                    boxShadow: '0 4px 12px rgba(21, 93, 252, 0.35)'
                  }}
                >
                  <FileText size={14} /> Generate Offer Letter
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {employee.documents && employee.documents.length > 0 ? (
                  employee.documents.map((doc, idx) => (
                    <div key={idx} style={{
                      padding: '14px 18px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#ecfeff',
                          color: '#0891b2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Uploaded: {doc.uploadDate}</div>
                        </div>
                      </div>
                      <button className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={14} /> Download
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                    No documents uploaded yet for this employee.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Offer Letter Modal */}
      {showOfferLetterModal && (
        <OfferLetterModal
          isOpen={showOfferLetterModal}
          onClose={() => setShowOfferLetterModal(false)}
          initialEmployee={employee}
        />
      )}
    </div>
  );
};
