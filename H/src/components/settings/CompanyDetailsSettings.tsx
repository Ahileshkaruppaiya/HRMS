import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { CompanyBranch } from '../../types/settings';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Edit3, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Globe, 
  Mail, 
  Phone, 
  FileText, 
  Clock, 
  Calendar, 
  User, 
  Users,
  Briefcase,
  X
} from 'lucide-react';

export const CompanyDetailsSettings: React.FC = () => {
  const { 
    companyInfo, 
    updateCompanyInfo, 
    companyBranches, 
    addCompanyBranch, 
    updateCompanyBranch, 
    deleteCompanyBranch,
    orgStructure,
    updateOrgStructure,
    policyAuditLogs,
    currentUser,
    hasPermission
  } = useHRMS();

  const isPrivileged = currentUser.role === 'Super Admin' || currentUser.role === 'HR Admin' || currentUser.role === 'Management';
  const [activeTab, setActiveTab] = useState<'info' | 'branches' | 'org'>('info');

  // Edit states for Company Info
  const [infoForm, setInfoForm] = useState(companyInfo);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoSavedSuccess, setInfoSavedSuccess] = useState(false);

  // Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<CompanyBranch | null>(null);
  const [branchForm, setBranchForm] = useState<{
    branchName: string;
    branchCode: string;
    isHeadOffice: boolean;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    contactNumber: string;
    email: string;
    branchHr: string;
    workingDays: string[];
    startTime: string;
    endTime: string;
  }>({
    branchName: '',
    branchCode: '',
    isHeadOffice: false,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    contactNumber: '',
    email: '',
    branchHr: '',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    startTime: '09:30',
    endTime: '18:30'
  });

  // Organization Master Add States
  const [newDept, setNewDept] = useState('');
  const [newDesig, setNewDesig] = useState('');
  const [newEmpType, setNewEmpType] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDept, setNewTeamDept] = useState(orgStructure.departments[0] || 'Engineering');
  const [newTeamLead, setNewTeamLead] = useState('');

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo(infoForm);
    setIsEditingInfo(false);
    setInfoSavedSuccess(true);
    setTimeout(() => setInfoSavedSuccess(false), 3000);
  };

  const openAddBranchModal = () => {
    setEditingBranch(null);
    setBranchForm({
      branchName: '',
      branchCode: '',
      isHeadOffice: false,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      contactNumber: '',
      email: '',
      branchHr: '',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      startTime: '09:30',
      endTime: '18:30'
    });
    setIsBranchModalOpen(true);
  };

  const openEditBranchModal = (b: CompanyBranch) => {
    setEditingBranch(b);
    setBranchForm({
      branchName: b.branchName,
      branchCode: b.branchCode,
      isHeadOffice: b.isHeadOffice,
      addressLine1: b.address.addressLine1,
      addressLine2: b.address.addressLine2 || '',
      city: b.address.city,
      state: b.address.state,
      country: b.address.country,
      pincode: b.address.pincode,
      contactNumber: b.contactNumber,
      email: b.email,
      branchHr: b.branchHr,
      workingDays: b.workingDays,
      startTime: b.workingHours.startTime,
      endTime: b.workingHours.endTime
    });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.branchName || !branchForm.branchCode) return;

    if (editingBranch) {
      updateCompanyBranch(editingBranch.id, {
        branchName: branchForm.branchName,
        branchCode: branchForm.branchCode,
        isHeadOffice: branchForm.isHeadOffice,
        address: {
          addressLine1: branchForm.addressLine1,
          addressLine2: branchForm.addressLine2,
          city: branchForm.city,
          state: branchForm.state,
          country: branchForm.country,
          pincode: branchForm.pincode
        },
        contactNumber: branchForm.contactNumber,
        email: branchForm.email,
        branchHr: branchForm.branchHr,
        workingDays: branchForm.workingDays,
        workingHours: {
          startTime: branchForm.startTime,
          endTime: branchForm.endTime
        }
      });
    } else {
      addCompanyBranch({
        branchName: branchForm.branchName,
        branchCode: branchForm.branchCode,
        isHeadOffice: branchForm.isHeadOffice,
        address: {
          addressLine1: branchForm.addressLine1,
          addressLine2: branchForm.addressLine2,
          city: branchForm.city,
          state: branchForm.state,
          country: branchForm.country,
          pincode: branchForm.pincode
        },
        contactNumber: branchForm.contactNumber,
        email: branchForm.email,
        branchHr: branchForm.branchHr,
        workingDays: branchForm.workingDays,
        workingHours: {
          startTime: branchForm.startTime,
          endTime: branchForm.endTime
        }
      });
    }
    setIsBranchModalOpen(false);
  };

  const handleAddDept = () => {
    if (!newDept.trim() || orgStructure.departments.includes(newDept.trim())) return;
    updateOrgStructure({ departments: [...orgStructure.departments, newDept.trim()] });
    setNewDept('');
  };

  const handleAddDesig = () => {
    if (!newDesig.trim() || orgStructure.designations.includes(newDesig.trim())) return;
    updateOrgStructure({ designations: [...orgStructure.designations, newDesig.trim()] });
    setNewDesig('');
  };

  const handleAddEmpType = () => {
    if (!newEmpType.trim() || orgStructure.employmentTypes.includes(newEmpType.trim())) return;
    updateOrgStructure({ employmentTypes: [...orgStructure.employmentTypes, newEmpType.trim()] });
    setNewEmpType('');
  };

  const handleAddLocation = () => {
    if (!newLocation.trim() || orgStructure.workLocations.includes(newLocation.trim())) return;
    updateOrgStructure({ workLocations: [...orgStructure.workLocations, newLocation.trim()] });
    setNewLocation('');
  };

  const handleRemoveLocation = (locToRemove: string) => {
    updateOrgStructure({
      workLocations: orgStructure.workLocations.filter(l => l !== locToRemove)
    });
  };

  const handleRemoveDept = (deptToRemove: string) => {
    updateOrgStructure({
      departments: orgStructure.departments.filter(d => d !== deptToRemove)
    });
  };

  const handleRemoveDesig = (desigToRemove: string) => {
    updateOrgStructure({
      designations: orgStructure.designations.filter(d => d !== desigToRemove)
    });
  };

  const handleRemoveEmpType = (typeToRemove: string) => {
    updateOrgStructure({
      employmentTypes: orgStructure.employmentTypes.filter(t => t !== typeToRemove)
    });
  };

  // Keep only Chennai in Work Locations, purge others
  React.useEffect(() => {
    const hasOtherLocations = orgStructure.workLocations.some(
      l => !l.toLowerCase().includes('chennai')
    );
    if (hasOtherLocations) {
      const chennaiOnly = orgStructure.workLocations.filter(l => l.toLowerCase().includes('chennai'));
      updateOrgStructure({
        workLocations: chennaiOnly.length > 0 ? chennaiOnly : ['Chennai HQ']
      });
    }
  }, []);

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam = {
      id: `TM-${Date.now()}`,
      name: newTeamName.trim(),
      departmentId: newTeamDept,
      leadEmployeeName: newTeamLead.trim() || 'Unassigned'
    };
    updateOrgStructure({ teams: [...orgStructure.teams, newTeam] });
    setNewTeamName('');
    setNewTeamLead('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            borderBottom: activeTab === 'info' ? '3px solid #0E7490' : '3px solid transparent',
            backgroundColor: activeTab === 'info' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'info' ? '#0E7490' : '#64748B',
            fontWeight: activeTab === 'info' ? 700 : 500,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          <Building2 size={16} /> A. Basic Company Information
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            borderBottom: activeTab === 'branches' ? '3px solid #0E7490' : '3px solid transparent',
            backgroundColor: activeTab === 'branches' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'branches' ? '#0E7490' : '#64748B',
            fontWeight: activeTab === 'branches' ? 700 : 500,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          <MapPin size={16} /> B. Address & Branches ({companyBranches.length})
        </button>

        <button
          onClick={() => setActiveTab('org')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            borderBottom: activeTab === 'org' ? '3px solid #0E7490' : '3px solid transparent',
            backgroundColor: activeTab === 'org' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'org' ? '#0E7490' : '#64748B',
            fontWeight: activeTab === 'org' ? 700 : 500,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          <Layers size={16} /> C. Organization Structure
        </button>
      </div>

      {infoSavedSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: '#DCFCE7',
          color: '#166534',
          borderRadius: '12px',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} /> Company details saved and logged into audit history successfully!
        </div>
      )}

      {/* TAB 1: BASIC COMPANY INFORMATION */}
      {activeTab === 'info' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E7ECF3',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
              Corporate Legal & Identity Profile
            </h3>
            {isPrivileged && !isEditingInfo && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditingInfo(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit3 size={15} /> Edit Details
              </button>
            )}
          </div>

          <form onSubmit={handleSaveInfo}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  Company Name (Brand)
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled={!isEditingInfo}
                  value={infoForm.companyName}
                  onChange={e => setInfoForm({ ...infoForm, companyName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  Legal Registered Entity Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled={!isEditingInfo}
                  value={infoForm.legalCompanyName}
                  onChange={e => setInfoForm({ ...infoForm, legalCompanyName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  Company Type
                </label>
                <select
                  className="form-control"
                  disabled={!isEditingInfo}
                  value={infoForm.companyType}
                  onChange={e => setInfoForm({ ...infoForm, companyType: e.target.value })}
                >
                  <option value="Private Limited">Private Limited (Pvt. Ltd.)</option>
                  <option value="Public Limited">Public Limited (Ltd.)</option>
                  <option value="Limited Liability Partnership">LLP</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  Industry Sector
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled={!isEditingInfo}
                  value={infoForm.industry}
                  onChange={e => setInfoForm({ ...infoForm, industry: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  ROC Registration Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled={!isEditingInfo}
                  value={infoForm.registrationNumber}
                  onChange={e => setInfoForm({ ...infoForm, registrationNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  GST Number (GSTIN)
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled={!isEditingInfo}
                  value={infoForm.gstNumber}
                  onChange={e => setInfoForm({ ...infoForm, gstNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  PAN Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled={!isEditingInfo}
                  value={infoForm.panNumber}
                  onChange={e => setInfoForm({ ...infoForm, panNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  CIN Number (Corporate Identification)
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled={!isEditingInfo}
                  value={infoForm.cinNumber}
                  onChange={e => setInfoForm({ ...infoForm, cinNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  Official Website
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Globe size={15} style={{ position: 'absolute', left: '12px', color: '#94A3B8' }} />
                  <input
                    type="url"
                    className="form-control"
                    style={{ paddingLeft: '34px' }}
                    disabled={!isEditingInfo}
                    value={infoForm.website}
                    onChange={e => setInfoForm({ ...infoForm, website: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  Official Corporate Email
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', color: '#94A3B8' }} />
                  <input
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '34px' }}
                    disabled={!isEditingInfo}
                    value={infoForm.officialEmail}
                    onChange={e => setInfoForm({ ...infoForm, officialEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  Official Phone Number
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '12px', color: '#94A3B8' }} />
                  <input
                    type="tel"
                    className="form-control"
                    style={{ paddingLeft: '34px' }}
                    disabled={!isEditingInfo}
                    value={infoForm.officialPhone}
                    onChange={e => setInfoForm({ ...infoForm, officialPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {isEditingInfo && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setInfoForm(companyInfo);
                    setIsEditingInfo(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB 2: ADDRESS & BRANCHES */}
      {activeTab === 'branches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                Multi-Branch & Headquarters Network
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                Company hierarchy across Head Office, construction yards, engineering centers, and regional hubs
              </p>
            </div>
            {isPrivileged && (
              <button
                className="btn btn-primary btn-sm"
                onClick={openAddBranchModal}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Branch
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {companyBranches.map(branch => (
              <div
                key={branch.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: branch.isHeadOffice ? '2px solid #0E7490' : '1px solid #E7ECF3',
                  padding: '20px',
                  position: 'relative',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                        {branch.branchName}
                      </h4>
                      {branch.isHeadOffice && (
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          backgroundColor: '#ECFEFF',
                          color: '#0E7490',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          border: '1px solid #A5F3FC'
                        }}>
                          HEAD OFFICE
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                      Code: {branch.branchCode}
                    </span>
                  </div>

                  {isPrivileged && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => openEditBranchModal(branch)}
                        title="Edit Branch"
                      >
                        <Edit3 size={14} />
                      </button>
                      {!branch.isHeadOffice && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#EF4444' }}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${branch.branchName}?`)) {
                              deleteCompanyBranch(branch.id);
                            }
                          }}
                          title="Delete Branch"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={15} color="#0E7490" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      {branch.address.addressLine1}, {branch.address.addressLine2 ? `${branch.address.addressLine2}, ` : ''}
                      {branch.address.city}, {branch.address.state} - {branch.address.pincode}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={15} color="#64748B" />
                    <span>{branch.contactNumber || 'N/A'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={15} color="#64748B" />
                    <span>{branch.email || 'N/A'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={15} color="#64748B" />
                    <span>Branch HR Lead: <strong>{branch.branchHr || 'Unassigned'}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} color="#64748B" />
                    <span>Working Hours: <strong>{branch.workingHours.startTime} - {branch.workingHours.endTime}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZATION STRUCTURE */}
      {activeTab === 'org' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Departments */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={16} color="#0E7490" /> Departments ({orgStructure.departments.length})
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Add new department..."
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  className="form-control form-control-sm"
                />
                <button className="btn btn-primary btn-sm" onClick={handleAddDept}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {orgStructure.departments.map(d => (
                  <span
                    key={d}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: '#F1F5F9',
                      color: '#1E293B',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => handleRemoveDept(d)}
                      title={`Remove ${d}`}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#64748B',
                        fontSize: '14px',
                        lineHeight: 1,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Designations */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={16} color="#0E7490" /> Designations ({orgStructure.designations.length})
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Add new designation..."
                  value={newDesig}
                  onChange={e => setNewDesig(e.target.value)}
                  className="form-control form-control-sm"
                />
                <button className="btn btn-primary btn-sm" onClick={handleAddDesig}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {orgStructure.designations.map(d => (
                  <span
                    key={d}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: '#F1F5F9',
                      color: '#1E293B',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => handleRemoveDesig(d)}
                      title={`Remove ${d}`}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#64748B',
                        fontSize: '14px',
                        lineHeight: 1,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Employment Types */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} color="#0E7490" /> Employment Types ({orgStructure.employmentTypes.length})
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Add employment type..."
                  value={newEmpType}
                  onChange={e => setNewEmpType(e.target.value)}
                  className="form-control form-control-sm"
                />
                <button className="btn btn-primary btn-sm" onClick={handleAddEmpType}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {orgStructure.employmentTypes.map(e => (
                  <span
                    key={e}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: '#ECFEFF',
                      color: '#0E7490',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {e}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmpType(e)}
                      title={`Remove ${e}`}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#0891B2',
                        fontSize: '14px',
                        lineHeight: 1,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Work Locations */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="#0E7490" /> Work Locations ({orgStructure.workLocations.length})
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Add location..."
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="form-control form-control-sm"
                />
                <button className="btn btn-primary btn-sm" onClick={handleAddLocation}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {orgStructure.workLocations.map(l => (
                  <span
                    key={l}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {l}
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(l)}
                      title={`Remove ${l}`}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#B45309',
                        fontSize: '14px',
                        lineHeight: 1,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Teams List */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="#0E7490" /> Operational Teams & Squads ({orgStructure.teams.length})
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 120px', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="Team / Squad Name"
                className="form-control form-control-sm"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
              />
              <select
                className="form-control form-control-sm"
                value={newTeamDept}
                onChange={e => setNewTeamDept(e.target.value)}
              >
                {orgStructure.departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                type="text"
                placeholder="Lead Name"
                className="form-control form-control-sm"
                value={newTeamLead}
                onChange={e => setNewTeamLead(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAddTeam}>Add Team</button>
            </div>

            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Department</th>
                  <th>Lead / Head</th>
                </tr>
              </thead>
              <tbody>
                {orgStructure.teams.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.departmentId}</td>
                    <td>{t.leadEmployeeName || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BRANCH CREATE / EDIT MODAL */}
      {isBranchModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3>{editingBranch ? 'Edit Branch Office' : 'Add New Branch'}</h3>
              <button className="close-btn" title="Close" onClick={() => setIsBranchModalOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSaveBranch}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label className="form-label">Branch Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Coimbatore Yard"
                    value={branchForm.branchName}
                    onChange={e => setBranchForm({ ...branchForm, branchName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Branch Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. BR-CBE"
                    value={branchForm.branchCode}
                    onChange={e => setBranchForm({ ...branchForm, branchCode: e.target.value })}
                    required
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Street / Plot / Highway"
                    value={branchForm.addressLine1}
                    onChange={e => setBranchForm({ ...branchForm, addressLine1: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={branchForm.city}
                    onChange={e => setBranchForm({ ...branchForm, city: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={branchForm.state}
                    onChange={e => setBranchForm({ ...branchForm, state: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={branchForm.pincode}
                    onChange={e => setBranchForm({ ...branchForm, pincode: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Branch Contact Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={branchForm.contactNumber}
                    onChange={e => setBranchForm({ ...branchForm, contactNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Branch Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={branchForm.email}
                    onChange={e => setBranchForm({ ...branchForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Branch HR Lead</label>
                  <input
                    type="text"
                    className="form-control"
                    value={branchForm.branchHr}
                    onChange={e => setBranchForm({ ...branchForm, branchHr: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Shift Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={branchForm.startTime}
                    onChange={e => setBranchForm({ ...branchForm, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Shift End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={branchForm.endTime}
                    onChange={e => setBranchForm({ ...branchForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsBranchModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
