import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfigStore } from '../store/config.store';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { LoginService } from '../services/login.service';
/**
 * Guard for routes that require the `useAuthentication` feature flag.
 * When the flag is **off**, navigating to `/login` or `/drafts` redirects to `/application`.
 */
export const authenticationFeatureGuard: CanActivateFn = () => {
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
export const landingGuard: CanActivateFn = () => {
  const configStore = inject(ConfigStore);
  const router = inject(Router);

  if (configStore.featureFlags().useAuthentication) {
    return true;
  }

  return router.createUrlTree(['/application']);
};

export const canActivate: CanActivateFn = async () => {
  const loginService = inject(LoginService);
  console.log('Authentication canActivate starting');
  const response = await loginService.checkAuth().toPromise();
  console.log('Authentication canActivate response:', response);
  return true;;
};

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService) {}

  public async canActivate(
  ): Promise<boolean> {
    // 2024-05-27 EMCRI-217 waynezen: replace AuthGuard with built-in from angular-auth-oidc-client
    const response = await this.loginService.checkAuth().toPromise();
    return response?.isAuthenticated ?? false;
    //return Promise.resolve(true);
  }
}
