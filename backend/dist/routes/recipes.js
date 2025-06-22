"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const Recipe_1 = __importDefault(require("../models/Recipe"));
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe_1.default.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 });
        res.json(recipes);
    }
    catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({ message: 'Server error while fetching recipes' });
    }
});
router.get('/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid recipe ID'), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const recipe = await Recipe_1.default.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
        });
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    }
    catch (error) {
        console.error('Get recipe error:', error);
        res.status(500).json({ message: 'Server error while fetching recipe' });
    }
});
router.post('/', [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Recipe name is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
    (0, express_validator_1.body)('ingredients.*.name').trim().notEmpty().withMessage('Ingredient name is required'),
    (0, express_validator_1.body)('ingredients.*.quantity').isFloat({ min: 0 }).withMessage('Valid quantity is required'),
    (0, express_validator_1.body)('ingredients.*.unit').trim().notEmpty().withMessage('Unit is required'),
    (0, express_validator_1.body)('instructions').isArray({ min: 1 }).withMessage('At least one instruction is required'),
    (0, express_validator_1.body)('instructions.*').trim().notEmpty().withMessage('Instruction step cannot be empty'),
    (0, express_validator_1.body)('prepTime').isInt({ min: 0 }).withMessage('Valid preparation time is required'),
    (0, express_validator_1.body)('cookTime').isInt({ min: 0 }).withMessage('Valid cooking time is required'),
    (0, express_validator_1.body)('servings').isInt({ min: 1 }).withMessage('Valid number of servings is required'),
    (0, express_validator_1.body)('category').isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']).withMessage('Valid category is required'),
    (0, express_validator_1.body)('imageUrl').optional().isURL().withMessage('Valid image URL is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const recipe = await Recipe_1.default.create({
            ...req.body,
            createdBy: req.user._id,
        });
        res.status(201).json(recipe);
    }
    catch (error) {
        console.error('Create recipe error:', error);
        res.status(500).json({ message: 'Server error while creating recipe' });
    }
});
router.put('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid recipe ID'),
    (0, express_validator_1.body)('name').optional().trim().notEmpty().withMessage('Recipe name cannot be empty'),
    (0, express_validator_1.body)('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    (0, express_validator_1.body)('ingredients').optional().isArray({ min: 1 }).withMessage('At least one ingredient is required'),
    (0, express_validator_1.body)('ingredients.*.name').optional().trim().notEmpty().withMessage('Ingredient name cannot be empty'),
    (0, express_validator_1.body)('ingredients.*.quantity').optional().isFloat({ min: 0 }).withMessage('Valid quantity is required'),
    (0, express_validator_1.body)('ingredients.*.unit').optional().trim().notEmpty().withMessage('Unit cannot be empty'),
    (0, express_validator_1.body)('instructions').optional().isArray({ min: 1 }).withMessage('At least one instruction is required'),
    (0, express_validator_1.body)('instructions.*').optional().trim().notEmpty().withMessage('Instruction step cannot be empty'),
    (0, express_validator_1.body)('prepTime').optional().isInt({ min: 0 }).withMessage('Valid preparation time is required'),
    (0, express_validator_1.body)('cookTime').optional().isInt({ min: 0 }).withMessage('Valid cooking time is required'),
    (0, express_validator_1.body)('servings').optional().isInt({ min: 1 }).withMessage('Valid number of servings is required'),
    (0, express_validator_1.body)('category').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']).withMessage('Valid category is required'),
    (0, express_validator_1.body)('imageUrl').optional().isURL().withMessage('Valid image URL is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const recipe = await Recipe_1.default.findOneAndUpdate({
            _id: req.params.id,
            createdBy: req.user._id,
        }, req.body, { new: true, runValidators: true });
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    }
    catch (error) {
        console.error('Update recipe error:', error);
        res.status(500).json({ message: 'Server error while updating recipe' });
    }
});
router.delete('/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid recipe ID'), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const recipe = await Recipe_1.default.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id,
        });
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json({ message: 'Recipe deleted successfully' });
    }
    catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({ message: 'Server error while deleting recipe' });
    }
});
exports.default = router;
//# sourceMappingURL=recipes.js.map