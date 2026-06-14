import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VidsrcService {

  // private EDGE_DELIVERY_NETWORK_API_URL= '/EDGE_DELIVERY_NETWORK_BASE_URL'
  // public EDGE_DELIVERY_NETWORK_API_URL = 'https://edgedeliverynetwork.com'

  // proxies only work with localhost
  //  Has no ads
  //  private _VIDSRC_API_URL = '/VIDSRCME_VIDSRC_ICU_BASE_URL'

  //  Has ads
  //  private _VIDSRC_API_URL = '/VIDSRC_ME_BASE_URL'

   private _VIDSRC_API_URL = 'https://vidsrcme.vidsrc.icu'


  private _IMDB_MOVIE_ENDPOINT = `${this._VIDSRC_API_URL}/embed/movie?imdb=`
  private _IMDB_SHOW_ENDPOINT = `${this._VIDSRC_API_URL}/embed/tv?imdb=`

  private _TMDB_MOVIE_ENDPOINT = `${this._VIDSRC_API_URL}/embed/movie?tmdb=`
  private _TMDB_SHOW_ENDPOINT = `${this._VIDSRC_API_URL}/embed/tv?tmdb=`

  private _httpOptions: object = {
    responseType: 'text',
    observe: 'response',
    // params: {
    //   ds_lang: 'ko'
    // }
  };

  constructor(private http: HttpClient) { }

  // getIMDBMovie(imdbID: string): Observable<string> {
  //   return this.http.get<any>(`${this._IMDB_MOVIE_ENDPOINT}${imdbID}`, this._httpOptions).pipe(
  //     map(x => x.body)
  //   )
  // }

  // getIMDBShow(imdbID: string, season: number, episode: number): Observable<string> {
  //   return this.http.get<any>(`${this._IMDB_SHOW_ENDPOINT}${imdbID}&season=${season}&episode=${episode}`, this._httpOptions).pipe(
  //     map(x => x.body)
  //   )
  // }

  getTMDBMovie(tmdbID: string): Observable<string> {
    return this.http.get<any>(`${this._TMDB_MOVIE_ENDPOINT}${tmdbID}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  getTMDBShow(tmdbID: string, season: number, episode: number): Observable<string> {
    return this.http.get<any>(`${this._TMDB_SHOW_ENDPOINT}${tmdbID}&season=${season}&episode=${episode}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

}