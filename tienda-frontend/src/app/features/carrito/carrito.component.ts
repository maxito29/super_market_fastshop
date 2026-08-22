import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

import { CarritoService } from '../../core/services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputNumberModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent {

  constructor(public carrito: CarritoService) {}

  actualizarCantidad(productoId: number, ofertaProductoId: number | null, cantidad: number): void {
    if (cantidad < 1) return;
    this.carrito.cambiarCantidad(productoId, ofertaProductoId, cantidad);
  }

  quitar(productoId: number, ofertaProductoId: number | null): void {
    this.carrito.quitar(productoId, ofertaProductoId);
  }
}
