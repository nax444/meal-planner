"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const MealPlan_1 = __importDefault(require("../models/MealPlan"));
const Recipe_1 = __importDefault(require("../models/Recipe"));
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/', async (req, res) => {
    try {
        const mealPlans = await MealPlan_1.default.find({ userId: req.user._id })
            .sort({ weekStartDate: -1 })
            .populate('meals.recipe');
        res.json(mealPlans);
    }
    catch (error) {
        console.error('Get meal plans error:', error);
        res.status(500).json({ message: 'Server error while fetching meal plans' });
    }
});
router.get('/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid meal plan ID'), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const mealPlan = await MealPlan_1.default.findOne({
            _id: req.params.id,
            userId: req.user._id,
        }).populate('meals.recipe');
        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        res.json(mealPlan);
    }
    catch (error) {
        console.error('Get meal plan error:', error);
        res.status(500).json({ message: 'Server error while fetching meal plan' });
    }
});
router.post('/', [
    (0, express_validator_1.body)('weekStartDate').isISO8601().withMessage('Valid week start date is required'),
    (0, express_validator_1.body)('meals').isArray().withMessage('Meals array is required'),
    (0, express_validator_1.body)('meals.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .withMessage('Valid day is required'),
    (0, express_validator_1.body)('meals.*.type').isIn(['breakfast', 'lunch', 'dinner'])
        .withMessage('Valid meal type is required'),
    (0, express_validator_1.body)('meals.*.recipe').isMongoId().withMessage('Valid recipe ID is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const recipeIds = [...new Set(req.body.meals.map((meal) => meal.recipe))];
        const recipes = await Recipe_1.default.find({
            _id: { $in: recipeIds },
            createdBy: req.user._id,
        });
        if (recipes.length !== recipeIds.length) {
            return res.status(400).json({ message: 'One or more recipes are invalid' });
        }
        const mealPlan = await MealPlan_1.default.create({
            userId: req.user._id,
            weekStartDate: req.body.weekStartDate,
            meals: req.body.meals,
        });
        const populatedMealPlan = await mealPlan.populate('meals.recipe');
        res.status(201).json(populatedMealPlan);
    }
    catch (error) {
        console.error('Create meal plan error:', error);
        res.status(500).json({ message: 'Server error while creating meal plan' });
    }
});
router.put('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid meal plan ID'),
    (0, express_validator_1.body)('weekStartDate').optional().isISO8601().withMessage('Valid week start date is required'),
    (0, express_validator_1.body)('meals').optional().isArray().withMessage('Meals must be an array'),
    (0, express_validator_1.body)('meals.*.day').optional()
        .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .withMessage('Valid day is required'),
    (0, express_validator_1.body)('meals.*.type').optional()
        .isIn(['breakfast', 'lunch', 'dinner'])
        .withMessage('Valid meal type is required'),
    (0, express_validator_1.body)('meals.*.recipe').optional().isMongoId().withMessage('Valid recipe ID is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (req.body.meals) {
            const recipeIds = [...new Set(req.body.meals.map((meal) => meal.recipe))];
            const recipes = await Recipe_1.default.find({
                _id: { $in: recipeIds },
                createdBy: req.user._id,
            });
            if (recipes.length !== recipeIds.length) {
                return res.status(400).json({ message: 'One or more recipes are invalid' });
            }
        }
        const mealPlan = await MealPlan_1.default.findOneAndUpdate({
            _id: req.params.id,
            userId: req.user._id,
        }, req.body, { new: true, runValidators: true }).populate('meals.recipe');
        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        res.json(mealPlan);
    }
    catch (error) {
        console.error('Update meal plan error:', error);
        res.status(500).json({ message: 'Server error while updating meal plan' });
    }
});
router.delete('/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid meal plan ID'), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const mealPlan = await MealPlan_1.default.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        res.json({ message: 'Meal plan deleted successfully' });
    }
    catch (error) {
        console.error('Delete meal plan error:', error);
        res.status(500).json({ message: 'Server error while deleting meal plan' });
    }
});
router.get('/:id/grocery-list', (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid meal plan ID'), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const mealPlan = await MealPlan_1.default.findOne({
            _id: req.params.id,
            userId: req.user._id,
        }).populate('meals.recipe');
        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        const groceryList = await mealPlan.generateGroceryList();
        res.json(groceryList);
    }
    catch (error) {
        console.error('Generate grocery list error:', error);
        res.status(500).json({ message: 'Server error while generating grocery list' });
    }
});
exports.default = router;
//# sourceMappingURL=mealPlans.js.map