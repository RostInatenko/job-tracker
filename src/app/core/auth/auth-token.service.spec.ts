import { TestBed } from '@angular/core/testing';
import { AuthTokenService } from './auth-token.service';

function tokenWith(claims: object): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256' })}.${encode(claims)}.signature`;
}

describe('AuthTokenService', () => {
  let service: AuthTokenService;

  beforeEach(() => {
    service = TestBed.inject(AuthTokenService);
  });

  it('is not a demo session without a token', () => {
    expect(service.isDemo()).toBe(false);
  });

  it('recognises a demo token', () => {
    service.setAccessToken(tokenWith({ sub: 3, demo: true }));

    expect(service.isDemo()).toBe(true);
  });

  it('does not treat a regular token as a demo session', () => {
    service.setAccessToken(tokenWith({ sub: 3 }));

    expect(service.isDemo()).toBe(false);
  });

  it('leaves the demo state when the token is cleared', () => {
    service.setAccessToken(tokenWith({ sub: 3, demo: true }));
    service.setAccessToken(null);

    expect(service.isDemo()).toBe(false);
  });

  it('ignores a token it cannot read', () => {
    service.setAccessToken('not-a-token');

    expect(service.isDemo()).toBe(false);
  });
});
