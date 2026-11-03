import { Injectable, computed, signal } from '@angular/core';

function hasDemoClaim(token: string | null): boolean {
  if (!token) {
    return false;
  }
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return (JSON.parse(atob(payload)) as { demo?: boolean }).demo === true;
  } catch {
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly _accessToken = signal<string | null>(null);
  readonly accessToken = this._accessToken.asReadonly();
  readonly isDemo = computed(() => hasDemoClaim(this._accessToken()));

  setAccessToken(token: string | null): void {
    this._accessToken.set(token);
  }
}
