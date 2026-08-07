import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { AuthTokenService } from './core/auth/auth-token.service';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly authToken = inject(AuthTokenService);
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);

  protected readonly isLoggedIn = this.authToken.accessToken;

  protected onLogout(): void {
    this.authService.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
