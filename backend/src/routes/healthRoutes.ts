import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'VRM Enterprise HRMS Payroll Engine',
    timestamp: new Date().toISOString(),
  });
});
