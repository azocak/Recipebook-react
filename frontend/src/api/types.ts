export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cooking_time: number;
  servings: number;
  created_at: string;
}
