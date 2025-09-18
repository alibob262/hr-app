import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

export const NoAuthGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isUserLoaded$.pipe(
    first(loaded => loaded),
    switchMap(() => {
      if (authService.isLoggedIn()) {
        router.navigate(['/dashboard']);
        return of(false);
      } else {
        return of(true);
      }
    })
  );
};