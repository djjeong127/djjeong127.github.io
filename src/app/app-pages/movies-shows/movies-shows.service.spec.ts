import { TestBed } from '@angular/core/testing';

import { MoviesShowsService } from './movies-shows.service';

describe('MoviesShowsService', () => {
  let service: MoviesShowsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoviesShowsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
