import { computed, inject, Service, signal } from '@angular/core';
import { TmdbApiService } from './tmdb-api-service';
import { DiscoverMovieParams, DiscoverMovieResponse, DiscoverMovieResult } from '../models/movie.model';
import { DiscoverTVParams, DiscoverTVResponse, DiscoverTVResult } from '../models/tv.model';

import { form } from '@angular/forms/signals';
import { Country, Genre, DiscoverSortDirection, DiscoverSortField, CombinedMediaResult, MediaType, TmdbConfiguration, QueryMode, SearchMode, SearchModel, QueryModeModel, MultiFilterEnum } from '../models/movie-tv.model';
import { count, forkJoin } from 'rxjs';
import { SearchMultiResponse, SearchMultiResult, TimeWindow, TrendingMultiResponse, TrendingMultiResult } from '../models/multi.model';



@Service()
export class MoviesAndShowsService {
    tmdbApiService = inject(TmdbApiService)

    ListOfCountriesIWant_iso_639_1: string[] = ['00', 'US', 'KR']

    customAllCountries: Country = {
        iso_3166_1: '00',
        english_name: '-- All Countries --',
        native_name: '-- All Countries --'
    }

    customAllGenres: Genre = {
        id: 0,
        name: '-- All Genres --'
    }

    isLoadingMoviePages = signal<boolean>(false)
    isLoadingTVPages = signal<boolean>(false)
    isLoadingSearchMultiPages = signal<boolean>(false)
    isLoadingTrendingMultiPages = signal<boolean>(false)

    tmdbConfiguration = signal<TmdbConfiguration | undefined>(undefined)
    countries = signal<Country[]>([])
    movieGenres = signal<Genre[]>([])
    tvGenres = signal<Genre[]>([])

    queryModeModel = signal<QueryModeModel>({
        queryMode: QueryMode.Search,
        searchMode: SearchMode.Unpopulated,
        discoverMode: MediaType.Movie
    })

