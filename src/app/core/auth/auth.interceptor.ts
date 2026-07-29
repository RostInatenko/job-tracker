import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokenService } from './auth-token.service';

const REFRESH_URL = `${environment.apiUrl}/auth/refresh`;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = inject(AuthTokenService);
  const http = inject(HttpClient);

  const token = authToken.accessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isRefreshCall = req.url === REFRESH_URL;
      if (error.status !== 401 || isRefreshCall) {
        return throwError(() => error);
      }

      return http
        .post<{ accessToken: string }>(REFRESH_URL, {}, { withCredentials: true })
        .pipe(
          switchMap((res) => {
            authToken.setAccessToken(res.accessToken);
            const retriedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            });
            return next(retriedReq);
          }),
        );
    }),
  );
};
