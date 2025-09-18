import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { EmployeeService } from '../../../services/employee.service';
import { DepartmentService } from '../../../services/department.service';
import { AuthService } from '../../../services/auth.service';
import { RouterLink, RouterModule } from '@angular/router';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    AsyncPipe
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent {
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  public authService = inject(AuthService);

  employees: Employee[] = [];
  currentUserId!: string | null;
  currentUserRole!: 'admin' | 'employee' | null;
  departmentsMap = new Map<number, string>();

  constructor() {
    this.authService.getCurrentUserData().then(user => {
      this.currentUserId = user?.id ?? null;
    });

    this.authService.role$.subscribe(role => {
      this.currentUserRole = role;
    });

    this.departmentService.getDepartments().subscribe(depts => {
      this.departmentsMap = new Map(depts.map(d => [d.id, d.name]));
    });
  }

  ngOnInit() {
    this.employeeService.getEmployees().subscribe(list => {
      this.employees = list;
    });
  }

  getDepartmentName(id: number | string): string {
    const num = Number(id);
    return this.departmentService.getDepartmentById(num)?.name || 'Unknown';
  }

  canEdit(employeeId: string): boolean {
    // admins can edit anyone, otherwise you can only edit yourself
    return (
      this.currentUserRole === 'admin' ||
      this.currentUserId === employeeId
    );
  }
}