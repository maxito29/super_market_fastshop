import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

import { PedidoService } from '../../core/services/pedido.service';
import { PedidoResponse } from '../../core/models/pedido.models';

type ModoBusqueda = 'numero' | 'dni' | 'ruc' | 'telefono';

@Component({
  selector: 'app-mi-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TagModule],
  templateUrl: './mi-pedido.component.html',
  styleUrl: './mi-pedido.component.scss'
})
export class MiPedidoComponent implements OnInit {

  modos: { label: string; value: ModoBusqueda; placeholder: string }[] = [
    { label: 'Número de pedido', value: 'numero', placeholder: 'PED-XXXXXXXXXXX' },
    { label: 'DNI', value: 'dni', placeholder: 'Ej. 71234567' },
    { label: 'RUC', value: 'ruc', placeholder: 'Ej. 20601030013' },
    { label: 'Teléfono', value: 'telefono', placeholder: 'Ej. 987654321' }
  ];
  modoSeleccionado: ModoBusqueda = 'numero';

  valor = '';
  buscando = false;
  buscoUnaVez = false;
  pedidos: PedidoResponse[] = [];
  mensajeError = '';

  constructor(private pedidoService: PedidoService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const valorInicial = this.route.snapshot.queryParamMap.get('valor');
    if (valorInicial) {
      this.valor = valorInicial;
      this.consultar();
    }
  }

  get placeholderActual(): string {
    return this.modos.find(m => m.value === this.modoSeleccionado)?.placeholder ?? '';
  }

  get etiquetaActual(): string {
    return this.modos.find(m => m.value === this.modoSeleccionado)?.label ?? '';
  }

  elegirModo(modo: ModoBusqueda): void {
    this.modoSeleccionado = modo;
    this.valor = '';
  }

  consultar(): void {
    if (!this.valor) return;

    this.buscando = true;
    this.buscoUnaVez = true;
    this.pedidos = [];
    this.mensajeError = '';

    this.pedidoService.buscar(this.valor).subscribe({
      next: pagina => {
        this.pedidos = pagina.content;
        if (this.pedidos.length === 0) {
          this.mensajeError = 'No encontramos ningún pedido con ese dato. Revísalo e intenta de nuevo.';
        }
        this.buscando = false;
      },
      error: () => {
        this.mensajeError = 'No pudimos hacer la búsqueda. Intenta de nuevo en unos segundos.';
        this.buscando = false;
      }
    });
  }

  colorEstado(estado: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Pagado': return 'info';
      case 'En preparación': return 'info';
      case 'Enviado': return 'info';
      case 'Entregado': return 'success';
      case 'Cancelado': return 'danger';
      default: return 'secondary';
    }
  }
}
