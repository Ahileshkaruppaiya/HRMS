import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Role } from '../../types/hrms';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Shield, 
  X, 
  Check,
  UserCheck
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { switchRole } = useHRMS();

  const [email, setEmail] = useState('ceo@vrmstructures.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('Super Admin');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const roles: { role: Role; label: string; email: string; color: string }[] = [
    { role: 'Super Admin', label: 'CEO (Velmurugan)', email: 'ceo@vrmstructures.com', color: '#155DFC' },
    { role: 'HR Admin', label: 'HR (Pavithra)', email: 'hr@vrmstructures.com', color: '#7c3aed' },
    { role: 'Department Manager', label: 'Production Head', email: 'ramesh.ph@vrmstructures.com', color: '#0284c7' },
    { role: 'Employee', label: 'Floor Employee', email: 'murugan.fe@vrmstructures.com', color: '#d97706' }
  ];

  const handleRoleSelect = (roleItem: typeof roles[0]) => {
    setSelectedRole(roleItem.role);
    setEmail(roleItem.email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      switchRole(selectedRole);
      onLoginSuccess();
    }, 600);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
    setTimeout(() => {
      setForgotSubmitted(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 1800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      backgroundColor: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: 'hidden'
    }}>
      
      {/* LEFT PANEL: Dark Indigo Showcase Matching Screenshot */}
      <div style={{
        flex: '1 1 50%',
        background: 'linear-gradient(150deg, #04091e 0%, #0a1738 45%, #08112d 100%)',
        padding: '50px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {/* Subtle Ambient Radial Glows */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(39, 211, 245, 0.22) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        {/* Top Brand Logo Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)'
          }}>
            <img 
              src="/logo.png" 
              alt="VRM Structures Logo" 
              style={{ height: '36px', objectFit: 'contain' }} 
            />
          </div>
        </div>

        {/* Main Content Area matching screenshot */}
        <div style={{ maxWidth: '480px', margin: 'auto 0', zIndex: 2, padding: '40px 0' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '28px'
          }}>
            Manage your<br />
            <span style={{
              background: 'linear-gradient(90deg, #155DFC 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              workforce
            </span><br />
            with precision.
          </h1>

          {/* Feature Bullet List matching screenshot */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1', fontSize: '0.95rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(21, 93, 252, 0.15)',
                border: '1px solid rgba(21, 93, 252, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle2 size={15} color="#155DFC" />
              </div>
              <span>Facial recognition & GPS Location based attendance</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1', fontSize: '0.95rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(21, 93, 252, 0.15)',
                border: '1px solid rgba(21, 93, 252, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle2 size={15} color="#155DFC" />
              </div>
              <span>Automated payroll processing</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1', fontSize: '0.95rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(21, 93, 252, 0.15)',
                border: '1px solid rgba(21, 93, 252, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle2 size={15} color="#155DFC" />
              </div>
              <span>Comprehensive employee management & More...</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '0.78rem', color: '#64748b', zIndex: 2 }}>
          &copy; {new Date().getFullYear()} VRM Structures Enterprise Platform. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL: Clean White Form Section Matching Screenshot */}
      <div style={{
        flex: '1 1 50%',
        backgroundColor: '#ffffff',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              Welcome
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Sign in to your account to continue.
            </p>
          </div>

          {/* Quick Demo Persona Switcher Chips */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', marginBottom: '8px' }}>
              Instant Demo Role Switcher:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {roles.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: isSelected ? `2px solid ${r.color}` : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? `${r.color}12` : '#f8fafc',
                      color: isSelected ? r.color : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email or Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. admin@vrmstructures.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 38px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 38px 12px 38px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button matching screenshot */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #155DFC, #1d4ed8)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(21, 93, 252, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in as {selectedRole}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Links matching screenshot */}
          <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0891b2', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Don't have an account? Create one
            </button>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Sign in with your registered account
            </span>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', width: '90%', borderRadius: '16px', padding: '24px' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Reset Password</h2>
              <button onClick={() => setShowForgotModal(false)}><X size={18} /></button>
            </div>
            
            {forgotSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 6px' }}>Reset Link Sent!</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Check your inbox ({forgotEmail}) for instructions.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
                  Enter your registered work email to receive password reset instructions.
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@vrmstructures.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForgotModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Send Link</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
