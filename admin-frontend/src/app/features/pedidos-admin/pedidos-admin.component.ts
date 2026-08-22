import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PedidoAdminService } from '../../core/services/pedido-admin.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { PedidoTrabajador } from '../../core/models/pedido-trabajador.model';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  templateUrl: './pedidos-admin.component.html',
  styleUrl: './pedidos-admin.component.scss'
})
export class PedidosAdminComponent implements OnInit {

  pendientes = signal<PedidoTrabajador[]>([]);
  cargando = signal(true);

  constructor(
    private pedidoAdminService: PedidoAdminService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.pedidoAdminService.pendientes().subscribe({
      next: (data) => {
        this.pendientes.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  confirmarPago(pedido: PedidoTrabajador): void {
    this.pedidoAdminService.marcarPagado(pedido.id).subscribe({
      next: () => {
        this.notificacionService.notificarCreacion(`Pago confirmado: ${pedido.numeroPedido}`);
        this.cargar();
      },
      error: (err) => this.notificacionService.error(err.error?.mensaje ?? 'No se pudo confirmar el pago')
    });
  }
}