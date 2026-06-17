import { computed, inject, Injector, runInInjectionContext, Service, signal } from '@angular/core';
import { TmdbApiService } from './tmdb-api-service';
import { DiscoverMovieParams, DiscoverSearchMovieResponse, DiscoverSearchMovieResult } from '../models/movie.model';
import { DiscoverTVParams, DiscoverTVResponse, DiscoverTVResult, SearchTVResponse, SearchTVResult } from '../models/tv.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { form } from '@angular/forms/signals';
import { Country, Genre, DiscoverSortDirection, DiscoverSortField, CombinedMediaResult, MediaType, TmdbConfiguration } from '../models/movie-tv.model';
import { forkJoin } from 'rxjs';

export enum SearchMediaTypes {
    'Movie' = 'movie',
    'TV' = 'tv',
    'MovieAndTV' = 'movie_and_tv'
}

export interface SearchModel {
  searchMedia: string;
  searchMediaTypes: SearchMediaTypes
}

export interface LoadedMedia {
    movie_pages: DiscoverSearchMovieResponse[];
    tv_pages: DiscoverTVResponse[] | SearchTVResponse[];
}

export enum QueryMode {
    'Search' = 'search',
    'Discover' = 'discover'
}


@Service()
export class MoviesAndShowsService {
    tmdbApiService = inject(TmdbApiService)

    isLoadingMoviePages = signal<boolean>(false)
    isLoadingTVPages = signal<boolean>(false)

    queryMode = signal<QueryMode>(QueryMode.Discover)
    discoverMode = signal<MediaType>(MediaType.Movie)

    loadedMoviePages = signal<DiscoverSearchMovieResponse[]>([])
    loadedTVPages = signal<DiscoverTVResponse[] | SearchTVResponse[]>([])
    loadedMediaPages = computed<LoadedMedia>(() => {
        return {
            movie_pages: this.loadedMoviePages(),
            tv_pages: this.loadedTVPages()}
    })

    combinedLoadedMediaResults = computed<CombinedMediaResult[]>(() => {
        const combinedResults: CombinedMediaResult[] = [];
        
        this.loadedMediaPages().movie_pages.forEach(
            (page) => page.results.forEach(
                (result) => combinedResults.push(this.convertMovieResultToCombinedResult(result))
            )
        );
        this.loadedMediaPages().tv_pages.forEach(
            (page) => page.results.forEach(
                (result) => combinedResults.push(this.convertTVResultToCombinedResult(result))
            )
        );

        // combinedResults.sort((a, b) => b.popularity - a.popularity);
        return combinedResults;
    })

    nextMoviePageNumber = computed(() => this.loadedMoviePages().length === 0 ? 1 : this.loadedMoviePages().at(-1)!.page + 1)
    nextTVPageNumber = computed(() => this.loadedTVPages().length === 0 ? 1 : this.loadedTVPages().at(-1)!.page + 1)

    searchModel = signal<SearchModel>({
        searchMedia: '',
        searchMediaTypes: SearchMediaTypes.MovieAndTV
    })
    searchForm = form(this.searchModel)

    tmdbConfiguration = signal<TmdbConfiguration | undefined>(undefined)
    countries = signal<Country[]>([])
    movieGenres = signal<Genre[]>([])
    tvGenres = signal<Genre[]>([])
    movieAndTVGenreNames = computed<string[]>(() => {
        const moviesGenreNames: string[] = this.movieGenres().map((genre) => genre.name)
        const tvGenreNames: string[] = this.tvGenres().map((genre) => genre.name)
        
        const intersectionNames = moviesGenreNames.filter((name) => tvGenreNames.includes(name))
        return intersectionNames
    })

    discoverMovieModel = signal<DiscoverMovieParams>({
        page: this.nextMoviePageNumber(),
        sort_by: {
            field: DiscoverSortField.Popularity,
            direction: DiscoverSortDirection.Desc
        },
        with_genres: [],
        with_origin_country: this.getCountry('US'),
        without_genres: []
    })

    discoverMovieForm = form(this.discoverMovieModel)

