import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { AuthTokenService } from './core/auth/auth-token.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly authToken = inject(AuthTokenService);
  private readonly router = inject(Router);

  protected readonly isLoggedIn = this.authToken.accessToken;

  protected onLogout(): void {
    this.authService.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
