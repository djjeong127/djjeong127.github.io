import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Instruction, Recipe, RecipeResponse } from '../service.model';

@Service()
export class RecipesService {
    private http = inject(HttpClient)
    private jsonUrl = '/recipes.data.json'

    getRecipes(): Observable<Recipe[]> {
        return this.http.get<RecipeResponse>(this.jsonUrl).pipe(
            map(response => {
                // make sure that the instructions are in the right order
                for (const recipe of response.recipes) {
                    recipe.instructions = recipe.instructions.sort((a,b) => a.step - b.step)
                }
                // return the list of recipes
                return response.recipes
            })
        )
    }
}
