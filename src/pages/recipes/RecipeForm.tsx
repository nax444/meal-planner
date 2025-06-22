import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecipes, Recipe, Ingredient } from '../../contexts/RecipeContext';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon, XMarkIcon as XIcon } from '@heroicons/react/24/outline';

interface RecipeFormData {
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  category: string;
  imageUrl?: string;
}

const initialFormData: RecipeFormData = {
  name: '',
  description: '',
  ingredients: [{ id: '1', name: '', quantity: 0, unit: '' }],
  instructions: [''],
  prepTime: 0,
  cookTime: 0,
  servings: 1,
  category: 'main',
  imageUrl: '',
};

const RecipeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addRecipe, updateRecipe, getRecipe } = useRecipes();
  const [formData, setFormData] = useState<RecipeFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const recipe = getRecipe(id);
      if (recipe) {
        setFormData({
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients.map(ing => ({ ...ing, id: ing.id || String(Date.now()) })),
          instructions: recipe.instructions,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          category: recipe.category,
          imageUrl: recipe.imageUrl || '',
        });
      }
    }
  }, [id, getRecipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('User not authenticated');

      if (id) {
        await updateRecipe(id, { ...formData, createdBy: user.id });
      } else {
        const recipeToCreate = {
          ...formData,
          ingredients: formData.ingredients.map(({ id, ...rest }) => rest),
          createdBy: user.id,
        };
        await addRecipe(recipeToCreate);
      }

      navigate('/recipes');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while saving the recipe.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { id: String(Date.now()), name: '', quantity: 0, unit: '' }]
    });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, '']
    });
  };

  const removeInstruction = (index: number) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData({ ...formData, instructions: newInstructions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Recipe' : 'Create New Recipe'}
        </h1>

        {error && (
          <div className="bg-error bg-opacity-10 text-error p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Recipe Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
            <div className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="flex gap-4 items-start">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    className="flex-grow border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))}
                    className="w-24 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    className="w-24 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    required
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-error hover:text-error-dark"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="inline-flex items-center text-sm text-primary hover:text-primary-dark"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Ingredient
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
            <div className="space-y-4">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <span className="mt-2 text-gray-500">{index + 1}.</span>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    rows={2}
                    className="flex-grow border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    required
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="text-error hover:text-error-dark"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addInstruction}
                className="inline-flex items-center text-sm text-primary hover:text-primary-dark"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Step
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700">Prep Time (mins)</label>
              <input
                type="number"
                id="prepTime"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700">Cook Time (mins)</label>
              <input
                type="number"
                id="cookTime"
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-700">Servings</label>
              <input
                type="number"
                id="servings"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (optional)</label>
            <input
              type="url"
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/recipes')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;