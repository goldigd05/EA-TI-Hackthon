import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PredictionService, PredictionRequest, PredictionResult } from '../../services/prediction.service';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './predictions.html',
  styleUrl: './predictions.css',
})
export class Predictions {
  loading = signal(false);
  result = signal<PredictionResult | null>(null);
  errorMsg = signal('');

  form: PredictionRequest = {
    temperature: 45, gas_level: 20, humidity: 55, pressure: 105, smoke: 15,
    worker_count: 8, maintenance: 0, permit_status: 'approved', equipment_health: 80,
    shift: 'day', zone: 'Zone-A',
  };

  constructor(private predictionSvc: PredictionService) {}

  run(): void {
    this.loading.set(true);
    this.errorMsg.set('');
    this.result.set(null);

    this.predictionSvc.predict(this.form).subscribe({
      next: (res) => { this.result.set(res.data); this.loading.set(false); },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message || 'Prediction service unreachable. Is predict.py running on port 5001?');
      },
    });
  }

  riskClass(score: number): string {
    if (score >= 60) return 'critical';
    if (score >= 35) return 'warning';
    return 'safe';
  }
}
