import { 
  TaskItemEnhanced, 
  MOMMeeting, 
  TaskMasterItem, 
  TaskEscalationRule, 
  TaskPerformanceWeights 
} from '../types/tasks';

export const INITIAL_ENHANCED_TASKS: TaskItemEnhanced[] = [
  {
    id: 'TSK-501',
    taskNumber: 'TSK-2026-001',
    title: 'Q3 Financial Audit Preparation & Reconciliation',
    taskDate: '2026-08-24',
    sourceType: 'MOM',
    sourceReference: 'Executive Board Q3 Review',
    momId: 'MOM-2026-04',
    momItemNumber: 'AI-02',
    createdBy: 'Pavithra',
    assignedBy: 'Pavithra',
    responsiblePersonId: 'EMP-004',
    responsiblePersonName: 'Robert Chen',
    department: 'Accounts Head',
    taskCategory: 'Compliance',
    priority: 'Urgent',
    startDate: '2026-08-25',
    dueDate: '2026-09-08',
    reviewDate: '2026-09-07',
    relatedProject: 'Annual External Audit 2026',
    dependencyIds: [],
    description: 'Compile tax withholding certificates, reconciliation logs, and expense variance reports for upcoming quarterly auditor review.',
    expectedOutput: 'Complete signed reconciliation ledger and auditor pack in PDF format.',
    overallProgress: 73,
    overallStatus: 'PARTIALLY COMPLETED',
    assignees: [
      {
        id: 'ASN-101',
        taskId: 'TSK-501',
        employeeId: 'EMP-004',
        employeeName: 'Robert Chen',
        employeeEmail: 'robert.chen@company.com',
        employeeDepartment: 'Accounts Head',
        employeeAvatar: '',
        role: 'RESPONSIBLE',
        individualStatus: 'In Progress',
        progressPercentage: 70,
        actualStartDate: '2026-08-25',
        latestRemark: 'Balance sheet reconciliations verified with Citibank statements.',
        assignedAt: '2026-08-24T10:00:00Z',
        updatedAt: '2026-09-01T15:30:00Z'
      },
      {
        id: 'ASN-102',
        taskId: 'TSK-501',
        employeeId: 'EMP-002',
        employeeName: 'David Miller',
        employeeEmail: 'david.miller@company.com',
        employeeDepartment: 'Production Head',
        employeeAvatar: '',
        role: 'ASSIGNEE',
        individualStatus: 'Completed',
        progressPercentage: 100,
        actualStartDate: '2026-08-26',
        completedDate: '2026-09-01',
        latestRemark: 'Automated database extract queries run and certified tamper-proof.',
        completionEvidence: {
          fileName: 'DB_Extraction_Cert_Q3.pdf',
          fileType: 'application/pdf',
          description: 'SHA-256 verified extraction logs of GL transactions.',
          submittedAt: '2026-09-01T17:00:00Z'
        },
        assignedAt: '2026-08-24T10:00:00Z',
        updatedAt: '2026-09-01T17:00:00Z'
      },
      {
        id: 'ASN-103',
        taskId: 'TSK-501',
        employeeId: 'EMP-003',
        employeeName: 'Sarah Jenkins',
        employeeEmail: 'sarah.jenkins@company.com',
        employeeDepartment: 'Marketing',
        employeeAvatar: '',
        role: 'ASSIGNEE',
        individualStatus: 'In Progress',
        progressPercentage: 50,
        actualStartDate: '2026-08-27',
        latestRemark: 'Marketing vendor receipt binder halfway completed.',
        assignedAt: '2026-08-24T10:00:00Z',
        updatedAt: '2026-09-01T11:20:00Z'
      }
    ],
    updates: [
      {
        id: 'UPD-01',
        taskId: 'TSK-501',
        assigneeId: 'ASN-102',
        employeeId: 'EMP-002',
        employeeName: 'David Miller',
        employeeAvatar: '',
        status: 'Completed',
        progressPercentage: 100,
        remarks: 'Data queries complete. Uploaded cryptographically signed extract.',
        updatedBy: 'David Miller',
        updatedAt: '2026-09-01T17:00:00Z'
      },
      {
        id: 'UPD-02',
        taskId: 'TSK-501',
        assigneeId: 'ASN-101',
        employeeId: 'EMP-004',
        employeeName: 'Robert Chen',
        employeeAvatar: '',
        status: 'In Progress',
        progressPercentage: 70,
        remarks: 'Bank statements matched. Waiting for marketing receipts from Sarah.',
        updatedBy: 'Robert Chen',
        updatedAt: '2026-09-01T15:30:00Z'
      }
    ],
    comments: [
      {
        id: 'CMT-01',
        taskId: 'TSK-501',
        userId: 'EMP-001',
        userName: 'Pavithra',
        userAvatar: '',
        userRole: 'Super Admin',
        content: 'Please ensure KPMG format is followed for the variance summaries.',
        createdAt: '2026-08-25T11:00:00Z'
      },
      {
        id: 'CMT-02',
        taskId: 'TSK-501',
        userId: 'EMP-004',
        userName: 'Robert Chen',
        userAvatar: '',
        userRole: 'Department Manager',
        content: 'Noted Alex, David has already aligned the SQL schema to KPMG standards.',
        createdAt: '2026-08-25T14:15:00Z'
      }
    ],
    attachments: [
      {
        id: 'ATT-01',
        taskId: 'TSK-501',
        fileName: 'Audit_Guidelines_2026.pdf',
        fileSize: '2.4 MB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedBy: 'Pavithra',
        uploadedAt: '2026-08-24T10:15:00Z'
      },
      {
        id: 'ATT-02',
        taskId: 'TSK-501',
        fileName: 'DB_Extraction_Cert_Q3.pdf',
        fileSize: '1.1 MB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedBy: 'David Miller',
        uploadedAt: '2026-09-01T17:00:00Z'
      }
    ],
    timeline: [
      {
        id: 'TL-01',
        taskId: 'TSK-501',
        title: 'Task Created from MOM',
        description: 'Auto-created from Executive Board Meeting MOM item AI-02.',
        timestamp: '2026-08-24 10:00 AM',
        iconType: 'mom',
        actorName: 'Pavithra'
      },
      {
        id: 'TL-02',
        taskId: 'TSK-501',
        title: 'Assignees Dispatched',
        description: 'Assigned to Robert Chen, David Miller, and Sarah Jenkins.',
        timestamp: '2026-08-24 10:05 AM',
        iconType: 'assigned',
        actorName: 'System'
      },
      {
        id: 'TL-03',
        taskId: 'TSK-501',
        title: 'Work Completed by David Miller',
        description: 'David Miller marked progress 100% and submitted evidence.',
        timestamp: '2026-09-01 05:00 PM',
        iconType: 'evidence',
        actorName: 'David Miller'
      }
    ],
    auditLogs: [
      {
        id: 'AUD-01',
        taskId: 'TSK-501',
        taskNumber: 'TSK-2026-001',
        action: 'Task Created',
        module: 'Task Management',
        oldValue: 'N/A',
        newValue: 'Status: OPEN, Priority: Urgent',
        performedBy: 'Pavithra',
        performedByRole: 'Super Admin',
        timestamp: '2026-08-24 10:00:00'
      },
      {
        id: 'AUD-02',
        taskId: 'TSK-501',
        taskNumber: 'TSK-2026-001',
        action: 'Progress Updated',
        module: 'Task Assignees',
        oldValue: 'David Miller: 0%',
        newValue: 'David Miller: 100% (Completed)',
        performedBy: 'David Miller',
        performedByRole: 'Assignee',
        timestamp: '2026-09-01 17:00:00'
      },
      {
        id: 'AUD-03',
        taskId: 'TSK-501',
        taskNumber: 'TSK-2026-001',
        action: 'Status Changed',
        module: 'System Engine',
        oldValue: 'IN PROGRESS',
        newValue: 'PARTIALLY COMPLETED',
        performedBy: 'System Auto',
        performedByRole: 'System',
        timestamp: '2026-09-01 17:00:01'
      }
    ],
    createdAt: '2026-08-24',
    updatedAt: '2026-09-01'
  },
  {
    id: 'TSK-502',
    taskNumber: 'TSK-2026-002',
    title: 'Enterprise React 19 Core Security & RBAC Hardening',
    taskDate: '2026-08-26',
    sourceType: 'Project',
    sourceReference: 'SOC-2 Compliance 2026',
    createdBy: 'Pavithra',
    assignedBy: 'Pavithra',
    responsiblePersonId: 'EMP-002',
    responsiblePersonName: 'David Miller',
    department: 'Production Head',
    taskCategory: 'Technical',
    priority: 'High',
    startDate: '2026-08-28',
    dueDate: '2026-09-12',
    reviewDate: '2026-09-11',
    relatedProject: 'Core Portal v2.0',
    description: 'Upgrade React dependencies, enforce strict CSP headers, sanitize all input fields, and verify RBAC role boundaries.',
    expectedOutput: 'Zero vulnerability report from npm audit and passing end-to-end RBAC test suite.',
    overallProgress: 70,
    overallStatus: 'IN PROGRESS',
    assignees: [
      {
        id: 'ASN-201',
        taskId: 'TSK-502',
        employeeId: 'EMP-002',
        employeeName: 'David Miller',
        employeeEmail: 'david.miller@company.com',
        employeeDepartment: 'Production Head',
        employeeAvatar: '',
        role: 'RESPONSIBLE',
        individualStatus: 'In Progress',
        progressPercentage: 80,
        actualStartDate: '2026-08-28',
        latestRemark: 'Security middleware and rate limiting implemented on API gateways.',
        assignedAt: '2026-08-26T14:00:00Z',
        updatedAt: '2026-09-02T09:00:00Z'
      },
      {
        id: 'ASN-202',
        taskId: 'TSK-502',
        employeeId: 'EMP-001',
        employeeName: 'Pavithra',
        employeeEmail: 'alex.morgan@company.com',
        employeeDepartment: 'Human Resources',
        employeeAvatar: '',
        role: 'ASSIGNEE',
        individualStatus: 'In Progress',
        progressPercentage: 60,
        actualStartDate: '2026-08-29',
        latestRemark: 'HR Admin role permission matrix validated.',
        assignedAt: '2026-08-26T14:00:00Z',
        updatedAt: '2026-09-01T16:00:00Z'
      }
    ],
    updates: [
      {
        id: 'UPD-10',
        taskId: 'TSK-502',
        assigneeId: 'ASN-201',
        employeeId: 'EMP-002',
        employeeName: 'David Miller',
        employeeAvatar: '',
        status: 'In Progress',
        progressPercentage: 80,
        remarks: '80% complete, final testing on Edge browser environments.',
        updatedBy: 'David Miller',
        updatedAt: '2026-09-02T09:00:00Z'
      }
    ],
    comments: [],
    attachments: [],
    timeline: [
      {
        id: 'TL-10',
        taskId: 'TSK-502',
        title: 'Task Created',
        description: 'Initiated for SOC-2 milestone.',
        timestamp: '2026-08-26 02:00 PM',
        iconType: 'created',
        actorName: 'Pavithra'
      }
    ],
    auditLogs: [
      {
        id: 'AUD-10',
        taskId: 'TSK-502',
        taskNumber: 'TSK-2026-002',
        action: 'Task Created',
        module: 'Task Management',
        oldValue: 'N/A',
        newValue: 'Status: OPEN, Priority: High',
        performedBy: 'Pavithra',
        performedByRole: 'Super Admin',
        timestamp: '2026-08-26 14:00:00'
      }
    ],
    createdAt: '2026-08-26',
    updatedAt: '2026-09-02'
  },
  {
    id: 'TSK-503',
    taskNumber: 'TSK-2026-003',
    title: 'Autumn 2026 Talent Acquisition Campaign & Referral Drive',
    taskDate: '2026-08-28',
    sourceType: 'Direct',
    sourceReference: 'Q3 Talent Plan',
    createdBy: 'Pavithra',
    assignedBy: 'Pavithra',
    responsiblePersonId: 'EMP-005',
    responsiblePersonName: 'Jessica Taylor',
    department: 'Recruitment',
    taskCategory: 'Strategy',
    priority: 'Medium',
    startDate: '2026-09-01',
    dueDate: '2026-09-15',
    reviewDate: '2026-09-14',
    description: 'Launch employee referral bonus program, design marketing collateral, and schedule interviews for open Senior Frontend positions.',
    expectedOutput: 'At least 15 qualified candidate submissions and referral leaderboard publication.',
    overallProgress: 20,
    overallStatus: 'IN PROGRESS',
    assignees: [
      {
        id: 'ASN-301',
        taskId: 'TSK-503',
        employeeId: 'EMP-005',
        employeeName: 'Jessica Taylor',
        employeeEmail: 'jessica.taylor@company.com',
        employeeDepartment: 'Recruitment',
        employeeAvatar: '',
        role: 'RESPONSIBLE',
        individualStatus: 'In Progress',
        progressPercentage: 40,
        actualStartDate: '2026-09-01',
        latestRemark: 'Job boards published, referral portal banner active.',
        assignedAt: '2026-08-28T11:00:00Z',
        updatedAt: '2026-09-01T14:00:00Z'
      },
      {
        id: 'ASN-302',
        taskId: 'TSK-503',
        employeeId: 'EMP-003',
        employeeName: 'Sarah Jenkins',
        employeeEmail: 'sarah.jenkins@company.com',
        employeeDepartment: 'Marketing',
        employeeAvatar: '',
        role: 'ASSIGNEE',
        individualStatus: 'Pending',
        progressPercentage: 0,
        latestRemark: 'Awaiting creative briefs.',
        assignedAt: '2026-08-28T11:00:00Z',
        updatedAt: '2026-08-28T11:00:00Z'
      }
    ],
    updates: [],
    comments: [],
    attachments: [],
    timeline: [
      {
        id: 'TL-20',
        taskId: 'TSK-503',
        title: 'Task Created',
        description: 'Recruitment drive created.',
        timestamp: '2026-08-28 11:00 AM',
        iconType: 'created',
        actorName: 'Pavithra'
      }
    ],
    auditLogs: [],
    createdAt: '2026-08-28',
    updatedAt: '2026-09-01'
  },
  {
    id: 'TSK-504',
    taskNumber: 'TSK-2026-004',
    title: 'Annual ISO 27001 Access Review & User Archival',
    taskDate: '2026-08-15',
    sourceType: 'MOM',
    sourceReference: 'Security Committee Meeting',
    momId: 'MOM-2026-04',
    momItemNumber: 'AI-04',
    createdBy: 'Pavithra',
    assignedBy: 'Pavithra',
    responsiblePersonId: 'EMP-001',
    responsiblePersonName: 'Pavithra',
    department: 'Human Resources',
    taskCategory: 'Compliance',
    priority: 'Urgent',
    startDate: '2026-08-16',
    dueDate: '2026-08-30', // PAST DUE!
    reviewDate: '2026-08-29',
    description: 'Audit inactive user accounts, revoke former contractor credentials, and archive terminated employee access logs in accordance with ISO 27001.',
    expectedOutput: 'Signed certification of zero dormant administrative accounts.',
    overallProgress: 58,
    overallStatus: 'OVERDUE',
    assignees: [
      {
        id: 'ASN-401',
        taskId: 'TSK-504',
        employeeId: 'EMP-001',
        employeeName: 'Pavithra',
        employeeEmail: 'alex.morgan@company.com',
        employeeDepartment: 'Human Resources',
        employeeAvatar: '',
        role: 'RESPONSIBLE',
        individualStatus: 'In Progress',
        progressPercentage: 65,
        actualStartDate: '2026-08-16',
        latestRemark: 'Department manager signoffs 80% received.',
        assignedAt: '2026-08-15T09:00:00Z',
        updatedAt: '2026-08-29T16:00:00Z'
      },
      {
        id: 'ASN-402',
        taskId: 'TSK-504',
        employeeId: 'EMP-004',
        employeeName: 'Robert Chen',
        employeeEmail: 'robert.chen@company.com',
        employeeDepartment: 'Accounts Head',
        employeeAvatar: '',
        role: 'ASSIGNEE',
        individualStatus: 'In Progress',
        progressPercentage: 50,
        actualStartDate: '2026-08-17',
        latestRemark: 'Payroll user credential verification ongoing.',
        assignedAt: '2026-08-15T09:00:00Z',
        updatedAt: '2026-08-28T14:00:00Z'
      }
    ],
    updates: [],
    comments: [],
    attachments: [],
    timeline: [
      {
        id: 'TL-30',
        taskId: 'TSK-504',
        title: 'Task Became Overdue',
        description: 'Due date of 2026-08-30 passed without all assignees completing.',
        timestamp: '2026-08-31 12:00 AM',
        iconType: 'escalated',
        actorName: 'System Engine'
      }
    ],
    auditLogs: [],
    createdAt: '2026-08-15',
    updatedAt: '2026-08-31'
  },
  {
    id: 'TSK-505',
    taskNumber: 'TSK-2026-005',
    title: 'Biometric & Face Attendance Edge Sensor Calibration',
    taskDate: '2026-08-18',
    sourceType: 'Audit',
    sourceReference: 'Safety & Facility Inspection',
    createdBy: 'Pavithra',
    assignedBy: 'Pavithra',
    responsiblePersonId: 'EMP-002',
    responsiblePersonName: 'David Miller',
    department: 'Production Head',
    taskCategory: 'Operations',
    priority: 'Low',
    startDate: '2026-08-20',
    dueDate: '2026-09-01',
    description: 'Calibrate optical lenses on tablet kiosks in HQ lobby and verify spoof detection thresholds with new lighting conditions.',
    expectedOutput: 'Sensor calibration certificate with <0.02% false acceptance rate.',
    overallProgress: 100,
    overallStatus: 'CLOSED',
    closedAt: '2026-09-01T18:00:00Z',
    closedBy: 'Pavithra (HR Director)',
    closureRemarks: 'Verified in person at HQ lobby. Performance is outstanding.',
    assignees: [
      {
        id: 'ASN-501',
        taskId: 'TSK-505',
        employeeId: 'EMP-002',
        employeeName: 'David Miller',
        employeeEmail: 'david.miller@company.com',
        employeeDepartment: 'Production Head',
        employeeAvatar: '',
        role: 'RESPONSIBLE',
        individualStatus: 'Completed',
        progressPercentage: 100,
        actualStartDate: '2026-08-20',
        completedDate: '2026-08-30',
        latestRemark: 'All 4 tablets upgraded with latest OpenCV model and calibrated.',
        completionEvidence: {
          fileName: 'Calibration_Certificate_HQ.pdf',
          fileType: 'application/pdf',
          description: 'Lobby kiosk calibration metrics and latency tests.',
          submittedAt: '2026-08-30T17:00:00Z'
        },
        assignedAt: '2026-08-18T10:00:00Z',
        updatedAt: '2026-08-30T17:00:00Z'
      }
    ],
    updates: [],
    comments: [],
    attachments: [],
    timeline: [
      {
        id: 'TL-40',
        taskId: 'TSK-505',
        title: 'Task Verified & Closed',
        description: 'Verified and officially closed by Pavithra.',
        timestamp: '2026-09-01 06:00 PM',
        iconType: 'closed',
        actorName: 'Pavithra'
      }
    ],
    auditLogs: [
      {
        id: 'AUD-40',
        taskId: 'TSK-505',
        taskNumber: 'TSK-2026-005',
        action: 'Task Closed',
        module: 'Task Management',
        oldValue: 'COMPLETED',
        newValue: 'CLOSED',
        performedBy: 'Pavithra',
        performedByRole: 'Super Admin',
        timestamp: '2026-09-01 18:00:00'
      }
    ],
    createdAt: '2026-08-18',
    updatedAt: '2026-09-01'
  },
  {
    id: 'TSK-506',
    taskNumber: 'TSK-2026-006',
    title: 'Company Health Insurance Policy Renewal Briefing',
    taskDate: '2026-09-02',
    sourceType: 'MOM',
    sourceReference: 'HR Steering Committee #05',
    momId: 'MOM-2026-05',
    momItemNumber: 'AI-01',
    createdBy: 'Pavithra',
    assignedBy: 'Pavithra',
    responsiblePersonId: 'EMP-001',
    responsiblePersonName: 'Pavithra',
    department: 'Human Resources',
    taskCategory: 'Operations',
    priority: 'High',
    startDate: '2026-09-03',
    dueDate: '2026-09-20',
    reviewDate: '2026-09-19',
    description: 'Prepare presentation deck detailing new dental and vision options, organize all-hands Q&A session, and distribute enrollment forms.',
    expectedOutput: 'Approved slide deck and Google Form questionnaire sent to all staff.',
    overallProgress: 0,
    overallStatus: 'OPEN',
    assignees: [
      {
        id: 'ASN-601',
        taskId: 'TSK-506',
        employeeId: 'EMP-001',
        employeeName: 'Pavithra',
        employeeEmail: 'alex.morgan@company.com',
        employeeDepartment: 'Human Resources',
        employeeAvatar: '',
        role: 'RESPONSIBLE',
        individualStatus: 'Pending',
        progressPercentage: 0,
        assignedAt: '2026-09-02T09:00:00Z',
        updatedAt: '2026-09-02T09:00:00Z'
      },
      {
        id: 'ASN-602',
        taskId: 'TSK-506',
        employeeId: 'EMP-005',
        employeeName: 'Jessica Taylor',
        employeeEmail: 'jessica.taylor@company.com',
        employeeDepartment: 'Recruitment',
        employeeAvatar: '',
        role: 'ASSIGNEE',
        individualStatus: 'Pending',
        progressPercentage: 0,
        assignedAt: '2026-09-02T09:00:00Z',
        updatedAt: '2026-09-02T09:00:00Z'
      }
    ],
    updates: [],
    comments: [],
    attachments: [],
    timeline: [
      {
        id: 'TL-50',
        taskId: 'TSK-506',
        title: 'Task Created',
        description: 'Auto-created from HR Committee MOM AI-01.',
        timestamp: '2026-09-02 09:00 AM',
        iconType: 'mom',
        actorName: 'Pavithra'
      }
    ],
    auditLogs: [],
    createdAt: '2026-09-02',
    updatedAt: '2026-09-02'
  }
];

