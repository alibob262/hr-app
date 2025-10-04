import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { ActivatedRoute } from '@angular/router';
import { ExpenseClaim, ExpenseClaimView } from '../../models/expense.model';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../models/employee.model';
import { ExpensesChartComponent } from '../expenses-chart/expenses-chart.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseSubmissionModalComponent } from '../expense-submission-modal/expense-submission-modal.component';

@Component({
  selector: 'app-expenses-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    ExpensesChartComponent,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.scss']
})
export class ExpensesListComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  expenses: ExpenseClaimView[] = [];
  filteredExpenses: ExpenseClaimView[] = [];
  loading = true;
  userId: string | null = null;
  isAdminView = false;
  employees: Employee[] = [];
  selectedEmployee: string | null = null;

  fromDateFilter: Date | null = null;
  toDateFilter: Date | null = null;

  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];
  showChart = false;

  get totalPages(): number {
    return Math.ceil(this.filteredExpenses.length / this.pageSize);
  }

  get paginatedExpenses() {
    const start = this.pageIndex * this.pageSize;
    return this.filteredExpenses.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.isAdminView = this.route.snapshot.routeConfig?.path === 'expenses/admin';
    this.userId = this.authService.getCurrentUser()?.uid || null;

    if (this.isAdminView) {
      this.loadEmployees();
    } else {
      this.loadExpenses();
    }
  }

  openExpenseModal(): void {
    const dialogRef = this.dialog.open(ExpenseSubmissionModalComponent, {
      width: '800px',
      data: { userId: this.userId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.isAdminView) {
          this.loadAllExpenses();
        } else {
          this.loadExpenses();
        }
      }
    });
  }

  toggleChart() {
    this.showChart = !this.showChart;
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe(employees => {
      this.employees = employees;
      this.loadAllExpenses();
    });
  }

  loadAllExpenses() {
    this.loading = true;
    this.expenseService.getAllClaims().subscribe(expenses => {
      this.processExpenses(expenses);
    });
  }

  loadExpenses() {
    this.loading = true;
    if (this.userId) {
      this.expenseService.getEmployeeClaims(this.userId).subscribe(expenses => {
        this.processExpenses(expenses);
      });
    }
  }

  private processExpenses(expenses: ExpenseClaim[]) {
    this.expenses = expenses.map(expense => ({
      ...expense,
      date: this.convertTimestamp(expense.date),
      createdAt: this.convertTimestamp(expense.createdAt),
      employeeName: expense.employeeName || 'Unknown',
      showDetails: false,
      details: []
    })).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.applyFilters();
    this.loading = false;
  }

  getDate(date: Date | any): Date {
    return this.convertTimestamp(date);
  }

  private convertTimestamp(timestamp: any): Date {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  }

  toggleDetails(expense: ExpenseClaimView) {
    expense.showDetails = !expense.showDetails;

    if (expense.showDetails && (!expense.details || expense.details.length === 0)) {
      this.expenseService.getClaimDetails(expense.id!).subscribe(details => {
        expense.details = details.map(detail => ({
          ...detail,
          date: this.convertTimestamp(detail.date)
        }));
      });
    }
  }

  applyFilters() {
    this.filteredExpenses = this.expenses.filter(expense => {
      const matchesFrom = !this.fromDateFilter || 
        expense.date >= new Date(this.fromDateFilter);
      const matchesTo = !this.toDateFilter || 
        expense.date <= new Date(this.toDateFilter);
      const matchesEmployee = !this.selectedEmployee || 
        expense.employeeId === this.selectedEmployee;

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
}