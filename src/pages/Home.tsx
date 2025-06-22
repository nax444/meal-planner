import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import BookOpenIcon from '@heroicons/react/24/outline/BookOpenIcon';
import ShoppingCartIcon from '@heroicons/react/24/outline/ShoppingCartIcon';
import ChartPieIcon from '@heroicons/react/24/outline/ChartPieIcon';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome {user ? `, ${user.name}` : 'to Smart Food Planner'}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Plan your meals, manage recipes, and generate grocery lists automatically.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/meal-planner" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <CalendarIcon className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Meal Planner</h2>
          <p className="text-gray-600">Plan your weekly meals with our intuitive calendar interface.</p>
        </Link>

        <Link to="/recipes" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <BookOpenIcon className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Recipes</h2>
          <p className="text-gray-600">Browse, create, and manage your favorite recipes.</p>
        </Link>

        <Link to="/grocery-list" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <ShoppingCartIcon className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Grocery List</h2>
          <p className="text-gray-600">Auto-generated shopping lists based on your meal plan.</p>
        </Link>

        <Link to="/dashboard" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <ChartPieIcon className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          <p className="text-gray-600">View insights about your meal planning and nutrition.</p>
        </Link>
      </div>

      {!user && (
        <section className="bg-primary bg-opacity-10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Get Started Today</h2>
          <p className="text-gray-700 mb-6">Create your account to start planning meals and generating grocery lists.</p>
          <Link 
            to="/signup" 
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Sign Up Now
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home;