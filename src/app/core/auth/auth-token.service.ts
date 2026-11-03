import { Injectable, computed, signal } from '@angular/core';

const DEMO_TOKEN_KEY = 'demoAccessToken';

interface TokenClaims {
  demo?: boolean;
  exp?: number;
}

function readClaims(token: string | null): TokenClaims | null {
  if (!token) {
    return null;
  }
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)) as TokenClaims;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly _accessToken = signal<string | null>(null);
  readonly accessToken = this._accessToken.asReadonly();
  readonly isDemo = computed(() => readClaims(this._accessToken())?.demo === true);

  setAccessToken(token: string | null): void {
    this._accessToken.set(token);
    this.persistDemoToken(token);
  }

  restoreDemoToken(): boolean {
    try {
      const stored = sessionStorage.getItem(DEMO_TOKEN_KEY);
      const claims = readClaims(stored);
      if (stored && claims?.demo === true && (claims.exp ?? 0) * 1000 > Date.now()) {
        this._accessToken.set(stored);
        return true;
      }
      sessionStorage.removeItem(DEMO_TOKEN_KEY);
    } catch {
      return false;
    }
    return false;
  }

  private persistDemoToken(token: string | null): void {
    try {
      if (token && readClaims(token)?.demo === true) {
        sessionStorage.setItem(DEMO_TOKEN_KEY, token);
      } else {
        sessionStorage.removeItem(DEMO_TOKEN_KEY);
      }
    } catch {
      return;
    }
  }
}
