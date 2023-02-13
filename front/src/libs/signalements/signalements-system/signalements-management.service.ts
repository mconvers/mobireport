import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../../env';
import { Report } from './report.model';
import { Observable, BehaviorSubject, tap } from 'rxjs';

const reportsEndpoints = '/reports';
@Injectable({
  providedIn: 'root',
})
export class ReportsManagementService {
  availableReports$: Observable<Report[]> = new Observable<Report[]>();

  availableReports$$ = new BehaviorSubject<Report[]>([]);

  constructor(private _httpClient: HttpClient) {
    this.availableReports$ = this.getReports$();
    this.availableReports$
      .pipe(
        tap((reports) => {
          this.availableReports$$.next(reports);
          console.log(
            '[ReportsManagementService] Available reports: ',
            reports
          );
        })
      )
      .subscribe();
  }

  getReports$() {
    return this._httpClient.get<Report[]>(API_URL + reportsEndpoints);
  }

  postReport$(report: Partial<Report>) {
    return this._httpClient.post<Report>(API_URL + reportsEndpoints, report);
  }
}
