import { Component } from '@angular/core';
import { of, switchMap, tap } from 'rxjs';
import { ObservationsManagementService } from '../libs/observations/observations-system/observations-management.service';
import { ReportsManagementService } from '../libs/signalements/signalements-system/signalements-management.service';
import { ReportsListComponent } from '../libs/signalements/signalements-layout/reports-list/reports-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private _observationsManagementService: ObservationsManagementService,
    private _reportsManagementService: ReportsManagementService
  ) {}
}
