import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_NATIVE_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { EXPENSE_TYPES } from '../../models/expense.model';

@Component({
  selector: 'app-expense-submission-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatIconModule
  ],
  providers: [
      { provide: DateAdapter, useClass: NativeDateAdapter },
      { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
      { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
    ],
  templateUrl: './expense-submission-modal.component.html',
  styleUrls: ['./expense-submission-modal.component.scss']
})
export class ExpenseSubmissionModalComponent implements OnInit {
  expenseForm: FormGroup;
  loading = false;
  expenseTypes = EXPENSE_TYPES;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ExpenseSubmissionModalComponent>,
    private expenseService: ExpenseService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      expenseDetails: this.fb.array([this.createDetailFormGroup()])
    });
  }

  ngOnInit(): void {
    if (this.data?.claim) {
      // I can use this later to edit the expense
    }
  }

  get expenseDetails(): FormArray {
    return this.expenseForm.get('expenseDetails') as FormArray;
  }

  createDetailFormGroup(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
      total: ['', [Validators.required, Validators.min(0)]]
    });
  }

  addDetail(): void {
    this.expenseDetails.push(this.createDetailFormGroup());
  }

  removeDetail(index: number): void {
    this.expenseDetails.removeAt(index);
  }

  calculateTotal(): number {
    return this.expenseDetails.controls.reduce((sum, control) => {
      return sum + (control.get('total')?.value || 0);
    }, 0);
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.snackBar.open('Please fill in all required fields.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.loading = true;

    const formValue = this.expenseForm.value;
    const claimData = {
      employeeId: this.data.userId,
      employeeName: this.authService.getFullName() || 'Unknown',
      date: new Date(),
      description: formValue.description,
      total: this.calculateTotal(),
      status: 'pending',
      createdAt: new Date()
    };

    const details = formValue.expenseDetails.map((detail: any) => ({
      date: detail.date,
      description: detail.description,
      type: detail.type,
      total: detail.total
    }));

    this.expenseService.submitExpenseClaim(claimData, details)
      .then(() => {
        this.snackBar.open('Expense claim submitted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.dialogRef.close(true);
      })
      .catch(error => {
        this.snackBar.open('Error submitting expense claim: ' + error.message, 'Close', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }
}