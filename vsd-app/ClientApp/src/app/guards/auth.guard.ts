import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalAuthService } from '../services/local-auth.service';

/**
 * Route guard that redirects unauthenticated users to /login.
 * Temporary — will be replaced by Keycloak integration.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(LocalAuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
