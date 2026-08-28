import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CarritoService } from '../../core/services/carrito.service';
import { ItemCarrito } from '../../core/models/carrito.models';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent {

  private clavesSaliendo = new Set<string>();

  constructor(public carrito: CarritoService) {}

  clave(item: ItemCarrito): string {
    return `${item.productoId}-${item.ofertaProductoId ?? 'base'}`;
  }

  estaSaliendo(item: ItemCarrito): boolean {
    return this.clavesSaliendo.has(this.clave(item));
  }

  incrementar(item: ItemCarrito): void {
    if (item.cantidad < item.stockDisponible) {
      this.carrito.cambiarCantidad(item.productoId, item.ofertaProductoId, item.cantidad + 1);
    }
  }

  decrementar(item: ItemCarrito): void {
    if (item.cantidad > 1) {
      this.carrito.cambiarCantidad(item.productoId, item.ofertaProductoId, item.cantidad - 1);
    }
  }

  quitar(item: ItemCarrito): void {
    // Deja que la animación de salida se vea antes de sacar el producto del
    // signal; sin esto la tarjeta desaparece de golpe en vez de deslizarse.
    const clave = this.clave(item);
    this.clavesSaliendo.add(clave);

    setTimeout(() => {
      this.carrito.quitar(item.productoId, item.ofertaProductoId);
      this.clavesSaliendo.delete(clave);
    }, 260);
  }

  vaciarCarrito(): void {
    this.carrito.vaciar();
  }
}