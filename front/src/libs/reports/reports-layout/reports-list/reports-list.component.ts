import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BehaviorSubject, tap } from 'rxjs';
import { Report } from '../../reports-system/report.model';
import { ReportsManagementService } from '../../reports-system/reports-management.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-reports-list',
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    FormsModule,
    MatInputModule,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ReportsListComponent {
  reports$$ = new BehaviorSubject<Report[]>([]);

  columnsToDisplay: string[] = ['id', 'email'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: Report | null = null;
  dataSource: MatTableDataSource<Report>;

  _paginator?: MatPaginator;
  @ViewChild(MatPaginator)
  public set paginator(newPaginator) {
    this._paginator = newPaginator;
    this.dataSource.paginator = newPaginator ?? null;
  }
  public get paginator() {
    return this._paginator;
  }
  _sort?: MatSort;
  @ViewChild(MatSort)
  public set sort(newSort) {
    this._sort = newSort;
    this.dataSource.sort = newSort ?? null;
  }
  public get sort() {
    return this._sort;
  }

  constructor(private _reportsManagementService: ReportsManagementService) {
    this.dataSource = new MatTableDataSource();
    this.reports$$ = this._reportsManagementService.availableReports$$;
    this.reports$$
      .pipe(
        untilDestroyed(this),
        tap((reports) => {
          this.dataSource = new MatTableDataSource(reports);
        })
      )
      .subscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Open a prompt to edit the report
   * @param report
   */
  editReport(report: Report) {
    this.openReportPrompt(report);
  }

  /**
   * Delete the report
   * @param reportId
   */
  deleteReport(reportId: string) {
    this._reportsManagementService
      .deleteReport$(reportId)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  /**
   * Open a prompt to edit or create a report
   * @param report
   */
  openReportPrompt(report?: Report) {
    this._reportsManagementService.openReportPrompt(report);
  }
}
