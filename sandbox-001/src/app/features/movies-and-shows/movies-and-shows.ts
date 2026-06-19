import { Component, computed, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MoviesAndShowsService } from './services/movies-and-shows-service';
import { TmdbApiService } from './services/tmdb-api-service';
import { FormField } from '@angular/forms/signals';
import { MatAnchor } from "@angular/material/button";
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';
import { Genre, MediaType, QueryMode, SearchMode } from './models/movie-tv.model';
import { MultiFilter } from './models/multi.model';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import {COMMA, ENTER, P} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';


@Component({
  selector: 'app-movies-and-shows',
  imports: [ANGULAR_MATERIAL_MODULES, FormField, DatePipe, UpperCasePipe, RouterLink],
  templateUrl: './movies-and-shows.html',
  styleUrl: './movies-and-shows.scss',
})
export class MoviesAndShows {
  @ViewChild('bottomSentinel') bottomSentinel!: ElementRef;

  moviesAndShowsService = inject(MoviesAndShowsService)

  // javascript calculations for the movie-shows-header height, so that I can get a buffer of the same size
  appHeaderElement = signal(document.querySelector('.app-header') as HTMLElement)
  appHeaderElementHeight = computed(() => `${this.appHeaderElement().offsetHeight}px`)

  moviesAndShowsHeaderElement = signal(document.querySelector('.movies-and-shows-header') as HTMLElement)
  moviesAndShowsHeaderElementHeight = computed(() => `${this.moviesAndShowsHeaderElement().offsetHeight}px`)

  mediaCardsElement = signal(document.querySelector('.media-cards') as HTMLElement)
  mediaCardsElementHeight = computed(() => `${this.mediaCardsElement().offsetHeight}px`)

  lastScrollPosition = signal(0)
  scrollDown = signal(false)
  relative = signal(false)


  @HostListener('window:resize')
  onResize() {
    this.updateHeaderElementHeight()
  }

  private updateHeaderElementHeight() {
    const updatedMoviesAndShowsHeaderElement = (document.querySelector('.movies-and-shows-header') as HTMLElement)
    const updatedAppHeaderElement = (document.querySelector('.app-header') as HTMLElement)
    const updatedMediaCardsElement = (document.querySelector('.media-cards') as HTMLElement)


    if (updatedMoviesAndShowsHeaderElement) {
      this.moviesAndShowsHeaderElement.set(updatedMoviesAndShowsHeaderElement)
    }

    if (updatedAppHeaderElement) {
      this.appHeaderElement.set(updatedAppHeaderElement)
    }

    if (updatedMediaCardsElement) {
      this.mediaCardsElement.set(updatedMediaCardsElement)
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    const currentScrollPosition = window.scrollY || document.documentElement.scrollTop

    if (currentScrollPosition > this.lastScrollPosition()) {
      if (this.mediaCardsElement().getBoundingClientRect().top >= this.appHeaderElement().getBoundingClientRect().bottom) {
        this.scrollDown.set(false)
        this.relative.set(true)
      }
      else {
        this.scrollDown.set(true)
      }
    }
    else {
      this.scrollDown.set(false)
      this.relative.set(false)


    }
    this.lastScrollPosition.set(currentScrollPosition)
  }



  // Enums
  queryMode = QueryMode;
  searchMode = SearchMode;
  mediaType = MediaType;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  intersectionInterval: any = null;

  multiFilterMovie: MultiFilter = {
    movie: MediaType.Movie
  }
  multiFilterTV: MultiFilter = {
    tv: MediaType.TV
  }
  multiFilterMovieAndTV: MultiFilter = {
    movie: MediaType.Movie,
    tv: MediaType.TV
  }


  ngOnInit() {
    this.multiFilterMovieAndTV = this.moviesAndShowsService.searchModel().multiFilter;
    this.moviesAndShowsService.loadPageFresh()

    // Update header size for header buffer
    this.updateHeaderElementHeight()

  }

  ngAfterViewInit() {
    this.initIntersectionObserver()
  }


  initIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.0
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {

          // start interval to keep getting new pages
          this.intersectionInterval = setInterval(() => {
            if (this.moviesAndShowsService.combinedLoadedMediaResults().length > 0 && this.moviesAndShowsService.existsMorePages()) {
              this.moviesAndShowsService.loadNextPage()
              
            }
            else {
             
            }
          }, 100)
        }
        else {
          // clear interval to stop getting new pages
          clearInterval(this.intersectionInterval)
          this.intersectionInterval = null;
        }
      });
    }, options);

    observer.observe(this.bottomSentinel.nativeElement);
  }

  onSearchSubmitForm(event: Event) {
    event.preventDefault()

    this.onSearchSubmit()
  }

  onSearchSubmit() {

    if (this.moviesAndShowsService.searchModel().searchMedia === '') {
      this.moviesAndShowsService.updateSearchMode(this.searchMode.Unpopulated)
    }
    else {
      this.moviesAndShowsService.updateSearchMode(this.searchMode.Populated)
    }
    this.moviesAndShowsService.loadPageFresh()
  }

  onDiscoverSubmit() {
    this.moviesAndShowsService.loadPageFresh()
  }

  triggerDiscoverSubmitSyncCountries() {
    if (this.moviesAndShowsService.queryModeModel().discoverMode === MediaType.Movie) {
      this.moviesAndShowsService.discoverTVModel.update((tvModel) => ({...tvModel, with_origin_country: this.moviesAndShowsService.discoverMovieModel().with_origin_country}))
    }
    else if (this.moviesAndShowsService.queryModeModel().discoverMode === MediaType.TV) {
      this.moviesAndShowsService.discoverMovieModel.update((movieModel) => ({...movieModel, with_origin_country: this.moviesAndShowsService.discoverTVModel().with_origin_country}))
    }
    
    this.onDiscoverSubmit()
  }

  triggerDiscoverSubmitSyncGenreIfPossible() {
    if (this.moviesAndShowsService.queryModeModel().discoverMode === MediaType.Movie) {
      if (this.genreOverlaps(this.moviesAndShowsService.discoverMovieModel().with_genre)) {
        this.moviesAndShowsService.discoverTVModel.update((tvModel) => ({...tvModel, with_genre: this.moviesAndShowsService.getTVGenreFromName(this.moviesAndShowsService.discoverMovieModel().with_genre!.name)}))
      }
    }
    else if (this.moviesAndShowsService.queryModeModel().discoverMode === MediaType.TV) {
      if (this.genreOverlaps(this.moviesAndShowsService.discoverTVModel().with_genre)) {
        this.moviesAndShowsService.discoverMovieModel.update((movieModel) => ({...movieModel, with_genre: this.moviesAndShowsService.getMovieGenreFromName(this.moviesAndShowsService.discoverTVModel().with_genre!.name)}))
      }
    }

    this.onDiscoverSubmit()
  }

  genreOverlaps(with_genre: Genre | null): boolean {
    let movieGenreExists: boolean = false;
    let tvGenreExists: boolean = false;

    if (!with_genre) {
      return true
    }

    this.moviesAndShowsService.movieGenres().forEach((genre) => {
      if (genre.name === with_genre.name) {
        movieGenreExists = true
      }
    })

    this.moviesAndShowsService.tvGenres().forEach((genre) => {
      if (genre.name === with_genre.name) {
        tvGenreExists = true
      }
    })

    return (movieGenreExists && tvGenreExists)
  }
  
}

