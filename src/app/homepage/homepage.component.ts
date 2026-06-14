import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AngularMaterialModule } from '../shared/modules/angular-material.module';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink, AngularMaterialModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  password = 'asdf';
  input = '';
}
