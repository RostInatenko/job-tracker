import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  protected onSubmit(): void {
    if (!this.email.trim() || !this.password.trim()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.register({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => {
        this.loading.set(false);
        this.error.set('Registration failed. Try a different email or a longer password.');
      },
    });
  }
}
