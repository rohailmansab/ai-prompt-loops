import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getFooter,
  adminGetFooter,
  updateSettings,
  createLink,
  updateLink,
  deleteLink,
  toggleLink,
  createSocial,
  updateSocial,
  deleteSocial,
  toggleSocial,
} from '../controllers/footerController.js';

const router = express.Router();

router.get('/', getFooter);

router.get('/admin', authenticate, requireAdmin, adminGetFooter);
router.put('/settings', authenticate, requireAdmin, updateSettings);

router.post('/link', authenticate, requireAdmin, createLink);
router.put('/link/:id', authenticate, requireAdmin, updateLink);
router.delete('/link/:id', authenticate, requireAdmin, deleteLink);
router.patch('/link/:id/toggle', authenticate, requireAdmin, toggleLink);

router.post('/social', authenticate, requireAdmin, createSocial);
router.put('/social/:id', authenticate, requireAdmin, updateSocial);
router.delete('/social/:id', authenticate, requireAdmin, deleteSocial);
router.patch('/social/:id/toggle', authenticate, requireAdmin, toggleSocial);

export default router;
