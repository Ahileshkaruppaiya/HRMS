// VRM Enterprise HRMS - Authenticated Context Types

export type UserRole = 
  | 'Super Admin' 
  | 'CEO' 
  | 'HR Manager' 
  | 'HR Admin' 
  | 'Department Manager' 
  | 'Employee' 
  | 'Finance Manager';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  name?: string;
  department?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
