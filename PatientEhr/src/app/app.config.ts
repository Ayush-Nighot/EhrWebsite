import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './Services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideHttpClient(withInterceptors([authInterceptor])),provideToastr(),provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};
