import { CommonModule } from '@angular/common';
import {
  AfterViewInit, Component, ElementRef, HostListener,
  OnDestroy, OnInit, ViewChild, effect
} from '@angular/core';
import { CategoriaIconoComponent } from '../../shared/categoria-icono/categoria-icono.component';
import { VitrinaProductosComponent } from '../../shared/vitrina-productos/vitrina-productos.component';

import { CatalogoService } from '../../core/services/catalogo.service';
import { CarritoService } from '../../core/services/carrito.service';
import { CatalogoFiltroService } from '../../core/services/catalogo-filtro.service';
import { Categoria, OfertaProducto, Producto } from '../../core/models/catalogo.models';
import { Router, RouterLink } from '@angular/router';

interface DiapositivaHero {
  etiqueta: string;
  titulo: string;
  texto: string;
  cta: string;
  icono: string;
  acento: 'verde' | 'tomate';
}

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, CategoriaIconoComponent, RouterLink, VitrinaProductosComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('pistaMarquee') pistaMarqueeRef?: ElementRef<HTMLDivElement>;

  categorias: Categoria[] = [];
  categoriasMarquee: Categoria[] = [];
  productos: Producto[] = [];
  destacados: Producto[] = [];
  

  // ---------- Carrusel de categorías (marquee) ----------
  marqueePausado = false;
  arrastrandoMarquee = false;

  private readonly velocidadBase = 42; // px por segundo
  private posicionMarquee = 0;
  private anchoMitadPista = 0;
  private rafId?: number;
  private ultimoTimestamp = 0;
  private arrastreInicioX = 0;
  private posicionAlIniciarArrastre = 0;
  private distanciaArrastre = 0;
  private reduceMovimiento = false;

  readonly beneficios = [
    { icono: 'pi pi-truck', titulo: 'Envío gratis', texto: 'En pedidos desde S/ 50' },
    { icono: 'pi pi-percentage', titulo: 'Mejor precio', texto: 'Compara entre proveedores' },
    { icono: 'pi pi-map-marker', titulo: 'Recojo en tienda', texto: 'Listo el mismo día' },
    { icono: 'pi pi-star-fill', titulo: 'Frescura', texto: 'Selección diaria de productos' }
  ];

  // ---------- Carrusel hero ----------
  diapositivas: DiapositivaHero[] = [
    {
      etiqueta: 'Recojo en tienda o delivery',
      titulo: 'Lo que necesitas para tu semana, al mejor precio',
      texto: 'Compara precios de distintos proveedores por cada producto y elige el que más te convenga.',
      cta: 'Ver ofertas',
      icono: 'pi pi-shopping-bag',
      acento: 'verde'
    },
    {
      etiqueta: 'Envío gratis desde S/ 50',
      titulo: 'Tu pedido en la puerta de tu casa, sin vueltas',
      texto: 'Elige delivery a domicilio y sigue tu pedido hasta que llegue a tu puerta.',
      cta: 'Ver categorías',
      icono: 'pi pi-truck',
      acento: 'tomate'
    },
    {
      etiqueta: 'Frescura garantizada',
      titulo: 'Frutas y verduras seleccionadas cada mañana',
      texto: 'Trabajamos con proveedores locales para que tu despensa siempre esté fresca.',
      cta: 'Explorar frescos',
      icono: 'pi pi-star-fill',
      acento: 'verde'
    }
  ];
  diapositivaActual = 0;
  progreso = 0; // 0-100, para la barra de cada punto
  arrastrandoHero = false;
  offsetArrastreHero = 0; // px, mientras se arrastra

  private readonly duracionAutoplay = 6000;
  private temporizadorCarrusel?: ReturnType<typeof setInterval>;
  private rafProgresoId?: number;
  private inicioProgreso = 0;
  private arrastreHeroInicioX = 0;

  // ---------- Modal comparador ----------
  dialogoVisible = false;
  productoEnDialogo: Producto | null = null;
  ofertasEnDialogo: OfertaProducto[] = [];
  cargandoOfertas = false;
  ofertaElegida: OfertaProducto | 'base' = 'base';
  cantidadElegida = 1;

  constructor(
    private catalogoService: CatalogoService,
    private carritoService: CarritoService,
    public filtro: CatalogoFiltroService,
    private router: Router 
  ) {
    effect(() => {
      this.filtro.categoriaId();
      this.filtro.texto();
      this.cargarProductos();
    });
  }

  ngOnInit(): void {
    this.reduceMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.catalogoService.listarCategorias().subscribe(categorias => {
      this.categorias = categorias;
      // Se duplica la lista para que la cinta de categorías pueda hacer
      // un loop infinito sin que se note el punto donde vuelve a empezar.
      this.categoriasMarquee = [...categorias, ...categorias];
      requestAnimationFrame(() => this.recalcularAncho());
    });
    this.catalogoService.listarDestacados().subscribe(destacados => (this.destacados = destacados));
    this.iniciarCarrusel();
  }

  ngAfterViewInit(): void {
    if (this.reduceMovimiento) return; // se deja como scroll manual (ver SCSS)
    requestAnimationFrame(() => {
      this.recalcularAncho();
      this.rafId = requestAnimationFrame(this.animarMarquee);
    });
  }

  ngOnDestroy(): void {
    this.detenerCarrusel();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.rafProgresoId) cancelAnimationFrame(this.rafProgresoId);
  }

  // ---------- Marquee de categorías ----------
  @HostListener('window:resize')
  recalcularAncho(): void {
    const pista = this.pistaMarqueeRef?.nativeElement;
    if (pista) this.anchoMitadPista = pista.scrollWidth / 2;
  }

  private animarMarquee = (timestamp: number): void => {
    if (!this.ultimoTimestamp) this.ultimoTimestamp = timestamp;
    const delta = (timestamp - this.ultimoTimestamp) / 1000;
    this.ultimoTimestamp = timestamp;

    if (!this.arrastrandoMarquee && this.anchoMitadPista > 0) {
      const velocidad = this.marqueePausado ? this.velocidadBase * 0.15 : this.velocidadBase;
      this.posicionMarquee -= velocidad * delta;
      if (Math.abs(this.posicionMarquee) >= this.anchoMitadPista) {
        this.posicionMarquee += this.anchoMitadPista;
      }
    }

    const pista = this.pistaMarqueeRef?.nativeElement;
    if (pista) pista.style.transform = `translate3d(${this.posicionMarquee}px, 0, 0)`;

    this.rafId = requestAnimationFrame(this.animarMarquee);
  };

  iniciarArrastre(event: PointerEvent): void {
    if (this.reduceMovimiento) return;
    this.arrastrandoMarquee = true;
    this.distanciaArrastre = 0;
    this.arrastreInicioX = event.clientX;
    this.posicionAlIniciarArrastre = this.posicionMarquee;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  moverArrastre(event: PointerEvent): void {
    if (!this.arrastrandoMarquee) return;
    const delta = event.clientX - this.arrastreInicioX;
    this.distanciaArrastre = Math.abs(delta);
    this.posicionMarquee = this.posicionAlIniciarArrastre + delta;

    if (this.anchoMitadPista > 0) {
      if (this.posicionMarquee > 0) this.posicionMarquee -= this.anchoMitadPista;
      if (this.posicionMarquee < -this.anchoMitadPista) this.posicionMarquee += this.anchoMitadPista;
    }
  }

  terminarArrastre(): void {
    this.arrastrandoMarquee = false;
  }

clicMarquee(categoriaId: number, event: Event): void {
  if (this.distanciaArrastre > 6) {
    event.preventDefault();
    return;
  }
  this.router.navigate(['/categoria', categoriaId]); 
}

  // ---------- Carrusel hero: autoplay + barra de progreso ----------
  iniciarCarrusel(): void {
    this.detenerCarrusel();
    this.temporizadorCarrusel = setInterval(() => this.siguienteDiapositiva(), this.duracionAutoplay);
    this.iniciarProgreso();
  }

  detenerCarrusel(): void {
    if (this.temporizadorCarrusel) {
      clearInterval(this.temporizadorCarrusel);
    }
    this.detenerProgreso();
  }

  private iniciarProgreso(): void {
    this.detenerProgreso();
    this.progreso = 0;
    this.inicioProgreso = performance.now();

    const paso = (timestamp: number): void => {
      const transcurrido = timestamp - this.inicioProgreso;
      this.progreso = Math.min(100, (transcurrido / this.duracionAutoplay) * 100);
      if (this.progreso < 100) {
        this.rafProgresoId = requestAnimationFrame(paso);
      }
    };
    this.rafProgresoId = requestAnimationFrame(paso);
  }

  private detenerProgreso(): void {
    if (this.rafProgresoId) cancelAnimationFrame(this.rafProgresoId);
  }

  siguienteDiapositiva(): void {
    this.diapositivaActual = (this.diapositivaActual + 1) % this.diapositivas.length;
  }

  anteriorManual(): void {
    this.diapositivaActual = (this.diapositivaActual - 1 + this.diapositivas.length) % this.diapositivas.length;
    this.iniciarCarrusel();
  }

  siguienteManual(): void {
    this.siguienteDiapositiva();
    this.iniciarCarrusel();
  }

  irADiapositiva(indice: number): void {
    this.diapositivaActual = indice;
    this.iniciarCarrusel();
  }

  // ---------- Carrusel hero: arrastre / swipe ----------
  iniciarArrastreHero(event: PointerEvent): void {
    this.arrastrandoHero = true;
    this.arrastreHeroInicioX = event.clientX;
    this.offsetArrastreHero = 0;
    this.detenerCarrusel();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  moverArrastreHero(event: PointerEvent): void {
    if (!this.arrastrandoHero) return;
    this.offsetArrastreHero = event.clientX - this.arrastreHeroInicioX;
  }

  terminarArrastreHero(): void {
    if (!this.arrastrandoHero) return;
    this.arrastrandoHero = false;

    const umbral = 60; // px mínimos para considerar un swipe
    if (this.offsetArrastreHero < -umbral) {
      this.siguienteManual();
    } else if (this.offsetArrastreHero > umbral) {
      this.anteriorManual();
    } else {
      this.iniciarCarrusel();
    }
    this.offsetArrastreHero = 0;
  }

  // ---------- Resto del catálogo ----------
  cargarProductos(): void {
    const texto = this.filtro.texto();
    const categoriaId = this.filtro.categoriaId();

    const fuente = texto
      ? this.catalogoService.buscarProductos(texto)
      : categoriaId
        ? this.catalogoService.listarProductosPorCategoria(categoriaId)
        : this.catalogoService.listarProductos();

    fuente.subscribe(productos => (this.productos = productos));
  }

  categoriaActualNombre(): string | null {
    const id = this.filtro.categoriaId();
    if (!id) return null;
    return this.categorias.find(c => c.id === id)?.nombre ?? null;
  }

  seleccionarCategoria(id: number | null): void {
    this.filtro.seleccionar(id);
  }

  limpiarBusqueda(): void {
    this.filtro.limpiarBusqueda();
  }

  esBajoStock(producto: Producto): boolean {
    return producto.stock > 0 && producto.stock <= 10;
  }

  retrasoAnimacion(indice: number): string {
    return `${Math.min(indice, 11) * 45}ms`;
  }

  // ---------- Modal comparador ----------
  abrirComparador(producto: Producto): void {
    this.productoEnDialogo = producto;
    this.ofertaElegida = 'base';
    this.cantidadElegida = 1;
    this.dialogoVisible = true;
    this.cargandoOfertas = true;

    this.catalogoService.listarOfertas(producto.id).subscribe({
      next: ofertas => {
        this.ofertasEnDialogo = ofertas;
        this.cargandoOfertas = false;
        if (ofertas.length > 0) {
          this.ofertaElegida = ofertas[0];
        }
      },
      error: () => (this.cargandoOfertas = false)
    });
  }

  cerrarDialogo(): void {
    this.dialogoVisible = false;
  }

  elegirOferta(oferta: OfertaProducto | 'base'): void {
    this.ofertaElegida = oferta;
    if (this.cantidadElegida > this.stockDisponible()) {
      this.cantidadElegida = Math.max(1, this.stockDisponible());
    }
  }

  incrementarCantidad(): void {
    if (this.cantidadElegida < this.stockDisponible()) {
      this.cantidadElegida++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidadElegida > 1) {
      this.cantidadElegida--;
    }
  }

  precioMostrado(): number {
    if (!this.productoEnDialogo) return 0;
    return this.ofertaElegida === 'base' ? this.productoEnDialogo.precio : this.ofertaElegida.precio;
  }

  stockDisponible(): number {
    if (!this.productoEnDialogo) return 0;
    return this.ofertaElegida === 'base' ? this.productoEnDialogo.stock : this.ofertaElegida.stock;
  }

  confirmarAgregar(): void {
    if (!this.productoEnDialogo) return;

    const oferta = this.ofertaElegida === 'base' ? null : this.ofertaElegida;

    this.carritoService.agregar({
      productoId: this.productoEnDialogo.id,
      nombre: this.productoEnDialogo.nombre,
      imagenUrl: this.productoEnDialogo.imagenUrl,
      cantidad: this.cantidadElegida,
      precioUnitario: this.precioMostrado(),
      ofertaProductoId: oferta ? oferta.ofertaId : null,
      proveedorNombre: oferta ? oferta.proveedorNombre : null,
      stockDisponible: this.stockDisponible()
    });

    this.dialogoVisible = false;
    this.carritoService.abrir();
  }
}