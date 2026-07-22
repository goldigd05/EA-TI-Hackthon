import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SensorService, Sensor } from '../../services/sensor.service';

@Component({
  selector: 'app-sensors',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './sensors.html',
  styleUrl: './sensors.css',
})
export class Sensors implements OnInit {
  sensors = signal<Sensor[]>([]);
  loading = signal(true);
  showForm = signal(false);

  form: Sensor = { sensorId: '', sensorType: 'temperature', zone: '', value: 0, unit: '°C' };

  constructor(private sensorSvc: SensorService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.sensorSvc.getSensors().subscribe({
      next: (res) => { this.sensors.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    this.sensorSvc.createSensor(this.form).subscribe({
      next: () => {
        this.showForm.set(false);
        this.form = { sensorId: '', sensorType: 'temperature', zone: '', value: 0, unit: '°C' };
        this.load();
      },
    });
  }
}