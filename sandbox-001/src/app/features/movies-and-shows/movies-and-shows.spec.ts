import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoviesAndShows } from './movies-and-shows';

describe('MoviesAndShows', () => {
  let component: MoviesAndShows;
  let fixture: ComponentFixture<MoviesAndShows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoviesAndShows],
    }).compileComponents();

    fixture = TestBed.createComponent(MoviesAndShows);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
