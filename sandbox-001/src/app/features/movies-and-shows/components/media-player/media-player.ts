import { Component, computed, inject, input, signal } from '@angular/core';
import { MediaType } from '../../models/movie-tv.model';
import { TmdbApiService } from '../../services/tmdb-api-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MovieDetailResponse } from '../../models/movie.model';
import { TVEpisodeDetailResponse, TVSeasonDetailResponse, TVSeriesDetailResponse } from '../../models/tv.model';
import { MoviesAndShows } from '../../movies-and-shows';
import { MoviesAndShowsService } from '../../services/movies-and-shows-service';

@Component({
  selector: 'app-media-player',
  imports: [],
  templateUrl: './media-player.html',
  styleUrl: './media-player.scss',
})
export class MediaPlayer {
  media_type = input.required<MediaType>();
  id = input.required<number>();
  season = input<string | undefined>()
  episode = input<string | undefined>()

  seasonNumber = computed<number>(() => Number(this.season()))
  episodeNumber = computed<number>(() => Number(this.episode()))

  tmdbApiService = inject(TmdbApiService)
  moviesAndShowsService = inject(MoviesAndShowsService)

  mediaTypeEnum = MediaType

  selectedMovie = signal<MovieDetailResponse | undefined>(undefined)

  selectedTV = signal<TVSeriesDetailResponse | undefined>(undefined)
  selectedSeason = signal<TVSeasonDetailResponse | undefined>(undefined)
  selectedEpisode = signal<TVEpisodeDetailResponse | undefined>(undefined)


  ngOnInit() {
    if (this.media_type() === MediaType.Movie) {
      this.tmdbApiService.getMovieDetail(this.id()).subscribe({
        next: (response) => {
          this.selectedMovie.set(response)
        },
        error: (err) => {
          console.log(err)
        },
        complete: () => {

        }
      })
    }
    else if (this.media_type() === MediaType.TV) {
      this.tmdbApiService.getTVSeriesDetail(this.id()).subscribe({
      next: (response) => {
        this.selectedTV.set(response)
      },
      error: (err) => {
        console.log(err)
      },
      complete: () => {

      }
    })

    this.tmdbApiService.getTVSeasonDetail(this.id(), this.seasonNumber()).subscribe({
      next: (response) => {
        this.selectedSeason.set(response)
      },
      error: (err) => {
        console.log(err)
      },
      complete: () => {

      }
    })
    
    this.tmdbApiService.getTVEpisodeDetail(this.id(), this.seasonNumber(), this.episodeNumber()).subscribe({
      next: (response) => {
        this.selectedEpisode.set(response)
      },
      error: (err) => {
        console.log(err)
      },
      complete: () => {

      }
    })
    }
    
  }
}
