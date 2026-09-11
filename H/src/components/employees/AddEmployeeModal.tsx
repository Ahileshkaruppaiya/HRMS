import React, { useState, useEffect, useRef } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Employee, Role } from '../../types/hrms';
import { 
  X, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  User, 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  CreditCard, 
  Clock, 
  FolderPlus, 
  CheckCheck,
  Upload,
  Trash2,
  Camera,
  Phone,
  Mail,
  Building,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Award,
  Edit3
} from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateOfferLetter?: (employee: Employee) => void;
}

interface UploadedDoc {
  id: string;
  category: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ 
  isOpen, 
  onClose,
  onGenerateOfferLetter 
}) => {
  const { 
    addEmployee, 
    departments, 
    employees, 
    designations, 
    branches, 
    shifts, 
    leavePolicies, 
    weeklySchedules, 
    holidayPolicies,
    businessSettings
  } = useHRMS();
  const [step, setStep] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Prevent background scrolling and lock viewport cleanly
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  // Hidden file input ref for real file upload selection
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadCategory, setActiveUploadCategory] = useState<string>('');

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handleChange('avatar', result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-generate employee ID using business settings prefix
  const generateNewEmpId = () => {
    const rawPrefix = businessSettings?.employeeCodePrefix || 'EMP';
    const cleanPrefix = rawPrefix.replace(/[-_]+$/, '') || 'EMP';
    
    // Find highest numeric suffix among existing employees matching prefix
    const existingNums = employees
      .map(e => {
        const match = e.employeeId.match(new RegExp(`^${cleanPrefix}[-_]?(\\d+)$`, 'i'));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n) && n > 0);
    
    const nextNum = (existingNums.length > 0 ? Math.max(...existingNums) : employees.length) + 1;
    return `${cleanPrefix}-${String(nextNum).padStart(3, '0')}`;
  };

  const defaultFormData = {
    // 1. Personal Information
    employeeId: '',
    firstName: '',
    lastName: '',
    avatar: '',
    gender: 'Male' as Employee['gender'],
    dob: '1996-05-15',
    phone: '',
    personalEmail: '',
    companyEmail: '',
    maritalStatus: 'Single' as 'Single' | 'Married' | 'Divorced' | 'Widowed',

    // 2. Employment Information
    joiningDate: new Date().toISOString().split('T')[0],
    department: departments[0]?.name || 'HR',
    designation: designations[0]?.title || 'HR Manager',
    employmentType: 'Full-Time' as Employee['employmentType'],
    reportingManagerId: employees[0]?.employeeId || 'EMP-001',
    reportingManagerName: employees[0] ? `${employees[0].firstName} ${employees[0].lastName}`.trim() : 'Pavithra',
    workLocation: branches[0]?.name || 'Chennai HQ',
    status: 'Active' as Employee['status'],

    // 3. Address & Emergency Contact
    currentLine1: '',
    currentLine2: '',
    currentCity: 'Chennai',
    currentState: 'Tamil Nadu',
    currentCountry: 'India',
    currentPincode: '600001',
    sameAsCurrent: true,
    permanentLine1: '',
    permanentLine2: '',
    permanentCity: 'Chennai',
    permanentState: 'Tamil Nadu',
    permanentCountry: 'India',
    permanentPincode: '600001',
    emergencyName: '',
    emergencyRelationship: 'Parent',
    emergencyMobile: '',
    emergencyAltMobile: '',

    // 4. Educational Details
    qualification: 'B.E / B.Tech',
    degreeName: 'B.Tech Civil Engineering',
    specialization: 'Structural Engineering',
    university: 'Anna University',
    yearOfPassing: '2023',
    gradePercentage: '8.4 CGPA / 84%',

    // 5. Experience Details
    experienceType: 'Experienced' as 'Fresher' | 'Experienced',
    totalExperience: '3 Years 6 Months',
    previousCompany: 'L&T Construction',
    previousDesignation: 'Senior Structural Engineer',
    previousDepartment: 'Design',
    expStartDate: '2023-06-01',
    expEndDate: '2026-08-31',
    lastDrawnSalary: '₹50,000 / month',
    previousCompanyLocation: 'Chennai, Tamil Nadu',
    relevantExperience: '3 Years',
    skills: '',

    // 6. Salary & Payroll
    salaryStructure: 'Standard Industrial CTC',
    monthlyCtc: 75000,
    basicSalary: 37500,
    hra: 15000,
    transport: 5000,
    medical: 3000,
    special: 14500,
    bankName: 'HDFC Bank',
    accountNumber: '50100492817261',
    ifscCode: 'HDFC0001234',
    branch: 'Mount Road Branch',
    panNumber: 'ABCDE1234F',
    uanNumber: '101492817261',

    // 6. Attendance & Shift
    attendanceMethod: 'Face Scan' as Employee['attendanceMethod'],
    shift: 'General Shift (09:00 - 18:00)',
    weeklyOff: 'Sunday',
    holidayCalendar: 'Tamil Nadu Industrial Calendar (14 Days)',
    leavePolicy: 'Standard 18 Casual + 12 Medical + 10 Earned',
    gpsAllowed: true,

    // 7. System Access & Permissions
    officialUsername: '',
    role: 'Employee' as Role,
    accountStatus: 'Active' as 'Active' | 'Inactive',
    sendInvite: true,
    permissions: ['Dashboard', 'Attendance', 'Leaves', 'Tasks']
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [documents, setDocuments] = useState<UploadedDoc[]>([
    { id: 'doc-1', category: '10th Marksheet', name: '10th_Marksheet_SSLC.pdf', size: '320 KB', type: 'PDF', uploadDate: '2026-09-04' },
    { id: 'doc-2', category: '12th or Diploma', name: '12th_Diploma_Certificate.pdf', size: '1.2 MB', type: 'PDF', uploadDate: '2026-09-04' }
  ]);

  // Sync official email and username when names change
  useEffect(() => {
    if (formData.firstName && formData.lastName) {
      const generatedEmail = `${formData.firstName.toLowerCase().replace(/\s+/g, '')}.${formData.lastName.toLowerCase().replace(/\s+/g, '')}@vrmstructures.com`;
      setFormData(prev => ({
        ...prev,
        companyEmail: prev.companyEmail || generatedEmail,
        officialUsername: prev.officialUsername || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`
      }));
    }
  }, [formData.firstName, formData.lastName]);

  // Sync permanent address when sameAsCurrent is toggled
  useEffect(() => {
    if (formData.sameAsCurrent) {
      setFormData(prev => ({
        ...prev,
        permanentLine1: prev.currentLine1,
        permanentLine2: prev.currentLine2,
        permanentCity: prev.currentCity,
        permanentState: prev.currentState,
        permanentCountry: prev.currentCountry,
        permanentPincode: prev.currentPincode
      }));
    }
  }, [formData.sameAsCurrent, formData.currentLine1, formData.currentLine2, formData.currentCity, formData.currentState, formData.currentCountry, formData.currentPincode]);

  // Reset wizard on modal open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        ...defaultFormData,
        employeeId: '',
        department: departments[0]?.name || 'HR'
      });
      setIsSuccess(false);
      setCreatedEmployee(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError(null);
  };

  const validateCurrentStep = (currStep: number): string | null => {
    if (currStep === 1) {
      if (!formData.firstName.trim()) return 'First Name is mandatory.';
      if (!formData.employeeId.trim()) return 'Employee ID is mandatory.';
      const isDuplicateId = employees.some(e => e.employeeId.toLowerCase() === formData.employeeId.trim().toLowerCase());
      if (isDuplicateId) return `Employee ID "${formData.employeeId}" is already registered. Please provide a unique ID.`;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.personalEmail && !emailRegex.test(formData.personalEmail.trim())) {
        return 'Please enter a valid personal email format.';
      }
      if (formData.companyEmail) {
        if (!emailRegex.test(formData.companyEmail.trim())) {
          return 'Please enter a valid company email format.';
        }
        const isDuplicateEmail = employees.some(e => e.email.toLowerCase() === formData.companyEmail.trim().toLowerCase());
        if (isDuplicateEmail) {
          return `Company email "${formData.companyEmail}" is already registered for another employee.`;
        }
      }
      if (!formData.phone.trim()) return 'Phone number is mandatory.';
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 10) return 'Please enter a valid 10-digit mobile phone number.';
    }

    if (currStep === 2) {
      if (!formData.department.trim()) return 'Department selection is mandatory.';
      if (!formData.designation.trim()) return 'Designation is mandatory.';
      if (!formData.joiningDate) return 'Date of Joining is mandatory.';
      if (!formData.workLocation.trim()) return 'Work Location / Branch is mandatory.';
    }

    if (currStep === 3) {
      if (!formData.currentLine1.trim()) return 'Current Address Line 1 is mandatory.';
      if (!formData.currentCity.trim()) return 'Current City is mandatory.';
      if (!formData.currentState.trim()) return 'Current State is mandatory.';
      if (!formData.currentCountry.trim()) return 'Current Country is mandatory.';
      if (!formData.currentPincode.trim()) return 'Current Pincode is mandatory.';
      if (!formData.sameAsCurrent) {
        if (!formData.permanentLine1.trim()) return 'Permanent Address Line 1 is mandatory when "Same as Current Address" is not checked.';
        if (!formData.permanentCity.trim()) return 'Permanent City is mandatory when "Same as Current Address" is not checked.';
        if (!formData.permanentState.trim()) return 'Permanent State is mandatory when "Same as Current Address" is not checked.';
        if (!formData.permanentCountry.trim()) return 'Permanent Country is mandatory when "Same as Current Address" is not checked.';
        if (!formData.permanentPincode.trim()) return 'Permanent Pincode is mandatory when "Same as Current Address" is not checked.';
      }
      if (!formData.emergencyName.trim()) return 'Emergency Contact Name is mandatory.';
      if (!formData.emergencyRelationship.trim()) return 'Emergency Contact Relationship is mandatory.';
    }

    if (currStep === 4) {
      if (!formData.qualification.trim()) return 'Highest Qualification is mandatory.';
      if (!formData.degreeName.trim()) return 'Degree / Course Name is mandatory.';
      if (!formData.university.trim()) return 'University / Institution is mandatory.';
      if (!formData.yearOfPassing.trim()) return 'Year of Passing is mandatory.';
    }

    if (currStep === 5) {
      if (formData.experienceType === 'Experienced') {
        if (!formData.totalExperience.trim()) return 'Total Experience is mandatory for experienced candidates.';
        if (!formData.previousCompany.trim()) return 'Previous Company Name is mandatory for experienced candidates.';
        if (!formData.previousDesignation.trim()) return 'Previous Designation is mandatory for experienced candidates.';
      }
    }

    if (currStep === 6) {
      if (!formData.monthlyCtc || Number(formData.monthlyCtc) <= 0) return 'Total Monthly CTC must be greater than zero.';
      if (!formData.basicSalary || Number(formData.basicSalary) <= 0) return 'Basic Salary must be greater than zero.';
      if (formData.hra < 0 || formData.transport < 0 || formData.medical < 0 || formData.special < 0) {
        return 'Salary components cannot be negative.';
      }
      if (!formData.bankName.trim()) return 'Bank Name is mandatory.';
      if (!formData.accountNumber.trim()) return 'Bank Account Number is mandatory.';
      if (!formData.ifscCode.trim()) return 'IFSC Code is mandatory.';
      if (!formData.panNumber.trim()) return 'PAN Card Number is mandatory.';
      if (formData.panNumber.trim().length !== 10) return 'PAN Card number must be 10 characters (e.g. ABCDE1234F).';
    }

    return null;
  };

  const handleSalaryChange = (field: 'basicSalary' | 'hra' | 'transport' | 'medical' | 'special', value: number) => {
    const updated = { ...formData, [field]: value };
    const newTotal = (field === 'basicSalary' ? value : updated.basicSalary) +
      (field === 'hra' ? value : updated.hra) +
      (field === 'transport' ? value : updated.transport) +
      (field === 'medical' ? value : updated.medical) +
      (field === 'special' ? value : updated.special);

    setFormData(prev => ({
      ...prev,
      [field]: value,
      monthlyCtc: newTotal
    }));
  };

  const handleAddMockDocument = (category: string) => {
    const newDoc: UploadedDoc = {
      id: `doc-${Date.now()}`,
      category,
      name: `${category.replace(/[^a-zA-Z0-9]/g, '_')}_Verified.pdf`,
      size: `${Math.floor(Math.random() * 600 + 350)} KB`,
      type: 'PDF',
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [...prev.filter(d => d.category !== category), newDoc]);
  };

  const triggerUploadForCategory = (category: string) => {
    setActiveUploadCategory(category);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadCategory) return;

    const sizeInKb = Math.round(file.size / 1024);
    const sizeFormatted = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    const newDoc: UploadedDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: activeUploadCategory,
      name: file.name,
      size: sizeFormatted,
      type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      uploadDate: new Date().toISOString().split('T')[0]
    };

    setDocuments(prev => [...prev.filter(d => d.category !== activeUploadCategory), newDoc]);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const resetAndClose = () => {
    setStep(1);
    setIsSuccess(false);
    setCreatedEmployee(null);
    onClose();
  };

  const handleSubmit = () => {
    for (let s = 1; s <= 9; s++) {
      const err = validateCurrentStep(s);
      if (err) {
        setValidationError(err);
        setStep(s);
        return;
      }
    }
    const newEmp: Employee = {
      id: formData.employeeId || `EMP-${Date.now()}`,
      employeeId: formData.employeeId || `EMP-${Date.now()}`,
      firstName: formData.firstName.trim() || 'New',
      lastName: formData.lastName.trim() || 'Employee',
      email: formData.personalEmail.trim() || formData.companyEmail.trim() || `${(formData.firstName || 'emp').toLowerCase().replace(/\s+/g, '')}@vrmstructures.com`,
      phone: formData.phone.trim() || '+91 98765 43210',
      dob: formData.dob,
      gender: formData.gender,
      address: `${formData.currentLine1}, ${formData.currentCity}, ${formData.currentState} - ${formData.currentPincode}`,
      department: formData.department,
      designation: formData.designation,
      reportingManagerId: formData.reportingManagerId,
      reportingManagerName: formData.reportingManagerName,
      joiningDate: formData.joiningDate,
      employmentType: formData.employmentType,
      status: formData.status,
      avatar: formData.avatar || '',
      basicSalary: Number(formData.basicSalary),
      allowances: {
        hra: Number(formData.hra),
        transport: Number(formData.transport),
        medical: Number(formData.medical),
        special: Number(formData.special)
      },
      bankDetails: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        branch: formData.branch
      },
      attendanceMethod: formData.attendanceMethod,
      gpsAllowed: formData.gpsAllowed,
      faceRegistered: formData.attendanceMethod === 'Face Scan',
      workShift: formData.shift,
      documents: documents.map(d => ({
        name: d.name,
        type: d.type,
        url: '#',
        uploadDate: d.uploadDate
      })),

      // Extended Structured Data
      personalEmail: formData.personalEmail,
      companyEmail: formData.companyEmail,
      maritalStatus: formData.maritalStatus,
      workLocation: formData.workLocation,
      currentAddress: {
        line1: formData.currentLine1,
        line2: formData.currentLine2,
        city: formData.currentCity,
        state: formData.currentState,
        country: formData.currentCountry,
        pincode: formData.currentPincode
      },
      permanentAddress: {
        sameAsCurrent: formData.sameAsCurrent,
        line1: formData.permanentLine1,
        line2: formData.permanentLine2,
        city: formData.permanentCity,
        state: formData.permanentState,
        country: formData.permanentCountry,
        pincode: formData.permanentPincode
      },
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRelationship,
        mobile: formData.emergencyMobile,
        alternateMobile: formData.emergencyAltMobile
      },
      educationalDetails: {
        highestQualification: formData.qualification,
        degreeName: formData.degreeName,
        specialization: formData.specialization,
        university: formData.university,
        yearOfPassing: formData.yearOfPassing,
        gradePercentage: formData.gradePercentage,
        certificateUrl: documents.find(d => d.category === 'Educational Certificates')?.name
      },
      experienceDetails: {
        experienceType: formData.experienceType,
        totalExperience: formData.totalExperience,
        previousCompany: formData.previousCompany,
        previousDesignation: formData.previousDesignation,
        previousDepartment: formData.previousDepartment,
        startDate: formData.expStartDate,
        endDate: formData.expEndDate,
        lastDrawnSalary: formData.lastDrawnSalary,
        companyLocation: formData.previousCompanyLocation,
        experienceCertificateUrl: documents.find(d => d.category === 'Experience Certificates')?.name,
        relievingLetterUrl: documents.find(d => d.category === 'Relieving Letter')?.name
      },
      professionalDetails: {
        previousCompany: formData.previousCompany,
        totalExperience: formData.totalExperience,
        relevantExperience: formData.relevantExperience,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        qualification: formData.qualification,
        specialization: formData.specialization
      },
      salaryDetails: {
        salaryStructure: formData.salaryStructure,
        monthlyCtc: Number(formData.monthlyCtc),
        panNumber: formData.panNumber,
        uanNumber: formData.uanNumber
      },
      shiftDetails: {
        shiftType: formData.shift,
        weeklyOff: formData.weeklyOff,
        holidayCalendar: formData.holidayCalendar,
        leavePolicy: formData.leavePolicy
      },
      systemAccess: {
        role: formData.role,
        status: formData.accountStatus,
        permissions: formData.permissions,
        sendInvite: formData.sendInvite
      }
    };

    addEmployee(newEmp);
    setCreatedEmployee(newEmp);
    setIsSuccess(true);
  };

  const stepsList = [
    { num: 1, label: 'Personal', fullTitle: 'Basic Personal Information', icon: User },
    { num: 2, label: 'Employment', fullTitle: 'Employment & Role Details', icon: Briefcase },
    { num: 3, label: 'Address', fullTitle: 'Address & Emergency Contacts', icon: MapPin },
    { num: 4, label: 'Education', fullTitle: 'Educational Background & Qualifications', icon: GraduationCap },
    { num: 5, label: 'Experience', fullTitle: 'Previous Work Experience & History', icon: Award },
    { num: 6, label: 'Salary', fullTitle: 'Salary, Compensation & Bank Details', icon: CreditCard },
    { num: 7, label: 'Attendance', fullTitle: 'Attendance Mode & Work Shifts', icon: Clock },
    { num: 8, label: 'Documents', fullTitle: 'Employee Documents & Verification', icon: FolderPlus },
    { num: 9, label: 'Review', fullTitle: 'Comprehensive Onboarding Review', icon: CheckCheck }
  ];

  // Success Celebration Screen
  if (isSuccess && createdEmployee) {
    return (
      <div className="onboarding-fullscreen-modal" style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <div className="card" style={{ maxWidth: '580px', width: '90%', textAlign: 'center', padding: '40px 32px', borderRadius: 'var(--radius-dialog)', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '9999px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={42} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Employee Onboarded Successfully!
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            <strong>{createdEmployee.firstName} {createdEmployee.lastName}</strong> has been enrolled with ID <strong>{createdEmployee.employeeId}</strong> in the <strong>{createdEmployee.department}</strong> department.
          </p>

          <div style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid #CFFAFE', borderRadius: 'var(--radius-card)', padding: '18px', marginBottom: '28px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-blue)', fontWeight: 700, fontSize: '0.92rem', marginBottom: '6px' }}>
              <FileText size={18} /> Official Offer Letter Ready
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
              A standard offer letter pre-filled with {createdEmployee.firstName}'s CTC, designation, and joining date can now be generated and printed.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '0.95rem' }} 
              onClick={() => {
                if (onGenerateOfferLetter) onGenerateOfferLetter(createdEmployee);
                else resetAndClose();
              }}
            >
              <FileText size={18} /> Generate Offer Letter Now <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" style={{ padding: '12px' }} onClick={resetAndClose}>
              Done & View Employee Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-fullscreen-modal">
      {/* Hidden file input for real file picking */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        style={{ display: 'none' }} 
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />

      {/* Top Header */}
      <header className="onboarding-header">
        <div className="onboarding-header-title">
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFEFF', color: '#0E7490', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={20} />
          </div>
          <div>
            <h2>Add New Employee</h2>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
              Step {step} of 9 — {stepsList[step - 1]?.fullTitle}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#F1F5F9', borderRadius: '8px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
            <span>Employee ID:</span>
            <span style={{ color: '#0E7490', fontWeight: 700, fontFamily: 'monospace' }}>{formData.employeeId}</span>
          </div>
          <button 
            onClick={resetAndClose}
            style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', background: '#ffffff', cursor: 'pointer', transition: 'all 0.15s ease' }}
            title="Cancel & Exit Wizard"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Horizontal Stepper Progress Container */}
      <div className="onboarding-stepper-container">
        <div className="onboarding-stepper-bar">
          {stepsList.map(s => {
            const IconComp = s.icon;
            const isActive = step === s.num;
            const isCompleted = step > s.num;

            return (
              <div 
                key={s.num} 
                className={`onboarding-step-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (s.num > step) {
                    const err = validateCurrentStep(step);
                    if (err) {
                      setValidationError(err);
                      return;
                    }
                  }
                  setValidationError(null);
                  setStep(s.num);
                }}
                title={`Step ${s.num}: ${s.fullTitle}`}
              >
                <div className="onboarding-step-badge">
                  {isCompleted ? '✓' : s.num}
                </div>
                <IconComp size={14} />
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
        <div className="onboarding-progress-track">
          <div 
            className="onboarding-progress-fill" 
            style={{ width: `${(step / 9) * 100}%` }}
          />
        </div>
      </div>

      {/* Scrollable Wizard Form Body */}
      <main className="onboarding-body">
        <div className="onboarding-content-container">
          {validationError && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              borderRadius: 'var(--radius-card)',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.88rem',
              fontWeight: 500
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: Personal Information */}
        {step === 1 && (
          <div className="onboarding-section-card">
            <div className="onboarding-card-title">
              <User size={20} color="var(--color-primary-blue)" />
              <span>1. Basic Personal Details</span>
            </div>

            <div className="form-row" style={{ marginBottom: '18px' }}>
              <div className="form-group">
                <label className="form-label">
                  Employee ID <span className="required-star">*</span>
                </label>

                <input 
                  className="form-control" 
                  value={formData.employeeId} 
                  onChange={e => handleChange('employeeId', e.target.value.toUpperCase())}
                  placeholder="Enter Employee ID (e.g. EMP-020, VRM-101)"
                  style={{ 
                    fontWeight: 700, 
                    letterSpacing: '0.04em',
                    borderColor: formData.employeeId.trim() && employees.some(e => e.employeeId.toLowerCase() === formData.employeeId.trim().toLowerCase()) 
                      ? '#EF4444' 
                      : undefined
                  }}
                />

                {formData.employeeId.trim() && employees.some(e => e.employeeId.toLowerCase() === formData.employeeId.trim().toLowerCase()) && (
                  <div style={{ marginTop: '5px', fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>
                    ⚠️ Employee ID &quot;{formData.employeeId}&quot; is already in use by another employee!
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Profile Photo (Direct Upload)</label>
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleAvatarFileUpload} 
                />
                
                {formData.avatar ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                    <img 
                      src={formData.avatar} 
                      alt="Profile Preview" 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0E7490' }} 
                    />
                    <span style={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Photo Selected
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload size={12} /> Change
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm" 
                        style={{ padding: '4px 7px', fontSize: '0.75rem' }}
                        onClick={() => {
                          handleChange('avatar', '');
                          if (avatarInputRef.current) avatarInputRef.current.value = '';
                        }}
                        title="Remove Photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => avatarInputRef.current?.click()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      border: '1.5px dashed #CBD5E1',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      color: '#475569',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0E7490')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                  >
                    <Camera size={16} color="#0E7490" />
                    <span>Upload Profile Photo</span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>(JPG, PNG, WebP)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input 
                  className="form-control" 
                  value={formData.firstName} 
                  onChange={e => handleChange('firstName', e.target.value)}
                  placeholder="e.g. Rahul" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input 
                  className="form-control" 
                  value={formData.lastName} 
                  onChange={e => handleChange('lastName', e.target.value)}
                  placeholder="e.g. Sharma" 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select 
                  className="form-control" 
                  value={formData.gender} 
                  onChange={e => handleChange('gender', e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.dob} 
                  onChange={e => handleChange('dob', e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    className="form-control" 
                    value={formData.phone} 
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210" 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Personal Email ID</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={formData.personalEmail} 
                  onChange={e => handleChange('personalEmail', e.target.value)}
                  placeholder="rahul.personal@gmail.com" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Marital Status (Optional)</label>
                <select 
                  className="form-control" 
                  value={formData.maritalStatus} 
                  onChange={e => handleChange('maritalStatus', e.target.value)}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Employment Information */}
        {step === 2 && (
          <div className="onboarding-section-card">
            <div className="onboarding-card-title">
              <Briefcase size={20} color="var(--color-primary-blue)" />
              <span>2. Employment & Department Details</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Joining *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.joiningDate} 
                  onChange={e => handleChange('joiningDate', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select 
                  className="form-control" 
                  value={formData.department} 
                  onChange={e => handleChange('department', e.target.value)}
                  required
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Designation / Role Title *</label>
                <select 
                  className="form-control" 
                  value={formData.designation} 
                  onChange={e => handleChange('designation', e.target.value)}
                  required
                >
                  {designations.map(d => (
                    <option key={d.id} value={d.title}>{d.title} ({d.level})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Employment Type *</label>
                <select 
                  className="form-control" 
                  value={formData.employmentType} 
                  onChange={e => handleChange('employmentType', e.target.value)}
                >
                  <option value="Full-Time">Full Time</option>
                  <option value="Part-Time">Part Time</option>
                  <option value="Intern">Intern</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Reporting Manager *</label>
                <select 
                  className="form-control" 
                  value={formData.reportingManagerName} 
                  onChange={e => {
                    const selEmp = employees.find(emp => `${emp.firstName} ${emp.lastName}`.trim() === e.target.value);
                    handleChange('reportingManagerName', e.target.value);
                    if (selEmp) handleChange('reportingManagerId', selEmp.employeeId);
                  }}
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`.trim()}>
                      {emp.firstName} {emp.lastName} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Work Location / Branch *</label>
                <select 
                  className="form-control" 
                  value={formData.workLocation} 
                  onChange={e => handleChange('workLocation', e.target.value)}
                  required
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.name}>{b.name} ({b.location})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Employee Status *</label>
                <select 
                  className="form-control" 
                  value={formData.status} 
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">Probation</option>
                  <option value="Terminated">Notice Period</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Address & Emergency Contact */}
        {step === 3 && (
          <div>
            <div className="onboarding-section-card">
              <div className="onboarding-card-title">
                <MapPin size={20} color="var(--color-primary-blue)" />
                <span>3A. Current Address Details</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address Line 1 *</label>
                  <input 
                    className="form-control" 
                    value={formData.currentLine1} 
                    onChange={e => handleChange('currentLine1', e.target.value)}
                    placeholder="Door / Flat No., Street Name" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address Line 2</label>
                  <input 
                    className="form-control" 
                    value={formData.currentLine2} 
                    onChange={e => handleChange('currentLine2', e.target.value)}
                    placeholder="Apartment, Landmark, Area" 
                  />
                </div>
              </div>
              <div className="form-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-control" value={formData.currentCity} onChange={e => handleChange('currentCity', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input className="form-control" value={formData.currentState} onChange={e => handleChange('currentState', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <input className="form-control" value={formData.currentCountry} onChange={e => handleChange('currentCountry', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input className="form-control" value={formData.currentPincode} onChange={e => handleChange('currentPincode', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="onboarding-section-card">
              <div className="onboarding-card-title" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={20} color="var(--color-primary-blue)" />
                  <span>3B. Permanent Address</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-blue)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.sameAsCurrent} 
                    onChange={e => handleChange('sameAsCurrent', e.target.checked)} 
                  />
                  Same as Current Address
                </label>
              </div>

              {!formData.sameAsCurrent && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Permanent Line 1 *</label>
                      <input 
                        className="form-control" 
                        value={formData.permanentLine1} 
                        onChange={e => handleChange('permanentLine1', e.target.value)} 
                        placeholder="House / Flat No, Street Name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Permanent Line 2</label>
                      <input 
                        className="form-control" 
                        value={formData.permanentLine2} 
                        onChange={e => handleChange('permanentLine2', e.target.value)} 
                        placeholder="Apartment, Landmark, Area"
                      />
                    </div>
                  </div>
                  <div className="form-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input 
                        className="form-control" 
                        value={formData.permanentCity} 
                        onChange={e => handleChange('permanentCity', e.target.value)} 
                        placeholder="e.g. Chennai"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <input 
                        className="form-control" 
                        value={formData.permanentState} 
                        onChange={e => handleChange('permanentState', e.target.value)} 
                        placeholder="e.g. Tamil Nadu"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country *</label>
                      <input 
                        className="form-control" 
                        value={formData.permanentCountry} 
                        onChange={e => handleChange('permanentCountry', e.target.value)} 
                        placeholder="e.g. India"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode *</label>
                      <input 
                        className="form-control" 
                        value={formData.permanentPincode} 
                        onChange={e => handleChange('permanentPincode', e.target.value)} 
                        placeholder="e.g. 600001"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="onboarding-section-card">
              <div className="onboarding-card-title">
                <Phone size={20} color="var(--color-primary-blue)" />
                <span>3C. Emergency Contact</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name *</label>
                  <input 
                    className="form-control" 
                    value={formData.emergencyName} 
                    onChange={e => handleChange('emergencyName', e.target.value)}
                    placeholder="e.g. S. Meenakshi" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship *</label>
                  <select 
                    className="form-control" 
                    value={formData.emergencyRelationship} 
                    onChange={e => handleChange('emergencyRelationship', e.target.value)}
                  >
                    <option value="Parent">Parent</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Educational Details */}
        {step === 4 && (
          <div className="onboarding-section-card">
            <div className="onboarding-card-title">
              <GraduationCap size={22} color="var(--color-primary-blue)" />
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>4. Educational Qualifications & Academic Records</span>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '3px 0 0', fontWeight: 500 }}>
                  Enter candidate's academic qualifications, degrees, institution records, and upload marksheets/certificates.
                </p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Highest Qualification *</label>
                <select 
                  className="form-control" 
                  value={formData.qualification} 
                  onChange={e => handleChange('qualification', e.target.value)}
                  required
                >
                  <option value="B.E / B.Tech">B.E / B.Tech (Engineering / Technology)</option>
                  <option value="M.E / M.Tech">M.E / M.Tech (Master of Engineering)</option>
                  <option value="Diploma">Diploma (Polytechnic / Technical)</option>
                  <option value="MBA">MBA (Master of Business Admin)</option>
                  <option value="MCA">MCA (Master of Computer Apps)</option>
                  <option value="B.Sc / BCA">B.Sc / BCA (Science / Computer Apps)</option>
                  <option value="B.Com / B.A / BBA">B.Com / B.A / BBA (Commerce / Arts / Admin)</option>
                  <option value="M.Sc / M.Com / M.A">M.Sc / M.Com / M.A (Post Graduate)</option>
                  <option value="Ph.D / Doctorate">Ph.D / Doctorate Research</option>
                  <option value="ITI">ITI Certification</option>
                  <option value="12th / HSC">12th Standard / HSC</option>
                  <option value="10th Standard">10th Standard / SSLC</option>
                  <option value="Other">Other Equivalent Qualification</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Degree / Course Name *</label>
                <input 
                  className="form-control" 
                  value={formData.degreeName} 
                  onChange={e => handleChange('degreeName', e.target.value)}
                  placeholder="e.g. B.Tech in Civil Engineering / B.Com" 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input 
                  className="form-control" 
                  value={formData.specialization} 
                  onChange={e => handleChange('specialization', e.target.value)}
                  placeholder="e.g. Structural Engineering / Financial Accounting" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">University / Institution *</label>
                <input 
                  className="form-control" 
                  value={formData.university} 
                  onChange={e => handleChange('university', e.target.value)}
                  placeholder="e.g. Anna University / IIT Madras / Loyola College" 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Year of Passing *</label>
                <input 
                  className="form-control" 
                  value={formData.yearOfPassing} 
                  onChange={e => handleChange('yearOfPassing', e.target.value)}
                  placeholder="e.g. 2023" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Grade / Percentage</label>
                <input 
                  className="form-control" 
                  value={formData.gradePercentage} 
                  onChange={e => handleChange('gradePercentage', e.target.value)}
                  placeholder="e.g. 8.5 CGPA or 85%" 
                />
              </div>
            </div>

            {/* Certificate / Marksheet Upload Box */}
            <div style={{ marginTop: '16px', padding: '16px', background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFEFF', color: '#0E7490', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
                      Certificate / Marksheet Upload
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                      Attach Degree Certificate, Consolidated Marksheet, or Provisional (PDF, JPG, PNG &lt; 10MB)
                    </div>
                  </div>
                </div>

                {documents.find(d => d.category === '12th or Diploma' || d.category === '10th Marksheet' || d.category === 'Educational Certificates') ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '4px 10px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> {documents.find(d => d.category === '12th or Diploma' || d.category === '10th Marksheet' || d.category === 'Educational Certificates')?.name}
                    </span>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => triggerUploadForCategory('12th or Diploma')}
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => triggerUploadForCategory('12th or Diploma')}
                    style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={14} /> Upload Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Experience Details */}
        {step === 5 && (
          <div className="onboarding-section-card">
            <div className="onboarding-card-title">
              <Award size={22} color="var(--color-primary-blue)" />
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>5. Past Work Experience & Employment History</span>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '3px 0 0', fontWeight: 500 }}>
                  Specify candidate's prior professional experience, previous companies, designations, and relieving records.
                </p>
              </div>
            </div>

            {/* Fresher vs Experienced Selector */}
            <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>Experience Profile:</span>
                <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0' }}>Select Fresher or Experienced candidate</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', background: '#E2E8F0', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: formData.experienceType === 'Fresher' ? '#0E7490' : 'transparent',
                    color: formData.experienceType === 'Fresher' ? '#FFFFFF' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => handleChange('experienceType', 'Fresher')}
                >
                  Fresher
                </button>
                <button
                  type="button"
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: formData.experienceType === 'Experienced' ? '#0E7490' : 'transparent',
                    color: formData.experienceType === 'Experienced' ? '#FFFFFF' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => handleChange('experienceType', 'Experienced')}
                >
                  Experienced
                </button>
              </div>
            </div>

            {formData.experienceType === 'Fresher' ? (
              <div style={{ padding: '24px', background: '#ECFEFF', border: '1px solid #CFFAFE', borderRadius: '12px', textAlign: 'center', color: '#0E7490', marginBottom: '20px' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px', color: '#0E7490' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px', color: '#0E7490' }}>Candidate Registered as Fresher</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  No prior employment history, relieving letters, or experience certificates required. You can add technical skills below and proceed to next step.
                </p>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Total Experience *</label>
                    <input 
                      className="form-control" 
                      value={formData.totalExperience} 
                      onChange={e => handleChange('totalExperience', e.target.value)}
                      placeholder="e.g. 3 Years 6 Months" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Previous Company Name *</label>
                    <input 
                      className="form-control" 
                      value={formData.previousCompany} 
                      onChange={e => handleChange('previousCompany', e.target.value)}
                      placeholder="e.g. L&T Construction / Tata Projects" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Previous Designation *</label>
                    <input 
                      className="form-control" 
                      value={formData.previousDesignation} 
                      onChange={e => handleChange('previousDesignation', e.target.value)}
                      placeholder="e.g. Site Engineer / Senior Structural Designer" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Previous Department</label>
                    <select 
                      className="form-control" 
                      value={formData.previousDepartment} 
                      onChange={e => handleChange('previousDepartment', e.target.value)}
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                      <option value="Civil & Structural Engineering">Civil & Structural Engineering</option>
                      <option value="Mechanical & Fabrication">Mechanical & Fabrication</option>
                      <option value="Operations & Site">Operations & Site</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Employment Start Date</label>
                    <input 
                      type="date"
                      className="form-control" 
                      value={formData.expStartDate} 
                      onChange={e => handleChange('expStartDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employment End Date</label>
                    <input 
                      type="date"
                      className="form-control" 
                      value={formData.expEndDate} 
                      onChange={e => handleChange('expEndDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Last Drawn Salary</label>
                    <input 
                      className="form-control" 
                      value={formData.lastDrawnSalary} 
                      onChange={e => handleChange('lastDrawnSalary', e.target.value)}
                      placeholder="e.g. ₹50,000 / month or ₹6.5 LPA" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Previous Company Location</label>
                    <input 
                      className="form-control" 
                      value={formData.previousCompanyLocation} 
                      onChange={e => handleChange('previousCompanyLocation', e.target.value)}
                      placeholder="e.g. Chennai, Tamil Nadu" 
                    />
                  </div>
                </div>

                {/* Upload Experience Certificate & Relieving Letter */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '18px 0' }}>
                  {/* Experience Certificate Upload */}
                  <div style={{ padding: '14px', background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                      Experience Certificate Upload
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: '10px' }}>
                      Service letter or experience certificate
                    </div>
                    {documents.find(d => d.category === 'Experience Certificate' || d.category === 'Experience Certificates') ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> {documents.find(d => d.category === 'Experience Certificate' || d.category === 'Experience Certificates')?.name}
                        </span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => triggerUploadForCategory('Experience Certificate')} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                          Replace
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => triggerUploadForCategory('Experience Certificate')} style={{ fontSize: '0.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Upload size={13} /> Upload Exp Certificate
                      </button>
                    )}
                  </div>

                  {/* Relieving Letter Upload */}
                  <div style={{ padding: '14px', background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                      Relieving Letter Upload
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: '10px' }}>
                      Formal relieving order / exit clearance
                    </div>
                    {documents.find(d => d.category === 'Relieving Letter') ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> {documents.find(d => d.category === 'Relieving Letter')?.name}
                        </span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => triggerUploadForCategory('Relieving Letter')} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                          Replace
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => triggerUploadForCategory('Relieving Letter')} style={{ fontSize: '0.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Upload size={13} /> Upload Relieving Letter
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* STEP 6: Salary & Payroll Details */}
        {step === 6 && (
          <div className="onboarding-section-card">
            <div className="onboarding-card-title">
              <CreditCard size={20} color="var(--color-primary-blue)" />
              <span>6. Salary, Compensation & Bank Details (Admin / HR Confidential)</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Salary Structure Grade</label>
                <select 
                  className="form-control" 
                  value={formData.salaryStructure} 
                  onChange={e => handleChange('salaryStructure', e.target.value)}
                >
                  <option value="Standard Industrial CTC">Standard Industrial CTC</option>
                  <option value="Executive Grade CTC">Executive Grade CTC</option>
                  <option value="Fixed Hourly Staff">Fixed Hourly Staff</option>
                  <option value="Contractor / Consultant">Contractor / Consultant</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total Monthly CTC (₹) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={formData.monthlyCtc} 
                  onChange={e => handleChange('monthlyCtc', Number(e.target.value))}
                  style={{ fontWeight: 700 }}
                  required 
                />
              </div>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '16px 0 10px', color: 'var(--color-text-secondary)' }}>
              Monthly Earnings Breakdown
            </h4>

            <div className="form-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <div className="form-group">
                <label className="form-label">Basic Salary (₹) *</label>
                <input type="number" className="form-control" value={formData.basicSalary} onChange={e => handleSalaryChange('basicSalary', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">HRA (₹)</label>
                <input type="number" className="form-control" value={formData.hra} onChange={e => handleSalaryChange('hra', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Transport (₹)</label>
                <input type="number" className="form-control" value={formData.transport} onChange={e => handleSalaryChange('transport', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Medical (₹)</label>
                <input type="number" className="form-control" value={formData.medical} onChange={e => handleSalaryChange('medical', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Others (₹)</label>
                <input type="number" className="form-control" value={formData.special} onChange={e => handleSalaryChange('special', Number(e.target.value))} />
              </div>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '18px 0 10px', color: 'var(--color-text-secondary)' }}>
              Banking & Statutory Registration
            </h4>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Bank Name *</label>
                <input className="form-control" value={formData.bankName} onChange={e => handleChange('bankName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Account Number *</label>
                <input className="form-control" value={formData.accountNumber} onChange={e => handleChange('accountNumber', e.target.value)} required />
              </div>
            </div>

            <div className="form-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="form-group">
                <label className="form-label">IFSC Code *</label>
                <input className="form-control" value={formData.ifscCode} onChange={e => handleChange('ifscCode', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">PAN Card Number *</label>
                <input className="form-control" value={formData.panNumber} onChange={e => handleChange('panNumber', e.target.value.toUpperCase())} placeholder="ABCDE1234F" required />
              </div>
              <div className="form-group">
                <label className="form-label">UAN / PF Number (Optional)</label>
                <input className="form-control" value={formData.uanNumber} onChange={e => handleChange('uanNumber', e.target.value)} placeholder="101234567890" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Attendance & Shift Settings */}
        {step === 7 && (
          <div className="onboarding-section-card">
            <div className="onboarding-card-title">
              <Clock size={20} color="var(--color-primary-blue)" />
              <span>7. Attendance Mode, Shifts & Leave Policies</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Primary Attendance Verification Method *</label>
                <select 
                  className="form-control" 
                  value={formData.attendanceMethod} 
                  onChange={e => handleChange('attendanceMethod', e.target.value)}
                >
                  <option value="Face Scan">Face Recognition Scan (AI Camera)</option>
                  <option value="GPS Location">Mobile GPS Geofenced Check-In</option>
                  <option value="Biometric">Biometric Fingerprint Scanner</option>
                  <option value="Manual">Manual HR Portal Punch</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Shift Schedule *</label>
                <select 
                  className="form-control" 
                  value={formData.shift} 
                  onChange={e => handleChange('shift', e.target.value)}
                  required
                >
                  {shifts.map(s => (
                    <option key={s.id} value={s.shiftName}>{s.shiftName} ({s.startTime} - {s.endTime})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weekly Off Routine</label>
                <select 
                  className="form-control" 
                  value={formData.weeklyOff} 
                  onChange={e => handleChange('weeklyOff', e.target.value)}
                >
                  {weeklySchedules.map(w => (
                    <option key={w.id} value={w.name}>{w.name} ({w.workingDays})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Annual Leave Policy Package</label>
                <select 
                  className="form-control" 
                  value={formData.leavePolicy} 
                  onChange={e => handleChange('leavePolicy', e.target.value)}
                >
                  {leavePolicies.map(lp => (
                    <option key={lp.id} value={lp.name}>{lp.name} ({lp.quotaDays} Days)</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-card)', marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-primary-blue)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.gpsAllowed} 
                  onChange={e => handleChange('gpsAllowed', e.target.checked)} 
                />
                Enable Mobile GPS Geofencing for Off-Site and Field Plant Punches
              </label>
            </div>
          </div>
        )}

        {/* STEP 8: Documents Upload */}
        {step === 8 && (
          <div className="onboarding-section-card">
            <div className="onboarding-card-title">
              <FolderPlus size={22} color="var(--color-primary-blue)" />
              <div>
                <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>8. Employee Documents & Verification Uploads</span>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '3px 0 0', fontWeight: 500 }}>
                  Attach official candidate credentials. Supported formats: PDF, DOCX, JPG, PNG (up to 10MB per file).
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '28px' }}>
              {[
                { cat: '10th Marksheet', desc: 'SSLC / 10th standard pass certificate' },
                { cat: '12th or Diploma', desc: '12th HSC, Diploma, or Degree marksheet' },
                { cat: 'Relieving Letter', desc: 'Formal relieving order & exit clearance' },
                { cat: 'Experience Certificate', desc: 'Service credential or experience certificate' },
                { cat: 'ID Proof', desc: 'Government issued identity proof (Aadhaar / PAN)' },
                { cat: 'Account Passbook (First Page)', desc: 'Bank passbook first page or cancelled cheque' }
              ].map(item => {
                const existingDoc = documents.find(d => d.category === item.cat);

                return (
                  <div 
                    key={item.cat} 
                    className={`document-upload-card ${existingDoc ? 'has-file' : ''}`}
                    onClick={() => triggerUploadForCategory(item.cat)}
                  >
                    {existingDoc ? (
                      <>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                          <CheckCircle2 size={22} />
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#166534' }}>{item.cat}</div>
                        <div style={{ fontSize: '0.74rem', color: '#15803D', marginTop: '4px', fontWeight: 600, wordBreak: 'break-all', maxWidth: '100%' }}>
                          {existingDoc.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                          {existingDoc.size} • {existingDoc.uploadDate}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }} onClick={e => e.stopPropagation()}>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => triggerUploadForCategory(item.cat)}
                            style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                          >
                            Replace
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-sm" 
                            onClick={() => handleRemoveDocument(existingDoc.id)}
                            style={{ fontSize: '0.72rem', padding: '4px 10px', color: '#EF4444', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ECFEFF', color: '#0E7490', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                          <Upload size={20} />
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>{item.cat}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>{item.desc}</div>
                        <span style={{ display: 'inline-block', padding: '2px 8px', background: '#F1F5F9', color: '#64748B', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 600, marginTop: '8px' }}>
                          PDF, DOCX, JPG &lt; 10MB
                        </span>
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm" 
                          style={{ marginTop: '12px', fontSize: '0.78rem', padding: '6px 14px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerUploadForCategory(item.cat);
                          }}
                        >
                          + Upload Document
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Document Queue Summary */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  Uploaded Documents ({documents.length} of 6 Attached)
                </h4>
                {documents.length > 0 && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '9999px' }}>
                    Ready for Verification
                  </span>
                )}
              </div>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                onClick={() => handleAddMockDocument('Additional Certificate')}
              >
                + Attach Extra Document
              </button>
            </div>

            {documents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: '#64748B', fontSize: '0.82rem' }}>
                No documents uploaded yet. Click any card above to attach your files, or continue to review.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ECFEFF', color: '#0E7490', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                          <span style={{ fontWeight: 600, color: '#0E7490' }}>{doc.category}</span> • {doc.size} • Uploaded on {doc.uploadDate}
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveDocument(doc.id)} 
                      style={{ color: '#EF4444', padding: '6px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove document"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 9: Final Review & Confirmation */}
        {step === 9 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Banner */}
            <div className="onboarding-section-card" style={{ marginBottom: 0 }}>
              <div className="onboarding-card-title">
                <CheckCheck size={22} color="var(--color-primary-blue)" />
                <div>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>9. Comprehensive Employee Onboarding Review</span>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '3px 0 0', fontWeight: 500 }}>
                    Please verify all candidate parameters across each section below before final submission into the system.
                  </p>
                </div>
              </div>

              {/* Header Profile Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: '#ECFEFF', border: '1px solid #CFFAFE', borderRadius: 'var(--radius-card)', marginTop: '16px' }}>
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" style={{ width: '64px', height: '64px', borderRadius: '9999px', objectFit: 'cover', border: '2px solid #0E7490', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '9999px', background: '#0E7490', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, flexShrink: 0 }}>
                    {formData.firstName?.[0] || 'E'}{formData.lastName?.[0] || 'M'}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    {formData.firstName || 'First'} {formData.lastName || 'Last'}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                    <strong style={{ color: '#0E7490' }}>{formData.employeeId}</strong> • {formData.designation} in <strong>{formData.department}</strong> ({formData.workLocation})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#0E7490', fontWeight: 600, marginTop: '2px' }}>
                    {formData.personalEmail || 'No personal email provided'} • {formData.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Basic Personal Information */}
            <div className="onboarding-section-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0E7490', fontSize: '0.95rem' }}>
                  <User size={18} /> 1. Basic Personal Information
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(1)} style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Edit
                </button>
              </div>
              <div className="review-item-grid">
                <div className="review-field-box">
                  <div className="review-field-label">Employee ID</div>
                  <div className="review-field-val" style={{ color: '#0E7490', fontFamily: 'monospace', fontWeight: 700 }}>{formData.employeeId}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Full Name</div>
                  <div className="review-field-val">{formData.firstName} {formData.lastName}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Gender & DOB</div>
                  <div className="review-field-val">{formData.gender} • {formData.dob}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Mobile Phone Number</div>
                  <div className="review-field-val">{formData.phone}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Personal Email ID</div>
                  <div className="review-field-val">{formData.personalEmail || 'N/A'}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Marital Status</div>
                  <div className="review-field-val">{formData.maritalStatus || 'Single'}</div>
                </div>
              </div>
            </div>

            {/* Section 2: Employment & Department Details */}
            <div className="onboarding-section-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0E7490', fontSize: '0.95rem' }}>
                  <Briefcase size={18} /> 2. Employment & Role Details
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(2)} style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Edit
                </button>
              </div>
              <div className="review-item-grid">
                <div className="review-field-box">
                  <div className="review-field-label">Department</div>
                  <div className="review-field-val" style={{ fontWeight: 700 }}>{formData.department}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Designation / Role</div>
                  <div className="review-field-val">{formData.designation}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Date of Joining</div>
                  <div className="review-field-val">{formData.joiningDate}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Employment Type & Status</div>
                  <div className="review-field-val">{formData.employmentType} ({formData.status})</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Reporting Manager</div>
                  <div className="review-field-val">{formData.reportingManagerName} ({formData.reportingManagerId})</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Work Location / Branch</div>
                  <div className="review-field-val">{formData.workLocation}</div>
                </div>
              </div>
            </div>

            {/* Section 3: Address & Emergency Contacts */}
            <div className="onboarding-section-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0E7490', fontSize: '0.95rem' }}>
                  <MapPin size={18} /> 3. Address & Emergency Contacts
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(3)} style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Edit
                </button>
              </div>
              <div className="review-item-grid">
                <div className="review-field-box" style={{ gridColumn: 'span 2' }}>
                  <div className="review-field-label">Current Address Details</div>
                  <div className="review-field-val">{formData.currentLine1}{formData.currentLine2 ? `, ${formData.currentLine2}` : ''}, {formData.currentCity}, {formData.currentState} - {formData.currentPincode}, {formData.currentCountry}</div>
                </div>
                <div className="review-field-box" style={{ gridColumn: 'span 2' }}>
                  <div className="review-field-label">Permanent Address Details</div>
                  <div className="review-field-val">{formData.sameAsCurrent ? 'Same as Current Address' : `${formData.permanentLine1}${formData.permanentLine2 ? `, ${formData.permanentLine2}` : ''}, ${formData.permanentCity}, ${formData.permanentState} - ${formData.permanentPincode}, ${formData.permanentCountry}`}</div>
                </div>
                <div className="review-field-box" style={{ gridColumn: 'span 2' }}>
                  <div className="review-field-label">Emergency Contact Person</div>
                  <div className="review-field-val">{formData.emergencyName} ({formData.emergencyRelationship})</div>
                </div>
              </div>
            </div>

            {/* Section 4: Educational Details */}
            <div className="onboarding-section-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0E7490', fontSize: '0.95rem' }}>
                  <GraduationCap size={18} /> 4. Educational Qualifications
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(4)} style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Edit
                </button>
              </div>
              <div className="review-item-grid">
                <div className="review-field-box">
                  <div className="review-field-label">Highest Qualification</div>
                  <div className="review-field-val">{formData.qualification}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Degree / Course Name</div>
                  <div className="review-field-val">{formData.degreeName}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Specialization / Major</div>
                  <div className="review-field-val">{formData.specialization || 'General / N/A'}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">University / Institution</div>
                  <div className="review-field-val">{formData.university}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Year of Passing</div>
                  <div className="review-field-val">{formData.yearOfPassing}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Grade / Percentage / CGPA</div>
                  <div className="review-field-val">{formData.gradePercentage || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Section 5: Work Experience Details */}
            <div className="onboarding-section-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0E7490', fontSize: '0.95rem' }}>
                  <Award size={18} /> 5. Work Experience History
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(5)} style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Edit
                </button>
              </div>
              {formData.experienceType === 'Fresher' ? (
                <div style={{ padding: '14px 18px', background: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '0.88rem', fontWeight: 600 }}>
                  Candidate is registered as a <strong>Fresher</strong> (No prior employment records).
                </div>
              ) : (
                <div className="review-item-grid">
                  <div className="review-field-box">
                    <div className="review-field-label">Total Work Experience</div>
                    <div className="review-field-val">{formData.totalExperience}</div>
                  </div>
                  <div className="review-field-box">
                    <div className="review-field-label">Previous Company</div>
                    <div className="review-field-val">{formData.previousCompany}</div>
                  </div>
                  <div className="review-field-box">
                    <div className="review-field-label">Previous Designation</div>
                    <div className="review-field-val">{formData.previousDesignation}</div>
                  </div>
                  <div className="review-field-box">
                    <div className="review-field-label">Previous Department</div>
                    <div className="review-field-val">{formData.previousDepartment}</div>
                  </div>
                  <div className="review-field-box">
                    <div className="review-field-label">Employment Tenure</div>
                    <div className="review-field-val">{formData.expStartDate || 'N/A'} to {formData.expEndDate || 'Present'}</div>
                  </div>
                  <div className="review-field-box">
                    <div className="review-field-label">Last Drawn Salary & Location</div>
                    <div className="review-field-val">{formData.lastDrawnSalary || 'N/A'} • {formData.previousCompanyLocation || 'N/A'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 6: Salary, Compensation & Banking */}
            <div className="onboarding-section-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0E7490', fontSize: '0.95rem' }}>
                  <CreditCard size={18} /> 6. Salary & Bank Details
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(6)} style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Edit
                </button>
              </div>
              <div className="review-item-grid">
                <div className="review-field-box">
                  <div className="review-field-label">Monthly Gross CTC</div>
                  <div className="review-field-val" style={{ color: '#16A34A', fontWeight: 700 }}>₹{Number(formData.monthlyCtc).toLocaleString('en-IN')} / month</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Basic Salary</div>
                  <div className="review-field-val">₹{Number(formData.basicSalary).toLocaleString('en-IN')}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Allowances Breakdown</div>
                  <div className="review-field-val" style={{ fontSize: '0.8rem' }}>HRA: ₹{formData.hra} | Trans: ₹{formData.transport} | Med: ₹{formData.medical} | Others: ₹{formData.special}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Bank Name & Branch</div>
                  <div className="review-field-val">{formData.bankName} ({formData.branch || 'Main Branch'})</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Account Number & IFSC</div>
                  <div className="review-field-val">{formData.accountNumber} • {formData.ifscCode}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">PAN Card & UAN / PF</div>
                  <div className="review-field-val">{formData.panNumber} • {formData.uanNumber || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Section 7: Attendance & Shift Policies */}
            <div className="onboarding-section-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0E7490', fontSize: '0.95rem' }}>
                  <Clock size={18} /> 7. Attendance & Shift Settings
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(7)} style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Edit
                </button>
              </div>
              <div className="review-item-grid">
                <div className="review-field-box">
                  <div className="review-field-label">Attendance Capture Mode</div>
                  <div className="review-field-val">{formData.attendanceMethod} {formData.gpsAllowed ? '(GPS Geofenced Enabled)' : ''}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Assigned Work Shift</div>
                  <div className="review-field-val">{formData.shift}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Weekly Off Routine</div>
                  <div className="review-field-val">{formData.weeklyOff}</div>
                </div>
                <div className="review-field-box">
                  <div className="review-field-label">Annual Leave Policy</div>
                  <div className="review-field-val">{formData.leavePolicy}</div>
                </div>
              </div>
            </div>

            {/* Section 8: Uploaded Documents */}
            <div className="onboarding-section-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0E7490', fontSize: '0.95rem' }}>
                  <FolderPlus size={18} /> 8. Verified Uploaded Documents ({documents.length} Files)
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(8)} style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Edit
                </button>
              </div>
              {documents.length === 0 ? (
                <div style={{ padding: '14px 18px', background: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '0.85rem' }}>
                  No documents attached yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {documents.map(doc => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                      <FileCheck size={18} color="#0E7490" style={{ flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}><span style={{ color: '#0E7490', fontWeight: 600 }}>{doc.category}</span> • {doc.size}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmation Banner */}
            <div style={{ padding: '16px 20px', background: '#ECFEFF', border: '1px solid #CFFAFE', borderRadius: 'var(--radius-card)', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <CheckCircle2 size={24} color="var(--color-primary-blue)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                All mandatory parameters have been checked and validated. Clicking <strong>Confirm & Onboard Employee</strong> will save the profile into the employee directory and prepare the official offer letter.
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Bottom Sticky Action Footer */}
      <footer className="onboarding-footer">
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={resetAndClose}
          style={{ padding: '9px 18px', fontSize: '0.88rem' }}
        >
          Cancel & Exit
        </button>

        <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          Step <span style={{ color: '#0E7490', fontWeight: 700 }}>{step}</span> of 9 • {Math.round((step / 9) * 100)}% Completed
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {step > 1 && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setStep(prev => prev - 1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '0.88rem' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {step < 9 ? (
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={() => {
                const err = validateCurrentStep(step);
                if (err) {
                  setValidationError(err);
                  return;
                }
                setValidationError(null);
                setStep(prev => prev + 1);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', fontSize: '0.88rem', background: '#0E7490', borderColor: '#0E7490', boxShadow: '0 2px 8px rgba(14, 116, 144, 0.25)' }}
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSubmit}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10B981', borderColor: '#10B981', padding: '9px 22px', fontSize: '0.88rem', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}
            >
              <CheckCircle2 size={18} /> Confirm & Onboard Employee
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
