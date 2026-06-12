import { Component, inject } from '@angular/core';
import { RecipesService } from './services/recipes-service';
import { RouterLink } from "@angular/router";
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';

@Component({
  selector: 'app-recipes',
  imports: [RouterLink, ANGULAR_MATERIAL_MODULES],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss',
})
export class Recipes {
  recipesService = inject(RecipesService);

}
