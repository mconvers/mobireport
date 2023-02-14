import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, switchMap, take, tap } from 'rxjs';
import { API_URL } from '../../../env';
import { Observation } from './observation.model';

const observationsEndpoints = '/observations';
@Injectable({
  providedIn: 'root',
})
export class ObservationsManagementService {
  availableObservations$$ = new BehaviorSubject<Observation[]>([]);

  constructor(private _httpClient: HttpClient) {
    this.getObservations$()
      .pipe(
        switchMap((observations) => {
          this.availableObservations$$.next(observations);
          console.log(
            '[ObservationsManagementService] Available observations: ',
            observations
          );
          if (observations.length < 3) return this.initObservations$();
          return of(undefined);
        })
      )
      .subscribe();
  }

  getObservations$() {
    return this._httpClient.get<Observation[]>(API_URL + observationsEndpoints);
  }

  pullDataOnce$() {
    return this._httpClient
      .get<Observation[]>(API_URL + observationsEndpoints)
      .pipe(
        take(1),
        tap((observations) => {
          this.availableObservations$$.next(observations);
        })
      );
  }

  initObservations$() {
    return this._httpClient
      .get<string>(API_URL + observationsEndpoints + '/init')
      .pipe(
        switchMap(() => {
          return this.pullDataOnce$();
        })
      );
  }
}
