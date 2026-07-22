import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkerService, Worker } from '../../services/worker.service';

@Component({
  selector: 'app-workers',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './workers.html',
  styleUrl: './workers.css',
})
export class Workers implements OnInit {
  workers = signal<Worker[]>([]);
  loading = signal(true);
  showForm = signal(false);

  form: Worker = {
    name: '', employeeId: '', zone: '', heartRate: 75, temperature: 36.6,
    helmetDetected: true, oxygenLevel: 98,
  };

  constructor(private workerSvc: WorkerService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.workerSvc.getWorkers().subscribe({
      next: (res) => { this.workers.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    this.workerSvc.createWorker(this.form).subscribe({
      next: () => {
        this.showForm.set(false);
        this.form = { name: '', employeeId: '', zone: '', heartRate: 75, temperature: 36.6, helmetDetected: true, oxygenLevel: 98 };
        this.load();
      },
    });
  }

  remove(id: string | undefined): void {
    if (!id) return;
    if (!confirm('Remove this worker?')) return;
    this.workerSvc.deleteWorker(id).subscribe({ next: () => this.load() });
  }
}
