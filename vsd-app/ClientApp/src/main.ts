import { enableProdMode, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppModule } from './app/app.module';
import { HealthCheckService } from './app/services/health-check.service';
import { ConfigStore } from './app/store/config.store';
import { LookupStore } from './app/store/lookup.store';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  if (window) {
    window.console.log = function () {};
  }
}

platformBrowser().bootstrapModule(AppModule, {
  applicationProviders: [
    provideZoneChangeDetection(),
    provideAppInitializer(async () => {
      // Capture all injections synchronously before any await
      const router = inject(Router);
      const healthCheckService = inject(HealthCheckService);
      const lookupStore = inject(LookupStore);
      const configStore = inject(ConfigStore);

      const isHealthy = await healthCheckService.checkHealth();

      if (!isHealthy) {
        router.navigateByUrl('/outage');
        return;
      }

      await Promise.all([lookupStore.loadAll(), configStore.load()]);

      if (configStore.maintenanceMode()) {
        router.navigateByUrl('/maintenance');
      }
    })
  ]
});
