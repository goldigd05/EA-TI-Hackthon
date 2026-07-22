import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { IncidentService, Incident } from '../../services/incident.service';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './incidents.html',
  styleUrl: './incidents.css',
})
export class Incidents implements OnInit {
  incidents = signal<Incident[]>([]);
  loading = signal(true);
  showForm = signal(false);

  form: Incident = { incidentId: '', zone: '', severity: 'medium', description: '' };

  constructor(private incidentSvc: IncidentService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.incidentSvc.getIncidents().subscribe({
      next: (res) => { this.incidents.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    this.incidentSvc.createIncident(this.form).subscribe({
      next: () => {
        this.showForm.set(false);
        this.form = { incidentId: '', zone: '', severity: 'medium', description: '' };
        this.load();
      },
    });
  }
}