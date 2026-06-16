import { inject, Service, signal } from '@angular/core';
import { TmdbApiService } from './tmdb-api-service';

export enum MediaType {
    'Movie' = 'movie',
    'TV' = 'tv'
}

@Service()
export class MoviesAndShowsService {
    tmdbApiService = inject(TmdbApiService)

    selectedMedia = signal<any>(null)

    
}
