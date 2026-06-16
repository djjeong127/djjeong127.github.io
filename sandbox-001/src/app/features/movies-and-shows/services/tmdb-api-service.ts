import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { DiscoverMovieSortBy, DiscoverMovieSortField, DiscoverSearchMovieResponse, GetMovieDetailResponse } from '../models/movie.model';
import { DiscoverTVResponse, SearchTVResponse } from '../models/tv.model';
import { Country, Genre, SortDirection } from '../models/movie-tv.model';

@Service()
export class TmdbApiService {
    private http = inject(HttpClient);

    private baseUrl = 'https://api.themoviedb.org/3';

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



    discoverMovie(page: number = 1, sort_by: DiscoverMovieSortBy = {field: DiscoverMovieSortField.Popularity, direction: SortDirection.Asc}, with_genres: Genre[] = [], with_origin_country: Country = {iso_3166_1: 'US', english_name: 'United States of America', native_name: 'United States'}, without_genres: Genre[] = []): Observable<DiscoverSearchMovieResponse> {
        let withGenres: string = ''
        if (with_genres.length > 0) {
            with_genres?.forEach((genre) => withGenres += genre.id + ',')
        }

        let withoutGenres: string = ''
        if (without_genres.length > 0) {
            without_genres?.forEach((genre) => withoutGenres += genre.id + ',')
        }

        const movieParams = this.params
            .set('page', page)
            .set('sort_by', `${sort_by.field}.${sort_by.direction}`)
            .set('with_genres', withGenres.slice(0, -1))
            .set('with_origin_country', with_origin_country.iso_3166_1)
            .set('without_genres', withoutGenres.slice(0, -1))

        return this.http.get<DiscoverSearchMovieResponse>(this.discoverMovieUrl, {headers: this.header, params: movieParams})
    }

    discoverTV(): Observable<DiscoverTVResponse> {
        return this.http.get<DiscoverTVResponse>(this.discoverTVUrl, {headers: this.header, params: this.params})
    }

    searchMovie(movie: string): Observable<DiscoverSearchMovieResponse> {
        const movieParams = this.params.set('query', movie)
        return this.http.get<DiscoverSearchMovieResponse>(this.searchMovieUrl, {headers: this.header, params: movieParams})
    }

    searchTV(tv: string): Observable<SearchTVResponse> {
        const tvParams = this.params.set('query', tv)
        return this.http.get<SearchTVResponse>(this.searchTVUrl, {headers: this.header, params: tvParams})
    }

    getMovieDetail(movieId: number): Observable<GetMovieDetailResponse> {
        const movieParams = this.params.delete('include_adult')
        return this.http.get<GetMovieDetailResponse>(this.getMovieDetailUrl + `/${movieId}`, {headers: this.header, params: movieParams})
    }
}
