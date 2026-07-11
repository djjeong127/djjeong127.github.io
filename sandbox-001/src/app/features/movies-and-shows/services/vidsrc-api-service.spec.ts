import { TestBed } from '@angular/core/testing';

import { VidsrcApiService } from './vidsrc-api-service';

describe('VidsrcApiService', () => {
  let service: VidsrcApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VidsrcApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
