import { Component, computed, effect, ElementRef, HostListener, inject, input, signal, ViewChild } from '@angular/core';
import { MediaType, MultiFilterEnum, SearchMode } from '../../models/movie-tv.model';
import { TmdbApiService } from '../../services/tmdb-api-service';
import { MovieDetailResponse } from '../../models/movie.model';
import { Episode, EpisodeGroup, EpisodeGroupDetailEpisode, Season, TVEpisodeDetailResponse, TVEpisodeGroupDetailResponse, TVEpisodeGroupsResponse, TVSeasonDetailResponse, TVSeriesDetailResponse } from '../../models/tv.model';
import { MoviesAndShowsService } from '../../services/movies-and-shows-service';
import { DatePipe } from '@angular/common';
import { VidsrcApiService } from '../../services/vidsrc-api-service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ANGULAR_MATERIAL_MODULES } from '../../../../shared/modules/angular-material.module';
import { form, FormField } from '@angular/forms/signals';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';

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
  @ViewChild('episodeHeader') episodeHeader!: ElementRef<HTMLDivElement>;

  media_type = input.required<MediaType>();
  id = input.required<number>();
  season = input<string | undefined>()
  episode = input<string | undefined>()
  scrollToMediaPlayer = input<boolean>(false)

  seasonNumber = computed<number>(() => Number(this.season()))
  episodeNumber = computed<number>(() => Number(this.episode()))

  tmdbApiService = inject(TmdbApiService)
  moviesAndShowsService = inject(MoviesAndShowsService)
  vidsrcApiService = inject(VidsrcApiService)
  sanitizer = inject(DomSanitizer)
  routerService = inject(Router)
  activatedRouteService = inject(ActivatedRoute)

  mediaTypeEnum = MediaType

  isLoading = signal<boolean>(true)

  selectedMovie = signal<MovieDetailResponse | undefined>(undefined)
  selectedTVDetail = signal<TVSeriesDetailResponse | undefined>(undefined)
  selectedSeasonDetail = signal<TVSeasonDetailResponse | undefined>(undefined)
  selectedEpisodeDetail = signal<TVEpisodeDetailResponse | undefined>(undefined)

  seasonsList = computed<Season[] | undefined>(() => this.selectedTVDetail()?.seasons)
  episodesList = computed<Episode[] | undefined>(() => this.selectedSeasonDetail()?.episodes)

  episodeGroups = signal<TVEpisodeGroupsResponse | undefined>(undefined)
  episodeGroupDetail = signal<TVEpisodeGroupDetailResponse | undefined>(undefined)

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


  // javascript calculations for the movie-shows-header height, so that I can get a buffer of the same size
  appHeaderElement = signal(document.querySelector('.app-header') as HTMLElement)
  mediaPlayerHeaderElement = signal(document.querySelector('.media-player-header') as HTMLElement)
  mediaPlayerBodyElement = signal(document.querySelector('.media-player-body') as HTMLElement)

  lastScrollPosition = signal(0)
  scrollDown = signal(false)
  relative = signal(false)


  @HostListener('window:resize')
  onResize() {
    this.updateHeaderElementHeight()
  }

  private updateHeaderElementHeight() {
    const updatedAppHeaderElement = (document.querySelector('.app-header') as HTMLElement)
    const updatedMediaPlayerHeaderElement = (document.querySelector('.media-player-header') as HTMLElement)
    const updatedMediaPlayerElement = (document.querySelector('.media-player-body') as HTMLElement)

    if (updatedAppHeaderElement) {
      this.appHeaderElement.set(updatedAppHeaderElement)
    }

    if (updatedMediaPlayerHeaderElement) {
      this.mediaPlayerHeaderElement.set(updatedMediaPlayerHeaderElement)
    }

    if (updatedMediaPlayerElement) {
      this.mediaPlayerBodyElement.set(updatedMediaPlayerElement)
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    const currentScrollPosition = window.scrollY || document.documentElement.scrollTop
    
    if (currentScrollPosition > this.lastScrollPosition()) {
      if (this.mediaPlayerBodyElement().getBoundingClientRect().top >= this.appHeaderElement().getBoundingClientRect().bottom) {
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

  constructor() {
    effect(() => {
      this.safeVidsrcUrl.set(undefined)
      this.isLoading.set(true)

      this.selectedMovie.set(undefined)
      this.selectedTVDetail.set(undefined)
      this.selectedSeasonDetail.set(undefined)
      this.selectedEpisodeDetail.set(undefined)

      this.episodeGroups.set(undefined)
      this.episodeGroupDetail.set(undefined)

      // this.tmdbApiService.getTVEpisodeGroups(this.id()).subscribe({
      //   next: (response) => {
      //     this.episodeGroups.set(response)
      //     if (response.results.length !== 0) {
      //       const absoluteEpisodeGroup: EpisodeGroup = response.results.find((result) => result.type === 2 && result.group_count === 1)!
      //       this.tmdbApiService.getTVEpisodeGroupDetail(absoluteEpisodeGroup.id).subscribe({
      //         next: (response) => {
      //           this.episodeGroupDetail.set(response)
      //         },
      //         error: (err) => {
      //           this.isLoading.set(false)
      //           console.error(err)
      //         },
      //         complete: () => {
      //           this.isLoading.set(false)
      //         }
      //       })
            
      //     }
      //   },
      //   error: (err) => {
      //     this.isLoading.set(false)
      //     console.error(err)
      //   },
      //   complete: () => {
      //     this.isLoading.set(false)
      //   }
      // })

      this.getTmdbAndVidsrcInfo(this.media_type(), this.id(), this.seasonNumber(), this.episodeNumber())

    })
  }

  ngOnInit() {
    this.updateHeaderElementHeight()
  }

  getTmdbAndVidsrcInfo(mediaType: MediaType, id: number, seasonNumber: number, episodeNumber: number) {
    if (mediaType === MediaType.Movie) {
      this.tmdbApiService.getMovieDetail(id).subscribe({
        next: (response) => {
          this.selectedMovie.set(response)
        },
        error: (err) => {
          this.isLoading.set(false)
          console.error(err)
        },
        complete: () => {
          this.vidsrcApiService.getVidsrcMovie(id).subscribe({
            next: (response) => {
              this.safeVidsrcUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(response))
            },
            error: (err) => {
              this.isLoading.set(false)
              this.safeVidsrcUrl.set('')
              if (this.scrollToMediaPlayer()) {
                this.scrollToEpisodeHeader()
              }
              console.error(err)
            },
            complete: () => {
              this.isLoading.set(false)
              if (this.scrollToMediaPlayer()) {
                this.scrollToEpisodeHeader()
              }
            }
          })
        }
      })

     
    }
    else if (mediaType === MediaType.TV) {
      this.tmdbApiService.getTVSeriesDetail(id).subscribe({
        next: (response) => {
          this.selectedTVDetail.set(response)
          this.searchTVModel.update((form) => ({...form, season: this.getSeason(seasonNumber, response.seasons)}))
        },
        error: (err) => {
          this.isLoading.set(false)
          console.error(err)
        },
        complete: () => {





          this.tmdbApiService.getTVEpisodeGroups(this.id()).subscribe({
            next: (response) => {
              this.episodeGroups.set(response)
              },
            error: (err) => {
              this.isLoading.set(false)
              console.error(err)
            },
            complete: () => {
              if (this.episodeGroups() && this.episodeGroups()!.results.length !== 0) {
                const absoluteEpisodeGroup: EpisodeGroup = this.episodeGroups()!.results.find((result) => result.type === 2 && result.group_count === 1)!
                this.tmdbApiService.getTVEpisodeGroupDetail(absoluteEpisodeGroup.id).subscribe({
                  next: (response) => {
                    this.episodeGroupDetail.set(response)
                  },
                  error: (err) => {
                    this.isLoading.set(false)
                    console.error(err)
                  },
                  complete: () => {
                    let absoluteEpisodeNumber = episodeNumber
                    if (seasonNumber > 1) {
                      absoluteEpisodeNumber = this.getAbsoluteEpisodeNumber(seasonNumber, episodeNumber)
                    }
                    this.tmdbApiService.getTVSeasonDetail(id, seasonNumber).subscribe({
                      next: (response) => {
                        this.selectedSeasonDetail.set(response)
                        this.searchTVModel.update((form) => ({...form, episode: this.getEpisode(absoluteEpisodeNumber, response.episodes)}))
                      },
                      error: (err) => {
                        this.isLoading.set(false)
                        console.error(err)
                      },
                      complete: () => {
                        this.tmdbApiService.getTVEpisodeDetail(id, seasonNumber, absoluteEpisodeNumber).subscribe({
                          next: (response) => {
                            this.selectedEpisodeDetail.set(response)
                          },
                          error: (err) => {
                            this.isLoading.set(false)
                            console.error(err)
                          },
                          complete: () => {
                            this.vidsrcApiService.getVidsrcTV(id, seasonNumber, episodeNumber).subscribe({
                              next: (response) => {
                                this.safeVidsrcUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(response))
                              },
                              error: (err) => {
                                this.isLoading.set(false)
                                this.safeVidsrcUrl.set('')
                                if (this.scrollToMediaPlayer()) {
                                  this.scrollToEpisodeHeader()
                                }
                                console.error(err)
                              },
                              complete: () => {
                                this.isLoading.set(false)
                                if (this.scrollToMediaPlayer()) {
                                  this.scrollToEpisodeHeader()
                                }
                              }
                            })
                          }
                        })      
                      }
                    })

                  }
                })
              }
              else {
                this.tmdbApiService.getTVSeasonDetail(id, seasonNumber).subscribe({
                  next: (response) => {
                    this.selectedSeasonDetail.set(response)
                    this.searchTVModel.update((form) => ({...form, episode: this.getEpisode(episodeNumber, response.episodes)}))
                  },
                  error: (err) => {
                    this.isLoading.set(false)
                    console.error(err)
                  },
                  complete: () => {
                    this.tmdbApiService.getTVEpisodeDetail(id, seasonNumber, episodeNumber).subscribe({
                      next: (response) => {
                        this.selectedEpisodeDetail.set(response)
                      },
                      error: (err) => {
                        this.isLoading.set(false)
                        console.error(err)
                      },
                      complete: () => {
                        this.vidsrcApiService.getVidsrcTV(id, seasonNumber, episodeNumber).subscribe({
                          next: (response) => {
                            this.safeVidsrcUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(response))
                          },
                          error: (err) => {
                            this.isLoading.set(false)
                            this.safeVidsrcUrl.set('')
                            if (this.scrollToMediaPlayer()) {
                              this.scrollToEpisodeHeader()
                            }
                            console.error(err)
                          },
                          complete: () => {
                            this.isLoading.set(false)
                            if (this.scrollToMediaPlayer()) {
                              this.scrollToEpisodeHeader()
                            }
                          }
                        })
                      }
                    })      
                  }
                })
              }
            }
          })







          // this.tmdbApiService.getTVSeasonDetail(id, seasonNumber).subscribe({
          //   next: (response) => {
          //     this.selectedSeasonDetail.set(response)
          //     this.searchTVModel.update((form) => ({...form, episode: this.getEpisode(episodeNumber, response.episodes)}))
          //   },
          //   error: (err) => {
          //     this.isLoading.set(false)
          //     console.error(err)
          //   },
          //   complete: () => {
          //     this.tmdbApiService.getTVEpisodeDetail(id, seasonNumber, episodeNumber).subscribe({
          //       next: (response) => {
          //         this.selectedEpisodeDetail.set(response)
          //       },
          //       error: (err) => {
          //         this.isLoading.set(false)
          //         console.error(err)
          //       },
          //       complete: () => {
          //         this.vidsrcApiService.getVidsrcTV(id, seasonNumber, episodeNumber).subscribe({
          //           next: (response) => {
          //             this.safeVidsrcUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(response))
          //           },
          //           error: (err) => {
          //             this.isLoading.set(false)
          //             this.safeVidsrcUrl.set('')
          //             console.error(err)
          //           },
          //           complete: () => {
          //             this.isLoading.set(false)
          //           }
          //         })
          //       }
          //     })      
          //   }
          // })
        }
      })
    }
    else {
      this.isLoading.set(false)
    }
  }

  minutesToHoursAndMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`
    }
    else {
      return `${Math.trunc(minutes / 60)}h ${minutes % 60}min`
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

   triggerSearchTVSeason(event: MatSelectChange) {
    const newSeason: Season = event.value
    this.searchAndScrollTVSeason(newSeason.season_number)
  }

  searchAndScrollTVSeason(seasonNumber: number) {
    this.searchTVSeason(seasonNumber)
  }

  searchTVSeason(seasonNumber: number) {
    this.routerService.navigate([], {
      relativeTo: this.activatedRouteService,
      queryParams: this.setQueryParams(seasonNumber, 1, true),
      queryParamsHandling: 'merge',
    })
  }

  triggerSearchTVEpisode(event: MatSelectChange) {
    const newEpisode: Episode = event.value

    this.searchAndScrollTVEpisode(newEpisode.episode_number)
    
  }

  searchAndScrollTVEpisode(episodeNumber: number) {
    if (this.episodeGroupDetail()) {
      this.searchTVEpisode(this.getNotAbsoluteEpisodeNumber(this.seasonNumber(), episodeNumber))
    }
    else {
      this.searchTVEpisode(episodeNumber)
    }
  }

  searchTVEpisode(episodeNumber: number) {
    this.routerService.navigate([], {
      relativeTo: this.activatedRouteService,
      queryParams: this.setQueryParams(this.searchTVModel().season.season_number, episodeNumber, true),
      queryParamsHandling: 'merge',
    })
  }

  setQueryParams(seasonNumber: number, episodeNumber: number, scrollToMediaPlayer: boolean) {
      return {season: seasonNumber, episode: episodeNumber, scrollToMediaPlayer: scrollToMediaPlayer}
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  scrollToEpisodeHeader(): void {
    const appHeaderHeight = (document.querySelector('.app-header') as HTMLElement).getBoundingClientRect().height
    const episodeHeaderPosition = this.episodeHeader.nativeElement.getBoundingClientRect().top;
    const currentScrollPosition = window.scrollY

    const targetPosition = episodeHeaderPosition + currentScrollPosition - appHeaderHeight

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  getAbsoluteEpisodeNumber(seasonNumber: number, episodeNumber: number): number {
    const absoluteSeasonEpisodes: EpisodeGroupDetailEpisode[] = this.episodeGroupDetail()?.groups[0].episodes.filter((absoluteEpisode) => absoluteEpisode.season_number ===  seasonNumber)!
    const absoluteEpisode: EpisodeGroupDetailEpisode = absoluteSeasonEpisodes[episodeNumber - 1]
    return absoluteEpisode.episode_number
  }

  getNotAbsoluteEpisodeNumber(seasonNumber: number, absoluteEpisodeNumber: number): number {
    const absoluteSeasonEpisodes: EpisodeGroupDetailEpisode[] = this.episodeGroupDetail()?.groups[0].episodes.filter((absoluteEpisode) => absoluteEpisode.season_number ===  seasonNumber)!
    const notAbsoluteEpisodeNumber: number = absoluteSeasonEpisodes.findIndex((episode) => episode.episode_number === absoluteEpisodeNumber) + 1

    return notAbsoluteEpisodeNumber
  }


  onSearchSubmitForm(event: Event) {
    event.preventDefault()

    this.moviesAndShowsService.searchModel.update((currentFilter) => ({...currentFilter, multiFilter: MultiFilterEnum.MovieAndTV}))

    if (this.moviesAndShowsService.searchModel().searchMedia === '') {
      this.moviesAndShowsService.updateSearchMode(SearchMode.Unpopulated)
    }
    else {
      this.moviesAndShowsService.updateSearchMode(SearchMode.Populated)
    }

    this.moviesAndShowsService.loadPageFresh()

    this.routerService.navigate(['/movies-and-shows'])
  }
}
