import { getSupabaseAdmin, isRealSupabaseConfigured } from '../config/supabase.js';
import { SalaryStructureInput } from '../types/payroll.js';

export interface EmployeeRecord {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  basicSalary: number;
  grossSalary: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface EmployeeSalaryStructureRecord extends SalaryStructureInput {
  id: string;
  employeeId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
}

// Initial seed employees aligned exactly with frontend HRMS employee master
const fallbackEmployees: EmployeeRecord[] = [
  {
    id: 'e01a1111-0000-0000-0000-000000000000',
    employeeId: 'EMP-000',
    firstName: 'Velmurugan',
    lastName: '',
    email: 'ceo@vrmstructures.com',
    department: 'HR',
    designation: 'CEO',
    basicSalary: 100000,
    grossSalary: 250000,
    bankName: 'HDFC Bank',
    accountNumber: '****1001',
    ifscCode: 'HDFC0001234',
  },
  {
    id: 'e01a1111-0000-0000-0000-000000000001',
    employeeId: 'EMP-001',
    firstName: 'Pavithra',
    lastName: '',
    email: 'hr@vrmstructures.com',
    department: 'HR',
    designation: 'HR Manager',
    basicSalary: 6000,
    grossSalary: 15000,
    bankName: 'ICICI Bank',
    accountNumber: '****6789',
    ifscCode: 'ICIC00912',
  },
  {
    id: 'e01a1111-0000-0000-0000-000000000002',
    employeeId: 'EMP-002',
    firstName: 'Ramesh',
    lastName: 'Kumar',
    email: 'ramesh.ph@vrmstructures.com',
    department: 'Dispatch',
    designation: 'Dispatch Head',
    basicSalary: 8000,
    grossSalary: 20000,
    bankName: 'State Bank of India',
    accountNumber: '****4321',
    ifscCode: 'SBIN00123',
  },
  {
    id: 'e01a1111-0000-0000-0000-000000000003',
    employeeId: 'EMP-003',
    firstName: 'Suresh',
    lastName: 'Patel',
    email: 'suresh.dh@vrmstructures.com',
    department: 'Dispatch',
    designation: 'Logistics Coordinator',
    basicSalary: 12000,
    grossSalary: 30000,
    bankName: 'Canara Bank',
    accountNumber: '****9876',
    ifscCode: 'CNRB00876',
  },
  {
    id: 'e01a1111-0000-0000-0000-000000000004',
    employeeId: 'EMP-004',
    firstName: 'Karthik',
    lastName: 'Rajan',
    email: 'karthik.fs@vrmstructures.com',
    department: 'Procurement',
    designation: 'Procurement Head',
    basicSalary: 26000,
    grossSalary: 65000,
    bankName: 'Axis Bank',
    accountNumber: '****1122',
    ifscCode: 'UTIB00345',
  },
  {
    id: 'e01a1111-0000-0000-0000-000000000005',
    employeeId: 'EMP-005',
    firstName: 'Murugan',
    lastName: 'S',
    email: 'murugan.fe@vrmstructures.com',
    department: 'Procurement',
    designation: 'Purchase Executive',
    basicSalary: 15200,
    grossSalary: 38000,
    bankName: 'Indian Bank',
    accountNumber: '****5566',
    ifscCode: 'IDIB00112',
  },
  {
    id: 'e01a1111-0000-0000-0000-000000000006',
    employeeId: 'EMP-006',
    firstName: 'Anand',
    lastName: 'Sharma',
    email: 'anand.pr@vrmstructures.com',
    department: 'Procurement',
    designation: 'Vendor Coordinator',
    basicSalary: 35200,
    grossSalary: 88000,
    bankName: 'HDFC Bank',
    accountNumber: '****7788',
    ifscCode: 'HDFC0008899',
  },
  {
    id: 'e01a1111-0000-0000-0000-000000000007',
    employeeId: 'EMP-007',
    firstName: 'Priya',
    lastName: 'Natarajan',
    email: 'priya.ah@vrmstructures.com',
    department: 'Accounts',
    designation: 'Accounts Head',
    basicSalary: 36800,
    grossSalary: 92000,
    bankName: 'ICICI Bank',
    accountNumber: '****2233',
    ifscCode: 'ICIC00124',
  },
  {
    id: 'e01a1111-0000-0000-0000-000000000008',
    employeeId: 'EMP-008',
    firstName: 'Rajesh',
    lastName: 'Kannan',
    email: 'rajesh.sh@vrmstructures.com',
    department: 'Sales',
    designation: 'Sales Head',
    basicSalary: 38400,
    grossSalary: 96000,
    bankName: 'Kotak Mahindra Bank',
    accountNumber: '****4455',
    ifscCode: 'KKBK00012',
  },
  {
    id: 'e01a1111-0000-0000-0000-000000000009',
    employeeId: 'EMP-009',
    firstName: 'Dinesh',
    lastName: 'Kumar',
    email: 'dinesh.se@vrmstructures.com',
    department: 'Sales',
    designation: 'Sales Executive',
    basicSalary: 18000,
    grossSalary: 45000,
    bankName: 'Axis Bank',
    accountNumber: '****6677',
    ifscCode: 'UTIB00889',
  },
  {
    id: 'e01a1111-0000-0000-0000-000000000010',
    employeeId: 'EMP-010',
    firstName: 'Swetha',
    lastName: 'Sundar',
    email: 'swetha.de@vrmstructures.com',
    department: 'Design',
    designation: 'Design Executive',
    basicSalary: 27200,
    grossSalary: 68000,
    bankName: 'State Bank of India',
    accountNumber: '****8899',
    ifscCode: 'SBIN00456',
  },
];

// Fallback in-memory salary structures (Default: 40% Basic, 20% DA, 5% Conveyance, 35% HRA)
const inMemoryStructures = new Map<string, EmployeeSalaryStructureRecord>([
  [
    'EMP-000',
    {
      id: 'ss-000',
      employeeId: 'EMP-000',
      monthlySalary: 250000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
  [
    'EMP-001',
    {
      id: 'ss-001',
      employeeId: 'EMP-001',
      monthlySalary: 15000, // ₹15,000 project standard test baseline
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
  [
    'EMP-002',
    {
      id: 'ss-002',
      employeeId: 'EMP-002',
      monthlySalary: 20000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
  [
    'EMP-003',
    {
      id: 'ss-003',
      employeeId: 'EMP-003',
      monthlySalary: 30000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
  [
    'EMP-004',
    {
      id: 'ss-004',
      employeeId: 'EMP-004',
      monthlySalary: 65000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
  [
    'EMP-005',
    {
      id: 'ss-005',
      employeeId: 'EMP-005',
      monthlySalary: 38000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
  [
    'EMP-006',
    {
      id: 'ss-006',
      employeeId: 'EMP-006',
      monthlySalary: 88000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
  [
    'EMP-007',
    {
      id: 'ss-007',
      employeeId: 'EMP-007',
      monthlySalary: 92000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
  [
    'EMP-008',
    {
      id: 'ss-008',
      employeeId: 'EMP-008',
      monthlySalary: 96000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
  [
    'EMP-009',
    {
      id: 'ss-009',
      employeeId: 'EMP-009',
      monthlySalary: 45000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
  [
    'EMP-010',
    {
      id: 'ss-010',
      employeeId: 'EMP-010',
      monthlySalary: 68000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    },
  ],
]);

export class EmployeeRepository {
  async getEmployeeById(idOrEmpId: string): Promise<EmployeeRecord | null> {
    if (isRealSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .or(`id.eq.${idOrEmpId},employee_id.eq.${idOrEmpId}`)
          .single();

        if (data && !error) {
          return {
            id: data.id,
            employeeId: data.employee_id,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            department: data.department || 'General',
            designation: data.designation || 'Staff',
            basicSalary: Number(data.basic_salary) || 0,
            grossSalary: Number(data.basic_salary) * 2.5 || 15000,
            bankName: data.bank_name,
            accountNumber: data.account_number,
            ifscCode: data.ifsc_code,
          };
        }
      } catch {
        // Fall back to in-memory store
      }
    }

    return (
      fallbackEmployees.find(e => e.id === idOrEmpId || e.employeeId === idOrEmpId) || {
        id: idOrEmpId,
        employeeId: idOrEmpId,
        firstName: 'Staff',
        lastName: 'Member',
        email: `${idOrEmpId.toLowerCase()}@vrmstructures.in`,
        department: 'Operations',
        designation: 'Associate',
        basicSalary: 6000,
        grossSalary: 15000,
      }
    );
  }

  async getAllEmployees(): Promise<EmployeeRecord[]> {
    if (isRealSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.from('employees').select('*').eq('status', 'Active');
        if (data && !error && data.length > 0) {
          return data.map(d => ({
            id: d.id,
            employeeId: d.employee_id,
            firstName: d.first_name,
            lastName: d.last_name,
            email: d.email,
            department: d.department || 'General',
            designation: d.designation || 'Staff',
            basicSalary: Number(d.basic_salary) || 0,
            grossSalary: Number(d.basic_salary) * 2.5 || 15000,
            bankName: d.bank_name,
            accountNumber: d.account_number,
            ifscCode: d.ifsc_code,
          }));
        }
      } catch {
        // fallback
      }
    }
    return fallbackEmployees;
  }

  async getSalaryStructure(employeeId: string): Promise<EmployeeSalaryStructureRecord | null> {
    const emp = await this.getEmployeeById(employeeId);
    const key = emp ? emp.employeeId : employeeId;

    if (isRealSupabaseConfigured() && emp) {
      try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
          .from('salary_structures')
          .select('*')
          .eq('employee_id', emp.id)
          .eq('is_active', true)
          .single();

        if (data && !error) {
          return {
            id: data.id,
            employeeId: key,
            monthlySalary: Number(data.monthly_salary),
            basicPercentage: Number(data.basic_percentage),
            daPercentage: Number(data.da_percentage),
            conveyancePercentage: Number(data.conveyance_percentage),
            hraPercentage: Number(data.hra_percentage),
            effectiveFrom: data.effective_from,
            effectiveTo: data.effective_to,
            isActive: data.is_active,
          };
        }
      } catch {
        // fallback
      }
    }

    const found = inMemoryStructures.get(key);
    if (found) return found;

    // Default structure (40% Basic, 20% DA, 5% Conveyance, 35% HRA) for monthly salary 15000
    const defaultStructure: EmployeeSalaryStructureRecord = {
      id: `ss-${key}`,
      employeeId: key,
      monthlySalary: 15000,
      basicPercentage: 40,
      daPercentage: 20,
      conveyancePercentage: 5,
      hraPercentage: 35,
      effectiveFrom: '2026-01-01',
      isActive: true,
    };
    inMemoryStructures.set(key, defaultStructure);
    return defaultStructure;
  }

  async saveSalaryStructure(
    employeeId: string,
    structure: SalaryStructureInput & { effectiveFrom?: string; effectiveTo?: string | null }
  ): Promise<EmployeeSalaryStructureRecord> {
    const emp = await this.getEmployeeById(employeeId);
    const key = emp ? emp.employeeId : employeeId;

    const record: EmployeeSalaryStructureRecord = {
      id: `ss-${key}-${Date.now()}`,
      employeeId: key,
      monthlySalary: structure.monthlySalary,
      basicPercentage: structure.basicPercentage,
      daPercentage: structure.daPercentage,
      conveyancePercentage: structure.conveyancePercentage,
      hraPercentage: structure.hraPercentage,
      effectiveFrom: structure.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveTo: structure.effectiveTo || null,
      isActive: true,
    };

    inMemoryStructures.set(key, record);

    if (isRealSupabaseConfigured() && emp) {
      try {
        const supabase = getSupabaseAdmin();
        // Deactivate old structures
        await supabase
          .from('salary_structures')
          .update({ is_active: false })
          .eq('employee_id', emp.id);

        // Insert new active structure
        await supabase.from('salary_structures').insert({
          employee_id: emp.id,
          monthly_salary: structure.monthlySalary,
          basic_percentage: structure.basicPercentage,
          da_percentage: structure.daPercentage,
          conveyance_percentage: structure.conveyancePercentage,
          hra_percentage: structure.hraPercentage,
          effective_from: record.effectiveFrom,
          is_active: true,
        });
      } catch (err) {
        console.warn('Could not persist salary structure to Supabase:', err);
      }
    }

    return record;
  }
}

export const employeeRepository = new EmployeeRepository();
