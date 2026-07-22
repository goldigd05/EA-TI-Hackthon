import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Permit {
  _id?: string;
  permitId: string;
  workerId: string;
  permitType: 'hot_work' | 'confined_space' | 'height_work' | 'electrical' | 'excavation';
  zone: string;
  status?: 'pending' | 'approved' | 'rejected' | 'expired';
  rejectionReason?: string | null;
  expiry: string;
}

@Injectable({ providedIn: 'root' })
export class PermitService {
  private readonly base = `${environment.apiUrl}/permits`;

  constructor(private http: HttpClient) { }

  getPermits(filters?: { zone?: string; status?: string }): Observable<{ success: boolean; data: Permit[] }> {
    return this.http.get<{ success: boolean; data: Permit[] }>(this.base, { params: { ...filters } as any });
  }

  createPermit(permit: Permit): Observable<{ success: boolean; data: Permit; message: string }> {
    return this.http.post<{ success: boolean; data: Permit; message: string }>(this.base, permit);
  }
}
