import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImdbService {
  
  // proxy only works in localhost
  // private _IMDB_API_URL = '/IMDB_BASE_URL'
  private _IMDB_API_URL = 'https://www.imdb.com'

  private _IMDB_SEARCH_ENDPOINT = `${this._IMDB_API_URL}/find/?q=`

  constructor(private http: HttpClient) { }

  private _httpOptions: object = {
    responseType: 'text',
    observe: 'response',
  }

  getSearch(title: string) {
    return this.http.get<any>(`${this._IMDB_SEARCH_ENDPOINT}${title}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }
}
