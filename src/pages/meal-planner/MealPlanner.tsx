import React, { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useRecipes } from '../../contexts/RecipeContext';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import XIcon from '@heroicons/react/24/outline/XMarkIcon';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;

const MealPlanner: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMealType, setSelectedMealType] = useState<typeof MEAL_TYPES[number] | null>(null);
  const { currentPlan, loading, error, setMealForDay, removeMealFromDay } = useMealPlan();
  const { recipes } = useRecipes();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    setSelectedDate(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    setSelectedDate(addDays(selectedDate, 7));
  };

  const handleMealSelect = async (date: Date, mealType: typeof MEAL_TYPES[number], recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      const dateStr = format(date, 'yyyy-MM-dd');
      await setMealForDay(dateStr, mealType, recipe);
    }
  };

  const handleRemoveMeal = async (date: Date, mealType: typeof MEAL_TYPES[number]) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    await removeMealFromDay(dateStr, mealType);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-error p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Meal Planner</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousWeek}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-lg font-medium">
            {format(weekStart, 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-4">
            {/* Time slots */}
            <div className="pt-16">
              {MEAL_TYPES.map(mealType => (
                <div
                  key={mealType}
                  className="h-32 flex items-center justify-end pr-4 font-medium text-gray-500 capitalize"
                >
                  {mealType}
                </div>
              ))}
            </div>

            {/* Days */}
            {weekDays.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const dayMeals = currentPlan?.meals[dateStr] || {};

              return (
                <div key={dateStr} className="space-y-4">
                  <div className="text-center">
                    <div className="font-medium">{format(date, 'EEE')}</div>
                    <div className="text-sm text-gray-500">{format(date, 'MMM d')}</div>
                  </div>

                  {MEAL_TYPES.map(mealType => {
                    const meal = dayMeals[mealType];

                    return (
                      <div
                        key={mealType}
                        className="h-32 p-2 border rounded-lg bg-white hover:shadow-md transition-shadow"
                      >
                        {meal ? (
                          <div className="h-full flex flex-col">
                            <div className="font-medium truncate">{meal.name}</div>
                            <p className="text-sm text-gray-500 flex-grow line-clamp-2">
                              {meal.description}
                            </p>
                            <button
                              onClick={() => handleRemoveMeal(date, mealType)}
                              className="text-sm text-error hover:text-error-dark mt-2"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedDate(date);
                              setSelectedMealType(mealType);
                            }}
                            className="w-full h-full flex items-center justify-center text-gray-400 hover:text-primary"
                          >
                            <PlusIcon className="h-6 w-6" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recipe Selection Modal */}
      {selectedMealType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Select {selectedMealType} for {format(selectedDate, 'EEE, MMM d')}
              </h2>
              <button
                onClick={() => setSelectedMealType(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {recipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => {
                    handleMealSelect(selectedDate, selectedMealType, recipe.id);
                    setSelectedMealType(null);
                  }}
                  className="w-full text-left p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">{recipe.name}</div>
                  <p className="text-sm text-gray-500 line-clamp-2">{recipe.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;