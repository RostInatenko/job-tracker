import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly error = signal('');
  protected readonly loading = signal(false);
  protected readonly demoLoading = signal(false);

  protected onTryDemo(): void {
    this.loading.set(true);
    this.demoLoading.set(true);
    this.error.set('');

    this.authService.loginAsDemo().subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => {
        this.loading.set(false);
        this.demoLoading.set(false);
        this.error.set('The demo is unavailable right now, please try again in a moment.');
      },
    });
  }

  protected onSubmit(): void {
    if (!this.email.trim() || !this.password.trim()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid email or password.');
      },
    });
  }
}
