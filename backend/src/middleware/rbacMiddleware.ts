import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth.js';

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          details: [],
        },
      });
      return;
    }

    // Super Admin and CEO always possess full access
    if (req.user.role === 'Super Admin' || req.user.role === 'CEO') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Your role (${req.user.role}) does not have permission for this action`,
          details: [`Allowed roles: ${allowedRoles.join(', ')}`],
        },
      });
      return;
    }

    next();
  };
};
