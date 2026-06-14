import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from '../../auth.config';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private oauthService: OAuthService) {
  }

  async initAuth(): Promise<void> {
    this.oauthService.configure(authCodeFlowConfig)
    this.oauthService.setupAutomaticSilentRefresh();
    return await this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (!this.oauthService.hasValidAccessToken()) {
        this.oauthService.initCodeFlow()
        return Promise.reject()
      }
      return Promise.resolve()
    })
  }

  isLoggedIn(): boolean {
    if (environment.authEnabled) {
      return this.oauthService.hasValidAccessToken();
    }
    else {
      return true
    }
  }

  logout() {
    this.oauthService.logOut();
  }
}
