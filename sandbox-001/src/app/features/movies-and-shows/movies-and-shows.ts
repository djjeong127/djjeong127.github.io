import { Component, computed, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MoviesAndShowsService } from './services/movies-and-shows-service';
import { TmdbApiService } from './services/tmdb-api-service';
import { FormField } from '@angular/forms/signals';
import { MatAnchor } from "@angular/material/button";
import { ANGULAR_MATERIAL_MODULES } from '../../shared/modules/angular-material.module';
import { MediaType } from './models/movie-tv.model';
import { MultiFilter } from './models/multi.model';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-movies-and-shows',
  imports: [ANGULAR_MATERIAL_MODULES, FormField, DatePipe],
  templateUrl: './movies-and-shows.html',
  styleUrl: './movies-and-shows.scss',
})
export class MoviesAndShows {
  @ViewChild('bottomSentinel') bottomSentinel!: ElementRef;

  moviesAndShowsService = inject(MoviesAndShowsService)

  mediaType = MediaType;

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

  onSearchSubmit(event: Event) {
    event.preventDefault(); 
    this.moviesAndShowsService.searchMultiFresh()
  }
}

