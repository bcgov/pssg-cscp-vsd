import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfigStore } from '../store/config.store';
/**
 * Guard for routes that require the `useAuthentication` feature flag.
 * When the flag is **off**, navigating to `/login` or `/drafts` redirects to `/application`.
 */
export const authGuard: CanActivateFn = () => {
  const configStore = inject(ConfigStore);
  const router = inject(Router);

  if (configStore.featureFlags().useAuthentication) {
    return true;
  }

  return router.createUrlTree(['/application']);
};

/**
 * Guard for the root (`/`) route.
 * When `useAuthentication` is **off**, redirects the user straight to `/application`.
 * When it is **on**, allows the landing page to render normally.
 */
export const authFeatureGuard: CanActivateFn = () => {
  const configStore = inject(ConfigStore);
  const router = inject(Router);

  if (configStore.featureFlags().useAuthentication) {
    return true;
  }

  return router.createUrlTree(['/application']);
};

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate {
//   constructor(private loginService: LoginService) {}

//   public async canActivate(): Promise<boolean> {
//     const response = await this.loginService.checkAuth().toPromise();
//     return response?.isAuthenticated ?? false;
//   }
// }
