import { Inject, inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  console.log(route)
  console.log('authGuard' + authService.isLoggedIn())
  return authService.isLoggedIn()
};


export const timeGuard: CanActivateFn = (route, state) => {
  var currentTime = new Date();
  console.log(currentTime.getMinutes())
  return currentTime.getMinutes() % 2 === 0
};
