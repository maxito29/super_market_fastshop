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
import { ClienteAuthService } from '../../../core/services/cliente-auth.service';

// Importaciones de PrimeNG 17
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

const LIMITE_RESULTADOS_PANEL = 6;
const LIMITE_BUSQUEDAS_RECIENTES = 5;
const CLAVE_BUSQUEDAS_RECIENTES = 'fastshop_busquedas_recientes';

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

  menuCuentaAbierto = false;

  textoBusqueda = '';
  panelAbierto = false;
  buscando = false;
  resultados: Producto[] = [];
  totalResultados = 0;
  productoRecienAgregadoId: number | null = null;

  readonly terminosPopulares = ['pollo', 'leche', 'huevos', 'café', 'arroz', 'carne', 'vino', 'queso', 'pan', 'agua'];

  busquedasRecientes: string[] = [];

  private readonly busquedaCambiada$ = new Subject<string>();
  private temporizadorAgregado?: ReturnType<typeof setTimeout>;

  constructor(
    public carrito: CarritoService,
    public menu: MenuLateralService,
    public filtro: CatalogoFiltroService,
    private catalogoService: CatalogoService,
    private router: Router,
    public clienteAuth: ClienteAuthService
  ) {}

    get primerNombre(): string {
    const nombre = this.clienteAuth.cliente()?.nombreRazonSocial ?? '';
    return nombre.trim().split(' ')[0] || 'Cliente';
  }

get inicialesCliente(): string {
  const nombre = this.clienteAuth.cliente()?.nombreRazonSocial?.trim() ?? '';
  if (!nombre) return '?';

  const partes = nombre.split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0][0].toUpperCase();

  const inicialNombre = partes[0][0];
  const indiceApellido = partes.length >= 3 ? partes.length - 2 : partes.length - 1;
  const inicialApellido = partes[indiceApellido][0];

  return (inicialNombre + inicialApellido).toUpperCase();
}

  alternarMenuCuenta(): void {
    this.menuCuentaAbierto = !this.menuCuentaAbierto;
  }

  cerrarMenuCuenta(): void {
    this.menuCuentaAbierto = false;
  }

  cerrarSesion(): void {
    this.cerrarMenuCuenta();
    this.clienteAuth.cerrarSesion();
    this.router.navigateByUrl('/');
  }

  @HostListener('document:click', ['$event'])
  alHacerClicFuera(evento: MouseEvent): void {
    if (!this.menuCuentaAbierto) return;
    const contenedor = document.getElementById('menu-cuenta-contenedor');
    if (contenedor && !contenedor.contains(evento.target as Node)) {
      this.menuCuentaAbierto = false;
    }
  }

  ngOnInit(): void {
    this.textoBusqueda = this.filtro.texto();
    this.busquedasRecientes = this.cargarBusquedasRecientes();

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
    this.cerrarPanel();
  }

  alPresionarCarrito(): void {
    if (this.router.url.startsWith('/carrito')) {
      return;
    }
    this.carrito.abrir();
  }

  abrirPanel(): void {
    this.panelAbierto = true;

    this.menu.cerrar();
    if (this.textoBusqueda.trim() && this.resultados.length === 0) {
      this.ejecutarBusquedaPanel(this.textoBusqueda);
    }
  }

  cerrarPanel(): void {
    this.panelAbierto = false;
    this.textoBusqueda = '';
    this.resultados = [];
    this.totalResultados = 0;
  }

  alEscribirBusqueda(texto: string): void {
    this.busquedaCambiada$.next(texto);
  }

  buscarTermino(termino: string): void {
    this.textoBusqueda = termino;
    this.ejecutarBusquedaPanel(termino);
  }

  verTodosLosResultados(): void {
    this.confirmarBusqueda(this.textoBusqueda);
  }

  buscarAhora(): void {
    this.confirmarBusqueda(this.textoBusqueda);
  }

  buscarTerminoReciente(termino: string): void {
    this.buscarTermino(termino);
  }

  irADetalle(producto: Producto): void {
    this.guardarBusquedaSiHayTexto();
    this.cerrarPanel();
    this.router.navigate(['/producto', producto.id]);
  }

  limpiarBusqueda(): void {
    this.textoBusqueda = '';
    this.resultados = [];
    this.totalResultados = 0;
    this.filtro.limpiarBusqueda();
  }

  agregarRapido(producto: Producto, evento: Event): void {
    evento.stopPropagation();
    if (producto.stock <= 0) {
      return;
    }

    this.guardarBusquedaSiHayTexto();

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
    this.cerrarPanel();

    if (!limpio) {
      this.filtro.limpiarBusqueda();
      this.irAInicioSiHaceFalta();
      return;
    }

    this.guardarBusquedaReciente(limpio);

    this.catalogoService.buscarProductos(limpio).subscribe(productos => {
      const categoriaId = this.categoriaMasFrecuente(productos);

      if (categoriaId != null) {
        this.filtro.seleccionar(categoriaId);
        this.router
          .navigate(['/categoria', categoriaId], { queryParams: { q: limpio } })
          .then(() => this.desplazarAResultados());
      } else {
        this.filtro.buscar(limpio);
        this.irAInicioSiHaceFalta();
      }
    });
  }

  private categoriaMasFrecuente(productos: Producto[]): number | null {
    if (productos.length === 0) {
      return null;
    }

    const conteoPorCategoria = new Map<number, number>();
    for (const producto of productos) {
      conteoPorCategoria.set(producto.categoriaId, (conteoPorCategoria.get(producto.categoriaId) ?? 0) + 1);
    }

    let categoriaId: number | null = null;
    let mejorConteo = 0;
    for (const [id, conteo] of conteoPorCategoria) {
      if (conteo > mejorConteo) {
        mejorConteo = conteo;
        categoriaId = id;
      }
    }
    return categoriaId;
  }

  private irAInicioSiHaceFalta(): void {
    if (this.router.url === '/' || this.router.url.startsWith('/?')) {
      this.desplazarAResultados();
      return;
    }
    this.router.navigate(['/']).then(() => this.desplazarAResultados());
  }

  private desplazarAResultados(): void {
    window.scrollTo({ top: 0 });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('catalogo-resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  private guardarBusquedaSiHayTexto(): void {
    const termino = this.textoBusqueda.trim();
    if (termino) {
      this.guardarBusquedaReciente(termino);
    }
  }

  private cargarBusquedasRecientes(): string[] {
    try {
      const guardado = localStorage.getItem(CLAVE_BUSQUEDAS_RECIENTES);
      const lista = guardado ? JSON.parse(guardado) : [];
      return Array.isArray(lista) ? lista : [];
    } catch {
      return [];
    }
  }

  private guardarBusquedaReciente(termino: string): void {
    const normalizado = termino.trim();
    if (!normalizado) {
      return;
    }
    const sinDuplicados = this.busquedasRecientes.filter(
      t => t.toLowerCase() !== normalizado.toLowerCase()
    );

    this.busquedasRecientes = [normalizado, ...sinDuplicados].slice(0, LIMITE_BUSQUEDAS_RECIENTES);

    try {
      localStorage.setItem(CLAVE_BUSQUEDAS_RECIENTES, JSON.stringify(this.busquedasRecientes));
    } catch {
    }
  }

  
}