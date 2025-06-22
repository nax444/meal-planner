# Smart Food Planner Backend

This is the backend server for the Smart Food Planner application. It provides APIs for user authentication, recipe management, meal planning, and grocery list generation.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration
6. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication

#### Register User
- **POST** `/api/auth/signup`
- Body: `{ "name": string, "email": string, "password": string }`

#### Login User
- **POST** `/api/auth/login`
- Body: `{ "email": string, "password": string }`

### Recipes

#### Get All Recipes
- **GET** `/api/recipes`
- Auth: Required

#### Get Single Recipe
- **GET** `/api/recipes/:id`
- Auth: Required

#### Create Recipe
- **POST** `/api/recipes`
- Auth: Required
- Body: Recipe object

#### Update Recipe
- **PUT** `/api/recipes/:id`
- Auth: Required
- Body: Recipe object

#### Delete Recipe
- **DELETE** `/api/recipes/:id`
- Auth: Required

### Meal Plans

#### Get All Meal Plans
- **GET** `/api/meal-plans`
- Auth: Required

#### Get Single Meal Plan
- **GET** `/api/meal-plans/:id`
- Auth: Required

#### Create Meal Plan
- **POST** `/api/meal-plans`
- Auth: Required
- Body: Meal plan object

#### Update Meal Plan
- **PUT** `/api/meal-plans/:id`
- Auth: Required
- Body: Meal plan object

#### Delete Meal Plan
- **DELETE** `/api/meal-plans/:id`
- Auth: Required

#### Generate Grocery List
- **GET** `/api/meal-plans/:id/grocery-list`
- Auth: Required

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Project Structure

```
src/
├── config/         # Configuration files
├── middleware/     # Custom middleware
├── models/         # MongoDB models
├── routes/         # API routes
└── index.ts        # Application entry point
```

## Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation
- Error handling middleware

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request