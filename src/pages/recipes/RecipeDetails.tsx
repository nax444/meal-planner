import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRecipes } from '../../contexts/RecipeContext';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';

const RecipeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getRecipe, deleteRecipe, loading, error } = useRecipes();
  const navigate = useNavigate();
  const recipe = getRecipe(id || '');

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        navigate('/recipes');
      } catch (err) {
        alert('Failed to delete recipe.');
      }
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  if (!recipe) {
    return <div className="text-center p-4">Recipe not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/recipes" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Recipes
        </Link>
        <div className="flex items-center space-x-4">
          <Link to={`/recipes/${id}/edit`} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button onClick={handleDelete} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {recipe.imageUrl && (
        <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-64 object-cover rounded-lg" />
      )}

      <h1 className="text-3xl font-bold text-gray-900">{recipe.name}</h1>
      <p className="text-gray-600">{recipe.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="font-semibold">Prep Time</p>
          <p>{recipe.prepTime} mins</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="font-semibold">Cook Time</p>
          <p>{recipe.cookTime} mins</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="font-semibold">Servings</p>
          <p>{recipe.servings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc list-inside space-y-2">
            {recipe.ingredients.map((ing, index) => (
              <li key={index}>{`${ing.quantity} ${ing.unit} ${ing.name}`}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            {recipe.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
