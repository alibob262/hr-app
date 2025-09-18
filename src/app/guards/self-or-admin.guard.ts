import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { filter, first, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SelfOrAdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const idParam = route.paramMap.get('id');

    return this.auth.isUserLoaded$.pipe(
      filter(loaded => loaded),
      first(),
      map(() => {
        const role   = this.auth.getCurrentUserRole();
        const me     = this.auth.getCurrentUser()?.uid;
        return role === 'admin' || me === idParam;
      }),
      tap(allowed => {
        if (!allowed) {
          this.router.navigate(['/employees']);
        }
      })
    );
  }
}
