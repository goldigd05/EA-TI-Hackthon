import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PermitService, Permit } from '../../services/permit.service';

@Component({
  selector: 'app-permits',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './permits.html',
  styleUrl: './permits.css',
})
export class Permits implements OnInit {
  permits = signal<Permit[]>([]);
  loading = signal(true);
  showForm = signal(false);
  lastResult = signal<{ approved: boolean; message: string } | null>(null);

  form: Permit = { permitId: '', workerId: '', permitType: 'hot_work', zone: '', expiry: '' };

  constructor(private permitSvc: PermitService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.permitSvc.getPermits().subscribe({
      next: (res) => { this.permits.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    this.permitSvc.createPermit(this.form).subscribe({
      next: (res) => {
        this.lastResult.set({ approved: res.data.status === 'approved', message: res.message });
        this.showForm.set(false);
        this.load();
      },
    });
  }
}