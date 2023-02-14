import { HttpHeaders } from '@angular/common/http';

export const API_URL = 'http://localhost:8000';

export const optionRequete = {
  headers: new HttpHeaders({
    'Access-Control-Allow-Origin': '*',
  }),
};
