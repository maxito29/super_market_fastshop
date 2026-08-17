import { Component, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ChatWidgetComponent } from '../chat-widget/chat-widget.component';

interface ItemMenu {
  etiqueta: string;
  icono: string;
  ruta: string;
  disponible: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AvatarModule, ButtonModule, TooltipModule, ChatWidgetComponent],
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

  sidebarAbierto = signal<boolean>(this.obtenerEstadoInicial());

  private obtenerEstadoInicial(): boolean {
    if (typeof window !== 'undefined') {
      if (this.esMovil()) {
        return false; 
      }
      return localStorage.getItem('sidebar_estado') !== 'false';
    }
    return true;
  }

  esMovil(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 900;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const width = (event.target as Window).innerWidth;
    if (width <= 900 && this.sidebarAbierto()) {
      this.sidebarAbierto.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarAbierto.update(v => {
      const nuevoEstado = !v;
      if (!this.esMovil()) {
        localStorage.setItem('sidebar_estado', String(nuevoEstado));
      }
      return nuevoEstado;
    });
  }

  cerrarSidebarSiMovil(): void {
    if (this.esMovil()) {
      this.sidebarAbierto.set(false);
    }
  }
}