export const INITIAL_MOM_MEETINGS: MOMMeeting[] = [
  {
    id: 'MOM-2026-04',
    meetingNumber: 'MOM-2026-04',
    meetingTitle: 'Executive Board Q3 Strategy & Audit Review',
    meetingDate: '2026-08-24',
    startTime: '10:00 AM',
    endTime: '11:45 AM',
    location: 'Boardroom A & Zoom',
    department: 'Executive',
    organizerName: 'Pavithra',
    attendees: ['Pavithra', 'David Miller', 'Robert Chen', 'Sarah Jenkins'],
    summary: 'Reviewed Q3 financial projections, infrastructure scaling costs, and compliance audit timeline.',
    actionItems: [
      {
        id: 'MOM-AI-01',
        momId: 'MOM-2026-04',
        momNumber: 'MOM-2026-04',
        itemNumber: 'AI-01',
        title: 'Finalize AWS Reserved Instances budget authorization',
        description: 'Submit 3-year term commitment analysis for cloud hosting.',
        decision: 'Approved in principle subject to CFO sign-off.',
        dueDate: '2026-09-10',
        actionRequired: true,
        assignedEmployeeIds: ['EMP-004', 'EMP-002'],
        department: 'Accounts Head',
        priority: 'High',
        status: 'Pending',
        createdAt: '2026-08-24'
      },
      {
        id: 'MOM-AI-02',
        momId: 'MOM-2026-04',
        momNumber: 'MOM-2026-04',
        itemNumber: 'AI-02',
        title: 'Q3 Financial Audit Preparation & Reconciliation',
        description: 'Compile tax withholding certificates, reconciliation logs, and expense variance reports.',
        decision: 'Mandatory completion before external auditors arrive.',
        dueDate: '2026-09-08',
        actionRequired: true,
        assignedEmployeeIds: ['EMP-004', 'EMP-002', 'EMP-003'],
        department: 'Accounts Head',
        priority: 'Urgent',
        status: 'In Progress',
        linkedTaskId: 'TSK-501',
        linkedTaskNumber: 'TSK-2026-001',
        createdAt: '2026-08-24'
      },
      {
        id: 'MOM-AI-04',
        momId: 'MOM-2026-04',
        momNumber: 'MOM-2026-04',
        itemNumber: 'AI-04',
        title: 'Annual ISO 27001 Access Review & User Archival',
        description: 'Audit inactive user accounts and archive access logs.',
        decision: 'Mandated by external security compliance standard.',
        dueDate: '2026-08-30',
        actionRequired: true,
        assignedEmployeeIds: ['EMP-001', 'EMP-004'],
        department: 'Human Resources',
        priority: 'Urgent',
        status: 'In Progress',
        linkedTaskId: 'TSK-504',
        linkedTaskNumber: 'TSK-2026-004',
        createdAt: '2026-08-15'
      }
    ]
  },
  {
    id: 'MOM-2026-05',
    meetingNumber: 'MOM-2026-05',
    meetingTitle: 'HR Steering Committee & Welfare Sync',
    meetingDate: '2026-09-02',
    startTime: '09:00 AM',
    endTime: '10:15 AM',
    location: 'Conference Room 2',
    department: 'Human Resources',
    organizerName: 'Pavithra',
    attendees: ['Pavithra', 'Jessica Taylor', 'Sarah Jenkins'],
    summary: 'Discussed employee healthcare insurance renewals and autumn hiring referral awards.',
    actionItems: [
      {
        id: 'MOM-AI-05',
        momId: 'MOM-2026-05',
        momNumber: 'MOM-2026-05',
        itemNumber: 'AI-01',
        title: 'Company Health Insurance Policy Renewal Briefing',
        description: 'Prepare presentation deck detailing new dental and vision options.',
        decision: 'Deliver slide deck for management approval by mid-September.',
        dueDate: '2026-09-20',
        actionRequired: true,
        assignedEmployeeIds: ['EMP-001', 'EMP-005'],
        department: 'Human Resources',
        priority: 'High',
        status: 'Task Created',
        linkedTaskId: 'TSK-506',
        linkedTaskNumber: 'TSK-2026-006',
        createdAt: '2026-09-02'
      },
      {
        id: 'MOM-AI-06',
        momId: 'MOM-2026-05',
        momNumber: 'MOM-2026-05',
        itemNumber: 'AI-02',
        title: 'Workplace Ergonomics Audit for Remote & Hybrid Staff',
        description: 'Distribute ergonomic desk stipend claim forms to all remote team members.',
        decision: 'Budget capped at ₹30,000 per employee.',
        dueDate: '2026-09-25',
        actionRequired: true,
        assignedEmployeeIds: ['EMP-005'],
        department: 'Human Resources',
        priority: 'Medium',
        status: 'Pending',
        createdAt: '2026-09-02'
      }
    ]
  }
];

