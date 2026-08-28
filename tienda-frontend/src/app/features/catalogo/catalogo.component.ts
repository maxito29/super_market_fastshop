import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, effect } from '@angular/core';

import { CatalogoService } from '../../core/services/catalogo.service';
import { CarritoService } from '../../core/services/carrito.service';
import { CatalogoFiltroService } from '../../core/services/catalogo-filtro.service';
import { Categoria, OfertaProducto, Producto } from '../../core/models/catalogo.models';

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
  imports: [CommonModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent implements OnInit, OnDestroy {

  categorias: Categoria[] = [];
  categoriasMarquee: Categoria[] = [];
  productos: Producto[] = [];
  marqueePausado = false;

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
  private temporizadorCarrusel?: ReturnType<typeof setInterval>;

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
    public filtro: CatalogoFiltroService
  ) {
    // Se recarga el catálogo cada vez que cambia la categoría elegida,
    // ya sea desde el menú hamburguesa, los chips o esta misma página.
    effect(() => {
      this.filtro.categoriaId();
      this.cargarProductos();
    });
  }

  ngOnInit(): void {
    this.catalogoService.listarCategorias().subscribe(categorias => {
      this.categorias = categorias;
      // Se duplica la lista para que la cinta de categorías pueda hacer
      // un loop infinito sin que se note el punto donde vuelve a empezar.
      this.categoriasMarquee = [...categorias, ...categorias];
    });
    this.iniciarCarrusel();
  }

  ngOnDestroy(): void {
    this.detenerCarrusel();
  }

  // ---------- Carrusel ----------
  iniciarCarrusel(): void {
    this.detenerCarrusel();
    this.temporizadorCarrusel = setInterval(() => this.siguienteDiapositiva(), 6000);
  }

  detenerCarrusel(): void {
    if (this.temporizadorCarrusel) {
      clearInterval(this.temporizadorCarrusel);
    }
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

  // ---------- Catálogo ----------
  cargarProductos(): void {
    const categoriaId = this.filtro.categoriaId();
    const fuente = categoriaId
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