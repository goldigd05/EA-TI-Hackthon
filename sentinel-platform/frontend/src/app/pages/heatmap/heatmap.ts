import { Component, OnInit, signal } from '@angular/core';
import { ZoneService, ZoneRisk } from '../../services/zone.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-heatmap',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './heatmap.html',
    styleUrl: './heatmap.css',
})
export class Heatmap implements OnInit {
    zones = signal<ZoneRisk[]>([]);
    loading = signal(true);
    selected = signal<ZoneRisk | null>(null);
    lastUpdated = signal<Date | null>(null);

    constructor(private zoneSvc: ZoneService) { }

    ngOnInit(): void {
        this.load();
        setInterval(() => this.load(), 20000);
    }

    load(): void {
        this.zoneSvc.getZones().subscribe({
            next: (res) => {
                this.zones.set(res.data);
                this.lastUpdated.set(new Date());
                this.loading.set(false);
                if (res.data.length > 0) {
                    const current = this.selected();
                    const stillExists = current ? res.data.find((z) => z.zone === current.zone) : null;
                    this.selected.set(stillExists || res.data[0]);
                }
            },
            error: () => this.loading.set(false),
        });
    }

    select(zone: ZoneRisk): void {
        this.selected.set(zone);
    }

    tileSpan(zone: ZoneRisk): string {
        if (zone.riskScore >= 60) return 'span-2';
        return 'span-1';
    }
}