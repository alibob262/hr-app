import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, NativeDateAdapter, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { LeaveService } from '../../services/leave.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leave-submission-modal',
  standalone: true,
  templateUrl: './leave-submission-modal.component.html',
  styleUrls: ['./leave-submission-modal.component.scss'],
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
    MatDialogModule
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ]
})
export class LeaveSubmissionModalComponent {
  leaveForm: FormGroup;
  loading = false;

  leaveTypes = [
    { id: 1, name: 'Vacation' },
    { id: 2, name: 'Sick Leave' },
    { id: 3, name: 'Emergency' },
    { id: 4, name: 'Unpaid' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<LeaveSubmissionModalComponent>,
    private leaveService: LeaveService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.leaveForm = this.fb.group({
      leaveTypeId: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
      note: ['']
    });
  }

  calculateDaysDisplay(): number {
    const fromDate = new Date(this.leaveForm.get('from')?.value);
    const toDate = new Date(this.leaveForm.get('to')?.value);

    if (!fromDate || !toDate || toDate < fromDate) return 0;

    let count = 0;
    let current = new Date(fromDate);

    while (current <= toDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) {
      this.snackBar.open('Please fill in all required fields.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.loading = true;

    const formValue = this.leaveForm.value;
    const leaveData = {
      employeeId: this.data.userId,
      employeeName: this.authService.getFullName() || 'Unknown',
      leaveTypeId: formValue.leaveTypeId,
      leaveTypeName: this.leaveTypes.find(t => t.id === formValue.leaveTypeId)?.name || '',
      from: formValue.from,
      to: formValue.to,
      numberOfDays: this.calculateDaysDisplay(),
      note: formValue.note || ''
    };

    this.leaveService.submitLeave(leaveData)
      .then(() => {
        this.snackBar.open('Leave request submitted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.dialogRef.close(true);
      })
      .catch(error => {
        this.snackBar.open('Error submitting leave: ' + error.message, 'Close', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}