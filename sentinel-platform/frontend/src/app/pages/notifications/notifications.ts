import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  notifications = signal<Notification[]>([]);
  loading = signal(true);

  constructor(private notifSvc: NotificationService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.notifSvc.getNotifications().subscribe({
      next: (res) => { this.notifications.set(res.data.notifications); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  markRead(id: string): void {
    this.notifSvc.markAsRead(id).subscribe({ next: () => this.load() });
  }
}