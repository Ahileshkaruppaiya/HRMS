import React, { useState, useRef, useEffect } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { ModuleName } from '../../types/hrms';
import { 
  LayoutDashboard, 
  Users, 
  ScanFace, 
  CalendarCheck, 
  CalendarDays, 
  Clock, 
  TrendingUp, 
  CheckSquare, 
  Briefcase, 
  IndianRupee, 
  CreditCard, 
  Settings as SettingsIcon,
  Laptop,
  ChevronsLeft,
  ChevronsRight,
  Banknote,
  Timer,
  Search
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

interface MenuItem {
  id: ModuleName;
  label: string;
  icon: React.ElementType;
  section: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { 
    activeModule, 
    setActiveModule, 
    hasPermission, 
    currentUser,
    businessSettings,
    tasks = [],
    notifications = [],
    leaveRequests = [],
    loanRecords = [],
    overtimeRequests = []
  } = useHRMS();

  const [searchFilter, setSearchFilter] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (⌘K / Ctrl+K) to quickly focus sidebar search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Standardized VRM Enterprise Sidebar Menu
  const menuStructure: MenuItem[] = [
    // Organization & Staffing
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'ORGANIZATION' },
    { id: 'employees', label: 'Employee Directory', icon: Users, section: 'ORGANIZATION' },

    // Time & Attendance
    { id: 'face_attendance', label: 'Live Face Attendance', icon: ScanFace, section: 'TIME & ATTENDANCE' },
    { id: 'attendance', label: 'Attendance Management', icon: CalendarCheck, section: 'TIME & ATTENDANCE' },
    { id: 'leaves', label: 'Leave Management', icon: CalendarDays, section: 'TIME & ATTENDANCE' },
    { id: 'shifts', label: 'Shift Management', icon: Clock, section: 'TIME & ATTENDANCE' },

    { id: 'tasks', label: 'Tasks', icon: CheckSquare, section: 'WORKFLOW & OPS' },
    { 
      id: 'performance', 
      label: currentUser.role === 'Employee' ? 'My Performance' : 'Performance', 
      icon: TrendingUp, 
      section: 'WORKFLOW & OPS' 
    },
    { id: 'recruitment', label: 'Recruitment', icon: Briefcase, section: 'WORKFLOW & OPS' },

    // Finance & Payroll
    { id: 'finance', label: 'Finance & Expenses', icon: IndianRupee, section: 'FINANCE & PAYROLL' },
    { id: 'payroll', label: 'Payroll', icon: CreditCard, section: 'FINANCE & PAYROLL' },
    { 
      id: 'advance_salary', 
      label: currentUser.role === 'Employee' ? 'My Advance / Loan' : 'Advance Salary & Loans', 
      icon: Banknote, 
      section: 'FINANCE & PAYROLL' 
    },

    // Workspace & Reports
    { id: 'assets', label: 'Asset Management', icon: Laptop, section: 'WORKSPACE & REPORTS' },

    // System & Config
    { id: 'settings', label: 'Settings', icon: SettingsIcon, section: 'SYSTEM & CONFIG' },
  ];

  // Dynamic live count calculations for badges (mirroring reference badge style)
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const pendingLeavesCount = (currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin')
    ? leaveRequests.filter(l => l.status === 'Pending').length
    : 0;
  const pendingLoansCount = (currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin')
    ? loanRecords.filter(l => l.status === 'Pending').length
    : 0;
  const isManagerOrAdmin = 
    currentUser.role === 'Super Admin' || 
    currentUser.role === 'HR Admin' || 
    currentUser.role === 'HR Manager' || 
    currentUser.role === 'CEO' || 
    currentUser.role === 'Department Manager' || 
    currentUser.role === 'Department Head';
  const pendingOtCount = isManagerOrAdmin
    ? overtimeRequests.filter(r => r.status === 'Pending Approval').length
    : 0;

  const getItemBadge = (id: ModuleName): number | null => {
    if (id === 'tasks' && pendingTasksCount > 0) return pendingTasksCount;
    if (id === 'notifications' && unreadNotificationsCount > 0) return unreadNotificationsCount;
    if (id === 'leaves' && pendingLeavesCount > 0) return pendingLeavesCount;
    if (id === 'advance_salary' && pendingLoansCount > 0) return pendingLoansCount;
    if (id === 'overtime' && pendingOtCount > 0) return pendingOtCount;
    return null;
  };

  // Filter menu items by search query and RBAC permissions
  const filteredItems = menuStructure.filter(item => {
    // Hide Employee directory module for Employee role
    if (currentUser.role === 'Employee' && item.id === 'employees') {
      return false;
    }

    // Check RBAC permission for this module
    if (!hasPermission(item.id, 'view')) {
      return false;
    }

    if (!searchFilter.trim()) return true;

    const query = searchFilter.toLowerCase().trim();
    return item.label.toLowerCase().includes(query) || item.section.toLowerCase().includes(query);
  });

  // Track sections to place thin divider lines between categories
  let renderedSections = new Set<string>();

  const brandInitial = (businessSettings?.businessName || 'VRM').charAt(0).toUpperCase() + '.';

  return (
    <aside className={`hrms-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Top Company Card */}
      {!isCollapsed ? (
        <div className="sidebar-top-card">
          <div 
            className="sidebar-brand-wrapper" 
            onClick={() => setActiveModule('dashboard')} 
            title="Go to Dashboard"
          >
            {businessSettings?.logoUrl ? (
              <img 
                src={businessSettings.logoUrl} 
                alt={`${businessSettings.businessName || 'VRM'} Logo`} 
                className="sidebar-logo-img" 
              />
            ) : (
              <div className="sidebar-logo-square">
                <span>{brandInitial}</span>
              </div>
            )}
            <div className="sidebar-brand-details">
              <div className="sidebar-brand-title">
                {businessSettings?.businessName || 'VRM Enterprise'}
              </div>
              <div className="sidebar-brand-subtitle">
                Enterprise Edition
              </div>
            </div>
          </div>
          <button 
            className="sidebar-collapse-btn"
            onClick={toggleSidebar}
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <ChevronsLeft size={16} strokeWidth={2.4} />
          </button>
        </div>
      ) : (
        <div className="sidebar-top-collapsed">
          <div 
            className="sidebar-logo-square" 
            onClick={() => setActiveModule('dashboard')} 
            title="Dashboard"
            style={{ cursor: 'pointer' }}
          >
            <span>{brandInitial}</span>
          </div>
          <button 
            className="sidebar-collapse-btn collapsed"
            onClick={toggleSidebar}
            title="Expand Sidebar"
            aria-label="Expand Sidebar"
          >
            <ChevronsRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      {!isCollapsed && (
        <div className="sidebar-search-box">
          <Search size={16} color="#64748B" strokeWidth={2.2} />
          <input 
            ref={searchInputRef}
            type="text"
            className="sidebar-search-input"
            placeholder="Search"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      )}

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {filteredItems.map((item) => {
          const isNewSection = !isCollapsed && !renderedSections.has(item.section);
          const isFirstSection = renderedSections.size === 0;

          if (isNewSection) {
            renderedSections.add(item.section);
          }

          const IconComponent = item.icon;
          const isActive = activeModule === item.id;
          const badgeCount = getItemBadge(item.id);

          return (
            <React.Fragment key={item.id}>
              {isNewSection && (
                <>
                  {!isFirstSection && <div className="sidebar-section-divider" />}
                  <div className="nav-section-title">{item.section}</div>
                </>
              )}
              <a
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModule(item.id);
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                  <span className="nav-icon">
                    <IconComponent size={18} strokeWidth={2.2} />
                  </span>
                  {!isCollapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                </div>

                {!isCollapsed && badgeCount !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="nav-item-badge">{badgeCount}</span>
                  </div>
                )}
              </a>
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
};
