import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { CarritoService } from '../../core/services/carrito.service';

@Component({
  selector: 'app-mini-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-carrito.component.html',
  styleUrl: './mini-carrito.component.scss'
})
export class MiniCarritoComponent {
  constructor(public carrito: CarritoService, private router: Router) {}

  cerrar(): void {
    this.carrito.cerrar();
  }

  incrementar(productoId: number, ofertaProductoId: number | null, cantidadActual: number, stockDisponible: number): void {
    if (cantidadActual < stockDisponible) {
      this.carrito.cambiarCantidad(productoId, ofertaProductoId, cantidadActual + 1);
    }
  }

  decrementar(productoId: number, ofertaProductoId: number | null, cantidadActual: number): void {
    if (cantidadActual > 1) {
      this.carrito.cambiarCantidad(productoId, ofertaProductoId, cantidadActual - 1);
    } else {
      this.carrito.quitar(productoId, ofertaProductoId);
    }
  }

  quitar(productoId: number, ofertaProductoId: number | null): void {
    this.carrito.quitar(productoId, ofertaProductoId);
  }

  irAlCarrito(): void {
    this.carrito.cerrar();
    this.router.navigateByUrl('/carrito');
  }

  seguirComprando(): void {
    this.carrito.cerrar();
  }
}