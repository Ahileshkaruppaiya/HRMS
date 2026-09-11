import { Router } from 'express';
import { payrollController } from '../controllers/payrollController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/rbacMiddleware.js';

export const payrollRouter = Router();

// Apply auth to all payroll routes
payrollRouter.use(authenticateToken);

// Settings
payrollRouter.get('/settings', (req, res, next) => payrollController.getSettings(req, res, next));
payrollRouter.put('/settings', requireRoles(['Super Admin', 'CEO', 'HR Manager', 'Finance Manager']), (req, res, next) =>
  payrollController.updateSettings(req, res, next)
);

// Preview (Authoritative calculation preview)
payrollRouter.post('/preview', (req, res, next) => payrollController.previewPayroll(req, res, next));

// Payroll Runs
payrollRouter.post('/runs', requireRoles(['Super Admin', 'CEO', 'HR Manager', 'Finance Manager']), (req, res, next) =>
  payrollController.createRun(req, res, next)
);
payrollRouter.get('/runs', (req, res, next) => payrollController.getAllRuns(req, res, next));
payrollRouter.get('/runs/:id', (req, res, next) => payrollController.getRunById(req, res, next));

// Workflow actions: Process -> Approve -> Pay
payrollRouter.post('/runs/:id/process', requireRoles(['Super Admin', 'CEO', 'HR Manager', 'Finance Manager']), (req, res, next) =>
  payrollController.processRun(req, res, next)
);
payrollRouter.post('/runs/:id/approve', requireRoles(['Super Admin', 'CEO', 'HR Manager', 'Finance Manager']), (req, res, next) =>
  payrollController.approveRun(req, res, next)
);
payrollRouter.post('/runs/:id/pay', requireRoles(['Super Admin', 'CEO', 'Finance Manager']), (req, res, next) =>
  payrollController.payRun(req, res, next)
);

// Processed Records & Payslips
payrollRouter.get('/records', (req, res, next) => payrollController.getRecords(req, res, next));
payrollRouter.get('/records/:id', (req, res, next) => payrollController.getRecords(req, res, next));

payrollRouter.get('/payslips/:id', (req, res, next) => payrollController.getPayslip(req, res, next));
payrollRouter.get('/employees/:employeeId/payslips', (req, res, next) => payrollController.getPayslip(req, res, next));
