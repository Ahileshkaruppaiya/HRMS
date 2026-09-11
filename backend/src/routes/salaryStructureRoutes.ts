import { Router } from 'express';
import { salaryStructureController } from '../controllers/salaryStructureController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/rbacMiddleware.js';

export const salaryStructureRouter = Router();

salaryStructureRouter.use(authenticateToken);

salaryStructureRouter.get(
  '/employees/:employeeId/salary-structure',
  (req, res, next) => salaryStructureController.getStructure(req, res, next)
);

salaryStructureRouter.post(
  '/employees/:employeeId/salary-structure',
  requireRoles(['Super Admin', 'CEO', 'HR Manager', 'Finance Manager']),
  (req, res, next) => salaryStructureController.saveStructure(req, res, next)
);

salaryStructureRouter.put(
  '/employees/:employeeId/salary-structure/:id',
  requireRoles(['Super Admin', 'CEO', 'HR Manager', 'Finance Manager']),
  (req, res, next) => salaryStructureController.saveStructure(req, res, next)
);
