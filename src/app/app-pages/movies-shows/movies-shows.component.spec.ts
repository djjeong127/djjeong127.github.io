import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoviesShowsComponent } from './movies-shows.component';

describe('MoviesShowsComponent', () => {
  let component: MoviesShowsComponent;
  let fixture: ComponentFixture<MoviesShowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoviesShowsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoviesShowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
