import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReportResult {
  downloadUrl: string;
  summary: {
    incidentCount: number;
    predictionCount: number;
    criticalSensorCount: number;
    criticalWorkerCount: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly base = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) { }

  generateReport(type: 'daily' | 'weekly' | 'monthly'): Observable<{ success: boolean; data: ReportResult }> {
    return this.http.get<{ success: boolean; data: ReportResult }>(this.base, { params: { type } });
  }

  getDownloadUrl(fileName: string): string {
    return `${this.base}/download/${fileName}`;
  }
}
