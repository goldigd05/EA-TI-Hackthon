import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell implements OnInit {
  unreadCount = signal(0);
  now = signal(new Date());

  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Command Center', icon: 'grid' },
    { path: '/workers', label: 'Workers', icon: 'user' },
    { path: '/sensors', label: 'Sensors', icon: 'radio' },
    { path: '/permits', label: 'Permits', icon: 'file-check' },
    { path: '/incidents', label: 'Incidents', icon: 'alert' },
    { path: '/predictions', label: 'AI Predictor', icon: 'brain' },
    { path: '/reports', label: 'Reports', icon: 'doc' },
    { path: '/notifications', label: 'Alerts', icon: 'bell' },
    { path: '/heatmap', label: 'Zone Heatmap', icon: 'map' },
  ];

  constructor(
    public auth: AuthService,
    private notifSvc: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUnread();
    setInterval(() => this.loadUnread(), 30000);
    setInterval(() => this.now.set(new Date()), 1000);
  }

  loadUnread(): void {
    this.notifSvc.getNotifications().subscribe({
      next: (res) => this.unreadCount.set(res.data.unreadCount),
      error: () => { },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}