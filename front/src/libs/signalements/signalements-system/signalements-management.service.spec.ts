import { TestBed } from '@angular/core/testing';

import { ReportsManagementService } from './signalements-management.service';

describe('ReportsManagementService', () => {
  let service: ReportsManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportsManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
