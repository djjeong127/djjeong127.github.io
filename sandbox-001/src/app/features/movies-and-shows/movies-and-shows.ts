import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MoviesAndShowsService } from './services/movies-and-shows-service';
import { TmdbApiService } from './services/tmdb-api-service';

@Component({
  selector: 'app-movies-and-shows',
  imports: [],
  templateUrl: './movies-and-shows.html',
  styleUrl: './movies-and-shows.scss',
})
export class MoviesAndShows {
  moviesAndShowsService = inject(MoviesAndShowsService)
  tmdbApiService = inject(TmdbApiService)

  discoverMovie = toSignal(this.tmdbApiService.discoverMovie(undefined, undefined, [{id: 28, name: "Action"}, {id: 16, name: 'Animation'}], undefined, []), {initialValue: null})
  // // discoverTV = toSignal(this.tmdbApiService.discoverTV(), {initialValue: null})

  // stringDiscoverMovie = computed(() => JSON.stringify(this.discoverMovie()))
  // // stringDiscoverTV = computed(() => JSON.stringify(this.discoverTV()))
  
  // movieResults = '';

  // searchMovie(movie: string) {
  //   const movieResults = toSignal(this.tmdbApiService.searchMovie(movie), {initialValue: null})
  //   this.movieResults = JSON.stringify(movieResults())
  //   return movieResults
  // }

  // getDetails = toSignal(this.tmdbApiService.getMovieDetail(2))
}
