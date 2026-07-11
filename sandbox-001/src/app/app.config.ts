import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    provideAppInitializer(() => initializeCustomIcons())
  ]
};


// Function to initialize and register your custom icons
function initializeCustomIcons(): Promise<void> {
  const iconRegistry = inject(MatIconRegistry);
  const sanitizer = inject(DomSanitizer);

  iconRegistry.addSvgIcon(
    'language_english', // The name you will use in templates
    sanitizer.bypassSecurityTrustResourceUrl('movies-and-shows-assets/icons/language_english.svg') // Path to asset
  );
  iconRegistry.addSvgIcon(
    'language_korean', // The name you will use in templates
    sanitizer.bypassSecurityTrustResourceUrl('movies-and-shows-assets/icons/language_korean.svg') // Path to asset
  );
  
  return Promise.resolve();
}