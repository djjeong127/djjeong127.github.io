import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MoviesAndShowsService, QueryMode, SearchMediaTypes } from './services/movies-and-shows-service';
import { TmdbApiService } from './services/tmdb-api-service';
import { FormField } from '@angular/forms/signals';
import { MatAnchor } from "@angular/material/button";
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';
import { MediaType } from './models/movie-tv.model';


@Component({
  selector: 'app-movies-and-shows',
  imports: [ANGULAR_MATERIAL_MODULES, FormField],
  templateUrl: './movies-and-shows.html',
  styleUrl: './movies-and-shows.scss',
})
export class MoviesAndShows {
  moviesAndShowsService = inject(MoviesAndShowsService)
  tmdbApiService = inject(TmdbApiService)

  searchMediaTypes = SearchMediaTypes

  // a = toSignal(this.tmdbApiService.getCountries())
  // b = toSignal(this.tmdbApiService.getMovieGenres())
  // c = this.b()

  s = computed(() => JSON.stringify(this.moviesAndShowsService.searchModel().searchMedia))

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const windowBottomPosition = window.scrollY + window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    const bottomHalf = documentHeight - windowBottomPosition <= window.innerHeight

    if (bottomHalf) {
      if (this.moviesAndShowsService.queryMode() === QueryMode.Discover) {
        if (this.moviesAndShowsService.discoverMode() === MediaType.Movie) {
          this.moviesAndShowsService.discoverNextMoviePage()
        }
        else {
          this.moviesAndShowsService.discoverNextTVPage()
        }
      }
      else {
        this.moviesAndShowsService.searchNextPage()
      }
    }
  }

  onSearchSubmit(event: Event) {
    event.preventDefault(); 
    console.log(this.moviesAndShowsService.searchForm.searchMediaTypes().controlValue())
    this.moviesAndShowsService.searchFresh()
  }
}

