import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CarritoService } from '../../../core/services/carrito.service';
import { MenuLateralService } from '../../../core/services/menu-lateral.service';

// Importaciones de PrimeNG 17
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(public carrito: CarritoService, public menu: MenuLateralService, private router: Router) {}

  alPresionarCarrito(): void {
    // Si el cliente ya está viendo la página del carrito, el ícono no debe
    // abrir el drawer encima de la misma información: solo se queda ahí.
    if (this.router.url.startsWith('/carrito')) {
      return;
    }
    this.carrito.abrir();
  }
}