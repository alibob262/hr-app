import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../../services/employee.service';
import { DepartmentService } from '../../../services/department.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule, RouterLink } from '@angular/router';
import { Employee } from '../../../models/employee.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    RouterLink,
    AsyncPipe,
    MatSnackBarModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  private fb               = inject(FormBuilder);
  private employeeService  = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private router           = inject(Router);
  private route            = inject(ActivatedRoute);
  private snackBar         = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    name:         ['', Validators.required],
    email:        ['', [Validators.required, Validators.email]],
    address:      ['', Validators.required],
    departmentId: ['', Validators.required]
  });

  departments$ = this.departmentService.getDepartments();
  isEditMode   = false;
  employeeId: string | null = null;
  loading      = false;

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (!this.employeeId) {
      this.router.navigate(['/employees']);
      return;
    }

    this.isEditMode = true;
    this.loadEmployeeData(this.employeeId);
  }

  private loadEmployeeData(id: string): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee: Employee) => {
        this.form.patchValue({
          name:         employee.name,
          email:        employee.email,
          address:      employee.address,
          departmentId: employee.departmentId
        });
      },
      error: console.error
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.isEditMode || !this.employeeId) return;

    this.loading = true;
    const data = this.form.value;

    this.employeeService.updateEmployee(this.employeeId, data)
      .then(() => {
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        setTimeout(() => this.router.navigate(['/employees']), 2000);
      })
      .catch(error => {
        console.error('Update error:', error);
        this.loading = false;
      });
  }
}
