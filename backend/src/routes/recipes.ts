import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import Recipe from '../models/Recipe';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/recipes
// @desc    Get all recipes for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ message: 'Server error while fetching recipes' });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get a specific recipe
// @access  Private
router.get('/:id', 
  param('id').isMongoId().withMessage('Invalid recipe ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const recipe = await Recipe.findOne({
        _id: req.params.id,
        createdBy: req.user._id,
      });

      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      res.json(recipe);
    } catch (error) {
      console.error('Get recipe error:', error);
      res.status(500).json({ message: 'Server error while fetching recipe' });
    }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Recipe name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
    body('ingredients.*.name').trim().notEmpty().withMessage('Ingredient name is required'),
    body('ingredients.*.quantity').isFloat({ min: 0 }).withMessage('Valid quantity is required'),
    body('ingredients.*.unit').trim().notEmpty().withMessage('Unit is required'),
    body('instructions').isArray({ min: 1 }).withMessage('At least one instruction is required'),
    body('instructions.*').trim().notEmpty().withMessage('Instruction step cannot be empty'),
    body('prepTime').isInt({ min: 0 }).withMessage('Valid preparation time is required'),
    body('cookTime').isInt({ min: 0 }).withMessage('Valid cooking time is required'),
    body('servings').isInt({ min: 1 }).withMessage('Valid number of servings is required'),
    body('category').isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']).withMessage('Valid category is required'),
    body('imageUrl').optional().isURL().withMessage('Valid image URL is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const recipe = await Recipe.create({
        ...req.body,
        createdBy: req.user._id,
      });

      res.status(201).json(recipe);
    } catch (error) {
      console.error('Create recipe error:', error);
      res.status(500).json({ message: 'Server error while creating recipe' });
    }
});

// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Private
router.put('/:id',
  [
    param('id').isMongoId().withMessage('Invalid recipe ID'),
    body('name').optional().trim().notEmpty().withMessage('Recipe name cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('ingredients').optional().isArray({ min: 1 }).withMessage('At least one ingredient is required'),
    body('ingredients.*.name').optional().trim().notEmpty().withMessage('Ingredient name cannot be empty'),
    body('ingredients.*.quantity').optional().isFloat({ min: 0 }).withMessage('Valid quantity is required'),
    body('ingredients.*.unit').optional().trim().notEmpty().withMessage('Unit cannot be empty'),
    body('instructions').optional().isArray({ min: 1 }).withMessage('At least one instruction is required'),
    body('instructions.*').optional().trim().notEmpty().withMessage('Instruction step cannot be empty'),
    body('prepTime').optional().isInt({ min: 0 }).withMessage('Valid preparation time is required'),
    body('cookTime').optional().isInt({ min: 0 }).withMessage('Valid cooking time is required'),
    body('servings').optional().isInt({ min: 1 }).withMessage('Valid number of servings is required'),
    body('category').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']).withMessage('Valid category is required'),
    body('imageUrl').optional().isURL().withMessage('Valid image URL is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const recipe = await Recipe.findOneAndUpdate(
        {
          _id: req.params.id,
          createdBy: req.user._id,
        },
        req.body,
        { new: true, runValidators: true }
      );

      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      res.json(recipe);
    } catch (error) {
      console.error('Update recipe error:', error);
      res.status(500).json({ message: 'Server error while updating recipe' });
    }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private
router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid recipe ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const recipe = await Recipe.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user._id,
      });

      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error('Delete recipe error:', error);
      res.status(500).json({ message: 'Server error while deleting recipe' });
    }
});

export default router;