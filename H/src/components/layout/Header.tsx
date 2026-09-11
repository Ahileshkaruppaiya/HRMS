import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Role } from '../../types/hrms';
import { 
  Bell, 
  Plus, 
  ChevronDown, 
  Menu, 
  LogOut, 
  User, 
  Settings as SettingsIcon
} from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  onLogout?: () => void;
  onOpenQuickAdd: (type: 'employee' | 'leave' | 'task' | 'expense') => void;
}

export const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  onLogout,
  onOpenQuickAdd
}) => {
  const { 
    currentUser, 
    updateCurrentUser,
    activeModule,
    businessSettings,
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    searchQuery, 
    setSearchQuery,
    setActiveModule,
    setActiveSettingsTab
  } = useHRMS();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getModuleTitle = (mod: string): string => {
    switch (mod) {
      case 'dashboard': return 'Dashboard';
      case 'employees': return 'Employee Directory';
      case 'organization': return 'Organization';
      case 'face_attendance': return 'Live Face Attendance';
      case 'attendance': return 'Attendance Management';
      case 'leaves': return 'Leave Management';
      case 'shifts': return 'Shift Management';
      case 'overtime': return currentUser.role === 'Employee' ? 'My Overtime Requests' : 'Overtime Management';
      case 'tasks': return 'Tasks';
      case 'performance': return 'Performance';
      case 'notifications': return 'Notifications';
      case 'recruitment': return 'Recruitment';
      case 'finance': return 'Finance & Expenses';
      case 'payroll': return 'Payroll';
      case 'advance_salary': return currentUser.role === 'Employee' ? 'My Advance Salary / Loan' : 'Advance Salary & Loan Management';
      case 'reports': return 'Attendance Reports';
      case 'assets': return 'Asset Management';
      case 'settings': return 'Settings';
      case 'profile': return 'My Profile';
      default: return 'Dashboard';
    }
  };

  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="hrms-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          aria-label="Toggle Sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb Title */}
        <div className="header-breadcrumb">
          <span className="header-brand-prefix">
            {businessSettings?.businessName || 'VRM HRM'} |
          </span>
          <span className="header-module-title">
            {getModuleTitle(activeModule)}
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Quick Add Menu */}
        <div style={{ position: 'relative' }}>
          <button 
            className="header-quick-add-btn"
            onClick={() => {
              setShowQuickAddMenu(prev => !prev);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Quick Add</span>
            <ChevronDown size={13} strokeWidth={2.5} />
          </button>

          {showQuickAddMenu && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                onClick={() => setShowQuickAddMenu(false)} 
              />
              <div className="card" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '190px',
                padding: '6px',
                zIndex: 50,
                boxShadow: 'var(--shadow-xl)',
                backgroundColor: '#ffffff',
                borderRadius: '12px'
              }}>
                {(currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin') && (
                  <button
                    type="button"
                    className="dropdown-menu-item"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onOpenQuickAdd('employee'); 
                      setShowQuickAddMenu(false); 
                    }}
                  >
                    + Add Employee
                  </button>
                )}
                {currentUser.role === 'Employee' && (
                  <button
                    type="button"
                    className="dropdown-menu-item"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onOpenQuickAdd('leave'); 
                      setShowQuickAddMenu(false); 
                    }}
                  >
                    + Apply Leave
                  </button>
                )}
                {currentUser.role !== 'Employee' && (
                  <button
                    type="button"
                    className="dropdown-menu-item"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onOpenQuickAdd('task'); 
                      setShowQuickAddMenu(false); 
                    }}
                  >
                    + Create Task
                  </button>
                )}
                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onOpenQuickAdd('expense'); 
                    setShowQuickAddMenu(false); 
                  }}
                >
                  + Submit Expense
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications Circle Action Button (Matches Reference Bell Icon Button) */}
        <div style={{ position: 'relative' }}>
          <button 
            className="header-action-circle-btn" 
            onClick={() => {
              setShowNotifications(prev => !prev);
              setShowQuickAddMenu(false);
              setShowProfileMenu(false);
            }}
            title="Notifications"
          >
            <Bell size={18} strokeWidth={2.2} />
            {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                onClick={() => setShowNotifications(false)} 
              />
              <div className="card" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '340px',
                padding: '16px',
                zIndex: 50,
                boxShadow: 'var(--shadow-xl)',
                maxHeight: '420px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                borderRadius: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0B1A2D' }}>Notifications ({notifications.length})</h4>
                  <button 
                    style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={markAllNotificationsRead}
                  >
                    Mark all read
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No notifications</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          backgroundColor: n.read ? '#ffffff' : '#ECFEFF',
                          border: '1px solid #E2E8F0',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 750, color: '#0B1A2D' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{n.timestamp}</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Profile Pill with White Avatar (Matches Reference Header) */}
        <div style={{ position: 'relative' }}>
          <div 
            className="user-profile-btn" 
            onClick={() => {
              setShowProfileMenu(prev => !prev);
              setShowQuickAddMenu(false);
              setShowNotifications(false);
            }}
          >
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar" />
            ) : (
              <div className="user-avatar-circle">
                {userInitial}
              </div>
            )}
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role-label">
                {currentUser.designation || (currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role)}
              </span>
            </div>
            <ChevronDown size={14} color="#FFFFFF" strokeWidth={2.4} style={{ opacity: 0.85 }} />
          </div>

          {showProfileMenu && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                onClick={() => setShowProfileMenu(false)} 
              />
              <div className="card" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '220px',
                padding: '8px',
                zIndex: 50,
                boxShadow: 'var(--shadow-xl)',
                backgroundColor: '#ffffff',
                borderRadius: '14px'
              }}>
                <div style={{ padding: '6px 10px 10px', borderBottom: '1px solid #E2E8F0', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0B1A2D' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#0E7490', fontWeight: 700 }}>{currentUser.designation || (currentUser.role === 'Super Admin' ? 'CEO' : currentUser.role)}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{currentUser.email}</div>
                </div>

                {/* Instant Demo Role Switcher */}
                <div style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: '10px', marginBottom: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Switch Role (Demo):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        updateCurrentUser({
                          id: 'USR-001',
                          name: 'Velmurugan',
                          email: 'ceo@vrmstructures.com',
                          role: 'Super Admin',
                          designation: 'CEO',
                          department: 'Management',
                          employeeId: 'EMP-000'
                        });
                        setShowProfileMenu(false);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: currentUser.role === 'Super Admin' ? '1px solid #0E7490' : '1px solid #E2E8F0',
                        background: currentUser.role === 'Super Admin' ? '#0E7490' : '#FFFFFF',
                        color: currentUser.role === 'Super Admin' ? '#FFFFFF' : '#334155',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>👑 CEO (Super Admin)</span>
                      {currentUser.role === 'Super Admin' && <span style={{ fontSize: '0.65rem' }}>Active</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateCurrentUser({
                          id: 'EMP-001',
                          name: 'Pavithra',
                          email: 'hr@vrmstructures.com',
                          role: 'HR Admin',
                          designation: 'HR Specialist',
                          department: 'Human Resources',
                          employeeId: 'EMP-001'
                        });
                        setShowProfileMenu(false);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: currentUser.role === 'HR Admin' ? '1px solid #7C3AED' : '1px solid #E2E8F0',
                        background: currentUser.role === 'HR Admin' ? '#7C3AED' : '#FFFFFF',
                        color: currentUser.role === 'HR Admin' ? '#FFFFFF' : '#334155',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>💼 HR (HR Admin)</span>
                      {currentUser.role === 'HR Admin' && <span style={{ fontSize: '0.65rem' }}>Active</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateCurrentUser({
                          id: 'EMP-008',
                          name: 'Arun Kumar',
                          email: 'arun.sales@vrmstructures.com',
                          role: 'Department Head',
                          designation: 'Sales Department Head',
                          department: 'Sales',
                          employeeId: 'EMP-008'
                        });
                        setShowProfileMenu(false);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: (currentUser.role === 'Department Head' || currentUser.role === 'Manager') ? '1px solid #0E7490' : '1px solid #E2E8F0',
                        background: (currentUser.role === 'Department Head' || currentUser.role === 'Manager') ? '#0E7490' : '#FFFFFF',
                        color: (currentUser.role === 'Department Head' || currentUser.role === 'Manager') ? '#FFFFFF' : '#334155',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>👔 Manager (Sales Head)</span>
                      {(currentUser.role === 'Department Head' || currentUser.role === 'Manager') && <span style={{ fontSize: '0.65rem' }}>Active</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateCurrentUser({
                          id: 'EMP-005',
                          name: 'Murugan',
                          email: 'murugan.fe@vrmstructures.com',
                          role: 'Employee',
                          designation: 'Floor Employee',
                          department: 'Production',
                          employeeId: 'EMP-005'
                        });
                        setShowProfileMenu(false);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: currentUser.role === 'Employee' ? '1px solid #D97706' : '1px solid #E2E8F0',
                        background: currentUser.role === 'Employee' ? '#D97706' : '#FFFFFF',
                        color: currentUser.role === 'Employee' ? '#FFFFFF' : '#334155',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>👷 Employee (Murugan)</span>
                      {currentUser.role === 'Employee' && <span style={{ fontSize: '0.65rem' }}>Active</span>}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => { 
                    setActiveModule('settings'); 
                    setActiveSettingsTab('my_profile');
                    setShowProfileMenu(false); 
                  }}
                >
                  <User size={16} /> My Profile
                </button>
                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => { 
                    setActiveModule('settings'); 
                    if (currentUser.role === 'Employee') {
                      setActiveSettingsTab('my_profile');
                    } else {
                      setActiveSettingsTab('company_details');
                    }
                    setShowProfileMenu(false); 
                  }}
                >
                  <SettingsIcon size={16} /> Settings & Policies
                </button>
                <div style={{ borderTop: '1px solid #E2E8F0', margin: '4px 0' }} />
                <button
                  type="button"
                  className="dropdown-menu-item danger"
                  onClick={() => { 
                    setShowProfileMenu(false); 
                    if (onLogout) onLogout(); 
                  }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
