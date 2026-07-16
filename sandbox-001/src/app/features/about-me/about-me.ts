import { Component } from '@angular/core';
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-me',
  imports: [ANGULAR_MATERIAL_MODULES, RouterLink],
  templateUrl: './about-me.html',
  styleUrl: './about-me.scss',
})
export class AboutMe {}
