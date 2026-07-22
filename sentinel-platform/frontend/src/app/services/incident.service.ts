import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Incident {
  _id?: string;
  incidentId: string;
  zone: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  prediction?: string;
  confidence?: number;
  status?: 'open' | 'investigating' | 'resolved';
  description?: string;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly base = `${environment.apiUrl}/incidents`;

  constructor(private http: HttpClient) { }

  getIncidents(filters?: { zone?: string; severity?: string; status?: string }): Observable<{ success: boolean; data: Incident[] }> {
    return this.http.get<{ success: boolean; data: Incident[] }>(this.base, { params: { ...filters } as any });
  }

  createIncident(incident: Incident): Observable<{ success: boolean; data: Incident }> {
    return this.http.post<{ success: boolean; data: Incident }>(this.base, incident);
  }
}
