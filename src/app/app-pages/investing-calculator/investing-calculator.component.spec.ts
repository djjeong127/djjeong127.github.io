import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestingCalculatorComponent } from './investing-calculator.component';

describe('InvestingCalculatorComponent', () => {
  let component: InvestingCalculatorComponent;
  let fixture: ComponentFixture<InvestingCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestingCalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestingCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
