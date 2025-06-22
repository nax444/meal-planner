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
const mealSchema = new mongoose_1.Schema({
    recipe: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: [true, 'Recipe reference is required'],
    },
    type: {
        type: String,
        enum: {
            values: ['breakfast', 'lunch', 'dinner'],
            message: '{VALUE} is not a valid meal type',
        },
        required: [true, 'Meal type is required'],
    },
}, { _id: false });
const mealPlanSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
    },
    weekStartDate: {
        type: Date,
        required: [true, 'Week start date is required'],
        validate: {
            validator: function (date) {
                return date.getDay() === 1;
            },
            message: 'Week start date must be a Monday',
        },
    },
    meals: {
        type: Map,
        of: [mealSchema],
        default: new Map(),
        validate: {
            validator: function (meals) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                for (const date of meals.keys()) {
                    if (!dateRegex.test(date)) {
                        return false;
                    }
                    const mealDate = new Date(date);
                    const weekStart = new Date(this.weekStartDate);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    if (mealDate < weekStart || mealDate > weekEnd) {
                        return false;
                    }
                }
                return true;
            },
            message: 'Invalid date format or date outside week range',
        },
    },
}, {
    timestamps: true,
});
mealPlanSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });
mealPlanSchema.methods.generateGroceryList = async function () {
    const groceryList = new Map();
    await this.populate({
        path: 'meals.$*.recipe',
        select: 'ingredients',
    });
    for (const [_, meals] of this.meals) {
        for (const meal of meals) {
            const recipe = meal.recipe;
            if (recipe && recipe.ingredients) {
                for (const ingredient of recipe.ingredients) {
                    const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
                    const existing = groceryList.get(key);
                    if (existing) {
                        existing.quantity += ingredient.quantity;
                    }
                    else {
                        groceryList.set(key, {
                            quantity: ingredient.quantity,
                            unit: ingredient.unit,
                        });
                    }
                }
            }
        }
    }
    return Array.from(groceryList.entries())
        .map(([key, value]) => ({
        name: key.split('-')[0],
        quantity: value.quantity,
        unit: value.unit,
    }))
        .sort((a, b) => a.name.localeCompare(b.name));
};
const MealPlan = mongoose_1.default.model('MealPlan', mealPlanSchema);
exports.default = MealPlan;
//# sourceMappingURL=MealPlan.js.map