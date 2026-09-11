import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  Building2, 
  Clock, 
  CalendarDays, 
  CreditCard, 
  Trophy, 
  ChevronRight,
  User,
  Banknote
} from 'lucide-react';
import { NewSettingsSection } from '../../types/settings';

interface SettingsDashboardProps {
  onSelectSection: (section: NewSettingsSection) => void;
  searchQuery?: string;
}

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ onSelectSection, searchQuery = '' }) => {
  const { 
    companyInfo, 
    masterAttendancePolicies, 
    masterLeavePolicies, 
    payrollSettingsConfig, 
    rewardPolicies, 
    loanPolicies = [],
    currentUser 
  } = useHRMS();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isEmployee = currentUser.role === 'Employee';

  const activeAttCount = masterAttendancePolicies.filter(p => p.status === 'Active').length;
  const activeLeaveCount = masterLeavePolicies.filter(p => p.status === 'Active').length;
  const activeSalaryComps = (payrollSettingsConfig.components || []).filter(c => c.active).length;
  const activeRewardsCount = rewardPolicies.filter(p => p.status === 'Active').length;
  const activeLoanCount = loanPolicies.filter(p => p.status === 'Active').length;

  const sections = [
    {
      id: 'my_profile' as NewSettingsSection,
      title: '1. Personal Profile & Credentials',
      icon: User,
      color: '#0E7490',
      bgColor: '#ECFEFF',
      description: 'Personal contact details, password change, two-factor authentication, and notifications.',
      statusBadge: `${currentUser.name} (${currentUser.role})`
    },
    {
      id: 'company_details' as NewSettingsSection,
      title: '2. Company Details',
      icon: Building2,
      color: '#0891B2',
      bgColor: '#F0FDFA',
      description: 'Corporate ROC/GST/PAN identity, multi-branch network, and organizational team hierarchy.',
      statusBadge: `${companyInfo.companyName}`
    },
    {
      id: 'attendance_time' as NewSettingsSection,
      title: '3. Attendance & Time',
      icon: Clock,
      color: '#0284C7',
      bgColor: '#F0F9FF',
      description: 'Shift hours, grace window, custom late deduction rules, and GPS Geofencing map coordinates.',
      statusBadge: `${activeAttCount} Policy Active`
    },
    {
      id: 'leave_management' as NewSettingsSection,
      title: '4. Leave Management',
      icon: CalendarDays,
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      description: 'Leave quota masters, free monthly unpaid leave thresholds, and multi-tier approval flows.',
      statusBadge: `${activeLeaveCount} Master Policy Active`
    },
    {
      id: 'payroll_settings' as NewSettingsSection,
      title: '5. Payroll Settings',
      icon: CreditCard,
      color: '#16A34A',
      bgColor: '#F0FDF4',
      description: 'Salary components, statutory EPF (12%) & ESIC (0.75%) rules, and live mathematical formula builder.',
      statusBadge: `${activeSalaryComps} Components Active`
    },
    {
      id: 'rewards_recognition' as NewSettingsSection,
      title: '6. Rewards & Recognition',
      icon: Trophy,
      color: '#EA580C',
      bgColor: '#FFF7ED',
      description: 'Monthly Attendance Reward (₹1,000) for zero leave, zero absent days and zero late punches.',
      statusBadge: `${activeRewardsCount} Program Active`
    },
    {
      id: 'advance_loan_policy' as NewSettingsSection,
      title: '7. Advance Salary / Loan Policy',
      icon: Banknote,
      color: '#059669',
      bgColor: '#ECFDF5',
      description: 'Work tenure rules, maximum salary advance borrowing caps, monthly EMI tenure bounds, and payroll recovery.',
      statusBadge: `${activeLoanCount} Policies Active`
    }
  ];

  const filteredSections = sections.filter(sec => {
    if (isEmployee && sec.id !== 'my_profile') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return sec.title.toLowerCase().includes(q) || sec.description.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {filteredSections.length === 0 ? (
        <div style={{
          padding: '36px',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E7ECF3',
          color: '#64748B',
          fontSize: '0.9rem'
        }}>
          No settings match your search for "{searchQuery}".
        </div>
      ) : (
        filteredSections.map(sec => {
        const Icon = sec.icon;
        const isHovered = hoveredId === sec.id;

        return (
          <div
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            onMouseEnter={() => setHoveredId(sec.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              backgroundColor: isHovered ? '#FAFCFD' : '#FFFFFF',
              borderRadius: '14px',
              border: isHovered ? `1.5px solid #0E7490` : '1px solid #E7ECF3',
              padding: '14px 20px',
              cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '18px',
              boxShadow: isHovered ? '0 4px 12px rgba(14, 116, 144, 0.08)' : '0 1px 2px rgba(0,0,0,0.02)',
              transform: isHovered ? 'translateY(-1px)' : 'none'
            }}
          >
            {/* Left: Icon + Title & Description */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: sec.bgColor,
                color: sec.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 0.18s ease',
                transform: isHovered ? 'scale(1.05)' : 'none'
              }}>
                <Icon size={20} />
              </div>

              <div style={{ minWidth: 0 }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '14.5px',
                  fontWeight: 750,
                  color: isHovered ? '#0E7490' : '#1E293B',
                  letterSpacing: '-0.2px',
                  transition: 'color 0.15s ease'
                }}>
                  {sec.title}
                </h3>
                <p style={{
                  margin: '3px 0 0',
                  fontSize: '12.5px',
                  color: '#64748B',
                  lineHeight: 1.4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {sec.description}
                </p>
              </div>
            </div>

            {/* Right: Status Badge & Sleek Arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
              <span style={{
                fontSize: '11.5px',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: isHovered ? '#ECFEFF' : '#F8FAFC',
                color: isHovered ? '#0E7490' : '#475569',
                border: isHovered ? '1px solid #CFFAFE' : '1px solid #E2E8F0',
                transition: 'all 0.15s ease'
              }}>
                {sec.statusBadge}
              </span>

              <div style={{
                color: isHovered ? '#0E7490' : '#94A3B8',
                transition: 'all 0.18s ease',
                transform: isHovered ? 'translateX(3px)' : 'none',
                display: 'flex',
                alignItems: 'center'
              }}>
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        );
      }))}
    </div>
  );
};
