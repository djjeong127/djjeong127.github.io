import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { config, Observable } from 'rxjs';
import { DiscoverMovieParams, DiscoverMovieResponse, DiscoverMovieSortBy, GetMovieDetailResponse } from '../models/movie.model';
import { DiscoverTVParams, DiscoverTVResponse, DiscoverTVSortBy } from '../models/tv.model';
import { Country, Genre, GenresResponse, TmdbConfiguration } from '../models/movie-tv.model';
import { shareReplay } from 'rxjs';
import { SearchMultiResponse, TimeWindow, TrendingMultiResponse } from '../models/multi.model';

@Service()
export class TmdbApiService {
    private http = inject(HttpClient);

    private baseUrl = 'https://api.themoviedb.org/3';

    private configurationUrl = this.baseUrl + '/configuration';
    private countriesUrl = this.baseUrl + '/configuration/countries';

    private movieGenresUrl = this.baseUrl + '/genre/movie/list';
    private tvGenresUrl = this.baseUrl + '/genre/tv/list'

    private discoverMovieUrl = this.baseUrl + '/discover/movie';
    private discoverTVUrl = this.baseUrl + '/discover/tv';

    private searchMultiUrl = this.baseUrl + '/search/multi';
    private trendingMultiUrl = this.baseUrl + '/trending/all'

    private getMovieDetailUrl = this.baseUrl + '/movie';

    private header = new HttpHeaders().set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjIzNjlmZTRjOWU0NmUyZjk3YjExM2ZkODM2ZWZkOSIsIm5iZiI6MTcwMTI5NDQzMC40NzksInN1YiI6IjY1NjdiMTVlNmMwYjM2MDBhZTUwNGI4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w9CbNfyRS54DMDwag6-YcAmGjVqbi3KZj1S3UdelaPw')
    private params = new HttpParams()
        .set('include_adult', false)
        .set('language', 'en-Us')
        // .set('language', 'ko-KR')


    getConfiguration(): Observable<TmdbConfiguration> {
        const configParams = this.params
            .delete('include_adult')
            .delete('language')
        return this.http.get<TmdbConfiguration>(this.configurationUrl, {headers: this.header, params: configParams})
    }

    getCountries(): Observable<Country[]> {
        const countryParams = this.params.delete('include_adult')
        return this.http.get<Country[]>(this.countriesUrl, {headers: this.header, params: countryParams})
    }

    getMovieGenres(): Observable<GenresResponse> {
        const movieGenresParams = this.params.delete('include_adult')
        return this.http.get<GenresResponse>(this.movieGenresUrl, {headers: this.header, params: movieGenresParams})
    }

    getTVGenres() {
        const tvGenresParams = this.params.delete('include_adult')
        return this.http.get<GenresResponse>(this.tvGenresUrl, {headers: this.header, params: tvGenresParams})
    }

    discoverMovie(params: DiscoverMovieParams): Observable<DiscoverMovieResponse> {

        let movieParams = this.params
            .set('page', params.page)
            .set('sort_by', `${params.sort_by.field}.${params.sort_by.direction}`)
        
        if (params.with_origin_country.iso_3166_1 !== '00')  {
            movieParams = movieParams.set('with_origin_country', params.with_origin_country.iso_3166_1)
        }

        if (params.with_genre.id !== 0)  {
            movieParams = movieParams.set('with_genres', params.with_genre.id)
        }

        return this.http.get<DiscoverMovieResponse>(this.discoverMovieUrl, {headers: this.header, params: movieParams})
    }

    discoverTV(params: DiscoverTVParams): Observable<DiscoverTVResponse> {

        let tvParams = this.params
            .set('page', params.page)
            .set('sort_by', `${params.sort_by.field}.${params.sort_by.direction}`)
        
        if (params.with_origin_country.iso_3166_1 !== '00')  {
            tvParams = tvParams.set('with_origin_country', params.with_origin_country.iso_3166_1)
        }

        if (params.with_genre.id !== 0)  {
            tvParams = tvParams.set('with_genres', params.with_genre.id)
        }
        
        return this.http.get<DiscoverTVResponse>(this.discoverTVUrl, {headers: this.header, params: tvParams})
    }

    searchMulti(searchMedia: string, page: number): Observable<SearchMultiResponse> {
        const searchMultiParams = this.params
            .set('query', searchMedia)
            .set('page', page)
        return this.http.get<SearchMultiResponse>(this.searchMultiUrl, {headers: this.header, params: searchMultiParams})
    }

    trendingMulti(timeWindow: TimeWindow, page: number): Observable<TrendingMultiResponse> {
        const trendingMultiParams = this.params
            .delete('include_adult')
            .set('page', page)
        return this.http.get<TrendingMultiResponse>(this.trendingMultiUrl + `/${timeWindow}`, {headers: this.header, params: trendingMultiParams})
    }
    
    getMovieDetail(movieId: number): Observable<GetMovieDetailResponse> {
        const movieParams = this.params.delete('include_adult')
        return this.http.get<GetMovieDetailResponse>(this.getMovieDetailUrl + `/${movieId}`, {headers: this.header, params: movieParams})
    }
}
