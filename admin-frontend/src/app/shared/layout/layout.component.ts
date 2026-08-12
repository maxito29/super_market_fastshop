import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';

interface ItemMenu {
  etiqueta: string;
  icono: string;
  ruta: string;
  disponible: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AvatarModule, ButtonModule, TooltipModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
menu: ItemMenu[] = [
    { etiqueta: 'Dashboard', icono: 'pi pi-home', ruta: '/dashboard', disponible: true },
    { etiqueta: 'Productos', icono: 'pi pi-box', ruta: '/productos', disponible: true },
    { etiqueta: 'Categorías', icono: 'pi pi-tags', ruta: '/categorias', disponible: true },
    { etiqueta: 'Trabajadores', icono: 'pi pi-users', ruta: '/usuarios', disponible: true },
  ];

  constructor(public authService: AuthService) {}

  get iniciales(): string {
    const nombre = this.authService.usuarioActual()?.nombre ?? '';
    return nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}