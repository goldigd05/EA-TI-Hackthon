import { Component, signal } from '@angular/core';
import { ReportService, ReportResult } from '../../services/report.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  loading = signal<string | null>(null);
  results = signal<{ type: string; result: ReportResult }[]>([]);
  errorMsg = signal('');

  constructor(private reportSvc: ReportService) {}

  generate(type: 'daily' | 'weekly' | 'monthly'): void {
    this.loading.set(type);
    this.errorMsg.set('');
    this.reportSvc.generateReport(type).subscribe({
      next: (res) => {
        this.loading.set(null);
        this.results.update((list) => [{ type, result: res.data }, ...list]);
      },
      error: (err) => {
        this.loading.set(null);
        this.errorMsg.set(err?.error?.message || 'Failed to generate report.');
      },
    });
  }

  downloadUrl(url: string): string {
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }
}
