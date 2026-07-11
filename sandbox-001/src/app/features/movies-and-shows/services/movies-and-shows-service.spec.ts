import { TestBed } from '@angular/core/testing';

import { MoviesAndShowsService } from './movies-and-shows-service';

describe('MoviesAndShowsService', () => {
  let service: MoviesAndShowsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoviesAndShowsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
