import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';

@Service()
export class VidsrcApiService {
    private http = inject(HttpClient);

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
    private vidsrcTVURL = this.vidsrcBaseUrl + '/embed/tv?tmdb='

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
                return this.cleanHtmlDocument(response)
            })
        )
    }

    getVidsrcTV(tvId: number, season: number, episode: number) {
        return this.http.get(this.vidsrcTVURL + `${tvId}&season=${season}&episode=${episode}`, this.httpOptions).pipe(
            map((response) => {
                return this.cleanHtmlDocument(response)
            })
        )
    }



    cleanHtmlDocument(rawHtml: string): string {
        if (!rawHtml) return '';

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        // 1. Remove broken relative stylesheet link tags causing MIME/404 errors
        doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.startsWith('/') && !href.startsWith('//')) {
            link.remove();
            }
        });

        // 2. Select and completely remove explicit ad elements from the layout
        const adSelectors = [
            '#AdWidgetContainer',
            '#ad720',
            '.ad_container',
            '#onexbet',
            '#histats_counter'
        ];

        adSelectors.forEach(selector => {
            doc.querySelectorAll(selector).forEach(element => element.remove());
        });

        // 3. Purge ad-specific CSS rules inside internal <style> blocks
        doc.querySelectorAll('style').forEach(styleNode => {
            if (styleNode.textContent) {
            if (/ad720|AdWidget|onexbet/i.test(styleNode.textContent)) {
                styleNode.remove();
            }
            }
        });

        // 4. Target and drop tracking script configurations, anti-devtool, and host overrides
        doc.querySelectorAll('script').forEach(script => {
            const src = script.getAttribute('src') || '';
            const textContent = script.textContent || '';

            if (
            src.includes('disable-devtool') || 
            src.includes('histats.com') ||     
            src.includes('cloudorchestranova.com') ||
            textContent.includes('Histats') || 
            textContent.includes('_Hasync') ||
            // Drops scripts attempting to hook document properties or domain variables
            textContent.includes('cloudorchestranova.com') 
            ) {
            script.remove();
            }
        });

        // 5. Clean layout fallback wrappers
        doc.querySelectorAll('noscript').forEach(noscript => {
            if (noscript.innerHTML.includes('histats')) {
            noscript.remove();
            }
        });

        return doc.documentElement.outerHTML;
        }
}
