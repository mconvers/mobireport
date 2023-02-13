import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-prompt',
  templateUrl: './report-prompt.component.html',
  styleUrls: ['./report-prompt.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ReportPromptComponent {
  constructor(public dialogRef: MatDialogRef<ReportPromptComponent>) {}
}
