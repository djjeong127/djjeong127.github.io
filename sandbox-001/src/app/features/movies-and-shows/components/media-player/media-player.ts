import { Component, computed, inject, input, signal } from '@angular/core';
import { MediaType } from '../../models/movie-tv.model';
import { TmdbApiService } from '../../services/tmdb-api-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MovieDetailResponse } from '../../models/movie.model';
import { TVEpisodeDetailResponse, TVSeasonDetailResponse, TVSeriesDetailResponse } from '../../models/tv.model';
import { MoviesAndShows } from '../../movies-and-shows';
import { MoviesAndShowsService } from '../../services/movies-and-shows-service';
import { DatePipe } from '@angular/common';
import { VidsrcApiService } from '../../services/vidsrc-api-service';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ANGULAR_MATERIAL_MODULES } from '../../../../shared/modules/angular-material.module';

@Component({
  selector: 'app-media-player',
  imports: [DatePipe, ANGULAR_MATERIAL_MODULES],
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
  vidsrcApiService = inject(VidsrcApiService)
  sanitizer = inject(DomSanitizer)

  mediaTypeEnum = MediaType

  hasAttemptedGettingVidsrcMedia = signal<boolean>(false)
  hasGottenVidsrcMedia = signal<boolean>(false)

  selectedMovie = signal<MovieDetailResponse | undefined>(undefined)
  selectedTV = signal<TVSeriesDetailResponse | undefined>(undefined)
  selectedSeason = signal<TVSeasonDetailResponse | undefined>(undefined)
  selectedEpisode = signal<TVEpisodeDetailResponse | undefined>(undefined)


  cleanHtml = signal<SafeHtml>('')

  ngOnInit() {
    if (this.media_type() === MediaType.Movie) {
      this.tmdbApiService.getMovieDetail(this.id()).subscribe({
        next: (response) => {
          this.selectedMovie.set(response)
        },
        error: (err) => {
          console.error(err)
        },
        complete: () => {

        }
      })

      this.vidsrcApiService.getVidsrcMovie(this.id()).subscribe({
        next: (response) => {
          this.cleanHtml.set(this.sanitizer.bypassSecurityTrustHtml(response))
        },
        error: (err) => {
          this.hasAttemptedGettingVidsrcMedia.set(true)
          console.error(err)
          
        },
        complete: () => {
          this.hasAttemptedGettingVidsrcMedia.set(true)
          this.hasGottenVidsrcMedia.set(true)
        }
      })
    }
    else if (this.media_type() === MediaType.TV) {
      this.tmdbApiService.getTVSeriesDetail(this.id()).subscribe({
      next: (response) => {
        this.selectedTV.set(response)
      },
      error: (err) => {
        console.error(err)
      },
      complete: () => {

      }
    })

    this.tmdbApiService.getTVSeasonDetail(this.id(), this.seasonNumber()).subscribe({
      next: (response) => {
        this.selectedSeason.set(response)
      },
      error: (err) => {
        console.error(err)
      },
      complete: () => {

      }
    })
    
    this.tmdbApiService.getTVEpisodeDetail(this.id(), this.seasonNumber(), this.episodeNumber()).subscribe({
      next: (response) => {
        this.selectedEpisode.set(response)
      },
      error: (err) => {
        console.error(err)
      },
      complete: () => {

      }
    })
    }

    this.vidsrcApiService.getVidsrcTV(this.id(), this.seasonNumber(), this.episodeNumber()).subscribe({
        next: (response) => {
          this.cleanHtml.set(this.sanitizer.bypassSecurityTrustHtml(response))
        },
        error: (err) => {
          this.hasAttemptedGettingVidsrcMedia.set(true)
          console.error(err)
        },
        complete: () => {
          this.hasAttemptedGettingVidsrcMedia.set(true)
          this.hasGottenVidsrcMedia.set(true)
        }
      })
    
  }

  minutesToHoursAndMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    else {
      return `${Math.trunc(minutes / 60)} hour${Math.trunc(minutes / 60) > 1 ? 's' : ''}, ${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''}`
    }

  }
}
