import { Component, computed, inject, Input, input } from '@angular/core';
import { Recipe } from '../../service.model';
import { RecipesService } from '../../services/recipes-service';

@Component({
  selector: 'app-recipe-page',
  imports: [],
  templateUrl: './recipe-page.html',
  styleUrl: './recipe-page.scss',
})
export class RecipePage {
  id = input.required<number>();

  recipesService = inject(RecipesService)

  recipe = computed(() => {
    return this.recipesService.getRecipe(this.id())
  })
}
