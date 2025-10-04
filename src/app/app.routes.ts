import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
import { EmployeeFormComponent } from './features/employees/employee-form/employee-form.component';
import { EmployeeListComponent } from './features/employees/employee-list/employee-list.component';
import { NoAuthGuard } from './guards/no-auth.guard';
import { LeavesListComponent } from './components/leaves-list/leaves-list.component';
import { AdminGuard } from './guards/admin.guard';
import { ExpensesListComponent } from './components/expenses-list/expenses-list.component';
import { LeavesChartComponent } from './components/leaves-chart/leaves-chart.component';
import { ExpensesChartComponent } from './components/expenses-chart/expenses-chart.component';
import { SelfOrAdminGuard } from './guards/self-or-admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [NoAuthGuard] },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'leaves',
    canActivate: [AuthGuard],
    component: LeavesListComponent
  },
  {
    path: 'leaves/admin',
    canActivate: [AuthGuard, AdminGuard],
    component: LeavesListComponent
  },
  {
    path: 'expenses',
    canActivate: [AuthGuard],
    component: ExpensesListComponent
  },
  {
    path: 'expenses/admin',
    canActivate: [AuthGuard, AdminGuard],
    component: ExpensesListComponent
  },
  {
    path: 'employees',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: EmployeeListComponent },
      { path: ':id', component: EmployeeFormComponent, canActivate: [AuthGuard,SelfOrAdminGuard] }
    ]
  },
  {
    path: 'leaves/chart',
    canActivate: [AuthGuard, AdminGuard],
    component: LeavesChartComponent
  },
  { path: 'expenses/chart', 
    canActivate: [AuthGuard, AdminGuard],
    component: ExpensesChartComponent 
  }
];