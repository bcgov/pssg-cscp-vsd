import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, switchMap, take } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';

/**
 * Regex patterns for API URLs that require the Bearer token.
 * Currently only ApplicationDrafts endpoints.
 */
const PROTECTED_URLS: RegExp[] = [/\/api\/ApplicationDrafts/i];

/**
 * Functional HTTP interceptor that attaches the JWT Bearer token
 * to outgoing requests matching the protected URL patterns.
 * Temporary — will be replaced by Keycloak integration.
 */
export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const oidcSecurityService = inject(OidcSecurityService);
  const isProtected = PROTECTED_URLS.some((pattern) => pattern.test(req.url));

  if (!isProtected) {
    return next(req);
  }

  return oidcSecurityService.getAccessToken().pipe(
    take(1),
    switchMap((token: string) => {
      if (token) {
        req = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }

  return next(req);
    })
  );
};
