import { Component, computed, inject, input, signal } from '@angular/core';
import { MediaType } from '../../models/movie-tv.model';
import { TmdbApiService } from '../../services/tmdb-api-service';
import { MovieDetailResponse } from '../../models/movie.model';
import { Episode, Season, TVEpisodeDetailResponse, TVSeasonDetailResponse, TVSeriesDetailResponse } from '../../models/tv.model';
import { MoviesAndShowsService } from '../../services/movies-and-shows-service';
import { DatePipe } from '@angular/common';
import { VidsrcApiService } from '../../services/vidsrc-api-service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ANGULAR_MATERIAL_MODULES } from '../../../../shared/modules/angular-material.module';
import { form, FormField } from '@angular/forms/signals';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';

export interface SearchTVModel {
  season: Season;
  episode: Episode;
}

@Component({
  selector: 'app-media-player',
  imports: [DatePipe, ANGULAR_MATERIAL_MODULES, FormField],
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
  routerService = inject(Router)


  mediaTypeEnum = MediaType

  isLoading = signal<boolean>(true)

  selectedMovie = signal<MovieDetailResponse | undefined>(undefined)
  selectedTVDetail = signal<TVSeriesDetailResponse | undefined>(undefined)
  selectedSeasonDetail = signal<TVSeasonDetailResponse | undefined>(undefined)
  selectedEpisodeDetail = signal<TVEpisodeDetailResponse | undefined>(undefined)

  seasonsList = computed<Season[] | undefined>(() => this.selectedTVDetail()?.seasons)
  episodesList = computed<Episode[] | undefined>(() => this.selectedSeasonDetail()?.episodes)

  searchTVModel = signal<SearchTVModel>({
    season: {
      air_date: '',
      episode_count: 0,
      id: 0,
      name: '',
      overview: '',
      poster_path: '',
      season_number: 0,
      vote_average: 0
    },
    episode: {
      id: 0,
      name: '',
      overview: '',
      vote_average: 0,
      vote_count: 0,
      air_date: '',
      episode_number: 0,
      production_code: '',
      runtime: 0,
      season_number: 0,
      show_id: 0,
      still_path: ''
    }
  })
  searchTVForm = form(this.searchTVModel)


  safeVidsrcUrl = signal<SafeResourceUrl | undefined>(undefined)

  ngOnInit() {
    
    this.getTmdbAndVidsrcInfo()

  }

  getTmdbAndVidsrcInfo() {
    if (this.media_type() === MediaType.Movie) {
      this.tmdbApiService.getMovieDetail(this.id()).subscribe({
        next: (response) => {
          this.selectedMovie.set(response)
        },
        error: (err) => {
          console.error(err)
        },
        complete: () => {
          this.vidsrcApiService.getVidsrcMovie(this.id()).subscribe({
            next: (response) => {
              this.safeVidsrcUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(response))
            },
            error: (err) => {
              this.isLoading.set(false)
              this.safeVidsrcUrl.set('')
              console.error(err)
            },
            complete: () => {
              this.isLoading.set(false)
            }
          })
        }
      })

     
    }
    else if (this.media_type() === MediaType.TV) {
      this.tmdbApiService.getTVSeriesDetail(this.id()).subscribe({
        next: (response) => {
          this.selectedTVDetail.set(response)
          this.searchTVModel.update((form) => ({...form, season: this.getSeason(this.seasonNumber(), response.seasons)}))
        },
        error: (err) => {
          console.error(err)
        },
        complete: () => {
          this.tmdbApiService.getTVSeasonDetail(this.id(), this.seasonNumber()).subscribe({
            next: (response) => {
              this.selectedSeasonDetail.set(response)
              this.searchTVModel.update((form) => ({...form, episode: this.getEpisode(this.episodeNumber(), response.episodes)}))
            },
            error: (err) => {
              console.error(err)
            },
            complete: () => {
              this.tmdbApiService.getTVEpisodeDetail(this.id(), this.seasonNumber(), this.episodeNumber()).subscribe({
                next: (response) => {
                  this.selectedEpisodeDetail.set(response)
                },
                error: (err) => {
                  console.error(err)
                },
                complete: () => {
                  this.vidsrcApiService.getVidsrcTV(this.id(), this.seasonNumber(), this.episodeNumber()).subscribe({
                    next: (response) => {
                      this.safeVidsrcUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(response))
                    },
                    error: (err) => {
                      this.isLoading.set(false)
                      this.safeVidsrcUrl.set('')
                      console.error(err)
                    },
                    complete: () => {
                      this.isLoading.set(false)
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  }

  minutesToHoursAndMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    else {
      return `${Math.trunc(minutes / 60)} hour${Math.trunc(minutes / 60) > 1 ? 's' : ''}, ${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''}`
    }

  }

  getSeason(seasonNumber: number, seasons: Season[]): Season {
    const season = seasons.find((season) => season.season_number === seasonNumber)!
    return season
  }

  getEpisode(episodeNumber: number, episodes: Episode[]): Episode {
    const episode = episodes.find((episode) => episode.episode_number === episodeNumber)!
    return episode
  }

  async triggerSearchTVSeason(event: MatSelectChange) {
    const newSeason: Season = event.value
    const successfulRouting = await this.routerService.navigate(['/movies-and-shows', this.media_type(), this.id()], {
      queryParams: this.setQueryParams(newSeason.season_number, 1),
      // onSameUrlNavigation: 'reload',
      replaceUrl: true
    })

    if (successfulRouting) {
      this.getTmdbAndVidsrcInfo()
    }

  }

  async triggerSearchTVEpisode(event: MatSelectChange) {
    const newEpisode: Episode = event.value
    const successfulRouting = await this.routerService.navigate(['/movies-and-shows', this.media_type(), this.id()], {
      queryParams: this.setQueryParams(this.searchTVModel().season.season_number, newEpisode.episode_number),
      // onSameUrlNavigation: 'reload',
      replaceUrl: true
    })

    if (successfulRouting) {
      this.getTmdbAndVidsrcInfo()
    }
  }

  setQueryParams(seasonNumber: number, episodeNumber: number) {
      return {season: seasonNumber, episode: episodeNumber}
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }
}
