import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChristmasCalendarComponent } from './christmas-calendar.component';

describe('ChristmasCalendarComponent', () => {
  let component: ChristmasCalendarComponent;
  let fixture: ComponentFixture<ChristmasCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChristmasCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChristmasCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
