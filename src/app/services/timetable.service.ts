import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimetableService {
  private apiUrl = 'https://api.miagenda.fr/fetch_schedule';

  constructor(private http: HttpClient) { }

  getSchedule(icalUrl: string, startDate?: string, endDate?: string): Observable<any> {
    return this.http.get(this.apiUrl+'?ical_url='+icalUrl+(startDate?('&start_date='+startDate):'')+(endDate ? ('&end_date='+endDate):''));
  }
}
