import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { first, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const AuthGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isUserLoaded$.pipe(
    first(loaded => loaded),
    switchMap(() => {
      if (authService.isLoggedIn()) {
        return of(true);
      } else {
        router.navigate(['/login']);
        return of(false);
      }
    })
  );
};