import React, { createContext, useContext, useState, useEffect } from 'react';
import { Recipe, parseRecipeDates } from './RecipeContext';

export interface MealPlan {
  id: string;
  userId: string;
  weekStartDate: Date;
  meals: {
    [key: string]: { // date string in YYYY-MM-DD format
      breakfast?: Recipe;
      lunch?: Recipe;
      dinner?: Recipe;
    };
  };
}

const parseMealPlanDates = (plan: any): MealPlan => {
  const parsedMeals: MealPlan['meals'] = {};
  if (plan.meals) {
    Object.keys(plan.meals).forEach(date => {
      const meal = plan.meals[date];
      parsedMeals[date] = {
        breakfast: meal.breakfast ? parseRecipeDates(meal.breakfast) : undefined,
        lunch: meal.lunch ? parseRecipeDates(meal.lunch) : undefined,
        dinner: meal.dinner ? parseRecipeDates(meal.dinner) : undefined,
      };
    });
  }
  return {
    ...plan,
    weekStartDate: new Date(plan.weekStartDate),
    meals: parsedMeals,
  };
};

interface MealPlanContextType {
  currentPlan: MealPlan | null;
  loading: boolean;
  error: string | null;
  setMealForDay: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', recipe: Recipe | undefined) => Promise<void>;
  removeMealFromDay: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner') => Promise<void>;
  createNewPlan: (weekStartDate: Date) => Promise<void>;
  generateGroceryList: () => Promise<{ ingredient: string; quantity: number; unit: string; }[]>;
  fetchCurrentPlan: () => Promise<void>;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};

export const MealPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/meal-plans/current`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch meal plan');
      }

      const data = await response.json();
      setCurrentPlan(data ? parseMealPlanDates(data) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching meal plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const setMealForDay = async (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', recipe: Recipe | undefined) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/meal-plans/current/meals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          mealType,
          recipeId: recipe?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update meal plan');
      }

      const updatedPlan = await response.json();
      setCurrentPlan(parseMealPlanDates(updatedPlan));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating meal plan');
      throw err;
    }
  };

  const removeMealFromDay = async (date: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    // This is a more explicit way to call setMealForDay for removal.
    await setMealForDay(date, mealType, undefined);
  };

  const createNewPlan = async (weekStartDate: Date) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/meal-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ weekStartDate })
      });

      if (!response.ok) {
        throw new Error('Failed to create meal plan');
      }

      const newPlan = await response.json();
      setCurrentPlan(parseMealPlanDates(newPlan));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating meal plan');
      throw err;
    }
  };

  const generateGroceryList = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/meal-plans/current/grocery-list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate grocery list');
      }

      const groceryList = await response.json();
      return groceryList;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating grocery list');
      throw err;
    }
  };

  return (
    <MealPlanContext.Provider value={{
      currentPlan,
      loading,
      error,
      setMealForDay,
      removeMealFromDay,
      createNewPlan,
      generateGroceryList,
      fetchCurrentPlan
    }}>
      {children}
    </MealPlanContext.Provider>
  );
};