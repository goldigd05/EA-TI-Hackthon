import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Worker {
  _id?: string;
  name: string;
  employeeId: string;
  zone: string;
  location?: { lat: number; lng: number };
  heartRate: number;
  temperature: number;
  helmetDetected: boolean;
  oxygenLevel: number;
  riskScore?: number;
  status?: 'safe' | 'warning' | 'critical';
}

@Injectable({ providedIn: 'root' })
export class WorkerService {
  private readonly base = `${environment.apiUrl}/workers`;

  constructor(private http: HttpClient) { }

  getWorkers(filters?: { zone?: string; status?: string }): Observable<{ success: boolean; data: Worker[] }> {
    const params: any = {};
    if (filters?.zone) params.zone = filters.zone;
    if (filters?.status) params.status = filters.status;
    return this.http.get<{ success: boolean; data: Worker[] }>(this.base, { params });
  }

  createWorker(worker: Worker): Observable<{ success: boolean; data: Worker }> {
    return this.http.post<{ success: boolean; data: Worker }>(this.base, worker);
  }

  updateWorker(id: string, worker: Partial<Worker>): Observable<{ success: boolean; data: Worker }> {
    return this.http.put<{ success: boolean; data: Worker }>(`${this.base}/${id}`, worker);
  }

  deleteWorker(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.base}/${id}`);
  }
}
