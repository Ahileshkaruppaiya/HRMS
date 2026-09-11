import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Employee } from '../../types/hrms';
import { AddEmployeeModal } from './AddEmployeeModal';
import { EmployeeProfile } from './EmployeeProfile';
import { OfferLetterModal } from './OfferLetterModal';
import { downloadCSV, downloadExcel, downloadPDF } from '../../utils/exportUtils';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { ExportDropdown } from '../common/ExportDropdown';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Plus, 
  Search, 
  Download, 
  FileSpreadsheet,
  Eye, 
  Trash2, 
  Building,
  FileText,
  AlertCircle,
  Briefcase,
  MapPin,
  X,
  RotateCcw,
  Filter
} from 'lucide-react';

interface EmployeeListProps {
  openAddModal?: boolean;
  onCloseQuickAdd?: () => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ openAddModal, onCloseQuickAdd }) => {
  const { 
    employees, 
    deleteEmployee, 
    canDeleteEmployee, 
    searchQuery, 
    setSearchQuery, 
    departments, 
    designations, 
    branches, 
    currentUser 
  } = useHRMS();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(openAddModal || false);
  const [activeProfileEmp, setActiveProfileEmp] = useState<Employee | null>(null);
  const [showOfferLetterModal, setShowOfferLetterModal] = useState<boolean>(false);
  const [offerLetterEmp, setOfferLetterEmp] = useState<Employee | null>(null);

  // Delete modal state
  const [deleteTargetEmp, setDeleteTargetEmp] = useState<Employee | null>(null);
  const [deleteCheckResult, setDeleteCheckResult] = useState<{ canDelete: boolean; reason?: string } | null>(null);

  const isEmployeeRole = currentUser.role === 'Employee';
  const isManagerRole = currentUser.role === 'Department Manager';

  // Role-based scoping of employee records
  const roleScopedEmployees = isEmployeeRole
    ? employees.filter(e => e.employeeId === (currentUser.employeeId || 'EMP-001') || e.email === currentUser.email)
    : isManagerRole
    ? employees.filter(e => e.department === currentUser.department)
    : employees;

  // Sync quick add trigger from layout header
  React.useEffect(() => {
    if (openAddModal) {
      setIsAddModalOpen(true);
    }
  }, [openAddModal]);

  // Filter scoped employees by search, dept, designation, location, status
  const filteredEmployees = roleScopedEmployees.filter(emp => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = (isManagerRole || selectedDepartment === 'All') 
      ? true 
      : emp.department === selectedDepartment;
    const matchesDesignation = selectedDesignation === 'All' || emp.designation === selectedDesignation;
    const matchesLocation = selectedLocation === 'All' || 
      (emp.workLocation && emp.workLocation.toLowerCase().includes(selectedLocation.toLowerCase())) ||
      (emp.address && emp.address.toLowerCase().includes(selectedLocation.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesDesignation && matchesLocation && matchesStatus;
  });

  const exportColumns = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'workLocation', label: 'Location' },
    { key: 'status', label: 'Status' }
  ];

  const getExportData = () => filteredEmployees.map(e => ({
    employeeId: e.employeeId,
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    department: e.department,
    designation: e.designation,
    workLocation: e.workLocation || 'Chennai HQ',
    status: e.status
  }));

  const handleExportCSV = () => {
    downloadCSV(getExportData(), `Employee_Directory_${new Date().toISOString().split('T')[0]}`, exportColumns);
  };

  const handleExportExcel = () => {
    downloadExcel(getExportData(), `Employee_Directory_${new Date().toISOString().split('T')[0]}`, exportColumns);
  };

  const handleExportPDF = () => {
    downloadPDF(getExportData(), 'Employee Directory Master Register', `Employee_Directory_${new Date().toISOString().split('T')[0]}`, exportColumns);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Employee Directory {isEmployeeRole ? '(My Profile)' : isManagerRole ? `(${currentUser.department} Department)` : '(All Workforce)'}</h1>
          <p className="page-subtitle">
            {isEmployeeRole 
              ? 'View and manage your personal employee profile details' 
              : isManagerRole 
              ? `Manage workforce records and profiles for the ${currentUser.department} department` 
              : 'Manage company-wide workforce records, department assignments, and employee profiles'}
          </p>
        </div>
        <div className="header-actions">
          {(currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin') && (
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => {
                setOfferLetterEmp(filteredEmployees[0] || null);
                setShowOfferLetterModal(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={15} color="#2563eb" /> Offer Letter Templates
            </button>
          )}
          <ExportDropdown 
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            label="Download"
          />
          {(currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin') && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>{isEmployeeRole ? 'My Profile Status' : isManagerRole ? 'Department Staff' : 'Total Employees'}</span>
            <div className="kpi-icon-wrapper blue"><Users size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{roleScopedEmployees.length}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Active Workforce</span>
            <div className="kpi-icon-wrapper emerald"><UserCheck size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{roleScopedEmployees.filter(e => e.status === 'Active').length}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>On Leave</span>
            <div className="kpi-icon-wrapper rose"><UserX size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{roleScopedEmployees.filter(e => e.status === 'On Leave').length}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>{isManagerRole ? 'Assigned Department' : 'Departments'}</span>
            <div className="kpi-icon-wrapper purple"><Building size={20} /></div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-value">{isManagerRole ? 1 : departments.length}</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      {/* Filters Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>

        {/* Row 2: 4-Column Aligned Filter Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '14px',
          paddingTop: '14px',
          borderTop: '1px solid var(--color-border)'
        }}>
          {/* Department */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Department
            </label>
            <select 
              className="form-control" 
              style={{ width: '100%', height: '38px', padding: '6px 12px', fontSize: '0.84rem', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
              value={isManagerRole ? currentUser.department : selectedDepartment} 
              onChange={e => setSelectedDepartment(e.target.value)}
              disabled={isManagerRole || isEmployeeRole}
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Designation
            </label>
            <select 
              className="form-control" 
              style={{ width: '100%', height: '38px', padding: '6px 12px', fontSize: '0.84rem', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
              value={selectedDesignation} 
              onChange={e => setSelectedDesignation(e.target.value)}
            >
              <option value="All">All Designations</option>
              {designations.map(des => (
                <option key={des.id} value={des.title}>{des.title}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Location
            </label>
            <select 
              className="form-control" 
              style={{ width: '100%', height: '38px', padding: '6px 12px', fontSize: '0.84rem', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
              value={selectedLocation} 
              onChange={e => setSelectedLocation(e.target.value)}
            >
              <option value="All">All Locations</option>
              {branches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Status
            </label>
            <select 
              className="form-control" 
              style={{ width: '100%', height: '38px', padding: '6px 12px', fontSize: '0.84rem', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
              value={selectedStatus} 
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-responsive">
        <table className="hrms-table" style={{ width: '100%', minWidth: '1000px' }}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Reporting Manager</th>
              <th>Type</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No employees matched your criteria.
                </td>
              </tr>
            ) : (
              filteredEmployees.map(emp => {
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="user-cell">
                        {emp.avatar ? (
                          <img src={emp.avatar} alt={emp.firstName} className="user-cell-img" />
                        ) : (
                          <div 
                            className="user-cell-img"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-primary-blue)',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              border: '1px solid #cffafe',
                              borderRadius: '9999px',
                              flexShrink: 0
                            }}
                          >
                            {emp.firstName?.[0] || ''}{emp.lastName?.[0] || ''}
                          </div>
                        )}
                        <div className="user-cell-info">
                          <span className="user-cell-name">{emp.firstName} {emp.lastName}</span>
                          <span className="user-cell-sub">{emp.employeeId} • {emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.reportingManagerName}</td>
                    <td>{emp.employmentType}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDateDDMMYYYY(emp.joiningDate)}</td>
                    <td>
                      <span className={`status-pill ${emp.status.toLowerCase().replace(' ', '-')}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          title="View Connected Profile"
                          onClick={() => setActiveProfileEmp(emp)}
                        >
                          <Eye size={14} /> Profile
                        </button>

                        {(currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin') && (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            title="Generate / View Offer Letter"
                            onClick={() => {
                              setOfferLetterEmp(emp);
                              setShowOfferLetterModal(true);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FileText size={14} color="var(--color-primary-blue)" /> Offer Letter
                          </button>
                        )}

                        <button 
                          className="btn btn-danger btn-sm" 
                          title="Delete Employee"
                          onClick={() => {
                            const check = canDeleteEmployee(emp.employeeId);
                            setDeleteTargetEmp(emp);
                            setDeleteCheckResult(check);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <AddEmployeeModal 
          isOpen={isAddModalOpen} 
          onClose={() => {
            setIsAddModalOpen(false);
            if (onCloseQuickAdd) onCloseQuickAdd();
          }} 
          onGenerateOfferLetter={(newEmp) => {
            setIsAddModalOpen(false);
            if (onCloseQuickAdd) onCloseQuickAdd();
            setOfferLetterEmp(newEmp);
            setShowOfferLetterModal(true);
          }}
        />
      )}

      {/* Employee Connected Profile Modal */}
      {activeProfileEmp && (
        <EmployeeProfile 
          employee={activeProfileEmp} 
          onClose={() => setActiveProfileEmp(null)} 
        />
      )}

      {/* Offer Letter Generator & Preview Modal */}
      {showOfferLetterModal && (
        <OfferLetterModal
          isOpen={showOfferLetterModal}
          onClose={() => setShowOfferLetterModal(false)}
          initialEmployee={offerLetterEmp}
        />
      )}

      {/* Delete Employee Confirmation / Safety Check Modal */}
      {deleteTargetEmp && deleteCheckResult && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '480px', borderRadius: 'var(--radius-dialog)' }}>
            <div className="modal-header" style={{ alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: deleteCheckResult.canDelete ? '#FEE2E2' : '#FEF3C7',
                  color: deleteCheckResult.canDelete ? '#EF4444' : '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {deleteCheckResult.canDelete ? <Trash2 size={20} /> : <AlertCircle size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                    {deleteCheckResult.canDelete ? 'Delete Employee Profile' : 'Deletion Blocked by System'}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    Employee ID: <strong style={{ fontFamily: 'monospace' }}>{deleteTargetEmp.employeeId}</strong>
                  </p>
                </div>
              </div>
              <button 
                className="btn-icon" 
                onClick={() => {
                  setDeleteTargetEmp(null);
                  setDeleteCheckResult(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px' }}>
              {deleteCheckResult.canDelete ? (
                <div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                    Are you sure you want to delete <strong>{deleteTargetEmp.firstName} {deleteTargetEmp.lastName}</strong>?
                  </p>
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    color: '#991B1B',
                    padding: '12px',
                    borderRadius: 'var(--radius-input)',
                    fontSize: '0.82rem'
                  }}>
                    ⚠️ This will remove the employee's personal record, attendance logs, and profile assignments permanently.
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FEF3C7',
                    color: '#92400E',
                    padding: '14px',
                    borderRadius: 'var(--radius-input)',
                    fontSize: '0.86rem',
                    lineHeight: '1.5',
                    marginBottom: '16px'
                  }}>
                    {deleteCheckResult.reason}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    To ensure enterprise data integrity, please return or reassign all company assets and tasks before removing this workforce member.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setDeleteTargetEmp(null);
                  setDeleteCheckResult(null);
                }}
              >
                {deleteCheckResult.canDelete ? 'Cancel' : 'Understood'}
              </button>
              {deleteCheckResult.canDelete && (
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => {
                    deleteEmployee(deleteTargetEmp.id);
                    setDeleteTargetEmp(null);
                    setDeleteCheckResult(null);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={16} /> Confirm Deletion
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
