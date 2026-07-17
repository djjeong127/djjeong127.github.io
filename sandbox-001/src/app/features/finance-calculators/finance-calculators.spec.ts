import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceCalculators } from './finance-calculators';

describe('FinanceCalculators', () => {
  let component: FinanceCalculators;
  let fixture: ComponentFixture<FinanceCalculators>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceCalculators],
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceCalculators);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
