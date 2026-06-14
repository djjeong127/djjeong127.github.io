import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AngularMaterialModule } from '../shared/modules/angular-material.module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AngularMaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
