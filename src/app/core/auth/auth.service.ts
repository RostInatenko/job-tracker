import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokenService } from './auth-token.service';

interface Credentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authToken = inject(AuthTokenService);

  register(credentials: Credentials): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/register`, credentials);
  }

  login(credentials: Credentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials, {
        withCredentials: true,
      })
      .pipe(tap((res) => this.authToken.setAccessToken(res.accessToken)));
  }

  refresh(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(tap((res) => this.authToken.setAccessToken(res.accessToken)));
  }

  logout(): void {
    this.authToken.setAccessToken(null);
  }
}
