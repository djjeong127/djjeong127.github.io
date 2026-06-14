import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { IMediaInfo } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  
  public TMDB_POSTER_PATH_URL = 'https://image.tmdb.org/t/p/w500'
  private _TMDB_API_URL = 'https://api.themoviedb.org/3';

  private _TMDB_TRENDING_ENDPOINT = `${this._TMDB_API_URL}/trending/all/week`;

  private _TMDB_SEARCH_MULTI_ENDPOINT = `${this._TMDB_API_URL}/search/multi`;
  private _TMDB_MOVIE_DETAILS_ENDPOINT = `${this._TMDB_API_URL}/movie`;
  private _TMDB_TV_DETAILS_ENDPOINT = `${this._TMDB_API_URL}/tv`;

  private _TMDB_MOVIE_GENRES = `${this._TMDB_API_URL}/genre/movie/list`
  private _TMDB_TV_GENRES = `${this._TMDB_API_URL}/genre/tv/list`
  


  private _httpOptions: object = {
    headers: {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjIzNjlmZTRjOWU0NmUyZjk3YjExM2ZkODM2ZWZkOSIsIm5iZiI6MTcwMTI5NDQzMC40NzksInN1YiI6IjY1NjdiMTVlNmMwYjM2MDBhZTUwNGI4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w9CbNfyRS54DMDwag6-YcAmGjVqbi3KZj1S3UdelaPw'
    },
    observe: 'response'
  }

  private _httpSearchOptions: object = Object.defineProperty(structuredClone(this._httpOptions), 'params', {value: {include_adult: 'false'}});


  constructor(private http: HttpClient) {}

  getTrending(page: number) {
    return this.http.get<any>(`${this._TMDB_TRENDING_ENDPOINT}?page=${page}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  getMoviesShows(title: string, page: number) {
    return this.http.get<any>(`${this._TMDB_SEARCH_MULTI_ENDPOINT}?query=${title}&page=${page}`, this._httpSearchOptions).pipe(
      map(x => x.body)
    )
  }

  getMovieDetails(tmdbID: string) {
    return this.http.get<any>(`${this._TMDB_MOVIE_DETAILS_ENDPOINT}/${tmdbID}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  getShowDetails(tmdbID: string) {
    return this.http.get<any>(`${this._TMDB_TV_DETAILS_ENDPOINT}/${tmdbID}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  getSeasonDetails(tmdbID: string, season: number) {
    return this.http.get<any>(`${this._TMDB_TV_DETAILS_ENDPOINT}/${tmdbID}/season/${season}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  getEpisodeDetails(tmdbID: string, season: number, episode: number) {
    return this.http.get<any>(`${this._TMDB_TV_DETAILS_ENDPOINT}/${tmdbID}/season/${season}/episode/${episode}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  getMovieGenres() {
    return this.http.get<any>(this._TMDB_MOVIE_GENRES, this._httpOptions).pipe(
      map(x => x.body.genres)
    )
  }
  getTVGenres() {
    return this.http.get<any>(this._TMDB_TV_GENRES, this._httpOptions).pipe(
      map(x => x.body.genres)
    )
  }

}
