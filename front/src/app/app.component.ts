import { Component } from '@angular/core';
import { ReportsManagementService } from '../libs/reports/reports-system/reports-management.service';
import { ObservationsManagementService } from '../libs/observations/observations-system/observations-management.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private _reportsManagementService: ReportsManagementService,
    private _observationsManagementService: ObservationsManagementService
  ) {}
}
