import { TestBed } from '@angular/core/testing';

import { VidsrcService } from './vidsrc.service';

describe('VidsrcService', () => {
  let service: VidsrcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VidsrcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
