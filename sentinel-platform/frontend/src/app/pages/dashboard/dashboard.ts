import { Component, OnInit, signal } from '@angular/core';
import { DashboardService, DashboardData } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  data = signal<DashboardData | null>(null);
  loading = signal(true);
  errorMsg = signal('');

  constructor(private dashboardSvc: DashboardService) {}

  ngOnInit(): void {
    this.load();
    setInterval(() => this.load(), 15000); // poll every 15s for a "live" feel
  }

  load(): void {
    this.dashboardSvc.getDashboard().subscribe({
      next: (res) => {
        this.data.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Could not reach backend. Is it running on port 5000?');
      },
    });
  }

  riskLevel(score: number): 'safe' | 'warning' | 'critical' {
    if (score >= 60) return 'critical';
    if (score >= 30) return 'warning';
    return 'safe';
  }
}
