import { inject, Service } from '@angular/core';
import { TmdbApiService } from './tmdb-api-service';

@Service()
export class MediaPlayerService {
    tmdbApiService = inject(TmdbApiService)
    
}
