import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Christmas } from './christmas';

describe('Christmas', () => {
  let component: Christmas;
  let fixture: ComponentFixture<Christmas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Christmas],
    }).compileComponents();

    fixture = TestBed.createComponent(Christmas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
