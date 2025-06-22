import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  category: string;
  imageUrl?: string;
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
}

export const parseRecipeDates = (recipe: any): Recipe => ({
  ...recipe,
  ingredients: recipe.ingredients || [],
  instructions: recipe.instructions || [],
  createdAt: new Date(recipe.createdAt),
  updatedAt: new Date(recipe.updatedAt),
});

export type RecipeCreationData = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'ingredients'> & {
  ingredients: Omit<Ingredient, 'id'>[];
};

interface RecipeContextType {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  addRecipe: (recipe: RecipeCreationData) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipe: (id: string) => Recipe | undefined;
  fetchRecipes: () => Promise<void>;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();
      setRecipes(data.map(parseRecipeDates));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const addRecipe = async (recipe: RecipeCreationData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recipe)
      });

      if (!response.ok) {
        throw new Error('Failed to add recipe');
      }

      const newRecipe = await response.json();
      setRecipes(prev => [...prev, parseRecipeDates(newRecipe)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the recipe');
      throw err;
    }
  };

  const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recipe)
      });

      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }

      const updatedRecipe = await response.json();
      setRecipes(prev => prev.map(r => r.id === id ? parseRecipeDates(updatedRecipe) : r));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the recipe');
      throw err;
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the recipe');
      throw err;
    }
  };

  const getRecipe = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  return (
    <RecipeContext.Provider value={{
      recipes,
      loading,
      error,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      getRecipe,
      fetchRecipes
    }}>
      {children}
    </RecipeContext.Provider>
  );
};