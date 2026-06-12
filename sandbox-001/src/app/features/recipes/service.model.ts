export interface RecipeResponse {
    recipes: Recipe[];
    total: number;
}

export interface Recipe {
    id: number;
    name: string;
    description: string;
    author: string;
    ingredients: Ingredient[];
    instructions: Instruction[];
}


interface Ingredient {
    item: string;
    amount: number;
    unit: string;
}

export interface Instruction {
    step: number;
    text: string;
}