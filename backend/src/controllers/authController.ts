import { Request, Response, NextFunction } from 'express';
import { authRepository } from '../repositories/authRepository.js';
import { auditRepository } from '../repositories/auditRepository.js';
import { changePasswordSchema, loginSchema } from '../validators/authValidators.js';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);
    const identifier = ('identifier' in validated ? validated.identifier : validated.email).trim();

    const user = await authRepository.findByIdentifier(identifier);
    if (!user) {
      await auditRepository.recordLog('LOGIN_FAILED', identifier, 'Anonymous', {
        reason: 'User account not found',
      });

      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          details: [],
        },
      });
      return;
    }

    // Check account active / disabled status
    if (user.accountStatus === 'DISABLED' || !user.isActive) {
      await auditRepository.recordLog('LOGIN_FAILED', user.employeeId, user.email, {
        reason: 'Account disabled',
      });

      res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Your login account is disabled. Please contact the HR Department.',
          details: [],
        },
      });
      return;
    }

    const isMatch = await authRepository.verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      await auditRepository.recordLog('LOGIN_FAILED', user.employeeId, user.email, {
        reason: 'Invalid password',
      });

      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          details: [],
        },
      });
      return;
    }

    // Record last login and generate token
    await authRepository.recordLoginSuccess(user);
    const token = authRepository.generateToken(user);

    res.status(200).json({
      success: true,
      data: {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          employeeId: user.employeeId,
          department: user.department,
          designation: user.designation,
          mustChangePassword: user.mustChangePassword,
          accountStatus: user.accountStatus,
          credentialEmailStatus: user.credentialEmailStatus,
          credentialEmailSentAt: user.credentialEmailSentAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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

    const validated = changePasswordSchema.parse(req.body);
    const result = await authRepository.changePassword(
      req.user.email,
      validated.currentPassword,
      validated.newPassword,
      req.user.email
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_FAILED',
          message: result.message || 'Failed to update password',
          details: [],
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. You may now access the full dashboard.',
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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

    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    next(err);
  }
};
