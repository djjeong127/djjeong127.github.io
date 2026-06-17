import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { config, Observable } from 'rxjs';
import { DiscoverMovieParams, DiscoverMovieSortBy, DiscoverSearchMovieResponse, GetMovieDetailResponse } from '../models/movie.model';
import { DiscoverTVParams, DiscoverTVResponse, DiscoverTVSortBy, SearchTVResponse } from '../models/tv.model';
import { Country, Genre, GenresResponse, TmdbConfiguration } from '../models/movie-tv.model';
import { shareReplay } from 'rxjs';

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
    private searchMovieUrl = this.baseUrl + '/search/movie';
    private searchTVUrl = this.baseUrl + '/search/tv';
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

    discoverMovie(params: DiscoverMovieParams): Observable<DiscoverSearchMovieResponse> {
        let withGenres: string = ''
        if (params.with_genres.length > 0) {
            params.with_genres?.forEach((genre) => withGenres += genre.id + ',')
        }

        let withoutGenres: string = ''
        if (params.without_genres.length > 0) {
            params.without_genres?.forEach((genre) => withoutGenres += genre.id + ',')
        }

        const movieParams = this.params
            .set('page', params.page)
            .set('sort_by', `${params.sort_by.field}.${params.sort_by.direction}`)
            .set('with_genres', withGenres.slice(0, -1))
            .set('with_origin_country', params.with_origin_country.iso_3166_1)
            .set('without_genres', withoutGenres.slice(0, -1))

        return this.http.get<DiscoverSearchMovieResponse>(this.discoverMovieUrl, {headers: this.header, params: movieParams})
    }

    searchMovie(movie: string, page: number): Observable<DiscoverSearchMovieResponse> {
        const movieParams = this.params
            .set('query', movie)
            .set('page', page)
        return this.http.get<DiscoverSearchMovieResponse>(this.searchMovieUrl, {headers: this.header, params: movieParams}).pipe(
            shareReplay({bufferSize: 10, refCount: true})
        )
    }

    getMovieDetail(movieId: number): Observable<GetMovieDetailResponse> {
        const movieParams = this.params.delete('include_adult')
        return this.http.get<GetMovieDetailResponse>(this.getMovieDetailUrl + `/${movieId}`, {headers: this.header, params: movieParams})
    }


    discoverTV(params: DiscoverTVParams): Observable<DiscoverTVResponse> {
        let withGenres: string = ''
        if (params.with_genres.length > 0) {
            params.with_genres?.forEach((genre) => withGenres += genre.id + ',')
        }

        let withoutGenres: string = ''
        if (params.without_genres.length > 0) {
            params.without_genres?.forEach((genre) => withoutGenres += genre.id + ',')
        }
        const tvParams = this.params
            .set('page', params.page)
            .set('sort_by', `${params.sort_by.field}.${params.sort_by.direction}`)
            .set('with_genres', withGenres.slice(0, -1))
            .set('with_origin_country', params.with_origin_country.iso_3166_1)
            .set('without_genres', withoutGenres.slice(0, -1))
        return this.http.get<DiscoverTVResponse>(this.discoverTVUrl, {headers: this.header, params: tvParams})
    }

    searchTV(tv: string, page: number): Observable<SearchTVResponse> {
        const tvParams = this.params
            .set('query', tv)
            .set('page', page)
        return this.http.get<SearchTVResponse>(this.searchTVUrl, {headers: this.header, params: tvParams})
    }
    
    
}
