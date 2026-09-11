import { Router } from 'express';
import { payrollRouter } from './payrollRoutes.js';
import { salaryStructureRouter } from './salaryStructureRoutes.js';
import { overtimeRouter } from './overtimeRoutes.js';
import { healthRouter } from './healthRoutes.js';

export const apiRouter = Router();

// Health check available at /health and /api/v1/health
apiRouter.use(healthRouter);

// Domain Routes
apiRouter.use('/payroll', payrollRouter);
apiRouter.use('/', salaryStructureRouter);
apiRouter.use('/', overtimeRouter);
