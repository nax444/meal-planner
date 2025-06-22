import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import MealPlan from '../models/MealPlan';
import Recipe from '../models/Recipe';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/meal-plans
// @desc    Get all meal plans for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ userId: req.user._id })
      .sort({ weekStartDate: -1 })
      .populate('meals.recipe');

    res.json(mealPlans);
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ message: 'Server error while fetching meal plans' });
  }
});

// @route   GET /api/meal-plans/:id
// @desc    Get a specific meal plan
// @access  Private
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid meal plan ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const mealPlan = await MealPlan.findOne({
        _id: req.params.id,
        userId: req.user._id,
      }).populate('meals.recipe');

      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      res.json(mealPlan);
    } catch (error) {
      console.error('Get meal plan error:', error);
      res.status(500).json({ message: 'Server error while fetching meal plan' });
    }
});

// @route   POST /api/meal-plans
// @desc    Create a new meal plan
// @access  Private
router.post('/',
  [
    body('weekStartDate').isISO8601().withMessage('Valid week start date is required'),
    body('meals').isArray().withMessage('Meals array is required'),
    body('meals.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
      .withMessage('Valid day is required'),
    body('meals.*.type').isIn(['breakfast', 'lunch', 'dinner'])
      .withMessage('Valid meal type is required'),
    body('meals.*.recipe').isMongoId().withMessage('Valid recipe ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify all recipes exist and belong to the user
      const recipeIds = [...new Set(req.body.meals.map((meal: any) => meal.recipe))];
      const recipes = await Recipe.find({
        _id: { $in: recipeIds },
        createdBy: req.user._id,
      });

      if (recipes.length !== recipeIds.length) {
        return res.status(400).json({ message: 'One or more recipes are invalid' });
      }

      const mealPlan = await MealPlan.create({
        userId: req.user._id,
        weekStartDate: req.body.weekStartDate,
        meals: req.body.meals,
      });

      const populatedMealPlan = await mealPlan.populate('meals.recipe');
      res.status(201).json(populatedMealPlan);
    } catch (error) {
      console.error('Create meal plan error:', error);
      res.status(500).json({ message: 'Server error while creating meal plan' });
    }
});

// @route   PUT /api/meal-plans/:id
// @desc    Update a meal plan
// @access  Private
router.put('/:id',
  [
    param('id').isMongoId().withMessage('Invalid meal plan ID'),
    body('weekStartDate').optional().isISO8601().withMessage('Valid week start date is required'),
    body('meals').optional().isArray().withMessage('Meals must be an array'),
    body('meals.*.day').optional()
      .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
      .withMessage('Valid day is required'),
    body('meals.*.type').optional()
      .isIn(['breakfast', 'lunch', 'dinner'])
      .withMessage('Valid meal type is required'),
    body('meals.*.recipe').optional().isMongoId().withMessage('Valid recipe ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.body.meals) {
        // Verify all recipes exist and belong to the user
        const recipeIds = [...new Set(req.body.meals.map((meal: any) => meal.recipe))];
        const recipes = await Recipe.find({
          _id: { $in: recipeIds },
          createdBy: req.user._id,
        });

        if (recipes.length !== recipeIds.length) {
          return res.status(400).json({ message: 'One or more recipes are invalid' });
        }
      }

      const mealPlan = await MealPlan.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user._id,
        },
        req.body,
        { new: true, runValidators: true }
      ).populate('meals.recipe');

      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      res.json(mealPlan);
    } catch (error) {
      console.error('Update meal plan error:', error);
      res.status(500).json({ message: 'Server error while updating meal plan' });
    }
});

// @route   DELETE /api/meal-plans/:id
// @desc    Delete a meal plan
// @access  Private
router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid meal plan ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const mealPlan = await MealPlan.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      res.json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
      console.error('Delete meal plan error:', error);
      res.status(500).json({ message: 'Server error while deleting meal plan' });
    }
});

// @route   GET /api/meal-plans/:id/grocery-list
// @desc    Generate grocery list from meal plan
// @access  Private
router.get('/:id/grocery-list',
  param('id').isMongoId().withMessage('Invalid meal plan ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const mealPlan = await MealPlan.findOne({
        _id: req.params.id,
        userId: req.user._id,
      }).populate('meals.recipe');

      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      const groceryList = await mealPlan.generateGroceryList();
      res.json(groceryList);
    } catch (error) {
      console.error('Generate grocery list error:', error);
      res.status(500).json({ message: 'Server error while generating grocery list' });
    }
});

export default router;