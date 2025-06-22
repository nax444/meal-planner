"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ingredientSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Ingredient name is required'],
        trim: true,
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        trim: true,
        lowercase: true,
    },
}, { _id: false });
const recipeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Recipe name is required'],
        trim: true,
        maxlength: [100, 'Recipe name cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    ingredients: {
        type: [ingredientSchema],
        required: [true, 'At least one ingredient is required'],
        validate: {
            validator: function (ingredients) {
                return ingredients.length > 0;
            },
            message: 'Recipe must have at least one ingredient',
        },
    },
    instructions: {
        type: [String],
        required: [true, 'Instructions are required'],
        validate: [
            {
                validator: function (instructions) {
                    return instructions.length > 0;
                },
                message: 'Recipe must have at least one instruction',
            },
            {
                validator: function (instructions) {
                    return instructions.every(instruction => instruction.trim().length > 0);
                },
                message: 'Instructions cannot be empty',
            },
        ],
    },
    prepTime: {
        type: Number,
        required: [true, 'Preparation time is required'],
        min: [0, 'Preparation time cannot be negative'],
        max: [1440, 'Preparation time cannot exceed 24 hours'],
    },
    cookTime: {
        type: Number,
        required: [true, 'Cooking time is required'],
        min: [0, 'Cooking time cannot be negative'],
        max: [1440, 'Cooking time cannot exceed 24 hours'],
    },
    servings: {
        type: Number,
        required: [true, 'Number of servings is required'],
        min: [1, 'Servings must be at least 1'],
        max: [100, 'Servings cannot exceed 100'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
            message: '{VALUE} is not a valid category',
        },
        lowercase: true,
    },
    imageUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v)
                    return true;
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Image URL must be a valid URL',
        },
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
    },
}, {
    timestamps: true,
});
recipeSchema.methods.getTotalTime = function () {
    return this.prepTime + this.cookTime;
};
recipeSchema.methods.scaleServings = function (newServings) {
    const scaleFactor = newServings / this.servings;
    return this.ingredients.map(ingredient => ({
        ...ingredient.toObject(),
        quantity: Number((ingredient.quantity * scaleFactor).toFixed(2)),
    }));
};
recipeSchema.index({ name: 'text', description: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ createdBy: 1 });
recipeSchema.index({ createdAt: -1 });
const Recipe = mongoose_1.default.model('Recipe', recipeSchema);
exports.default = Recipe;
//# sourceMappingURL=Recipe.js.map