import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { RepartidorService } from '../../core/services/repartidor.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { PedidoTrabajador } from '../../core/models/pedido-trabajador.model';

@Component({
  selector: 'app-repartidor-panel',
  standalone: true,
  imports: [CommonModule, TabViewModule, ButtonModule, TagModule, CardModule],
  templateUrl: './repartidor-panel.component.html',
  styleUrl: './repartidor-panel.component.scss'
})
export class RepartidorPanelComponent implements OnInit {

  disponibles = signal<PedidoTrabajador[]>([]);
  misEntregas = signal<PedidoTrabajador[]>([]);

  constructor(
    private repartidorService: RepartidorService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.repartidorService.disponibles().subscribe(data => this.disponibles.set(data));
    this.repartidorService.misEntregas().subscribe(data => this.misEntregas.set(data));
  }

  tomar(pedido: PedidoTrabajador): void {
    this.repartidorService.tomar(pedido.id).subscribe({
      next: () => {
        this.notificacionService.notificarCreacion(`Tomaste la entrega ${pedido.numeroPedido}`);
        this.cargarTodo();
      },
      error: (err) => this.notificacionService.error(err.error?.mensaje ?? 'No se pudo tomar el pedido')
    });
  }

  marcarEntregado(pedido: PedidoTrabajador): void {
    this.repartidorService.marcarEntregado(pedido.id).subscribe({
      next: () => {
        this.notificacionService.notificarReactivacion(`Pedido ${pedido.numeroPedido} entregado`);
        this.cargarTodo();
      },
      error: (err) => this.notificacionService.error(err.error?.mensaje ?? 'No se pudo confirmar')
    });
  }
}