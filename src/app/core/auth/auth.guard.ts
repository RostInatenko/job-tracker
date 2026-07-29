import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenService } from './auth-token.service';

export const authGuard: CanActivateFn = () => {
  const authToken = inject(AuthTokenService);
  const router = inject(Router);

  if (authToken.accessToken()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
