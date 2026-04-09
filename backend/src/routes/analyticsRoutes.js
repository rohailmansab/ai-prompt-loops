import express from 'express';
import { trackEvent, getAnalyticsDashboard } from '../controllers/analyticsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route to track events from frontend
router.post('/track', trackEvent);

// Admin route to retrieve dashboard data
router.get('/dashboard', authenticate, requireAdmin, getAnalyticsDashboard);

export default router;
