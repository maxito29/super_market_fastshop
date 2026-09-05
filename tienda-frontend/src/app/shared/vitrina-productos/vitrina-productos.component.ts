import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Producto } from '../../core/models/catalogo.models';
import { CarritoService } from '../../core/services/carrito.service';

@Component({
  selector: 'app-vitrina-productos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vitrina-productos.component.html',
  styleUrl: './vitrina-productos.component.scss'
})
export class VitrinaProductosComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) titulo!: string;
  @Input() icono = 'pi pi-star-fill';
  @Input() acento: 'verde' | 'tomate' = 'verde';
  @Input({ required: true }) productos: Producto[] = [];
  @Input() verTodoRuta: any[] | null = null;

  @ViewChild('pista') pistaRef?: ElementRef<HTMLDivElement>;

  puedeIzquierda = false;
  puedeDerecha = false;
  paginaActual = 0;
  totalPaginas = 1;

  private resizeObserver?: ResizeObserver;

  constructor(private carrito: CarritoService) {}

  ngAfterViewInit(): void {
    // Espera a que el *ngFor termine de pintar las tarjetas antes de medir
    // anchos reales; si se mide en el mismo frame, scrollWidth da 0.
    requestAnimationFrame(() => this.actualizarEstadoScroll());

    const pista = this.pistaRef?.nativeElement;
    if (pista && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.actualizarEstadoScroll());
      this.resizeObserver.observe(pista);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  retrasoAnimacion(indice: number): string {
    return `${Math.min(indice, 11) * 45}ms`;
  }

  paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i);
  }

  onScroll(): void {
    this.actualizarEstadoScroll();
  }

  desplazar(direccion: 1 | -1): void {
    const pista = this.pistaRef?.nativeElement;
    if (!pista) return;
    pista.scrollBy({ left: pista.clientWidth * 0.9 * direccion, behavior: 'smooth' });
  }

  irAPagina(pagina: number): void {
    const pista = this.pistaRef?.nativeElement;
    if (!pista) return;
    pista.scrollTo({ left: pista.clientWidth * pagina, behavior: 'smooth' });
  }

  etiquetaStock(producto: Producto): string {
    if (producto.stock <= 0) return 'Agotado';
    if (producto.stock <= 5) return `¡Últimas ${producto.stock} unidades!`;
    if (producto.stock > 10) return '10+ unidades disponibles';
    return `${producto.stock} unidades disponibles`;
  }

  agregarAlCarrito(producto: Producto, evento: MouseEvent): void {
    evento.preventDefault();
    evento.stopPropagation();

    if (producto.stock <= 0) return;

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

    this.carrito.abrir(); // quita esta línea si no quieres que se abra el mini-carrito al agregar
  }

  private actualizarEstadoScroll(): void {
    const pista = this.pistaRef?.nativeElement;
    if (!pista) return;

    const maxScroll = pista.scrollWidth - pista.clientWidth;
    this.puedeIzquierda = pista.scrollLeft > 8;
    this.puedeDerecha = pista.scrollLeft < maxScroll - 8;

    const ancho = pista.clientWidth;
    this.totalPaginas = ancho > 0 ? Math.max(1, Math.round(pista.scrollWidth / ancho)) : 1;
    this.paginaActual = ancho > 0 ? Math.round(pista.scrollLeft / ancho) : 0;
  }
}