import { Observation } from '../../observations/observations-system/observation.model';

export interface Report {
  id: number;
  author: Author;
  description: string;
  observations: Observation[];
}

export interface ReportPostRequest {
  author: string;
  description: string;
  observations: number[];
}

export interface Author {
  first_name: string;
  last_name: string;
  birth_date: string;
  sex: string;
  email: string;
}
