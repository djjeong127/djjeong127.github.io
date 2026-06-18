import { computed, inject, Service, signal } from '@angular/core';
import { TmdbApiService } from './tmdb-api-service';
import { DiscoverMovieParams, DiscoverMovieResponse, DiscoverMovieResult } from '../models/movie.model';
import { DiscoverTVParams, DiscoverTVResponse, DiscoverTVResult } from '../models/tv.model';

import { form } from '@angular/forms/signals';
import { Country, Genre, DiscoverSortDirection, DiscoverSortField, CombinedMediaResult, MediaType, TmdbConfiguration, QueryMode, SearchMode, SearchModel } from '../models/movie-tv.model';
import { forkJoin } from 'rxjs';
import { SearchMultiResponse, SearchMultiResult, TimeWindow, TrendingMultiResponse, TrendingMultiResult } from '../models/multi.model';



@Service()
export class MoviesAndShowsService {
    tmdbApiService = inject(TmdbApiService)

    isLoadingMoviePages = signal<boolean>(false)
    isLoadingTVPages = signal<boolean>(false)
    isLoadingSearchMultiPages = signal<boolean>(false)
    isLoadingTrendingMultiPages = signal<boolean>(false)

    queryMode = signal<QueryMode>(QueryMode.Search)
    searchMode = signal<SearchMode>(SearchMode.Unpopulated)
    discoverMode = signal<MediaType>(MediaType.Movie)

    loadedMoviePages = signal<DiscoverMovieResponse[]>([])
    loadedTVPages = signal<DiscoverTVResponse[]>([])
    loadedSearchMultiPages = signal<SearchMultiResponse[]>([])
    loadedTrendingMultiPages = signal<TrendingMultiResponse[]>([])

    timeWindow = signal<TimeWindow>(TimeWindow.Week)

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

        this.loadedSearchMultiPages().forEach(
            (page) => page.results.forEach(
                (result) => {
                    const newCombinedResult = this.convertSearchMultiResultToCombinedResult(result)
                    if (Object.values(this.searchModel().multiFilter).includes(newCombinedResult.media_type) && !combinedResults.some((result) => (result.media_type === newCombinedResult.media_type && result.id === newCombinedResult.id))) {
                        combinedResults.push(newCombinedResult)
                    }
                }
            )
        )

