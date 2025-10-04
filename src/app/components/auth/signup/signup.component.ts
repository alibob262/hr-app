import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Department } from '../../../models/department.model';
import { DepartmentService } from '../../../services/department.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
})
export class SignupComponent implements OnInit {
  form: FormGroup;
  departments: Department[] = [];
  loading = signal(false);
  error = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private departmentService: DepartmentService,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      address: ['', Validators.required],
      departmentId: ['', Validators.required]
    }, { 
      validator: this.passwordMatchValidator 
    });
  }

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe((departments) => {
      this.departments = departments;
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async signup() {
  if (this.form.valid) {
    this.loading.set(true);
    this.error.set('');
    try {
      const { email, password, fullName, departmentId, address } = this.form.value;
      await this.authService.signup(
        email, 
        password, 
        fullName, 
        departmentId,
        address
      );
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error.set(err.message || 'Error creating account. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
}