import { TestBed } from '@angular/core/testing';

import { FinanceCalculatorsService } from './finance-calculators-service';

describe('FinanceCalculatorsService', () => {
  let service: FinanceCalculatorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinanceCalculatorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
