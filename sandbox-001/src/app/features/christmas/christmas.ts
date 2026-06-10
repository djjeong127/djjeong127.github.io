import { Component, inject } from '@angular/core';
import { Dates } from './services/dates';

@Component({
  selector: 'app-christmas',
  imports: [],
  templateUrl: './christmas.html',
  styleUrl: './christmas.scss',
})
export class Christmas {
  dates = inject(Dates)
centered: any;

}
