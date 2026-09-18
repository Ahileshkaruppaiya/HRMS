import { Router } from 'express';
import {
  getAttendanceLogs,
  recordPunch,
  verifyFace,
  getTodaySummary,
} from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

export const attendanceRouter = Router();

attendanceRouter.use(authenticateToken);

attendanceRouter.get('/', getAttendanceLogs);
attendanceRouter.post('/punch', recordPunch);
attendanceRouter.post('/verify-face', verifyFace);
attendanceRouter.get('/summary', getTodaySummary);
