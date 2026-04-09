import { Router } from 'express';
import { getAllCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory, adminGetAllCategories } from '../controllers/categoryController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { param, body, validationResult } from 'express-validator';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};

// Admin (before /:slug)
router.get('/admin/all', authenticate, requireAdmin, adminGetAllCategories);

// Public
router.get('/', getAllCategories);
router.get('/:slug', [param('slug').trim().escape()], validate, getCategoryBySlug);

// Admin — Create
router.post('/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Category name is required').escape(),
    body('description').optional().trim().escape(),
    body('color').optional().matches(/^#[0-9a-fA-F]{3,6}$/).withMessage('Invalid color format'),
  ],
  validate,
  createCategory
);

// Admin — Update
router.put('/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isInt().withMessage('Invalid ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').escape(),
    body('description').optional().trim().escape(),
    body('color').optional().matches(/^#[0-9a-fA-F]{3,6}$/).withMessage('Invalid color format'),
  ],
  validate,
  updateCategory
);

// Admin — Delete
router.delete('/:id',
  authenticate,
  requireAdmin,
  [param('id').isInt().withMessage('Invalid ID')],
  validate,
  deleteCategory
);

export default router;
