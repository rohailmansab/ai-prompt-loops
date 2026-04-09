import { Router } from 'express';
import { getAllPrompts, getPromptBySlug, createPrompt, updatePrompt, deletePrompt, likePrompt, adminGetAllPrompts } from '../controllers/promptController.js';
import { authenticate, requireAdmin, requireEditor } from '../middleware/auth.js';

const router = Router();
import { param, body, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};

// Admin (must be before /:slug to avoid parameter conflict)
router.get('/admin/all', authenticate, requireAdmin, adminGetAllPrompts);

// Public
router.get('/', getAllPrompts);
router.get('/:slug', [param('slug').trim().escape()], validate, getPromptBySlug);
router.post('/:id/like', [param('id').isInt().withMessage('Invalid ID')], validate, likePrompt);

// Editor/Admin
router.post('/', 
  authenticate, 
  requireEditor, 
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required')
  ],
  validate,
  createPrompt
);

router.put('/:id', 
  authenticate, 
  requireEditor, 
  [param('id').isInt().withMessage('Invalid ID')],
  validate,
  updatePrompt
);

// Admin
router.delete('/:id', 
  authenticate, 
  requireAdmin, 
  [param('id').isInt().withMessage('Invalid ID')],
  validate,
  deletePrompt
);

export default router;