    queryModeForm = form(this.queryModeModel)

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
                    if (this.multiFilterMatches(newCombinedResult) && !combinedResults.some((result) => (result.media_type === newCombinedResult.media_type && result.id === newCombinedResult.id))) {
                        combinedResults.push(newCombinedResult)
                    }
                }
            )
        )

        this.loadedTrendingMultiPages().forEach(
            (page) => page.results.forEach(
                (result) => {
                    const newCombinedResult = this.convertTrendingMultiResultToCombinedResult(result)
                    if (this.multiFilterMatches(newCombinedResult) && !combinedResults.some((result) => (result.media_type === newCombinedResult.media_type && result.id === newCombinedResult.id))) {
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
        multiFilter: MultiFilterEnum.MovieAndTV
    })
    searchForm = form(this.searchModel)


    discoverMovieModel = signal<DiscoverMovieParams>({
        page: this.nextMoviePageNumber(),
        sort_by: {
            field: DiscoverSortField.Popularity,
            direction: DiscoverSortDirection.Desc
        },
        with_genre: this.customAllGenres,
        with_origin_country: this.customAllCountries,
    })

    discoverMovieForm = form(this.discoverMovieModel)

    discoverTVModel = signal<DiscoverTVParams>({
        page: this.nextTVPageNumber(),
        sort_by: {
            field: DiscoverSortField.Popularity,
            direction: DiscoverSortDirection.Desc
        },
        with_genre: this.customAllGenres,
        with_origin_country: this.customAllCountries,
    })

    discoverTVForm = form(this.discoverTVModel)



    constructor() {
        this.getMetaData()
    }

    
    multiFilterMatches(combinedMediaResult: CombinedMediaResult): boolean {
        if (this.searchModel().multiFilter === MultiFilterEnum.Movie && combinedMediaResult.media_type === MediaType.Movie) {
            return true
        }
        else if (this.searchModel().multiFilter === MultiFilterEnum.MovieAndTV) {
            return true
        }
        else if (this.searchModel().multiFilter === MultiFilterEnum.TV && combinedMediaResult.media_type === MediaType.TV) {
            return true
        }
        return false
    }

    updateSearchMode(newSearchMode: SearchMode) {
        this.queryModeModel.update((mode) => ({...mode, searchMode: newSearchMode}))
    }

    getFullImageUrl(imagePath: string, imageSize: string = 'original'): string {
        let fullUrl = this.tmdbConfiguration()?.images.secure_base_url + imageSize + imagePath

        if (imagePath === null || imagePath === undefined) {
            fullUrl = '/no_image.png'
        }
        
        return fullUrl
    }

    getMovieGenreFromId(genreId: number): Genre {
        return this.movieGenres().find((genre) => genre.id === genreId)!
    }

    getTVGenreFromId(genreId: number): Genre {
        return this.tvGenres().find((genre) => genre.id === genreId)!
    }

    getMovieGenreFromName(genreName: string): Genre {
        return this.movieGenres().find((genre) => genre.name === genreName)!
    }

    getTVGenreFromName(genreName: string): Genre {
        return this.tvGenres().find((genre) => genre.name === genreName)!
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

    movieGenreNamesStringFromGenreList(genreList: Genre[]): string {
        const orderedGenreList = genreList.sort((a, b) => a.name.localeCompare(b.name))
        let movieGenreNames = ''
        orderedGenreList.forEach((genre) => movieGenreNames += genre.name + ', ')
        movieGenreNames = movieGenreNames.slice(0, -2)
        return movieGenreNames
    }

    TVGenreNamesStringFromGenreList(genreList: Genre[]): string {
        const orderedGenreList = genreList.sort((a, b) => a.name.localeCompare(b.name))
        let tvGenreNames = ''
        orderedGenreList.forEach((genre) => tvGenreNames += genre.name + ', ')
        tvGenreNames = tvGenreNames.slice(0, -2)
        return tvGenreNames
    }

    convertMovieResultToCombinedResult(movieResult: DiscoverMovieResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            adult: movieResult.adult,
            media_type: MediaType.Movie,
            backdrop_path: movieResult.backdrop_path,
            genre_ids: movieResult.genre_ids.map(Number),
            release_date: movieResult.release_date,
            id: movieResult.id,
            original_language: movieResult.original_language,
            original_title_name: movieResult.original_title,
            overview: movieResult.overview,
            popularity: movieResult.popularity,
            poster_path: this.getFullImageUrl(movieResult.poster_path),
            title_name: movieResult.title,
            vote_average: movieResult.vote_average,
            vote_count: movieResult.vote_count
        }
        return newCombinedResult
    }

    convertTVResultToCombinedResult(TVResult: DiscoverTVResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            adult: false,
            media_type: MediaType.TV,
            backdrop_path: TVResult.backdrop_path,
            genre_ids: TVResult.genre_ids.map(Number),
            release_date: TVResult.first_air_date,
            id: TVResult.id,
            original_language: TVResult.original_language,
            original_title_name: TVResult.original_name,
            overview: TVResult.overview,
            popularity: TVResult.popularity,
            poster_path: this.getFullImageUrl(TVResult.poster_path),
            title_name: TVResult.name,
            vote_average: TVResult.vote_average,
            vote_count: TVResult.vote_count
        }
        return newCombinedResult
    }

    convertSearchMultiResultToCombinedResult(searchMultiResult: SearchMultiResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            adult: searchMultiResult.adult,
            media_type: this.getMediaTypeEnum(searchMultiResult.media_type),
            backdrop_path: searchMultiResult.backdrop_path,
            genre_ids: searchMultiResult.genre_ids,
            release_date: searchMultiResult.release_date ? searchMultiResult.release_date : searchMultiResult.first_air_date,
            id: searchMultiResult.id,
            original_language: searchMultiResult.original_language,
            original_title_name: searchMultiResult.original_title ? searchMultiResult.original_title : searchMultiResult.original_name,
            overview: searchMultiResult.overview,
            popularity: searchMultiResult.popularity,
            poster_path: this.getFullImageUrl(searchMultiResult.poster_path),
            title_name: searchMultiResult.title ? searchMultiResult.title : searchMultiResult.name,
            vote_average: searchMultiResult.vote_average,
            vote_count: searchMultiResult.vote_count
        }
        return newCombinedResult
    }

    convertTrendingMultiResultToCombinedResult(trendingMultiResult: TrendingMultiResult): CombinedMediaResult {
        const newCombinedResult: CombinedMediaResult = {
            adult: trendingMultiResult.adult,
            media_type: this.getMediaTypeEnum(trendingMultiResult.media_type),
            backdrop_path: trendingMultiResult.backdrop_path,
            genre_ids: trendingMultiResult.genre_ids,
            release_date: trendingMultiResult.release_date ? trendingMultiResult.release_date : trendingMultiResult.first_air_date,
            id: trendingMultiResult.id,
            original_language: trendingMultiResult.original_language,
            original_title_name: trendingMultiResult.original_title ? trendingMultiResult.original_title : trendingMultiResult.original_name,
            overview: trendingMultiResult.overview,
            popularity: trendingMultiResult.popularity,
            poster_path: this.getFullImageUrl(trendingMultiResult.poster_path),
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
                
                this.countries.update(() => [...this.countries(), this.customAllCountries])
                this.countries.update(() => [...this.countries(), ...getCountriesResponse])
                
                // reduce list of countries to a few selected countries
                // this.countries.set(this.countries().filter((country) => this.ListOfCountriesIWant_iso_639_1.includes(country.iso_3166_1)))

                // order list of countries by name
                this.countries.update((country) => country.sort((a, b) => a.english_name.localeCompare(b.english_name)))

                this.movieGenres.update(() => [...this.movieGenres(), this.customAllGenres])
                this.movieGenres.update(() => [...this.movieGenres(), ...getMovieGenresResponse.genres])

                this.tvGenres.update(() => [...this.tvGenres(), this.customAllGenres])
                this.tvGenres.update(() => [...this.tvGenres(), ...getTVGenresResponse.genres])


                // Set default country filter to All Countries
                this.discoverMovieModel.update((model) => ({...model, with_origin_country: this.getCountry('00')}))
                this.discoverTVModel.update((model) => ({...model, with_origin_country: this.getCountry('00')}))
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
        this.clearAllLoadedPages()
        this.discoverNextTVPage()
    }

    loadPageFresh() {
        if(this.queryModeModel().queryMode === QueryMode.Discover) {
            if (this.queryModeModel().discoverMode === MediaType.Movie) {
                this.discoverMovieFresh()
            }
            else if (this.queryModeModel().discoverMode === MediaType.TV) {
                this.discoverTVFresh()
            }
        }
        else if (this.queryModeModel().queryMode === QueryMode.Search) {
            if (this.queryModeModel().searchMode === SearchMode.Populated) {
                this.searchMultiFresh()
            }
            else if (this.queryModeModel().searchMode === SearchMode.Unpopulated) {
                this.trendingMultiFresh()
            }
        }
    }

    loadNextPage() {
        if(this.queryModeModel().queryMode === QueryMode.Discover) {
            if (this.queryModeModel().discoverMode === MediaType.Movie) {
                this.discoverNextMoviePage()
            }
            else if (this.queryModeModel().discoverMode === MediaType.TV) {
                this.discoverNextTVPage()
            }
        }
        else if (this.queryModeModel().queryMode === QueryMode.Search) {
            if (this.queryModeModel().searchMode === SearchMode.Populated) {
                this.searchNextMultiPage()
            }
            else if (this.queryModeModel().searchMode === SearchMode.Unpopulated) {
                this.trendingNextMultiPage()
            }
        }
    }

    existsMorePages(): boolean {
        if(this.queryModeModel().queryMode === QueryMode.Discover) {
            if (this.queryModeModel().discoverMode === MediaType.Movie) {
                const lastMoviePage: DiscoverMovieResponse | undefined = this.loadedMoviePages().at(-1)
                return lastMoviePage?.page !== lastMoviePage?.total_pages
            }
            else if (this.queryModeModel().discoverMode === MediaType.TV) {
                const lastTVPage: DiscoverTVResponse | undefined = this.loadedTVPages().at(-1)
                return lastTVPage?.page !== lastTVPage?.total_pages
            }
        }
        else if (this.queryModeModel().queryMode === QueryMode.Search) {
            if (this.queryModeModel().searchMode === SearchMode.Populated) {
                const lastMultiPage: SearchMultiResponse | undefined = this.loadedSearchMultiPages().at(-1)
                return lastMultiPage?.page !== lastMultiPage?.total_pages
            }
            else if (this.queryModeModel().searchMode === SearchMode.Unpopulated) {
                const lastMultiPage: TrendingMultiResponse | undefined = this.loadedTrendingMultiPages().at(-1)
                return lastMultiPage?.page !== lastMultiPage?.total_pages
            }
            
        }
        return false
    }
    
}
