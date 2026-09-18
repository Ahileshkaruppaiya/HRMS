import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticatedUser, UserRole } from '../types/auth.js';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    // Only in development or test environment: allow mock session if explicit dev flag is present
    if ((env.NODE_ENV === 'development' || env.NODE_ENV === 'test') && req.headers['x-dev-mock-auth'] === 'true') {
      req.user = {
        id: 'usr-admin-001',
        email: 'admin@vrmstructures.in',
        role: (req.headers['x-user-role'] as UserRole) || 'Super Admin',
        employeeId: (req.headers['x-employee-id'] as string) || 'EMP-001',
        name: 'System Admin',
      };
      return next();
    }

    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token required. Please provide a valid Bearer token.',
        details: [],
      },
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid or expired access token',
        details: [],
      },
    });
  }
};
