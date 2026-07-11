import { Component, computed, inject, Input, input } from '@angular/core';
import { RecipesService } from '../../services/recipes-service';
import { ANGULAR_MATERIAL_MODULES } from '../../../../shared/modules/angular-material.module';

@Component({
  selector: 'app-recipe-page',
  imports: [ANGULAR_MATERIAL_MODULES],
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
