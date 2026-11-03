import { TestBed } from '@angular/core/testing';
import { AuthTokenService } from './auth-token.service';

function tokenWith(claims: object): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256' })}.${encode(claims)}.signature`;
}

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;
const anHourAgo = () => Math.floor(Date.now() / 1000) - 3600;

describe('AuthTokenService', () => {
  let service: AuthTokenService;

  beforeEach(() => {
    sessionStorage.clear();
    service = TestBed.inject(AuthTokenService);
  });

  afterEach(() => sessionStorage.clear());

  describe('demo detection', () => {
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

  describe('demo session persistence', () => {
    it('restores a demo token saved earlier in the tab', () => {
      const token = tokenWith({ sub: 3, demo: true, exp: inOneHour() });
      service.setAccessToken(token);
      const reloaded = new AuthTokenService();

      expect(reloaded.restoreDemoToken()).toBe(true);
      expect(reloaded.accessToken()).toBe(token);
      expect(reloaded.isDemo()).toBe(true);
    });

    it('does not restore an expired demo token', () => {
      service.setAccessToken(tokenWith({ sub: 3, demo: true, exp: anHourAgo() }));
      const reloaded = new AuthTokenService();

      expect(reloaded.restoreDemoToken()).toBe(false);
      expect(reloaded.accessToken()).toBeNull();
      expect(sessionStorage.getItem('demoAccessToken')).toBeNull();
    });

    it('never stores a regular token', () => {
      service.setAccessToken(tokenWith({ sub: 3, exp: inOneHour() }));

      expect(sessionStorage.getItem('demoAccessToken')).toBeNull();
      expect(new AuthTokenService().restoreDemoToken()).toBe(false);
    });

    it('forgets the demo token on logout', () => {
      service.setAccessToken(tokenWith({ sub: 3, demo: true, exp: inOneHour() }));
      service.setAccessToken(null);

      expect(new AuthTokenService().restoreDemoToken()).toBe(false);
    });

    it('drops a stored demo token when a real user logs in', () => {
      service.setAccessToken(tokenWith({ sub: 3, demo: true, exp: inOneHour() }));
      service.setAccessToken(tokenWith({ sub: 9, exp: inOneHour() }));

      expect(new AuthTokenService().restoreDemoToken()).toBe(false);
    });

    it('ignores tampered storage content', () => {
      sessionStorage.setItem('demoAccessToken', 'garbage');

      expect(service.restoreDemoToken()).toBe(false);
      expect(service.accessToken()).toBeNull();
    });
  });
});