    discoverTVModel = signal<DiscoverTVParams>({
        page: this.nextTVPageNumber(),
        sort_by: {
            field: DiscoverSortField.Popularity,
            direction: DiscoverSortDirection.Desc
        },
        with_genres: [],
        with_origin_country: this.getCountry('US'),
        without_genres: []
    })

    discoverTVForm = form(this.discoverTVModel)



    constructor() {
        this.getMetaData()
    }

    updateQueryMode(queryMode: QueryMode) {
        this.queryMode.set(queryMode)
    }

    updateDiscoverMode(mediaType: MediaType) {
        this.discoverMode.set(mediaType)
    }
    
    getFullPosterUrl(posterPath: string, posterSize: string = this.tmdbConfiguration()?.images.poster_sizes.find((size) => size === 'original')!): string {
        const fullUrl = this.tmdbConfiguration()?.images.secure_base_url + posterSize + posterPath
        return fullUrl
    }

    convertMovieResultToCombinedResult(movieResult: DiscoverSearchMovieResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            media_type: MediaType.Movie,
            backdrop_path: movieResult.backdrop_path,
            genre_ids: movieResult.genre_ids,
            id: movieResult.id,
            original_language: movieResult.original_language,
            original_title_name: movieResult.original_title,
            overview: movieResult.overview,
            popularity: movieResult.popularity,
            poster_path: this.getFullPosterUrl(movieResult.poster_path),
            title_name: movieResult.title,
            vote_average: movieResult.vote_average,
            vote_count: movieResult.vote_count
        }
        return newCombinedResult
    }

    convertTVResultToCombinedResult(TVResult: DiscoverTVResult | SearchTVResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            media_type: MediaType.TV,
            backdrop_path: TVResult.backdrop_path,
            genre_ids: TVResult.genre_ids,
            id: TVResult.id,
            original_language: TVResult.original_language,
            original_title_name: TVResult.original_name,
            overview: TVResult.overview,
            popularity: TVResult.popularity,
            poster_path: this.getFullPosterUrl(TVResult.poster_path),
            title_name: TVResult.name,
            vote_average: TVResult.vote_average,
            vote_count: TVResult.vote_count
        }
        return newCombinedResult
    }

    getMetaData() {
        forkJoin([this.tmdbApiService.getConfiguration(), this.tmdbApiService.getCountries(), this.tmdbApiService.getMovieGenres(), this.tmdbApiService.getTVGenres()]).subscribe({
            next: ([getConfigurationResponse, getCountriesResponse, getMovieGenresResponse, getTVGenresResponse]) => {
                this.tmdbConfiguration.set(getConfigurationResponse)
                this.countries.set(getCountriesResponse)
                this.movieGenres.set(getMovieGenresResponse.genres)
                this.tvGenres.set(getTVGenresResponse.genres)

                // And also set the Discover Origin Country
                this.discoverMovieModel.set({
                    page: this.nextMoviePageNumber(),
                    sort_by: {
                        field: DiscoverSortField.Popularity,
                        direction: DiscoverSortDirection.Desc
                    },
                    with_genres: [],
                    with_origin_country: this.getCountry('US'),
                    without_genres: []
                })

                this.discoverTVModel.set({
                    page: this.nextTVPageNumber(),
                    sort_by: {
                        field: DiscoverSortField.Popularity,
                        direction: DiscoverSortDirection.Desc
                    },
                    with_genres: [],
                    with_origin_country: this.getCountry('US'),
                    without_genres: []
                })
            },
            error: (err) => {
                console.error(err)
            }
        })
    }

    getCountry(iso_3166_1: string): Country {
        return this.countries().find((country) => country.iso_3166_1 === iso_3166_1)!
    }

    clearLoadedMoviePages() {
        this.loadedMoviePages.set([])
    }

    clearLoadedTVPages() {
        this.loadedTVPages.set([])
    }

    clearLoadedMovieAndTVPages() {
        this.clearLoadedMoviePages()
        this.clearLoadedTVPages()
    }

    addMoviePage(moviePage: DiscoverSearchMovieResponse) {

        this.loadedMoviePages.update((loadedMoviePages) => [...loadedMoviePages, moviePage])
    }

    addTVPage(tvPage: DiscoverTVResponse | SearchTVResponse) {
        this.loadedTVPages.update((loadedTVPages) => [...loadedTVPages, tvPage])
    }

    searchNextMoviePage() {
        if(this.isLoadingMoviePages()) {
            return
        }
        else {
            this.isLoadingMoviePages.set(true)
        }
        this.tmdbApiService.searchMovie(this.searchModel().searchMedia, this.nextMoviePageNumber()).subscribe({
            next: (response) => {
                if (response.total_results !== 0) {
                    this.addMoviePage(response)
                }
            },
            error: (err) => {
                console.error(err)
            },
            complete: () => {
                this.isLoadingMoviePages.set(false)
            }
        })
    }

    searchMovieFresh() {
        this.clearLoadedMovieAndTVPages()
        this.searchNextMoviePage()
    }

    searchNextTVPage() {
        if(this.isLoadingTVPages()) {
            return
        }
        else {
            this.isLoadingTVPages.set(true)
        }
        this.tmdbApiService.searchTV(this.searchModel().searchMedia, this.nextTVPageNumber()).subscribe({
            next: (response) => {
                if (response.total_results !== 0) {
                    this.addTVPage(response)
                }
            },
            error: (err) => {
                console.error(err)
            },
            complete: () => {
                this.isLoadingTVPages.set(false)
            }
        })
    }

    searchTVFresh() {
        this.clearLoadedMovieAndTVPages()
        this.searchNextTVPage()
    }

    searchNextMovieAndTVPage() {
        this.searchNextMoviePage()
        this.searchNextTVPage()
        console.log(this.loadedMediaPages())
    }

    searchMovieAndTVFresh() {
        this.clearLoadedMovieAndTVPages()
        this.searchNextMovieAndTVPage()
    }

    searchFresh() {
        this.updateQueryMode(QueryMode.Search)
        if (this.searchModel().searchMediaTypes === SearchMediaTypes.Movie) {
            this.searchMovieFresh()
        }
        else if (this.searchModel().searchMediaTypes === SearchMediaTypes.TV) {
            this.searchTVFresh()
        }
        else {
            this.searchMovieAndTVFresh()
        }
    }

    searchNextPage() {
        if (this.searchModel().searchMediaTypes === SearchMediaTypes.Movie) {
            this.searchNextMoviePage()
        }
        else if (this.searchModel().searchMediaTypes === SearchMediaTypes.TV) {
            this.searchNextTVPage()
        }
        else {
            this.searchNextMovieAndTVPage()
        }
    }

    discoverNextMoviePage() {
        if(this.isLoadingMoviePages()) {
            return
        }
        else {
            this.isLoadingMoviePages.set(true)
        }
        this.discoverMovieModel.update((model) => ({...model, page: this.nextMoviePageNumber()}))
        this.tmdbApiService.discoverMovie(this.discoverMovieModel()).subscribe({
            next: (response) => {
                this.addMoviePage(response)
            },
            error: (err) => {
                console.error(err)
            },
            complete: () => {
                this.isLoadingMoviePages.set(false)
            }
        })
    }

    discoverMovieFresh() {
        this.updateQueryMode(QueryMode.Discover)
        this.updateDiscoverMode(MediaType.Movie)
        this.clearLoadedMovieAndTVPages()
        this.discoverNextMoviePage()
    }

    discoverNextTVPage() {
        if(this.isLoadingTVPages()) {
            return
        }
        else {
            this.isLoadingTVPages.set(true)
        }
        this.discoverTVModel.update((model) => ({...model, page: this.nextTVPageNumber()}))
        this.tmdbApiService.discoverTV(this.discoverTVModel()).subscribe({
            next: (response) => {
                this.addTVPage(response)
            },
            error: (err) => {
                console.error(err)
            },
            complete: () => {
                this.isLoadingTVPages.set(false)
            }
        })
    }

    discoverTVFresh() {
        this.updateQueryMode(QueryMode.Discover)
        this.updateDiscoverMode(MediaType.TV)
        this.clearLoadedMovieAndTVPages()
        this.discoverNextTVPage()
    }
}
