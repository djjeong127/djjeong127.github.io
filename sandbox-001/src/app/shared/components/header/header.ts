import { Component, inject } from '@angular/core';
import { ANGULAR_MATERIAL_MODULES } from '../../modules/angular-material.module';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ThemeService, Modes, Themes, Feature, TmdbApiLanguage } from '../../services/theme-service';
import { MoviesAndShowsService } from '../../../features/movies-and-shows/services/movies-and-shows-service';
import { SearchMode } from '../../../features/movies-and-shows/models/movie-tv.model';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [ANGULAR_MATERIAL_MODULES, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  themeService = inject(ThemeService)
  router = inject(Router)
  route = inject(ActivatedRoute)
  scroller = inject(ViewportScroller)
  moviesAndShowsService = inject(MoviesAndShowsService)
  
  featureEnum = Feature;
  modesEnum = Modes;
  themesEnum = Themes;
  tmbdApiLanguageEnum = TmdbApiLanguage;

  triggerTmdbApiLanguageChange() {
    this.themeService.toggleTmdbApiLanguage()

    if (this.router.url === '/movies-and-shows') {
      this.moviesAndShowsService.loadPageFresh()
    }
    else {
      this.refreshRoute()
    }
  }

   refreshRoute() {
    console.log(this.router.url)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve', // Keeps all existing query parameters intact
      onSameUrlNavigation: 'reload'
    });
  }

}
