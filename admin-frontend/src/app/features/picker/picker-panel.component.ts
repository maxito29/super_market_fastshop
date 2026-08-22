import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { PickerService } from '../../core/services/picker.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { PedidoTrabajador } from '../../core/models/pedido-trabajador.model';

@Component({
  selector: 'app-picker-panel',
  standalone: true,
  imports: [CommonModule, TabViewModule, ButtonModule, TagModule, CardModule],
  templateUrl: './picker-panel.component.html',
  styleUrl: './picker-panel.component.scss'
})
export class PickerPanelComponent implements OnInit {

  disponibles = signal<PedidoTrabajador[]>([]);
  misPreparaciones = signal<PedidoTrabajador[]>([]);
  listosRecojo = signal<PedidoTrabajador[]>([]);

  constructor(
    private pickerService: PickerService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.pickerService.disponibles().subscribe(data => this.disponibles.set(data));
    this.pickerService.misPreparaciones().subscribe(data => this.misPreparaciones.set(data));
    this.pickerService.listosParaRecojo().subscribe(data => this.listosRecojo.set(data));
  }

  tomar(pedido: PedidoTrabajador): void {
    this.pickerService.tomar(pedido.id).subscribe({
      next: () => {
        this.notificacionService.notificarCreacion(`Tomaste el pedido ${pedido.numeroPedido}`);
        this.cargarTodo();
      },
      error: (err) => this.notificacionService.error(err.error?.mensaje ?? 'No se pudo tomar el pedido')
    });
  }

  marcarListo(pedido: PedidoTrabajador): void {
    this.pickerService.marcarListo(pedido.id).subscribe({
      next: () => {
        this.notificacionService.notificarEdicion(`Pedido ${pedido.numeroPedido} listo`);
        this.cargarTodo();
      },
      error: (err) => this.notificacionService.error(err.error?.mensaje ?? 'No se pudo actualizar')
    });
  }

  confirmarRecojo(pedido: PedidoTrabajador): void {
    this.pickerService.confirmarRecojo(pedido.id).subscribe({
      next: () => {
        this.notificacionService.notificarReactivacion(`Pedido ${pedido.numeroPedido} entregado`);
        this.cargarTodo();
      },
      error: (err) => this.notificacionService.error(err.error?.mensaje ?? 'No se pudo confirmar')
    });
  }
}