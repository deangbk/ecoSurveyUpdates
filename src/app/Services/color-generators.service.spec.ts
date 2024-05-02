import { TestBed } from '@angular/core/testing';

import { ColorGeneratorsService } from './color-generators.service';

describe('ColorGeneratorsService', () => {
  let service: ColorGeneratorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorGeneratorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
