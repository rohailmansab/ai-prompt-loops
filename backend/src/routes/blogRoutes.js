import { Router } from 'express';
import { getAllBlogPosts, getBlogPostBySlug, createBlogPost, updateBlogPost, deleteBlogPost, adminGetAllBlogPosts } from '../controllers/blogController.js';
import { authenticate, requireAdmin, requireEditor } from '../middleware/auth.js';

const router = Router();
import { param, body, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};

// Admin (before /:slug)
router.get('/admin/all', authenticate, requireAdmin, adminGetAllBlogPosts);

// Public
router.get('/', getAllBlogPosts);
router.get('/:slug', [param('slug').trim().escape()], validate, getBlogPostBySlug);

// Editor/Admin
router.post('/', 
  authenticate, 
  requireEditor, 
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required')
  ],
  validate,
  createBlogPost
);

router.put('/:id', 
  authenticate, 
  requireEditor, 
  [param('id').isInt().withMessage('Invalid ID')],
  validate,
  updateBlogPost
);

// Admin
router.delete('/:id', 
  authenticate, 
  requireAdmin, 
  [param('id').isInt().withMessage('Invalid ID')],
  validate,
  deleteBlogPost
);

export default router;
