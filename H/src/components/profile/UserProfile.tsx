import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Role } from '../../types/hrms';
import { 
  User, 
  Lock, 
  Shield, 
  Bell, 
  Power,
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Save, 
  Copy, 
  Download, 
  QrCode, 
  Smartphone, 
  CreditCard, 
  FileText, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Check, 
  AlertTriangle,
  RefreshCw,
  LogOut
} from 'lucide-react';

export type ProfileTab = 
  | 'profile' 
  | 'password' 
  | '2fa' 
  | 'notifications' 
  | 'logout';

interface UserProfileProps {
  onLogout?: () => void;
  isEmbedded?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onLogout, isEmbedded = false }) => {
  const { 
    currentUser, 
    updateCurrentUser, 
    switchRole, 
    businessSettings 
  } = useHRMS();

  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || 'Velmurugan',
    email: currentUser.email || 'ceo@vrmstructures.com',
    phone: '+91 98401 23456',
    department: currentUser.department || 'Management',
    designation: currentUser.designation || 'Chief Executive Officer (CEO)',
    employeeId: currentUser.employeeId || 'EMP-000',
    location: 'Madhavaram Corporate HQ, Chennai',
    joiningDate: '12 Jan 2021',
    bio: 'Overseeing corporate operations, structural engineering projects, and enterprise digital workforce management across VRM facilities.'
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: profileForm.name,
      email: profileForm.email,
      department: profileForm.department,
      designation: profileForm.designation,
      employeeId: profileForm.employeeId
    });
    showToast('Profile information updated successfully!');
  };

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    showToast('Password updated securely!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Notification Preferences State
  const [notifPreferences, setNotifPreferences] = useState({
    emailLeaveAlerts: true,
    emailPayrollSlips: true,
    emailTaskAssignments: true,
    emailAnnouncements: true,
    pushDailyPunchReminder: true,
    pushShiftChanges: true,
    smsEmergencyAlerts: true,
    smsOtpVerification: true
  });

  // Navigation Items
  const menuItems: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: '2fa', label: 'Two-Factor Authentication', icon: Shield },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'logout', label: 'Log Out', icon: Power }
  ];

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: isEmbedded ? '100%' : '1200px', 
      margin: isEmbedded ? '0' : '0 auto', 
      padding: isEmbedded ? '0' : '12px 16px 60px', 
      fontFamily: 'var(--font-primary)' 
    }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
          fontWeight: 700,
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} color="#0E7490" /> {toastMessage}
        </div>
      )}

      {/* Page Title & Breadcrumb - shown when standalone */}
      {!isEmbedded && (
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Account & Profile
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
            Manage your personal credentials, enterprise security, notifications, and platform access
          </p>
        </div>
      )}

      {/* Sub-tabs for Embedded Mode in Settings */}
      {isEmbedded && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '14px',
          marginBottom: '20px',
          borderBottom: '1px solid #E2E8F0'
        }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLogout = item.id === 'logout';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isLogout && onLogout) {
                    setActiveTab('logout');
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid #0E7490' : '1px solid #CBD5E1',
                  backgroundColor: isActive ? '#0E7490' : isLogout ? '#FEF2F2' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : isLogout ? '#DC2626' : '#334155',
                  fontWeight: isActive ? 750 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(14, 116, 144, 0.2)' : 'none'
                }}
              >
                <Icon size={16} color={isActive ? '#FFFFFF' : isLogout ? '#DC2626' : '#0E7490'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Container */}
      <div style={isEmbedded ? { display: 'block' } : {
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>

        {/* Vertical Navigation Menu - shown only when standalone */}
        {!isEmbedded && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '12px 8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLogout = item.id === 'logout';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (isLogout && onLogout) {
                      setActiveTab('logout');
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isActive ? '#ECFEFF' : 'transparent',
                    color: isActive ? '#0E7490' : isLogout ? '#dc2626' : '#334155',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = isLogout ? '#fef2f2' : '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} color={isActive ? '#0E7490' : isLogout ? '#dc2626' : '#475569'} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ACTIVE PANEL CONTENT */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          minHeight: '480px'
        }}>

          {/* ---------------- 1. TAB: PROFILE ---------------- */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Personal Profile
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Manage your personal contact details, designation, and enterprise work profile
                </p>
              </div>

              {/* Profile Header Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '18px 20px',
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                marginBottom: '24px'
              }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    backgroundColor: '#0E7490',
                    color: '#ffffff',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(14, 116, 144, 0.2)'
                  }}>
                    {currentUser.name ? currentUser.name.split(' ').map(p => p[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() : 'VM'}
                  </div>
                  <button
                    type="button"
                    title="Change Avatar"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => showToast('Avatar upload dialog opened.')}
                  >
                    <Camera size={14} color="#0E7490" />
                  </button>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {currentUser.name}
                    </h3>
                    <span style={{
                      backgroundColor: '#ECFEFF',
                      color: '#0E7490',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px'
                    }}>
                      {currentUser.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
                    {currentUser.designation || 'CEO'} • {currentUser.department || 'Management'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    Employee Code: <strong>{profileForm.employeeId}</strong> • Member since {profileForm.joiningDate}
                  </div>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleProfileSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Official Corporate Email *</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Designation / Job Title</label>
                    <input
                      type="text"
                      value={profileForm.designation}
                      onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Department</label>
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Primary Work Location</label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Professional Bio / About</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="submit"
                    style={primaryBtnStyle}
                  >
                    <Save size={16} /> Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---------------- 2. TAB: CHANGE PASSWORD ---------------- */}
          {activeTab === 'password' && (
            <div>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Change Password
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Ensure your account is protected with a strong, unique password
                </p>
              </div>

              <form onSubmit={handlePasswordUpdate} style={{ maxWidth: '480px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Current Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      required
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      placeholder="Enter minimum 8 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Password Criteria Checklist */}
                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', fontSize: '0.78rem', color: '#64748b' }}>
                  <div style={{ fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Password Requirements:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordForm.newPassword.length >= 8 ? '#166534' : '#64748b' }}>
                      <Check size={14} color={passwordForm.newPassword.length >= 8 ? '#16a34a' : '#94a3b8'} /> Minimum 8 characters
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: /[A-Z]/.test(passwordForm.newPassword) ? '#166534' : '#64748b' }}>
                      <Check size={14} color={/[A-Z]/.test(passwordForm.newPassword) ? '#16a34a' : '#94a3b8'} /> At least one uppercase letter (A-Z)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: /[0-9]/.test(passwordForm.newPassword) ? '#166534' : '#64748b' }}>
                      <Check size={14} color={/[0-9]/.test(passwordForm.newPassword) ? '#16a34a' : '#94a3b8'} /> At least one number (0-9)
                    </div>
                  </div>
                </div>

                <button type="submit" style={primaryBtnStyle}>
                  <Lock size={16} /> Update Password
                </button>
              </form>
            </div>
          )}

          {/* ---------------- 3. TAB: TWO-FACTOR AUTHENTICATION ---------------- */}
          {activeTab === '2fa' && (
            <div>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Two-Factor Authentication (2FA)
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Add an extra layer of security to prevent unauthorized access to your account
                </p>
              </div>

              {/* Status Banner */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                backgroundColor: is2FAEnabled ? '#f0fdf4' : '#fffbeb',
                border: is2FAEnabled ? '1px solid #bbf7d0' : '1px solid #fde68a',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={24} color={is2FAEnabled ? '#16a34a' : '#d97706'} />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: is2FAEnabled ? '#166534' : '#92400e' }}>
                      {is2FAEnabled ? 'Two-Factor Authentication is Enabled' : '2FA is Currently Disabled'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: is2FAEnabled ? '#15803d' : '#b45309' }}>
                      {is2FAEnabled ? 'Your account is secured with Google/Microsoft Authenticator OTP' : 'Enable 2FA to protect corporate resources'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIs2FAEnabled(!is2FAEnabled);
                    showToast(is2FAEnabled ? '2FA disabled.' : '2FA activated successfully!');
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: is2FAEnabled ? '#fee2e2' : '#0E7490',
                    color: is2FAEnabled ? '#dc2626' : '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>

              {/* Authenticator Setup Simulation */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                gap: '24px',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '180px',
                  height: '180px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px'
                }}>
                  <QrCode size={130} color="#0f172a" />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Scan with App</span>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Step 1: Scan QR Code with Authenticator
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 12px 0' }}>
                    Open Google Authenticator or Microsoft Authenticator on your mobile device and scan this QR code.
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginBottom: '4px' }}>
                      Can't scan? Enter Secret Key manually:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{ padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', color: '#0E7490' }}>
                        VRM2-7X9K-B4LM-88Q1
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText('VRM2-7X9K-B4LM-88Q1');
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        style={{ padding: '6px 12px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}
                      >
                        {copiedCode ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                        {copiedCode ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                      Step 2: Enter 6-digit Verification Code
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        style={{ ...inputStyle, width: '160px', letterSpacing: '0.2em', textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (verificationCode.length === 6) {
                            showToast('Authenticator verified successfully!');
                            setVerificationCode('');
                          } else {
                            alert('Please enter a valid 6-digit code.');
                          }
                        }}
                        style={primaryBtnStyle}
                      >
                        Verify & Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recovery Backup Codes */}
              <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                    Emergency Backup Recovery Codes (8 remaining)
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Backup codes downloaded as PDF.')}
                    style={{ background: 'none', border: 'none', color: '#0E7490', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={14} /> Download Codes
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '0.82rem', fontFamily: 'monospace', color: '#475569' }}>
                  <div style={{ padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>8291-0492</div>
                  <div style={{ padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>3910-4829</div>
                  <div style={{ padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>9482-1920</div>
                  <div style={{ padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>5829-3019</div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- 4. TAB: NOTIFICATION SETTINGS ---------------- */}
          {activeTab === 'notifications' && (
            <div>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Notification Preferences
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Choose which alerts and digests you receive via Email, Mobile SMS, and Browser Push
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0E7490', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Email Notifications
                </div>

                <div style={toggleRowStyle}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>Leave & Regularization Approvals</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Receive instant email when your subordinates submit leaves or attendance corrections</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.emailLeaveAlerts}
                    onChange={(e) => {
                      setNotifPreferences({ ...notifPreferences, emailLeaveAlerts: e.target.checked });
                      showToast('Notification preference updated.');
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#0E7490', cursor: 'pointer' }}
                  />
                </div>

                <div style={toggleRowStyle}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>Monthly Payslip & Tax Form 16</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Get notified as soon as monthly payroll disbursement is published</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.emailPayrollSlips}
                    onChange={(e) => {
                      setNotifPreferences({ ...notifPreferences, emailPayrollSlips: e.target.checked });
                      showToast('Notification preference updated.');
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#0E7490', cursor: 'pointer' }}
                  />
                </div>

                <div style={toggleRowStyle}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>Task Assignments & Due Dates</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Alerts for critical engineering tasks and milestone dead-lines</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.emailTaskAssignments}
                    onChange={(e) => {
                      setNotifPreferences({ ...notifPreferences, emailTaskAssignments: e.target.checked });
                      showToast('Notification preference updated.');
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#0E7490', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0E7490', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '12px' }}>
                  Mobile & Push Alerts
                </div>

                <div style={toggleRowStyle}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>Daily Clock-In / Punch Reminder</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Browser notification 10 minutes prior to scheduled shift start</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.pushDailyPunchReminder}
                    onChange={(e) => {
                      setNotifPreferences({ ...notifPreferences, pushDailyPunchReminder: e.target.checked });
                      showToast('Notification preference updated.');
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#0E7490', cursor: 'pointer' }}
                  />
                </div>

                <div style={toggleRowStyle}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>Critical Site Safety & Emergency SMS</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Direct SMS broadcasts during severe weather or site safety protocols</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.smsEmergencyAlerts}
                    onChange={(e) => {
                      setNotifPreferences({ ...notifPreferences, smsEmergencyAlerts: e.target.checked });
                      showToast('Notification preference updated.');
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#0E7490', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---------------- 5. TAB: LOG OUT ---------------- */}
          {activeTab === 'logout' && (
            <div>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626', margin: 0 }}>
                  Log Out of Session
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Safely end your current session and sign out of the VRM Enterprise Portal
                </p>
              </div>

              <div style={{
                maxWidth: '520px',
                padding: '24px',
                backgroundColor: '#fef2f2',
                borderRadius: '16px',
                border: '1.5px solid #fecaca',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <Power size={28} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991b1b', margin: '0 0 8px 0' }}>
                  Are you sure you want to sign out?
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#7f1d1d', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                  You will be logged out of <strong>{currentUser.name}</strong> ({currentUser.role}). Any unsaved form drafts will be discarded.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel / Return
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) {
                        onLogout();
                      } else {
                        window.location.reload();
                      }
                    }}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                    }}
                  >
                    <LogOut size={16} /> Sign Out Now
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Styling Constants
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '6px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1.5px solid #cbd5e1',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff'
};

const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: '#0E7490',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '10px',
  border: 'none',
  fontSize: '0.88rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 2px 8px rgba(14, 116, 144, 0.25)'
};

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 16px',
  backgroundColor: '#f8fafc',
  borderRadius: '10px',
  border: '1px solid #e2e8f0'
};

