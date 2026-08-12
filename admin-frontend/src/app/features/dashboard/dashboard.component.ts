import { Component, OnInit, signal } from '@angular/core';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexGrid,
  ApexTooltip,
  ApexPlotOptions,
  ApexLegend
} from 'ng-apexcharts';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardResumen } from '../../core/models/dashboard.model';

export type ChartBarras = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  colors: string[];
};

export type ChartDona = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
};

const PALETA_COLORES = ['#16a34a', '#2563eb', '#f59e0b', '#dc2626', '#8b5cf6', '#0891b2'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  resumen = signal<DashboardResumen | null>(null);
  chartDona: Partial<ChartDona> | null = null;
  chartTop5: Partial<ChartBarras> | null = null;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.construirChartDona(data);
        this.construirChartTop5(data);
      }
    });
  }

  private construirChartDona(data: DashboardResumen): void {
    this.chartDona = {
      series: data.productosPorCategoria.map(c => c.cantidad),
      labels: data.productosPorCategoria.map(c => c.categoria),
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'Inter, sans-serif'
      },
      colors: PALETA_COLORES,
      legend: {
        position: 'bottom',
        fontSize: '0.8rem',
        labels: { colors: '#475569' }
      },
      dataLabels: { enabled: false },
      tooltip: { theme: 'light' }
    };
  }

  private construirChartTop5(data: DashboardResumen): void {
    this.chartTop5 = {
      series: [
        {
          name: 'Stock',
          data: data.topProductosStock.map(p => p.stock)
        }
      ],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif'
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: '55%',
          distributed: true
        }
      },
      dataLabels: { enabled: true, style: { colors: ['#fff'] } },
      xaxis: {
        categories: data.topProductosStock.map(p => p.nombre),
        labels: { style: { colors: '#64748b', fontSize: '0.8rem' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4
      },
      tooltip: { theme: 'light' },
      colors: PALETA_COLORES
    };
  }
}