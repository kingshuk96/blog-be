import { config } from 'dotenv';

// Load variables from .env file into process.env
config();

// Define the exact types for our environment variables
export interface EnvironmentVariables {
  PORT: number;
  MONGO_URI: string;
}

// Export a strongly-typed configuration object to be used throughout the app
// instead of directly accessing process.env
export const ENV: EnvironmentVariables = {
  PORT: parseInt(process.env.PORT as string, 10) || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/blog-be',
};
