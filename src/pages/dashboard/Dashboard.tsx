import React from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CHART_COLORS = [
  '#1a73e8',
  '#34a853',
  '#fbbc05',
  '#ea4335',
  '#4285f4',
  '#0f9d58',
];

const Dashboard: React.FC = () => {
  const { currentPlan, loading, error } = useMealPlan();

  // Calculate meal category distribution
  const calculateCategoryDistribution = () => {
    if (!currentPlan) return null;

    const categories: { [key: string]: number } = {};
    Object.values(currentPlan.meals).forEach(dayMeals => {
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const meal = dayMeals[mealType as keyof typeof dayMeals];
        if (meal) {
          categories[meal.category] = (categories[meal.category] || 0) + 1;
        }
      });
    });

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: CHART_COLORS,
        },
      ],
    };
  };

  // Calculate meals per day
  const calculateMealsPerDay = () => {
    if (!currentPlan) return null;

    const mealsPerDay: { [key: string]: number } = {};
    Object.entries(currentPlan.meals).forEach(([date, meals]) => {
      const mealCount = Object.values(meals).filter(Boolean).length;
      mealsPerDay[date] = mealCount;
    });

    return {
      labels: Object.keys(mealsPerDay).map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Meals Planned',
          data: Object.values(mealsPerDay),
          backgroundColor: CHART_COLORS[0],
        },
      ],
    };
  };

  const categoryData = calculateCategoryDistribution();
  const mealsPerDayData = calculateMealsPerDay();

  const totalMeals = currentPlan ? Object.values(currentPlan.meals).reduce((acc, meals) => acc + Object.values(meals).filter(Boolean).length, 0) : 0;
  const uniqueRecipes = currentPlan ? new Set(Object.values(currentPlan.meals).flatMap(meals => Object.values(meals)).filter(Boolean).map(meal => meal?.id)).size : 0;
  const daysPlanned = currentPlan ? Object.keys(currentPlan.meals).length : 0;
  const weekProgress = currentPlan ? Math.round((totalMeals / (7 * 3)) * 100) : 0;

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Summary Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Meals Planned</h3>
          <p className="text-3xl font-bold text-primary">
            {totalMeals}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unique Recipes</h3>
          <p className="text-3xl font-bold text-primary">
            {uniqueRecipes}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Days Planned</h3>
          <p className="text-3xl font-bold text-primary">
            {daysPlanned}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Week Progress</h3>
          <p className="text-3xl font-bold text-success">
            {weekProgress}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Meal Categories Distribution</h2>
          {categoryData && (
            <div className="aspect-w-16 aspect-h-9">
              <Pie
                data={categoryData}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Meals per Day</h2>
          {mealsPerDayData && (
            <div className="aspect-w-16 aspect-h-9">
              <Bar
                data={mealsPerDayData}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 3,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;