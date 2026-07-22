import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal('');

  form = { name: '', email: '', password: '', zone: 'ALL' };

  constructor(private auth: AuthService, private router: Router) { }

  submit(): void {
    this.error.set('');
    this.loading.set(true);

    const action$ =
      this.mode() === 'login'
        ? this.auth.login(this.form.email, this.form.password)
        : this.auth.register({ name: this.form.name, email: this.form.email, password: this.form.password, zone: this.form.zone });

    action$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Something went wrong. Check that the backend is running.');
      },
    });
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set('');
  }
}