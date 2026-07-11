import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiveUsThisDayOur } from './give-us-this-day-our';

describe('GiveUsThisDayOur', () => {
  let component: GiveUsThisDayOur;
  let fixture: ComponentFixture<GiveUsThisDayOur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiveUsThisDayOur],
    }).compileComponents();

    fixture = TestBed.createComponent(GiveUsThisDayOur);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