export const INITIAL_TASK_MASTERS: TaskMasterItem[] = [
  // Task Categories
  { id: 'MST-CAT-01', type: 'TaskCategory', name: 'Compliance & Audit', code: 'Compliance', color: '#dc2626', order: 1, isActive: true },
  { id: 'MST-CAT-02', type: 'TaskCategory', name: 'Technical & Engineering', code: 'Technical', color: '#2563eb', order: 2, isActive: true },
  { id: 'MST-CAT-03', type: 'TaskCategory', name: 'Operations & Facilities', code: 'Operations', color: '#059669', order: 3, isActive: true },
  { id: 'MST-CAT-04', type: 'TaskCategory', name: 'Strategic Initiatives', code: 'Strategy', color: '#7c3aed', order: 4, isActive: true },
  { id: 'MST-CAT-05', type: 'TaskCategory', name: 'Human Resources & Welfare', code: 'HR', color: '#db2777', order: 5, isActive: true },

  // Priorities
  { id: 'MST-PRI-01', type: 'Priority', name: 'Urgent / Critical', code: 'Urgent', color: '#ef4444', order: 1, isActive: true },
  { id: 'MST-PRI-02', type: 'Priority', name: 'High Priority', code: 'High', color: '#f97316', order: 2, isActive: true },
  { id: 'MST-PRI-03', type: 'Priority', name: 'Medium Priority', code: 'Medium', color: '#3b82f6', order: 3, isActive: true },
  { id: 'MST-PRI-04', type: 'Priority', name: 'Low Priority', code: 'Low', color: '#64748b', order: 4, isActive: true },

  // Task Statuses
  { id: 'MST-STA-01', type: 'TaskStatus', name: 'Open / Not Started', code: 'OPEN', color: '#64748b', order: 1, isActive: true },
  { id: 'MST-STA-02', type: 'TaskStatus', name: 'In Progress', code: 'IN PROGRESS', color: '#2563eb', order: 2, isActive: true },
  { id: 'MST-STA-03', type: 'TaskStatus', name: 'Partially Completed', code: 'PARTIALLY COMPLETED', color: '#d97706', order: 3, isActive: true },
  { id: 'MST-STA-04', type: 'TaskStatus', name: 'Completed (All Done)', code: 'COMPLETED', color: '#16a34a', order: 4, isActive: true },
  { id: 'MST-STA-05', type: 'TaskStatus', name: 'Closed & Verified', code: 'CLOSED', color: '#0f766e', order: 5, isActive: true },
  { id: 'MST-STA-06', type: 'TaskStatus', name: 'Overdue', code: 'OVERDUE', color: '#dc2626', order: 6, isActive: true },

  // Due Statuses
  { id: 'MST-DUE-01', type: 'DueStatus', name: 'On Track', code: 'On Track', color: '#10b981', order: 1, isActive: true },
  { id: 'MST-DUE-02', type: 'DueStatus', name: 'Due Tomorrow', code: 'Due Tomorrow', color: '#f59e0b', order: 2, isActive: true },
  { id: 'MST-DUE-03', type: 'DueStatus', name: 'Due Today', code: 'Due Today', color: '#f97316', order: 3, isActive: true },
  { id: 'MST-DUE-04', type: 'DueStatus', name: 'Overdue', code: 'Overdue', color: '#ef4444', order: 4, isActive: true },

  // Reason For Delay
  { id: 'MST-DEL-01', type: 'ReasonForDelay', name: 'Awaiting Dependency from Another Dept', code: 'DEP_BLOCK', color: '#f59e0b', order: 1, isActive: true },
  { id: 'MST-DEL-02', type: 'ReasonForDelay', name: 'Third-Party Vendor Delay', code: 'VENDOR_DELAY', color: '#f59e0b', order: 2, isActive: true },
  { id: 'MST-DEL-03', type: 'ReasonForDelay', name: 'Technical Infrastructure Impediment', code: 'INFRA_ISSUE', color: '#ef4444', order: 3, isActive: true },
  { id: 'MST-DEL-04', type: 'ReasonForDelay', name: 'Staff On Leave / Reduced Capacity', code: 'LEAVE_ABSENCE', color: '#64748b', order: 4, isActive: true }
];

