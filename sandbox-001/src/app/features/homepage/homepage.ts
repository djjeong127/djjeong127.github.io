import { Component } from '@angular/core';
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-homepage',
  imports: [ANGULAR_MATERIAL_MODULES, RouterLink],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage {}
