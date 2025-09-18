import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ]
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  menuOpen = false;

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn(); 

  }

  get isAdmin(): boolean {
    return this.auth.getCurrentUserRole() === 'admin';
  }

  get isEmployee(): boolean {
    return this.auth.getCurrentUserRole() === 'employee';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get fullName$() {
  return this.auth.fullName$;
}

}
