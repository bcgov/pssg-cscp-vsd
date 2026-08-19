import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfigStore } from '../store/config.store';

/**
 * Redirects to /maintenance when the FEATURE_MAINTENANCE_MODE flag is enabled.
 * The flag is resolved during app initialization (APP_INITIALIZER) before this
 * guard runs, so no async work is needed here.
 */
export const maintenanceGuard: CanActivateFn = () => {
  const configStore = inject(ConfigStore);
  const router = inject(Router);

  if (configStore.maintenanceMode()) {
    return router.createUrlTree(['/maintenance']);
  }

  return true;
};
