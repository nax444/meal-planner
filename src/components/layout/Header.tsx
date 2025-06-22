import React from 'react';
import { Link } from 'react-router-dom';
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">Smart Food Planner</Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-primary">Dashboard</Link>
              <Link to="/meal-planner" className="text-gray-600 hover:text-primary">Meal Planner</Link>
              <Link to="/recipes" className="text-gray-600 hover:text-primary">Recipes</Link>
              <Link to="/grocery-list" className="text-gray-600 hover:text-primary">Grocery List</Link>
              <button onClick={logout} className="text-gray-600 hover:text-primary flex items-center">
                <ArrowRightOnRectangleIcon className="h-6 w-6 mr-1" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-primary">Login</Link>
              <Link to="/register" className="text-gray-600 hover:text-primary">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;