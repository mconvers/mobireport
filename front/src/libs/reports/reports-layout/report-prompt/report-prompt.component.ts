import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, debounceTime, of, switchMap, tap } from 'rxjs';
import { Observation } from '../../../observations/observations-system/observation.model';
import { ObservationsManagementService } from '../../../observations/observations-system/observations-management.service';
import {
  Author,
  Report,
  ReportPostRequest,
} from '../../reports-system/report.model';
import { ReportsManagementService } from '../../reports-system/reports-management.service';

@UntilDestroy()
@Component({
  selector: 'app-report-prompt',
  templateUrl: './report-prompt.component.html',
  styleUrls: ['./report-prompt.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatIconModule,
    MatStepperModule,
  ],
})
export class ReportPromptComponent {
  /**
   * Forms
   */

  authorFormGroup = new FormGroup({
    last_name: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    first_name: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    sex: new FormControl('', [Validators.required]),
    birth_date: new FormControl(new Date(), [Validators.required]),
  });

  descriptionFormGroup = new FormGroup({
    description: new FormControl('', [Validators.required]),
  });

  /**
   * Settings
   */

  sexOptions = ['Homme', 'Femme', 'Non-binaire'];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  currentObservations: Observation[] = [];
  minDate = new Date();
  maxDate = new Date();

  /** Subject to know if email typed is already in DB */
  emailUsed$$ = new BehaviorSubject<boolean | undefined>(undefined);

  /** Observations list for selection */
  observations$$ = new BehaviorSubject<Observation[]>([]);

  constructor(
    private _reportsManagementService: ReportsManagementService,
    private _observationsManagementService: ObservationsManagementService,
    public dialogRef: MatDialogRef<ReportPromptComponent>,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public report?: Report
  ) {
    this._setMinDate();
    /** Patching value if a report is provided (ie. edit) */
    if (report) {
      this.patchValueFromExistingReport(report);
    }

    /** Getting observations */
    this._observationsManagementService.availableObservations$$
      .pipe(
        untilDestroyed(this),
        tap((observations) => {
          this.observations$$.next(observations);
        })
      )
      .subscribe();

    /** Custom validator for email input */
    const emailControl = this.authorFormGroup.get('email');
    emailControl?.valueChanges
      .pipe(
        debounceTime(50),
        switchMap((emailValue) => {
          // If email is valid and not the same as the report.author.email,
          // It checks if it's already used in DB
          if (
            !this.authorFormGroup.get('email')?.valid ||
            !emailValue ||
            this.report?.author.email === emailValue
          )
            return of(undefined);
          return this._reportsManagementService.checkEmailUsed$(emailValue);
        }),
        untilDestroyed(this),
        tap((emailUsed) => {
          this.emailUsed$$.next(emailUsed);

          // If already used, errors
          if (emailUsed) {
            emailControl.setErrors({
              emailUsed: true,
            });
          } else {
            const errors = emailControl.getError('email');
            emailControl.setErrors(errors);
          }
        })
      )
      .subscribe();
  }

  /**
   * Close the dialog without any data
   */
  dismiss() {
    this.dialogRef.close();
  }

  submit() {
    const lastName = this.authorFormGroup.get('last_name')?.value;
    const firstName = this.authorFormGroup.get('first_name')?.value;
    const email = this.authorFormGroup.get('email')?.value;
    const birthDate = this.authorFormGroup.get('birth_date')?.value;
    const birthDateFormatted = this.datePipe.transform(birthDate, 'yyyy-MM-dd');
    const sex = this.authorFormGroup.get('sex')?.value;
    const description = this.descriptionFormGroup.get('description')?.value;
    const observations = this.currentObservations.map((obs) => obs.id);

    // Checking if all needed value are provided
    if (
      !(
        lastName &&
        firstName &&
        email &&
        birthDateFormatted &&
        sex &&
        description &&
        observations
      )
    )
      return;

    const author: Author = {
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDateFormatted,
      email,
      sex,
    };

    const author_as_str = JSON.stringify(author);

    const newReport: ReportPostRequest = {
      author: author_as_str,
      description,
      observations,
    };
    this.dialogRef.close(newReport);
  }

  /**
   * Triggered when an observation has been selected
   * @param event
   */
  selectObservation(event: MatAutocompleteSelectedEvent) {
    const observation = event.option.viewValue;
    const matchObservation = this.observations$$.value.find(
      (obs) => obs.name === observation
    );
    if (matchObservation) {
      this.currentObservations.push(matchObservation);
    }
  }

  /**
   * Triggered when an observation is added without auto complete
   * @param event
   * @param input HTML element need to clear value when triggered
   */
  addObservation(event: MatChipInputEvent, input: HTMLInputElement) {
    const observation = event.value;
    const matchObservation = this.observations$$.value.find(
      (obs) => obs.name === observation
    );
    if (matchObservation) {
      this.currentObservations.push(matchObservation);
    }

    input.value = '';
  }

  /**
   * Delete an observation
   * @param observationId
   */
  removeObservation(observationId: number) {
    const newCurrentObservations = this.currentObservations.filter(
      (obs) => obs.id !== observationId
    );
    this.currentObservations = newCurrentObservations;
  }

  /**
   * Patch forms and current observations list from the report provided
   * @param report
   */
  patchValueFromExistingReport(report: Report) {
    this.authorFormGroup.patchValue({
      first_name: report.author.first_name,
      last_name: report.author.last_name,
      sex: report.author.sex,
      birth_date: new Date(Date.parse(report.author.birth_date)),
      email: report.author.email,
    });
    this.authorFormGroup.controls.email.disable();
    this.descriptionFormGroup.patchValue({ description: report.description });
    this.currentObservations = report.observations;
  }

  private _setMinDate() {
    const currentYear = new Date().getFullYear();
    const currentDay = new Date().getDay();
    const currentMonth = new Date().getMonth();
    this.minDate = new Date(currentYear - 100, currentMonth, currentDay);
  }
}
