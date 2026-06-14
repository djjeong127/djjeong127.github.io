import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig = {
  issuer: 'https://dev-f1wa8cblitcybrvx.us.auth0.com/',
  redirectUri: `${window.location.origin}`,
  clientId: 'JgVXzSMkzccGtX2fkwzWVKolHAc2gL5C',
  silentRefreshRedirectUri: `${window.location.origin}/silent-refresh.html`,
  useSilentRefresh: true,
  responseType: 'code',
  scope: 'openid profile name',
  showDebugInformation: true,
};