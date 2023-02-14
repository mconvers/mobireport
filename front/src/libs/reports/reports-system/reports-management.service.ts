import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL, optionRequete } from '../../../env';
import { Report, ReportPostRequest } from './report.model';
import { Observable, BehaviorSubject, tap, switchMap, of, take } from 'rxjs';
import { ReportPromptComponent } from '../reports-layout/report-prompt/report-prompt.component';
import { MatDialog } from '@angular/material/dialog';

const reportsEndpoints = '/reporting';
@Injectable({
  providedIn: 'root',
})
export class ReportsManagementService {
  availableReports$$ = new BehaviorSubject<Report[]>([]);

  constructor(private _httpClient: HttpClient, private _dialog: MatDialog) {
    this.getReports$()
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
    return this._httpClient.get<Report[]>(
      API_URL + reportsEndpoints,
      optionRequete
    );
  }

  pullDataOnce$() {
    return this.getReports$().pipe(
      take(1),
      tap((reports) => {
        this.availableReports$$.next(reports);
      })
    );
  }

  postReport$(report: ReportPostRequest) {
    console.log({ report });
    return this._httpClient
      .post<Report>(API_URL + reportsEndpoints, report, optionRequete)
      .pipe(
        switchMap(() => {
          return this.pullDataOnce$();
        })
      );
  }

  updateReport$(report: ReportPostRequest, reportId: number) {
    return this._httpClient
      .put<Report>(
        API_URL + reportsEndpoints + '/' + reportId,
        report,
        optionRequete
      )
      .pipe(
        switchMap(() => {
          return this.pullDataOnce$();
        })
      );
  }

  deleteReport$(reportId: string) {
    return this._httpClient
      .delete(API_URL + reportsEndpoints + '/' + reportId)
      .pipe(
        switchMap(() => {
          return this.pullDataOnce$();
        })
      );
  }

  checkEmailUsed$(email: string) {
    return this._httpClient.get<boolean>(
      API_URL + '/check-email/' + email,
      optionRequete
    );
  }

  openReportPrompt(reportToEdit?: Report) {
    this._dialog
      .open(ReportPromptComponent, {
        maxHeight: '90vh',
        maxWidth: '90vw',
        data: reportToEdit ? { ...reportToEdit } : undefined,
      })
      .afterClosed()
      .pipe(
        switchMap((report: ReportPostRequest | undefined) => {
          if (!report) return of(undefined);
          if (reportToEdit) return this.updateReport$(report, reportToEdit.id);
          return this.postReport$(report);
        })
      )
      .subscribe();
  }
}
