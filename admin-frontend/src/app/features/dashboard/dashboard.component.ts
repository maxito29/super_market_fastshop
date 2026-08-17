import { Component, OnInit, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
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
  ApexLegend,
  ApexStroke,
  ApexFill,
  ApexYAxis
} from 'ng-apexcharts';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ProductoService } from '../../core/services/producto.service';
import { DashboardResumen } from '../../core/models/dashboard.model';
import { Producto } from '../../core/models/producto.model';
import { ButtonModule } from 'primeng/button';
import { NotificacionService } from '../../core/services/notificacion.service';

export type ChartBarras = {
  series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; yaxis?: ApexYAxis;
  dataLabels: ApexDataLabels; grid: ApexGrid; tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions; colors: string[]; fill?: ApexFill;
};

export type ChartDona = {
  series: ApexNonAxisChartSeries; chart: ApexChart; labels: string[];
  colors: string[]; legend: ApexLegend; dataLabels: ApexDataLabels; tooltip: ApexTooltip;
  plotOptions?: ApexPlotOptions; fill?: ApexFill; stroke?: ApexStroke;
};

const PALETA_BASE = ['#2563eb', '#7c3aed', '#0d9488', '#f59e0b', '#ec4899', '#64748b'];
const PALETA_DEGRADADO = ['#60a5fa', '#a78bfa', '#2dd4bf', '#fbbf24', '#f472b6', '#94a3b8'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgApexchartsModule, TableModule, TagModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  resumen = signal<DashboardResumen | null>(null);
  productos = signal<Producto[]>([]);
  chartDona: Partial<ChartDona> | null = null;
  chartTop5: Partial<ChartBarras> | null = null;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private productoService: ProductoService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.construirChartDona(data);
        this.construirChartTop5(data);
      }
    });

    this.productoService.listarTodos().subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) => a.stock - b.stock);
        this.productos.set(ordenados);
      }
    });
  }

  claseStock(stock: number): 'danger' | 'warning' | 'success' {
    if (stock === 0) return 'danger';
    if (stock < 20) return 'warning';
    return 'success';
  }

  etiquetaStock(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock < 20) return 'Stock bajo';
    return 'Con stock';
  }

private construirChartDona(data: DashboardResumen): void {
  const cantidades = data.productosPorCategoria.map(c => c.cantidad);

  this.chartDona = {
    series: cantidades,
    labels: data.productosPorCategoria.map(c => c.categoria),
    chart: { 
      type: 'donut', 
      height: 320, 
      fontFamily: 'Inter, system-ui, sans-serif' 
    },
    colors: PALETA_BASE,
    stroke: {
      show: true,
      width: 2,
      colors: ['#ffffff']
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%', 
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: '#64748b',
              offsetY: -4
            },
            value: {
              show: true,
              fontSize: '24px', 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              color: '#0f172a',
              offsetY: 8,
              formatter: (val: string) => val 
            },
            total: {
              show: true,
              label: 'Total', 
              color: '#475569',
              fontWeight: 600,
              formatter: (w: any) => {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
              }
            }
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'diagonal1',
        shadeIntensity: 0.15,
        gradientToColors: PALETA_DEGRADADO,
        inverseColors: false,
        opacityFrom: 0.95,
        opacityTo: 0.85,
        stops: [0, 100]
      }
    },
    legend: { 
      position: 'bottom', 
      fontSize: '13px', 
      labels: { colors: '#475569' },
      markers: { width: 10, height: 10, radius: 12 }
    },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light' }
  };
}


  private construirChartTop5(data: DashboardResumen): void {
    this.chartTop5 = {
      series: [{ name: 'Stock', data: data.topProductosStock.map(p => p.stock) }],
      chart: { 
        type: 'bar', 
        height: 320, 
        toolbar: { show: false }, 
        fontFamily: 'Inter, system-ui, sans-serif' 
      },
      colors: PALETA_BASE,
      plotOptions: { 
        bar: { 
          horizontal: true, 
          borderRadius: 6, 
          borderRadiusApplication: 'end', 
          barHeight: '48%', 
          distributed: true 
        } 
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.2,
          gradientToColors: PALETA_DEGRADADO,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.85,
          stops: [0, 100]
        }
      },
      dataLabels: { 
        enabled: true, 
        textAnchor: 'end',
        style: { colors: ['#fff'], fontWeight: 600, fontSize: '11px' } 
      },
      xaxis: {
        categories: data.topProductosStock.map(p => p.nombre),
        labels: { style: { colors: '#64748b', fontSize: '12px' } },
        axisBorder: { show: false }, 
        axisTicks: { show: false }
      },
      yaxis: {
        labels: { style: { colors: '#334155', fontWeight: 500, fontSize: '12px' } }
      },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      tooltip: { theme: 'light' }
    };
  }

  enviarAlertaStock(): void {
    this.dashboardService.enviarAlertaStock().subscribe({
      next: (res: any) => {
        if (res.productosNotificados === 0) {
          this.notificacionService.exito(
            'No hay productos con stock bajo ahora mismo'
          );
        } else {
          this.notificacionService.notificarCreacion(
            `Correo enviado: ${res.productosNotificados} productos con stock bajo`
          );
        }
      },
      error: () => {
        this.notificacionService.error('No se pudo enviar el correo');
      }
    });
  }

  exportarPdf(): void {
    this.dashboardService.exportarPdf().subscribe({
      next: (blob) => this.descargarArchivo(blob, 'reporte-dashboard.pdf'),
      error: () => this.notificacionService.error('No se pudo generar el PDF')
    });
  }

  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    window.URL.revokeObjectURL(url);
  }
}
