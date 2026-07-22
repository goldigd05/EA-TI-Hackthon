import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sensor {
  _id?: string;
  sensorId: string;
  sensorType: 'temperature' | 'gas' | 'humidity' | 'smoke' | 'pressure' | 'vibration';
  zone: string;
  value: number;
  unit: string;
  status?: 'normal' | 'warning' | 'critical';
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class SensorService {
  private readonly base = `${environment.apiUrl}/sensors`;

  constructor(private http: HttpClient) { }

  getSensors(filters?: { zone?: string; sensorType?: string; status?: string }): Observable<{ success: boolean; data: Sensor[] }> {
    return this.http.get<{ success: boolean; data: Sensor[] }>(this.base, { params: { ...filters } as any });
  }

  createSensor(sensor: Sensor): Observable<{ success: boolean; data: Sensor }> {
    return this.http.post<{ success: boolean; data: Sensor }>(this.base, sensor);
  }
}
