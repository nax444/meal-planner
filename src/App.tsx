import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { MealPlanProvider } from './contexts/MealPlanContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Signup';
import RecipeList from './pages/recipes/RecipeList';
import RecipeForm from './pages/recipes/RecipeForm';
import RecipeDetails from './pages/recipes/RecipeDetails';
import MealPlanner from './pages/meal-planner/MealPlanner';
import GroceryList from './pages/grocery-list/GroceryList';
import Dashboard from './pages/dashboard/Dashboard';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <RecipeProvider>
          <MealPlanProvider>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Header />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  
                  <Route path="/recipes" element={<ProtectedRoute><RecipeList /></ProtectedRoute>} />
                  <Route path="/recipes/new" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
                  <Route path="/recipes/:id/edit" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
                  <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetails /></ProtectedRoute>} />

                  <Route path="/meal-planner" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
                  <Route path="/grocery-list" element={<ProtectedRoute><GroceryList /></ProtectedRoute>} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </MealPlanProvider>
        </RecipeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
