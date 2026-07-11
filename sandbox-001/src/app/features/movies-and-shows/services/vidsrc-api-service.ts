import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs';

@Service()
export class VidsrcApiService {
    private http = inject(HttpClient);
    sanitizer = inject(DomSanitizer)

    // The vidsrc player will not run properly locally (test by changing the urls and deploying)
    // Base Url proxys for localhost testing (remember to rebuild and npm start after changing the proxies in proxy.conf.json)
    // private VIDSRC_DOMAINS_URL = '/api-vidsrc-domains'
    // private VIDSRC_API = '/api-vidsrc-vidsrcme.ru'

    // Base Urls for deployments
    private VIDSRC_DOMAINS_URL = 'https://vidsrc.domains'
    private VIDSRC_API = 'https://vidsrcme.ru'



    private vidsrcDomainsUrl = this.VIDSRC_DOMAINS_URL
    private vidsrcBaseUrl = this.VIDSRC_API
    
    private vidsrcMovieUrl = this.vidsrcBaseUrl + '/embed/movie?tmdb='
    private vidsrcTVUrl = this.vidsrcBaseUrl + '/embed/tv?tmdb='

    private httpOptions = {
        responseType: 'text',
        // observe: 'response'
    } as const

    // getVidSrcDomains() {
    //     return this.http.get(this.vidsrcDomainsUrl, this.httpOptions).pipe(
    //         map((response) => {
    //             console.log(response)
    //         })
    //     )
    // }

    getVidsrcMovie(movieId: number) {
        return this.http.get(this.vidsrcMovieUrl + movieId, this.httpOptions).pipe(
            map((response) => {
                // disable correct return for iframe src
                return ''
                
                // return this.sanitizer.bypassSecurityTrustResourceUrl(this.extractIframeSrc(response))
            })
        )
    }

    getVidsrcTV(tvId: number, season: number, episode: number) {
        return this.http.get(this.vidsrcTVUrl + `${tvId}&season=${season}&episode=${episode}`, this.httpOptions).pipe(
            map((response) => {
                // disable correct return for iframe src
                return ''

                // return this.sanitizer.bypassSecurityTrustResourceUrl(this.extractIframeSrc(response))
            })
        )
    }

    extractIframeSrc(rawHtml: string): string {
        if (!rawHtml) return '';

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        // Query for the first iframe element in the document
        const iframe = doc.querySelector('iframe');
        
        // Return the src attribute if it exists, otherwise an empty string
        return iframe ? (iframe.getAttribute('src') || '') : '';
    }

}
