import { Component } from '@angular/core';
import { HomepageComponent } from "./homepage/homepage.component";
import { HeaderComponent } from "./header/header.component";
import { RouterOutlet } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { AngularMaterialModule } from './shared/modules/angular-material.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, AngularMaterialModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-18-app';

  constructor(private authService: AuthService) {
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn()
  }

  logout() {
    this.authService.logout();
  }
}
