import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { DiscoverSearchMovieResponse, GetMovieDetailResponse } from '../models/movie.model';
import { DiscoverTVResponse, SearchTVResponse } from '../models/tv.model';

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



    discoverMovie(): Observable<DiscoverSearchMovieResponse> {
        const movieParams = this.params
            .set('page', 1)
            .set('sort_by', 'asd')
            .set('with_genres', '')
            .set('with_origin_country', '')
            .set('with_original_language', '')
            .set('without_genres', '')

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
