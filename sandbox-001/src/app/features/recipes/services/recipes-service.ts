import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Instruction, Recipe, RecipeResponse } from '../models/service.model';

@Service()
export class RecipesService {
    private http = inject(HttpClient)
    private jsonUrl = '/recipes/recipes.data.json'

    private getRecipesResponse(): Observable<RecipeResponse> {
        return this.http.get<RecipeResponse>(this.jsonUrl)
    }

    public getRecipeList = toSignal(
        this.getRecipesResponse().pipe(
            map(response => {
                // make sure that the instructions are in the right order
                for (const recipe of response.recipes) {
                    recipe.instructions = recipe.instructions.sort((a,b) => a.step - b.step)
                }
                // return the list of recipes
                return response.recipes
            })
        ),
        { initialValue: null }
    )

    public getRecipe(id: number): Recipe | null {
        return this.getRecipeList()?.find(recipe => recipe.id == id) ?? null
    }
}
