import { TestBed } from '@angular/core/testing';

import { ObservationsManagementService } from './observations-management.service';

describe('ObservationsManagementService', () => {
  let service: ObservationsManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObservationsManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
