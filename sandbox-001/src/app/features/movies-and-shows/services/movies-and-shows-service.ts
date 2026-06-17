import { computed, inject, Injector, runInInjectionContext, Service, signal } from '@angular/core';
import { TmdbApiService } from './tmdb-api-service';
import { DiscoverMovieParams, DiscoverMovieResponse, DiscoverMovieResult } from '../models/movie.model';
import { DiscoverTVParams, DiscoverTVResponse, DiscoverTVResult } from '../models/tv.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { form } from '@angular/forms/signals';
import { Country, Genre, DiscoverSortDirection, DiscoverSortField, CombinedMediaResult, MediaType, TmdbConfiguration } from '../models/movie-tv.model';
import { delay, EMPTY, expand, filter, forkJoin, map, takeWhile, tap } from 'rxjs';
import { MultiFilter, SearchMultiResponse, SearchMultiResult } from '../models/multi.model';

export interface SearchModel {
  searchMedia: string;
  multiFilter: MultiFilter;
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
    isLoadingMultiPages = signal<boolean>(false)

    queryMode = signal<QueryMode>(QueryMode.Discover)
    discoverMode = signal<MediaType>(MediaType.Movie)

    loadedMoviePages = signal<DiscoverMovieResponse[]>([])
    loadedTVPages = signal<DiscoverTVResponse[]>([])
    loadedMultiPages = signal<SearchMultiResponse[]>([])

    combinedLoadedMediaResults = computed<CombinedMediaResult[]>(() => {
        const combinedResults: CombinedMediaResult[] = [];

        this.loadedMoviePages().forEach(
            (page) => page.results.forEach(
                (result) => {
                    const newCombinedResult = this.convertMovieResultToCombinedResult(result)
                    if (!combinedResults.some((result) => (result.media_type === newCombinedResult.media_type && result.id === newCombinedResult.id))) {
                        combinedResults.push(newCombinedResult)
                    }
                }
            )
        );
        this.loadedTVPages().forEach(
            (page) => page.results.forEach(
                (result) => {
                    const newCombinedResult = this.convertTVResultToCombinedResult(result)
                    if (!combinedResults.some((result) => (result.media_type === newCombinedResult.media_type && result.id === newCombinedResult.id))) {
                        combinedResults.push(newCombinedResult)
                    }
                }
            )
        );

        this.loadedMultiPages().forEach(
            (page) => page.results.forEach(
                (result) => {
                    const newCombinedResult = this.convertMultiResultToCombinedResult(result)
                    if (Object.values(this.searchModel().multiFilter).includes(newCombinedResult.media_type) && !combinedResults.some((result) => (result.media_type === newCombinedResult.media_type && result.id === newCombinedResult.id))) {
                        combinedResults.push(newCombinedResult)
                    }
                }
            )
        )
        return combinedResults;
    })

    nextMoviePageNumber = computed(() => this.loadedMoviePages().length === 0 ? 1 : this.loadedMoviePages().at(-1)!.page + 1)
    nextTVPageNumber = computed(() => this.loadedTVPages().length === 0 ? 1 : this.loadedTVPages().at(-1)!.page + 1)
    nextMultiPageNumber = computed(() => this.loadedMultiPages().length === 0 ? 1 : this.loadedMultiPages().at(-1)!.page + 1)


    searchModel = signal<SearchModel>({
        searchMedia: '',
        multiFilter: {
            movie: MediaType.Movie,
            tv: MediaType.TV
        }
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

    convertMovieResultToCombinedResult(movieResult: DiscoverMovieResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            media_type: MediaType.Movie,
            backdrop_path: movieResult.backdrop_path,
            genre_ids: movieResult.genre_ids.map(Number),
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

    convertTVResultToCombinedResult(TVResult: DiscoverTVResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            media_type: MediaType.TV,
            backdrop_path: TVResult.backdrop_path,
            genre_ids: TVResult.genre_ids.map(Number),
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

    convertMultiResultToCombinedResult(multiResult: SearchMultiResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            media_type: this.getMediaTypeEnum(multiResult.media_type),
            backdrop_path: multiResult.backdrop_path,
            genre_ids: multiResult.genre_ids,
            id: multiResult.id,
            original_language: multiResult.original_language,
            original_title_name: multiResult.original_name,
            overview: multiResult.overview,
            popularity: multiResult.popularity,
            poster_path: this.getFullPosterUrl(multiResult.poster_path),
            title_name: multiResult.name,
            vote_average: multiResult.vote_average,
            vote_count: multiResult.vote_count
        }
        return newCombinedResult
    }

    getMediaTypeEnum(mediaType: string): MediaType {
        return Object.values(MediaType).find((enumValue) => enumValue === mediaType) as MediaType
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

    clearLoadedMultiPages() {
        this.loadedMultiPages.set([])
    }

    clearAllLoadedPages() {
        this.clearLoadedMovieAndTVPages()
        this.clearLoadedMultiPages()
    }

    addMoviePage(moviePage: DiscoverMovieResponse) {

        this.loadedMoviePages.update((loadedMoviePages) => [...loadedMoviePages, moviePage])
    }

    addTVPage(tvPage: DiscoverTVResponse) {
        this.loadedTVPages.update((loadedTVPages) => [...loadedTVPages, tvPage])
    }

    addMultiPage(multiPage: SearchMultiResponse) {
        this.loadedMultiPages.update((loadedMultiPages) => [...loadedMultiPages, multiPage])
    }

    searchNextMultiPage() {
        if(this.isLoadingMultiPages()) {
            return
        }
        else {
            this.isLoadingMultiPages.set(true)
        }

        this.tmdbApiService.searchMulti(this.searchModel().searchMedia, this.nextMultiPageNumber()).subscribe({
            next: (response) => {
                this.addMultiPage(response)
            },
            error: (err) => {
                console.error(err)
            },
            complete: () => {
                this.isLoadingMultiPages.set(false)
            }
        })
    }

    searchMultiFresh() {
        this.updateQueryMode(QueryMode.Search)
        this.clearAllLoadedPages()
        this.searchNextMultiPage()
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
        this.clearAllLoadedPages()
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
        this.clearAllLoadedPages()
        this.discoverNextTVPage()
    }

    loadNextPage() {
        if(this.queryMode() === QueryMode.Discover) {
            if (this.discoverMode() === MediaType.Movie) {
                this.discoverNextMoviePage()
            }
            else if (this.discoverMode() === MediaType.TV) {
                this.discoverNextTVPage()
            }
        }
        else if (this.queryMode() === QueryMode.Search) {
            this.searchNextMultiPage()
        }
    }

    existsMorePages(): boolean {
        if(this.queryMode() === QueryMode.Discover) {
            if (this.discoverMode() === MediaType.Movie) {
                const lastMoviePage: DiscoverMovieResponse | undefined = this.loadedMoviePages().at(-1)
                return lastMoviePage?.page !== lastMoviePage?.total_pages
            }
            else if (this.discoverMode() === MediaType.TV) {
                const lastTVPage: DiscoverTVResponse | undefined = this.loadedTVPages().at(-1)
                return lastTVPage?.page !== lastTVPage?.total_pages
            }
        }
        else if (this.queryMode() === QueryMode.Search) {
            const lastMultiPage: SearchMultiResponse | undefined = this.loadedMultiPages().at(-1)
            return lastMultiPage?.page !== lastMultiPage?.total_pages
        }
        return false
    }
    
}
