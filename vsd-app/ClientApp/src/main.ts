import { enableProdMode, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
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
    provideAppInitializer(() => inject(LookupStore).loadAll()),
    provideAppInitializer(() => inject(ConfigStore).load())
  ]
});
