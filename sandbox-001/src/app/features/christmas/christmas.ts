import { Component, inject } from '@angular/core';
import { ChristmasService } from './services/christmas-service';

@Component({
  selector: 'app-christmas',
  imports: [],
  templateUrl: './christmas.html',
  styleUrl: './christmas.scss',
})
export class Christmas {
  christmasService = inject(ChristmasService)

}
