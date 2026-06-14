import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

fdescribe('AuthService', () => {
  let oauthServiceSpy: jasmine.SpyObj<any>;
  let service: AuthService;

  beforeEach(() => {
    oauthServiceSpy = jasmine.createSpyObj('OAuthService', ['configure', 'logOut', 'hasValidAccessToken', 'initCodeFlow', 'setupAutomaticSilentRefresh', 'loadDiscoveryDocumentAndTryLogin'])
    oauthServiceSpy.hasValidAccessToken.and.returnValue(true)
    oauthServiceSpy.loadDiscoveryDocumentAndTryLogin.and.returnValue(Promise.resolve())
    TestBed.configureTestingModule({providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideOAuthClient(),
      {
        provide: OAuthService,
        useValue: oauthServiceSpy
      }
    ]});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should indicate logged in status', () => {
    let isLoggedIn = service.isLoggedIn();
    expect(isLoggedIn).toEqual(jasmine.any(Boolean))
  })

  it('should logout', () => {
    service.logout()

    expect(sessionStorage.getItem('access_token')).toBe(null)

  })
  it('should initialize authentication successfully', async () => {
    var m = await service.initAuth().then(() => {
      expect(oauthServiceSpy.loadDiscoveryDocumentAndTryLogin).toHaveBeenCalled()
    })
    expect(oauthServiceSpy.configure).toHaveBeenCalled()
  })
  it('should initialize authentication unsuccessfully', async () => {
    oauthServiceSpy.hasValidAccessToken.and.returnValue(false)
    spyOn(service, 'isLoggedIn')

    var m = await service.initAuth().then(() => {
      expect(oauthServiceSpy.loadDiscoveryDocumentAndTryLogin).toHaveBeenCalled()
    })
    expect(oauthServiceSpy.configure).toHaveBeenCalled()
  })
});
