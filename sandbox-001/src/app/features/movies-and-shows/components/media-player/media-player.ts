import { Component, inject, input } from '@angular/core';
import { MediaType } from '../../models/movie-tv.model';
import { MoviesAndShowsService } from '../../services/movies-and-shows-service';

@Component({
  selector: 'app-media-player',
  imports: [],
  templateUrl: './media-player.html',
  styleUrl: './media-player.scss',
})
export class MediaPlayer {
  media_type = input.required<MediaType>();
  id = input.required<number>();

  moviesAndShowsService = inject(MoviesAndShowsService)
  
}
