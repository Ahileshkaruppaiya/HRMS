import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  Save, 
  Lock, 
  Eye, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload 
} from 'lucide-react';
import { Role, ModuleName, PermissionAction } from '../../types/hrms';

export const RolesPermissionsSettings: React.FC = () => {
  const { 
    permissionMatrix, 
    updatePermission, 
    currentUser, 
    switchRole 
  } = useHRMS();

  const [selectedRole, setSelectedRole] = useState<Role>('HR Admin');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableRoles: Role[] = [
    'Super Admin',
    'HR Admin',
    'Department Head',
    'Department Manager',
    'Finance Manager',
    'Employee'
  ];

  const modulesList: { id: ModuleName; label: string }[] = [
    { id: 'dashboard', label: 'Executive Dashboard' },
    { id: 'employees', label: 'Employee Management & Profiles' },
    { id: 'organization', label: 'Organization & Departments' },
    { id: 'attendance', label: 'Attendance & Biometrics' },
    { id: 'leaves', label: 'Leave Management' },
    { id: 'shifts', label: 'Shift Rostering' },
    { id: 'overtime', label: 'Overtime Management & Approvals' },
    { id: 'payroll', label: 'Payroll & Salary Slips' },
    { id: 'advance_salary', label: 'Advance Salary & Loans' },
    { id: 'finance', label: 'Finance & Expense Claims' },
    { id: 'recruitment', label: 'Recruitment & Job Openings' },
    { id: 'performance', label: 'Performance & Appraisals' },
    { id: 'assets', label: 'Corporate Asset Registry' },
    { id: 'tasks', label: 'Enterprise Task Management' },
    { id: 'reports', label: 'Reports & Analytics' },
    { id: 'settings', label: 'Enterprise System Settings' }
  ];

  const actionsList: { id: PermissionAction; label: string }[] = [
    { id: 'view', label: 'View' },
    { id: 'create', label: 'Create' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete' },
    { id: 'approve', label: 'Approve' },
    { id: 'export', label: 'Export' }
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggle = (module: ModuleName, action: PermissionAction) => {
    if (selectedRole === 'Super Admin') {
      triggerToast('Super Admin role retains immutable root permissions');
      return;
    }
    const currentActions = (permissionMatrix[selectedRole] && permissionMatrix[selectedRole][module]) || [];
    const isCurrentlyEnabled = currentActions.includes(action);
    updatePermission(selectedRole, module, action, !isCurrentlyEnabled);
    triggerToast(`Permission "${action}" for ${module} ${!isCurrentlyEnabled ? 'granted' : 'revoked'}`);
  };

  return (
    <div style={{ padding: '0 4px' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#0E7490',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(14, 116, 144, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>Role-Based Access Control (RBAC) Matrix</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0' }}>Configure module visibility, creation, edit, deletion, approval and export rights per role</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Select Role:</span>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as Role)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#0E7490',
                backgroundColor: '#ECFEFF'
              }}
            >
              {availableRoles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Permission Matrix Grid Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase' }}>Module / Surface</th>
              {actionsList.map(act => (
                <th key={act.id} style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>
                  {act.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modulesList.map(mod => {
              const roleMods = (permissionMatrix[selectedRole] && permissionMatrix[selectedRole][mod.id]) || [];
              const isSuper = selectedRole === 'Super Admin';
              return (
                <tr key={mod.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1E293B', fontSize: '0.88rem' }}>
                    {mod.label}
                  </td>
                  {actionsList.map(act => {
                    const isChecked = isSuper || roleMods.includes(act.id);
                    return (
                      <td key={act.id} style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isSuper}
                          onChange={() => handleToggle(mod.id, act.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: '#0E7490',
                            cursor: isSuper ? 'not-allowed' : 'pointer'
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default RolesPermissionsSettings;
