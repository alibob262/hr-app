import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LeaveSubmissionModalComponent } from '../leave-submission-modal/leave-submission-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseSubmissionModalComponent } from '../expense-submission-modal/expense-submission-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, MatButtonModule, MatDialogModule,MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  
  role: 'admin' | 'employee' | null = null;
  userId: string | null = null;

  ngOnInit(): void {
    this.role = this.authService.getCurrentUserRole();
    this.userId = this.authService.getCurrentUser()?.uid || null;
  }

  openLeaveSubmission() {
    this.dialog.open(LeaveSubmissionModalComponent, {
      width: '90%',
      maxWidth: '600px',
      data: { userId: this.userId }
    });
  }

  viewMyLeaves() {
    this.router.navigate(['/leaves']);
  }

  viewAllLeaves() {
    this.router.navigate(['/leaves/admin']);
  }

  openExpenseSubmission() {
    this.dialog.open(ExpenseSubmissionModalComponent, {
      width: '90%',
      maxWidth: '800px',
      data: { userId: this.userId }
    });
  }

  viewMyExpenses() {
    this.router.navigate(['/expenses']);
  }

  viewAllExpenses() {
    this.router.navigate(['/expenses/admin']);
  }
}