import { z } from 'zod';

export const loginSchema = z.union([
  z.object({
    identifier: z.string().min(1, 'User ID or Email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
  z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  }),
]);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(10, 'New password must be at least 10 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirmation do not match',
    path: ['confirmPassword'],
  });

export const updateAccountStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'LOCKED', 'DISABLED'], {
    errorMap: () => ({ message: "Status must be 'ACTIVE', 'LOCKED', or 'DISABLED'" }),
  }),
});
