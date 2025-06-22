import mongoose, { Document, Schema } from 'mongoose';

export interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface IRecipe extends Document {
  name: string;
  description: string;
  ingredients: IIngredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  getTotalTime(): number;
  scaleServings(newServings: number): IIngredient[];
}

interface IRecipeMethods {
  getTotalTime(): number;
  scaleServings(newServings: number): IIngredient[];
}

type RecipeModel = mongoose.Model<IRecipe, {}, IRecipeMethods>;

const ingredientSchema = new Schema<IIngredient>(
  {
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
  },
  { _id: false }
);

const recipeSchema = new Schema<IRecipe, RecipeModel, IRecipeMethods>(
  {
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
        validator: function(ingredients: IIngredient[]) {
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
          validator: function(instructions: string[]) {
            return instructions.length > 0;
          },
          message: 'Recipe must have at least one instruction',
        },
        {
          validator: function(instructions: string[]) {
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
        validator: function(v: string) {
          if (!v) return true; // Allow empty string
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Image URL must be a valid URL',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Get total time (prep + cook)
recipeSchema.methods.getTotalTime = function(): number {
  return this.prepTime + this.cookTime;
};

// Scale ingredients for different serving sizes
recipeSchema.methods.scaleServings = function(newServings: number): IIngredient[] {
  const scaleFactor = newServings / this.servings;
  return this.ingredients.map(ingredient => ({
    ...ingredient.toObject(),
    quantity: Number((ingredient.quantity * scaleFactor).toFixed(2)),
  }));
};

// Create indexes
recipeSchema.index({ name: 'text', description: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ createdBy: 1 });
recipeSchema.index({ createdAt: -1 });

const Recipe = mongoose.model<IRecipe, RecipeModel>('Recipe', recipeSchema);

export default Recipe;