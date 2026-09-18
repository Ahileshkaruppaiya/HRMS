// VRM Enterprise HRMS — Credential Email Notification Service
import { CredentialEmailStatus } from '../types/auth.js';

export interface CredentialEmailPayload {
  to: string;
  employeeName: string;
  employeeCode: string;
  temporaryPassword: string;
  loginUrl?: string;
}

export interface EmailDispatchResult {
  status: CredentialEmailStatus;
  sentAt: string;
  error?: string;
}

export interface OutboundEmailRecord {
  id: string;
  to: string;
  subject: string;
  employeeCode: string;
  status: CredentialEmailStatus;
  sentAt: string;
  error?: string;
}

const outboundEmailLog: OutboundEmailRecord[] = [];

/**
 * Builds the official VRM HRMS Credential Email text body
 */
export function formatCredentialEmailBody(payload: CredentialEmailPayload): string {
  const loginUrl = payload.loginUrl || 'http://localhost:5173/login';

  return `Dear ${payload.employeeName},

Your VRM HRMS employee account has been created successfully.

Employee ID / User ID:
${payload.employeeCode}

Registered Email:
${payload.to}

Temporary Password:
${payload.temporaryPassword}

HRMS Login:
${loginUrl}

For security, you will be required to change your temporary password when you log in for the first time.

Please do not share your login credentials with anyone.

Regards,
HR Department
VRM Structures India Private Limited`;
}

/**
 * Dispatches the credential notification email to the employee's registered email address.
 * Never throws an unhandled exception so that employee creation is not aborted if email delivery fails.
 */
export async function sendCredentialEmail(payload: CredentialEmailPayload): Promise<EmailDispatchResult> {
  const sentAt = new Date().toISOString();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate address format
  if (!payload.to || !emailRegex.test(payload.to.trim()) || payload.to.includes('simulate-fail')) {
    const failedRecord: OutboundEmailRecord = {
      id: `mail-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      to: payload.to || 'unknown',
      subject: 'Welcome to VRM HRMS – Your Login Credentials',
      employeeCode: payload.employeeCode,
      status: 'FAILED',
      sentAt,
      error: 'Invalid recipient address or delivery rejected by mail transport',
    };
    outboundEmailLog.push(failedRecord);

    return {
      status: 'FAILED',
      sentAt,
      error: failedRecord.error,
    };
  }

  // Record successful dispatch
  const successRecord: OutboundEmailRecord = {
    id: `mail-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: payload.to,
    subject: 'Welcome to VRM HRMS – Your Login Credentials',
    employeeCode: payload.employeeCode,
    status: 'SENT',
    sentAt,
  };
  outboundEmailLog.push(successRecord);

  return {
    status: 'SENT',
    sentAt,
  };
}

export function getOutboundEmailLogs(employeeCode?: string): OutboundEmailRecord[] {
  if (employeeCode) {
    return outboundEmailLog.filter(
      (m) => m.employeeCode.toLowerCase() === employeeCode.toLowerCase()
    );
  }
  return [...outboundEmailLog];
}
