import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ZonePrediction {
    incident: string;
    riskScore: number;
    recommendation: string;
}

export interface ZoneRisk {
    zone: string;
    riskScore: number;
    riskLevel: 'safe' | 'warning' | 'critical';
    workerCount: number;
    criticalWorkers: number;
    sensorCount: number;
    criticalSensors: number;
    warningSensors: number;
    latestPrediction: ZonePrediction | null;
    compoundRiskActive: boolean;
    activeSignals: string[];
}

@Injectable({ providedIn: 'root' })
export class ZoneService {
    private readonly base = `${environment.apiUrl}/zones`;

    constructor(private http: HttpClient) { }

    getZones(): Observable<{ success: boolean; data: ZoneRisk[] }> {
        return this.http.get<{ success: boolean; data: ZoneRisk[] }>(this.base);
    }
}