        this.loadedTrendingMultiPages().forEach(
            (page) => page.results.forEach(
                (result) => {
                    const newCombinedResult = this.convertTrendingMultiResultToCombinedResult(result)
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
    nextSearchMultiPageNumber = computed(() => this.loadedSearchMultiPages().length === 0 ? 1 : this.loadedSearchMultiPages().at(-1)!.page + 1)
    nextTrendingMultiPageNumber = computed(() => this.loadedTrendingMultiPages().length === 0 ? 1 : this.loadedTrendingMultiPages().at(-1)!.page + 1)

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

    updateSearchMode(searchMode: SearchMode) {
        this.searchMode.set(searchMode)
    }

    updateDiscoverMode(mediaType: MediaType) {
        this.discoverMode.set(mediaType)
    }

    getFullPosterUrl(posterPath: string, posterSize: string = this.tmdbConfiguration()?.images.poster_sizes.find((size) => size === 'original')!): string {
        const fullUrl = this.tmdbConfiguration()?.images.secure_base_url + posterSize + posterPath
        return fullUrl
    }

    getMovieGenreName(genreId: number): string {
        return this.movieGenres().find((genre) => genre.id === genreId)!.name
    }

    getTVGenreName(genreId: number): string {
        return this.tvGenres().find((genre) => genre.id === genreId)!.name
    }

    movieGenreNamesStringFromIdList(genreIdList: number[]): string {
        let movieGenreNames = ''
        genreIdList.forEach((id) => movieGenreNames += this.getMovieGenreName(id) + ', ')
        movieGenreNames = movieGenreNames.slice(0, -2)
        return movieGenreNames
    }

    TVGenreNamesStringFromIdList(genreIdList: number[]): string {
        let tvGenreNames = ''
        genreIdList.forEach((id) => tvGenreNames += this.getTVGenreName(id) + ', ')
        tvGenreNames = tvGenreNames.slice(0, -2)
        return tvGenreNames
    }

    convertMovieResultToCombinedResult(movieResult: DiscoverMovieResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            media_type: MediaType.Movie,
            backdrop_path: movieResult.backdrop_path,
            genre_ids: movieResult.genre_ids.map(Number),
            release_date: movieResult.release_date,
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
            release_date: TVResult.first_air_date,
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

    convertSearchMultiResultToCombinedResult(searchMultiResult: SearchMultiResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            media_type: this.getMediaTypeEnum(searchMultiResult.media_type),
            backdrop_path: searchMultiResult.backdrop_path,
            genre_ids: searchMultiResult.genre_ids,
            release_date: searchMultiResult.release_date ? searchMultiResult.release_date : searchMultiResult.first_air_date,
            id: searchMultiResult.id,
            original_language: searchMultiResult.original_language,
            original_title_name: searchMultiResult.original_title ? searchMultiResult.original_title : searchMultiResult.original_name,
            overview: searchMultiResult.overview,
            popularity: searchMultiResult.popularity,
            poster_path: this.getFullPosterUrl(searchMultiResult.poster_path),
            title_name: searchMultiResult.title ? searchMultiResult.title : searchMultiResult.name,
            vote_average: searchMultiResult.vote_average,
            vote_count: searchMultiResult.vote_count
        }
        return newCombinedResult
    }

    convertTrendingMultiResultToCombinedResult(trendingMultiResult: TrendingMultiResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            media_type: this.getMediaTypeEnum(trendingMultiResult.media_type),
            backdrop_path: trendingMultiResult.backdrop_path,
            genre_ids: trendingMultiResult.genre_ids,
            release_date: trendingMultiResult.release_date ? trendingMultiResult.release_date : trendingMultiResult.first_air_date,
            id: trendingMultiResult.id,
            original_language: trendingMultiResult.original_language,
            original_title_name: trendingMultiResult.original_title ? trendingMultiResult.original_title : trendingMultiResult.original_name,
            overview: trendingMultiResult.overview,
            popularity: trendingMultiResult.popularity,
            poster_path: this.getFullPosterUrl(trendingMultiResult.poster_path),
            title_name: trendingMultiResult.title ? trendingMultiResult.title : trendingMultiResult.name,
            vote_average: trendingMultiResult.vote_average,
            vote_count: trendingMultiResult.vote_count
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

    clearLoadedSearchMultiPages() {
        this.loadedSearchMultiPages.set([])
    }

    clearLoadedTrendingMultiPages() {
        this.loadedTrendingMultiPages.set([])
    }

    clearLoadedSearchMultiAndTrendingMultiPages() {
        this.clearLoadedSearchMultiPages()
        this.clearLoadedTrendingMultiPages()
    }

    clearAllLoadedPages() {
        this.clearLoadedMovieAndTVPages()
        this.clearLoadedSearchMultiAndTrendingMultiPages()
    }

    addMoviePage(moviePage: DiscoverMovieResponse) {

        this.loadedMoviePages.update((loadedMoviePages) => [...loadedMoviePages, moviePage])
    }

    addTVPage(tvPage: DiscoverTVResponse) {
        this.loadedTVPages.update((loadedTVPages) => [...loadedTVPages, tvPage])
    }

    addSearchMultiPage(searchMultiPage: SearchMultiResponse) {
        this.loadedSearchMultiPages.update((loadedSearchMultiPages) => [...loadedSearchMultiPages, searchMultiPage])
    }

    addTrendingMultiPage(trendingMultiPage: TrendingMultiResponse) {
        this.loadedTrendingMultiPages.update((loadedTrendingMultiPages) => [...loadedTrendingMultiPages, trendingMultiPage])
    }

    searchNextMultiPage() {
        if(this.isLoadingSearchMultiPages()) {
            return
        }
        else {
            this.isLoadingSearchMultiPages.set(true)
        }

        this.tmdbApiService.searchMulti(this.searchModel().searchMedia, this.nextSearchMultiPageNumber()).subscribe({
            next: (response) => {
                this.addSearchMultiPage(response)
            },
            error: (err) => {
                console.error(err)
            },
            complete: () => {
                this.isLoadingSearchMultiPages.set(false)
            }
        })
    }

    searchMultiFresh() {
        this.updateQueryMode(QueryMode.Search)
        this.updateSearchMode(SearchMode.Populated)
        this.clearAllLoadedPages()
        this.searchNextMultiPage()
    }

    trendingNextMultiPage() {
        if(this.isLoadingTrendingMultiPages()) {
            return
        }
        else {
            this.isLoadingTrendingMultiPages.set(true)
        }

        this.tmdbApiService.trendingMulti(this.timeWindow(), this.nextTrendingMultiPageNumber()).subscribe({
            next: (response) => {
                this.addTrendingMultiPage(response)
            },
            error: (err) => {
                console.error(err)
            },
            complete: () => {
                this.isLoadingTrendingMultiPages.set(false)
            }
        })
    }

    trendingMultiFresh() {
        this.updateQueryMode(QueryMode.Search)
        this.updateSearchMode(SearchMode.Unpopulated)
        this.clearAllLoadedPages()
        this.trendingNextMultiPage()
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

    loadPageFresh() {
        if(this.queryMode() === QueryMode.Discover) {
            if (this.discoverMode() === MediaType.Movie) {
                this.discoverMovieFresh()
            }
            else if (this.discoverMode() === MediaType.TV) {
                this.discoverTVFresh()
            }
        }
        else if (this.queryMode() === QueryMode.Search) {
            if (this.searchMode() === SearchMode.Populated) {
                this.searchMultiFresh()
            }
            else if (this.searchMode() === SearchMode.Unpopulated) {
                this.trendingMultiFresh()
            }
        }
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
            if (this.searchMode() === SearchMode.Populated) {
                this.searchNextMultiPage()
            }
            else if (this.searchMode() === SearchMode.Unpopulated) {
                this.trendingNextMultiPage()
            }
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
            if (this.searchMode() === SearchMode.Populated) {
                const lastMultiPage: SearchMultiResponse | undefined = this.loadedSearchMultiPages().at(-1)
                return lastMultiPage?.page !== lastMultiPage?.total_pages
            }
            else if (this.searchMode() === SearchMode.Unpopulated) {
                const lastMultiPage: TrendingMultiResponse | undefined = this.loadedTrendingMultiPages().at(-1)
                return lastMultiPage?.page !== lastMultiPage?.total_pages
            }
            
        }
        return false
    }
    
}
