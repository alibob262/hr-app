import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expenses-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './expenses-chart.component.html',
  styleUrls: ['./expenses-chart.component.scss']
})
export class ExpensesChartComponent implements OnInit, OnDestroy {
  private expenseService = inject(ExpenseService);
  expenseData$ = this.expenseService.getExpenseSummary();

  view: [number, number] = [700, 400];
  gradient = false;
  showXAxis = true;
  showYAxis = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Expense Type';
  yAxisLabel = 'Total Amount';
  legendPosition = LegendPosition.Below;
  barPadding = 8;

  colorScheme = {
    domain: ['#4285F4', '#FBBC05', '#34A853', '#EA4335'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'expenseScheme'
  };

  ngOnInit() {
    this.updateChartSize();
    window.addEventListener('resize', this.updateChartSize);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateChartSize);
  }

  private updateChartSize = () => {
    const width = window.innerWidth;
    const mobile = width < 768;
    const tablet = width >= 768 && width <= 1024;
    const w = mobile ? width * 0.95 : tablet ? width * 0.9 : 700;
    const h = mobile ? w * 0.7 : tablet ? w * 0.6 : 400;
    this.barPadding = mobile ? 16 : 8;
    this.showLegend = !mobile;
    this.view = [w, h];
  };
}
