import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CarritoService } from '../../../core/services/carrito.service';
import { MenuLateralService } from '../../../core/services/menu-lateral.service';
import { CatalogoFiltroService } from '../../../core/services/catalogo-filtro.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { Producto } from '../../../core/models/catalogo.models';

// Importaciones de PrimeNG 17
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

const LIMITE_RESULTADOS_PANEL = 6;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {

  textoBusqueda = '';
  panelAbierto = false;
  buscando = false;
  resultados: Producto[] = [];
  totalResultados = 0;
  productoRecienAgregadoId: number | null = null;

  // Lista curada de términos frecuentes para el estado inicial del buscador
  // (sin texto). En un catálogo con más historial se podría calcular desde
  // el backend, pero para el volumen actual una lista fija es suficiente.
  readonly terminosPopulares = ['pollo', 'leche', 'huevos', 'café', 'arroz', 'carne', 'vino', 'queso', 'pan', 'agua'];

  private readonly busquedaCambiada$ = new Subject<string>();
  private temporizadorAgregado?: ReturnType<typeof setTimeout>;

  constructor(
    public carrito: CarritoService,
    public menu: MenuLateralService,
    public filtro: CatalogoFiltroService,
    private catalogoService: CatalogoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // El input se mantiene sincronizado con el filtro compartido: si el
    // usuario limpia la búsqueda desde el catálogo, el buscador lo refleja.
    this.textoBusqueda = this.filtro.texto();

    // Este pipe solo se usa mientras el usuario ESCRIBE: el debounce evita
    // disparar una petición HTTP por cada tecla. Las búsquedas "explícitas"
    // (clic en un término popular, reabrir el panel con texto ya escrito)
    // van directo a ejecutarBusquedaPanel() sin esperar el debounce, para
    // que se sientan instantáneas.
    this.busquedaCambiada$
      .pipe(debounceTime(220), distinctUntilChanged())
      .subscribe(texto => this.ejecutarBusquedaPanel(texto));
  }

  ngOnDestroy(): void {
    this.busquedaCambiada$.complete();
    if (this.temporizadorAgregado) {
      clearTimeout(this.temporizadorAgregado);
    }
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    this.panelAbierto = false;
  }

  alPresionarCarrito(): void {
    // Si el cliente ya está viendo la página del carrito, el ícono no debe
    // abrir el drawer encima de la misma información: solo se queda ahí.
    if (this.router.url.startsWith('/carrito')) {
      return;
    }
    this.carrito.abrir();
  }

  abrirPanel(): void {
    this.panelAbierto = true;

    // El buscador y el menú lateral son dos overlays; si el menú ya estaba
    // abierto, se cierra al abrir la búsqueda para que no compitan por la
    // pantalla ni por el foco.
    this.menu.cerrar();

    // Si ya había texto escrito (el usuario volvió a hacer foco), refresca
    // los resultados de inmediato, sin esperar el debounce.
    if (this.textoBusqueda.trim() && this.resultados.length === 0) {
      this.ejecutarBusquedaPanel(this.textoBusqueda);
    }
  }

  cerrarPanel(): void {
    this.panelAbierto = false;
  }

  alEscribirBusqueda(texto: string): void {
    this.busquedaCambiada$.next(texto);
  }

  buscarTermino(termino: string): void {
    this.textoBusqueda = termino;
    // Búsqueda inmediata: el usuario ya eligió el término, no tiene sentido
    // hacerlo esperar el debounce pensado para cuando se está tipeando.
    this.ejecutarBusquedaPanel(termino);
  }

  verTodosLosResultados(): void {
    this.confirmarBusqueda(this.textoBusqueda);
  }

  buscarAhora(): void {
    this.confirmarBusqueda(this.textoBusqueda);
  }

  limpiarBusqueda(): void {
    this.textoBusqueda = '';
    this.resultados = [];
    this.totalResultados = 0;
    this.filtro.limpiarBusqueda();
  }

  agregarRapido(producto: Producto, evento: Event): void {
    // Evita que el clic sobre el botón "Agregar" cierre el panel.
    evento.stopPropagation();
    if (producto.stock <= 0) {
      return;
    }

    this.carrito.agregar({
      productoId: producto.id,
      nombre: producto.nombre,
      imagenUrl: producto.imagenUrl,
      cantidad: 1,
      precioUnitario: producto.precio,
      ofertaProductoId: null,
      proveedorNombre: null,
      stockDisponible: producto.stock
    });

    // Feedback breve en el botón ("Agregado ✓") sin cerrar el panel, para
    // poder seguir agregando varios productos desde la misma búsqueda.
    this.productoRecienAgregadoId = producto.id;
    if (this.temporizadorAgregado) {
      clearTimeout(this.temporizadorAgregado);
    }
    this.temporizadorAgregado = setTimeout(() => (this.productoRecienAgregadoId = null), 1500);
  }

  private ejecutarBusquedaPanel(texto: string): void {
    const limpio = texto.trim();

    if (!limpio) {
      this.buscando = false;
      this.resultados = [];
      this.totalResultados = 0;
      return;
    }

    this.buscando = true;
    this.catalogoService.buscarProductos(limpio).subscribe(productos => {
      this.buscando = false;
      this.totalResultados = productos.length;
      this.resultados = productos.slice(0, LIMITE_RESULTADOS_PANEL);
    });
  }

  private confirmarBusqueda(texto: string): void {
    const limpio = texto.trim();

    if (limpio) {
      this.filtro.buscar(limpio);
    } else {
      this.filtro.limpiarBusqueda();
    }

    this.panelAbierto = false;

    if (this.router.url === '/' || this.router.url.startsWith('/?')) {
      return;
    }
    this.router.navigate(['/']);
  }
}