export const INITIAL_ESCALATION_RULES: TaskEscalationRule[] = [
  {
    id: 'ESC-01',
    level: 1,
    triggerEvent: 'Overdue',
    triggerDelayHours: 0, // Immediately upon becoming overdue
    notifyRoles: ['Assignee', 'Responsible Person'],
    escalationAction: 'Send urgent in-app alert and tag task as Overdue',
    isActive: true
  },
  {
    id: 'ESC-02',
    level: 2,
    triggerEvent: 'Overdue',
    triggerDelayHours: 24, // 24 hours overdue
    notifyRoles: ['Responsible Person', 'Manager'],
    escalationAction: 'Alert Department Head and raise task priority level',
    isActive: true
  },
  {
    id: 'ESC-03',
    level: 3,
    triggerEvent: 'Overdue',
    triggerDelayHours: 48, // 48 hours overdue
    notifyRoles: ['Department Head', 'Management'],
    escalationAction: 'Flag on Executive Task Dashboard as High-Risk Bottleneck',
    isActive: true
  },
  {
    id: 'ESC-04',
    level: 1,
    triggerEvent: 'NoUpdate',
    triggerDelayHours: 72, // 3 days with no assignee progress or comment
    notifyRoles: ['Assignee', 'Responsible Person'],
    escalationAction: 'Send automated reminder to update status',
    isActive: true
  }
];

export const INITIAL_TASK_WEIGHTS: TaskPerformanceWeights = {
  taskCompletionWeight: 40,
  onTimeCompletionWeight: 25,
  attendanceWeight: 15,
  managerRatingWeight: 10,
  goalAchievementWeight: 10
};
