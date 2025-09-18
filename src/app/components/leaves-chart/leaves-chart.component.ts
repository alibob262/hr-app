import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-leaves-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './leaves-chart.component.html',
  styleUrls: ['./leaves-chart.component.scss']
})
export class LeavesChartComponent implements OnInit {
  private leaveService = inject(LeaveService);

  leaveData$ = this.leaveService.getLeaveTypeSummary();

  view: [number, number] = [700, 400];

  gradient = false;
  showXAxis = true;
  showYAxis = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Leave Type';
  yAxisLabel = 'Total Days';
  legendPosition = LegendPosition.Below;
  barPadding = 8;

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'customScheme'
  };

  ngOnInit() {
    this.updateChartSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateChartSize();
  }

  private updateChartSize() {
    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width <= 1024;

    const chartWidth = isMobile ? width * 0.98 : isTablet ? width * 0.9 : 700;
    const chartHeight = isMobile ? 280 : isTablet ? 360 : 400;

    this.barPadding = isMobile ? 18 : 8;
    this.showLegend = !isMobile;
    this.view = [chartWidth, chartHeight];
  }
}
