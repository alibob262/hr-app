import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LeaveService } from '../../services/leave.service';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { ActivatedRoute } from '@angular/router';
import { LeavesChartComponent } from '../leaves-chart/leaves-chart.component';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../models/employee.model';
import { Leave } from '../../models/leave.model';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { LeaveSubmissionModalComponent } from '../leave-submission-modal/leave-submission-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-leaves-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    LeavesChartComponent,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './leaves-list.component.html',
  styleUrls: ['./leaves-list.component.scss']
})
export class LeavesListComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  leaves: Leave[] = [];
  filteredLeaves: Leave[] = [];
  loading = true;
  userId: string | null = null;
  isAdminView = false;
  employees: Employee[] = [];
  selectedEmployee: string | null = null;

  // Filter controls
  fromDateFilter: Date | null = null;
  toDateFilter: Date | null = null;

  // Pagination
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];
  showChart = false;

  get totalPages(): number {
    return Math.ceil(this.filteredLeaves.length / this.pageSize);
  }

  get paginatedLeaves() {
    const start = this.pageIndex * this.pageSize;
    return this.filteredLeaves.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.isAdminView = this.route.snapshot.routeConfig?.path === 'leaves/admin';
    this.userId = this.authService.getCurrentUser()?.uid || null;
    
    if (this.isAdminView) {
      this.loadEmployees();
    } else {
      this.loadLeaves();
    }
  }

  openLeaveSubmissionModal(): void {
    const dialogRef = this.dialog.open(LeaveSubmissionModalComponent, {
      width: '500px',
      data: { userId: this.userId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadLeaves();
      }
    });
  }

  toggleChart() {
    this.showChart = !this.showChart;
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe(employees => {
      this.employees = employees;
      this.loadAllLeaves();
    });
  }

  loadAllLeaves() {
    this.loading = true;
    this.leaveService.getAllLeaves().subscribe(leaves => {
      this.processLeaves(leaves);
    });
  }

  loadLeaves() {
    this.loading = true;
    if (this.userId) {
      this.leaveService.getEmployeeLeaves(this.userId).subscribe(leaves => {
        this.processLeaves(leaves);
      });
    }
  }

  private processLeaves(leaves: Leave[]) {
    this.leaves = leaves.map(leave => ({
      ...leave,
      from: this.convertTimestamp(leave.from),
      to: this.convertTimestamp(leave.to),
      createdAt: this.convertTimestamp(leave.createdAt),
      employeeName: leave.employeeName || 'Unknown'
    })).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    this.applyFilters();
    this.loading = false;
  }

  private convertTimestamp(timestamp: any): Date {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  }

  applyFilters() {
    this.filteredLeaves = this.leaves.filter(leave => {
      const matchesFrom = !this.fromDateFilter || 
        leave.from >= new Date(this.fromDateFilter);
      const matchesTo = !this.toDateFilter || 
        leave.to <= new Date(this.toDateFilter);
      const matchesEmployee = !this.selectedEmployee || 
        leave.employeeId === this.selectedEmployee;
      
      return matchesFrom && matchesTo && (this.isAdminView ? matchesEmployee : true);
    });
    this.pageIndex = 0;
  }

  clearFilters() {
    this.fromDateFilter = null;
    this.toDateFilter = null;
    this.selectedEmployee = null;
    this.applyFilters();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'warn';
      case 'pending': return 'primary';
      default: return '';
    }
  }

  previousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
    }
  }

  onPageSizeChange() {
    this.pageIndex = 0;
  }

  updateLeaveStatus(leaveId: string, status: 'approved' | 'rejected') {
    this.leaveService.updateLeaveStatus(leaveId, status).then(() => {
      this.snackBar.open(`Leave request ${status} successfully`, 'Close', {
        duration: 3000
      });
      
      const leaveIndex = this.leaves.findIndex(l => l.id === leaveId);
      if (leaveIndex !== -1) {
        this.leaves[leaveIndex].status = status;
        this.applyFilters();
      }
    }).catch(error => {
      this.snackBar.open(`Failed to update leave status: ${error.message}`, 'Close', {
        duration: 5000
      });
    });
  }
}