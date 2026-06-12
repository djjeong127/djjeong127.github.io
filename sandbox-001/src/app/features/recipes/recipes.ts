import { Component, inject } from '@angular/core';
import { RecipesService } from './services/recipes-service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-recipes',
  imports: [AsyncPipe],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss',
})
export class Recipes {
  recipesService = inject(RecipesService);

  recipes$ = this.recipesService.getRecipes();

}
