import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  resetEmployeeLogin,
  updateEmployeeLoginStatus,
  getEmployeeLoginAccount,
} from '../controllers/employeeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/rbacMiddleware.js';

export const employeeRouter = Router();

employeeRouter.use(authenticateToken);

employeeRouter.get('/', getEmployees);
employeeRouter.get('/:id', getEmployeeById);
employeeRouter.post('/', requireRoles(['Super Admin', 'CEO', 'HR Manager', 'HR Admin']), createEmployee);
employeeRouter.put('/:id', requireRoles(['Super Admin', 'CEO', 'HR Manager', 'HR Admin']), updateEmployee);
employeeRouter.delete('/:id', requireRoles(['Super Admin', 'CEO', 'HR Manager']), deleteEmployee);

// Login Account Management (HR Admin / CEO / Super Admin)
employeeRouter.post('/:id/reset-login', requireRoles(['Super Admin', 'CEO', 'HR Manager', 'HR Admin']), resetEmployeeLogin);
employeeRouter.put('/:id/login-status', requireRoles(['Super Admin', 'CEO', 'HR Manager', 'HR Admin']), updateEmployeeLoginStatus);
employeeRouter.get('/:id/login-account', requireRoles(['Super Admin', 'CEO', 'HR Manager', 'HR Admin']), getEmployeeLoginAccount);
