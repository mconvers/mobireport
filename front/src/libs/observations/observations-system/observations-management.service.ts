import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observation } from './observation.model';
import { API_URL } from '../../../env';
import { BehaviorSubject, Observable, switchMap, of, tap } from 'rxjs';

const observationsEndpoints = '/observations';
@Injectable({
  providedIn: 'root',
})
export class ObservationsManagementService {
  availableObservations$: Observable<Observation[]> = new Observable<
    Observation[]
  >();

  availableObservations$$ = new BehaviorSubject<Observation[]>([]);

  constructor(private _httpClient: HttpClient) {
    this.availableObservations$ = this.getObservations$();
    this.availableObservations$
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

  initObservations$() {
    return this._httpClient.get<string>(API_URL + '/init_db');
  }
}
