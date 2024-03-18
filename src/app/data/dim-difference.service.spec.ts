import { TestBed } from '@angular/core/testing';

import { DimDifferenceService } from './dim-difference.service';

describe('DimDifferenceService', () => {
  let service: DimDifferenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DimDifferenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
