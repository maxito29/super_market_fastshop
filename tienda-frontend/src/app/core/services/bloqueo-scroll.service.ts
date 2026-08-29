import { Injectable, effect } from '@angular/core';
import { CarritoService } from './carrito.service';
import { MenuLateralService } from './menu-lateral.service';

@Injectable({ providedIn: 'root' })
export class BloqueoScrollService {

  constructor(
    private menu: MenuLateralService,
    private carrito: CarritoService
  ) {
    effect(() => {
      const debeBloquear = this.menu.abierto() || this.carrito.abierto();
      this.aplicarBloqueo(debeBloquear);
    });
  }

  private aplicarBloqueo(bloquear: boolean): void {
    if (bloquear) {
      const anchoScrollbar = window.innerWidth - document.documentElement.clientWidth;
      if (anchoScrollbar > 0) {
        document.body.style.paddingRight = `${anchoScrollbar}px`;
      }
      document.body.classList.add('scroll-bloqueado');
    } else {
      document.body.classList.remove('scroll-bloqueado');
      document.body.style.paddingRight = '';
    }
  }
}