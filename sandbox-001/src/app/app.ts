import { Component, DOCUMENT, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from "./shared/components/header/header";
import { filter } from 'rxjs';
import { Feature, ThemeService } from './shared/services/theme-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  router = inject(Router)
  themeService = inject(ThemeService)
  document = inject(DOCUMENT)

  constructor() {
    this.setupFeatureModeRouteListener()
  }

  // pays attention to the route url and change the Featuremode
  private setupFeatureModeRouteListener() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe((event: NavigationEnd) => {

      // switch feature mode
      if (event.urlAfterRedirects.includes('/movies-and-shows')) {
        this.themeService.switchFeature(Feature.MoviesAndShows)
        this.document.documentElement.style.setProperty('--root-background-color', 'var(--mat-sys-inverse-on-surface)')
      }
      else {
        this.themeService.switchFeature(Feature.DefaultAll)
        // this.document.documentElement.style.setProperty('--root-background-color', 'var(--mat-sys-surface)')
        this.document.documentElement.style.setProperty('--root-background-color', 'var(--mat-sys-inverse-on-surface)')
      }

    });
  }
}
