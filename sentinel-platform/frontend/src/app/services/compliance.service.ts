import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ComplianceRecord {
  _id?: string;
  zone: string;
  checklistItem: string;
  status: 'compliant' | 'non_compliant' | 'pending_review';
  notes?: string;
  date?: string;
}

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private readonly base = `${environment.apiUrl}/compliance`;

  constructor(private http: HttpClient) { }

  getCompliance(filters?: { zone?: string; status?: string }): Observable<{
    success: boolean;
    data: { records: ComplianceRecord[]; complianceRate: number };
  }> {
    return this.http.get<any>(this.base, { params: { ...filters } as any });
  }
}
