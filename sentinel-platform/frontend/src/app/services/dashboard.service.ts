import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardData {
  totalWorkers: number;
  activeSensors: number;
  criticalAlerts: number;
  safetyScore: number;
  currentRisk: number;
  todaysIncidents: number;
  predictionAccuracy: number;
  criticalWorkers: number;
  aiRecommendation: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly base = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getDashboard(): Observable<{ success: boolean; data: DashboardData }> {
    return this.http.get<{ success: boolean; data: DashboardData }>(this.base);
  }
}
