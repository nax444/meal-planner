import mongoose, { Document, Schema } from 'mongoose';
import { IRecipe } from './Recipe';

interface IMeal {
  recipe: mongoose.Types.ObjectId | IRecipe;
  type: 'breakfast' | 'lunch' | 'dinner';
}

interface IDayMeals {
  [key: string]: IMeal[];
}

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  meals: Map<string, IMeal[]>;
  createdAt: Date;
  updatedAt: Date;
  generateGroceryList(): Promise<Array<{ name: string; quantity: number; unit: string }>>;
}

interface IMealPlanMethods {
  generateGroceryList(): Promise<Array<{ name: string; quantity: number; unit: string }>>;
}

type MealPlanModel = mongoose.Model<IMealPlan, {}, IMealPlanMethods>;

const mealSchema = new Schema<IMeal>(
  {
    recipe: {
      type: Schema.Types.ObjectId,
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
  },
  { _id: false }
);

const mealPlanSchema = new Schema<IMealPlan, MealPlanModel, IMealPlanMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
      validate: {
        validator: function(date: Date) {
          // Ensure the date is a Monday
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
        validator: function(meals: Map<string, IMeal[]>) {
          // Validate date format (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          for (const date of meals.keys()) {
            if (!dateRegex.test(date)) {
              return false;
            }
            // Validate that the date is within the week
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
  },
  {
    timestamps: true,
  }
);

// Create indexes
mealPlanSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

// Add method to get grocery list
mealPlanSchema.methods.generateGroceryList = async function() {
  const groceryList = new Map<string, { quantity: number; unit: string; }>();

  // Populate recipes
  await this.populate({
    path: 'meals.$*.recipe',
    select: 'ingredients',
  });

  // Combine ingredients from all meals
  for (const [_, meals] of this.meals) {
    for (const meal of meals) {
      const recipe = meal.recipe as IRecipe;
      if (recipe && recipe.ingredients) {
        for (const ingredient of recipe.ingredients) {
          const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
          const existing = groceryList.get(key);
          
          if (existing) {
            existing.quantity += ingredient.quantity;
          } else {
            groceryList.set(key, {
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            });
          }
        }
      }
    }
  }

  // Convert map to array and sort by ingredient name
  return Array.from(groceryList.entries())
    .map(([key, value]) => ({
      name: key.split('-')[0],
      quantity: value.quantity,
      unit: value.unit,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const MealPlan = mongoose.model<IMealPlan, MealPlanModel>('MealPlan', mealPlanSchema);

export default MealPlan;