import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useHRMS } from '../../context/HRMSContext';

// Import Module Views (to be built)
import { Dashboard } from '../dashboard/Dashboard';
import { EmployeeList } from '../employees/EmployeeList';
import { FaceAttendance } from '../attendance/FaceAttendance';
import { AttendanceList } from '../attendance/AttendanceList';
import { AttendanceManagementModule } from '../attendance/AttendanceManagementModule';
import { AttendanceHub } from '../attendance/AttendanceHub';
import { GpsGeofencePortal } from '../attendance/GpsGeofencePortal';
import { LeaveManagement } from '../leave/LeaveManagement';
import { ShiftManagement } from '../shift/ShiftManagement';
import { OvertimeManagementModule } from '../overtime/OvertimeManagementModule';
import { PerformanceTracking } from '../performance/PerformanceTracking';
import { TaskManagement } from '../tasks/TaskManagement';
import { RecruitmentPipeline } from '../recruitment/RecruitmentPipeline';
import { ExpenseManagement } from '../finance/ExpenseManagement';
import { PayrollManagement } from '../payroll/PayrollManagement';
import { AdvanceSalaryManagement } from '../payroll/AdvanceSalaryManagement';
import { ReportsAnalytics } from '../reports/ReportsAnalytics';
import { AttendanceReportsView } from '../attendance/AttendanceReportsView';
import { Organization } from '../organization/Organization';
import { AssetManagement } from '../assets/AssetManagement';
import { Settings } from '../settings/Settings';
import { UserProfile } from '../profile/UserProfile';
import { AIAssistantWidget } from '../ai/AIAssistantWidget';

interface AppLayoutProps {
  onLogout?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 1024 : false
  );
  const { activeModule, setActiveModule, hasPermission } = useHRMS();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Quick Add modal states
  const [quickAddModal, setQuickAddModal] = useState<'employee' | 'leave' | 'task' | 'expense' | 'overtime' | null>(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderModuleView = () => {
    // RBAC Security Check
    if (!hasPermission(activeModule, 'view')) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--accent-rose)', marginBottom: '12px' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Your current role does not have permission to view the <strong>{activeModule}</strong> module.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Use the <strong>Role Switcher</strong> in the top header to change your role (e.g. to Super Admin) to access this page.
          </p>
        </div>
      );
    }

    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeeList openAddModal={quickAddModal === 'employee'} onCloseQuickAdd={() => setQuickAddModal(null)} />;
      case 'face_attendance':
        return <FaceAttendance />;
      case 'attendance':
        return <AttendanceReportsView title="Attendance Management" subtitle="Real-time attendance logs, muster roll verification, and departmental reports." />;
      case 'gps_geofence':
        return <GpsGeofencePortal />;
      case 'leaves':
        return <LeaveManagement openApplyModal={quickAddModal === 'leave'} onCloseQuickAdd={() => setQuickAddModal(null)} />;
      case 'shifts':
        return <ShiftManagement />;
      case 'overtime':
        return <OvertimeManagementModule openRequestModal={quickAddModal === 'overtime'} onCloseQuickAdd={() => setQuickAddModal(null)} />;
      case 'performance':
        return <PerformanceTracking />;
      case 'tasks':
        return <TaskManagement openAddModal={quickAddModal === 'task'} onCloseQuickAdd={() => setQuickAddModal(null)} />;
      case 'recruitment':
        return <RecruitmentPipeline />;
      case 'finance':
        return <ExpenseManagement openAddModal={quickAddModal === 'expense'} onCloseQuickAdd={() => setQuickAddModal(null)} />;
      case 'payroll':
        return <PayrollManagement />;
      case 'advance_salary':
        return <AdvanceSalaryManagement />;
      case 'reports':
        return <AttendanceReportsView />;
      case 'organization':
        return <Organization />;
      case 'assets':
        return <AssetManagement />;
      case 'settings':
        return <Settings onLogout={onLogout} />;
      case 'profile':
        return <Settings onLogout={onLogout} initialSection="my_profile" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="hrms-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className={`hrms-main-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header 
          toggleSidebar={toggleSidebar} 
          isSidebarCollapsed={isSidebarCollapsed}
          onLogout={onLogout}
          onOpenQuickAdd={(type) => {
            if (type === 'employee') setActiveModule('employees');
            if (type === 'leave') setActiveModule('leaves');
            if (type === 'task') setActiveModule('tasks');
            if (type === 'expense') setActiveModule('finance');
            setQuickAddModal(type);
          }}
        />

        <main className="hrms-content">
          {renderModuleView()}
        </main>
      </div>

      {/* Multilingual AI HRMS Assistant Floating Widget */}
      <AIAssistantWidget />
    </div>
  );
};
