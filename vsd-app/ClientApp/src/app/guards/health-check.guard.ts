import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HealthCheckService } from '../services/health-check.service';

/**
 * Redirects to /outage when the API reports itself as Unhealthy.
 * The health status is populated during app initialization (APP_INITIALIZER)
 * so it is always resolved before this guard runs.
 */
export const healthCheckGuard: CanActivateFn = () => {
  const healthCheckService = inject(HealthCheckService);
  const router = inject(Router);

  // isHealthy() is null only if the initializer somehow skipped; treat as healthy (fail-open).
  if (healthCheckService.isHealthy() === false) {
    return router.createUrlTree(['/outage']);
  }

  return true;
};
