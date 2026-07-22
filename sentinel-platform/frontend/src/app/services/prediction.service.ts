import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PredictionRequest {
  temperature: number;
  gas_level: number;
  humidity: number;
  pressure: number;
  smoke: number;
  worker_count: number;
  maintenance: 0 | 1;
  permit_status: 'approved' | 'pending' | 'rejected';
  equipment_health: number;
  shift: 'day' | 'night' | 'swing';
  zone: string;
}

export interface CompoundFactor {
  key: string;
  label: string;
  value: number | string;
  unit: string;
  triggered: boolean;
  detail: string;
}

export interface CompoundRisk {
  factors: CompoundFactor[];
  triggeredCount: number;
  isCompoundRisk: boolean;
  explanation: string;
}

export interface PredictionResult {
  riskScore: number;
  confidence: number;
  incident: string;
  recommendation: string;
  zone: string;
  probability: number;
  emergencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  modelVersion: string;
  compoundRisk?: CompoundRisk;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly base = `${environment.apiUrl}/predict`;

  constructor(private http: HttpClient) { }

  predict(payload: PredictionRequest): Observable<{ success: boolean; data: PredictionResult }> {
    return this.http.post<{ success: boolean; data: PredictionResult }>(this.base, payload);
  }
}