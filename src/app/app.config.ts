import {
	APP_INITIALIZER,
	ApplicationConfig,
	provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideOAuthClient } from "angular-oauth2-oidc";
import { AuthService } from "./shared/services/auth.service";
import { environment } from "../environments/environment.development";

function authFactory(authService: AuthService) {
	if (environment.authEnabled) {
		return () => authService.initAuth();
	} else {
		return () => {};
	}
}

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(),
		provideAnimationsAsync(),
		provideOAuthClient(),
		{
			provide: APP_INITIALIZER,
			useFactory: authFactory,
			deps: [AuthService],
			multi: true,
		},
	],
};
