import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { CatalogoService } from '../../core/services/catalogo.service';
import { CarritoService } from '../../core/services/carrito.service';
import { OfertaProducto } from '../../core/models/catalogo.models';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.scss'
})
export class ProductoDetalleComponent {
  private route = inject(ActivatedRoute);
  private catalogoService = inject(CatalogoService);
  private carritoService = inject(CarritoService);
  private titleService = inject(Title);

  cantidad = 1;
  ofertas: OfertaProducto[] = [];
  ofertaElegida: OfertaProducto | 'base' = 'base';
  cargandoOfertas = true;

  // undefined = todavía cargando · null = no existe o dio error · objeto = cargado.
  // Antes, si el id no existía (404) esta señal lanzaba el error del HTTP hacia
  // arriba y la página quedaba en blanco; con catchError queda controlado.
  producto = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        this.cantidad = 1;
        this.ofertaElegida = 'base';
        this.cargandoOfertas = true;
        const id = Number(params.get('id'));
        this.cargarOfertas(id);
        return this.catalogoService.obtenerProducto(id).pipe(catchError(() => of(null)));
      })
    )
  );

  constructor() {
    // Actualiza la pestaña del navegador apenas se resuelve el producto,
    // o al detectar que no existe — así cada link es identificable en el
    // historial del navegador y no queda pegado al título de la ruta anterior.
    effect(() => {
      const p = this.producto();
      if (p) {
        this.titleService.setTitle(`${p.nombre} | Fastshop`);
      } else if (p === null) {
        this.titleService.setTitle('Producto no encontrado | Fastshop');
      }
    });
  }

  private cargarOfertas(productoId: number): void {
    this.catalogoService.listarOfertas(productoId).subscribe({
      next: ofertas => {
        this.ofertas = ofertas;
        this.cargandoOfertas = false;
      },
      error: () => (this.cargandoOfertas = false)
    });
  }

  precioMostrado(): number {
    const p = this.producto();
    if (!p) return 0;
    return this.ofertaElegida === 'base' ? p.precio : this.ofertaElegida.precio;
  }

  stockDisponible(): number {
    const p = this.producto();
    if (!p) return 0;
    return this.ofertaElegida === 'base' ? p.stock : this.ofertaElegida.stock;
  }

  elegirOferta(oferta: OfertaProducto | 'base'): void {
    this.ofertaElegida = oferta;
    if (this.cantidad > this.stockDisponible()) {
      this.cantidad = Math.max(1, this.stockDisponible());
    }
  }

  incrementar(): void {
    if (this.cantidad < this.stockDisponible()) this.cantidad++;
  }

  decrementar(): void {
    if (this.cantidad > 1) this.cantidad--;
  }

  agregarAlCarrito(): void {
    const p = this.producto();
    if (!p) return;
    const oferta = this.ofertaElegida === 'base' ? null : this.ofertaElegida;

    this.carritoService.agregar({
      productoId: p.id,
      nombre: p.nombre,
      imagenUrl: p.imagenUrl,
      cantidad: this.cantidad,
      precioUnitario: this.precioMostrado(),
      ofertaProductoId: oferta ? oferta.ofertaId : null,
      proveedorNombre: oferta ? oferta.proveedorNombre : null,
      stockDisponible: this.stockDisponible()
    });
    this.carritoService.abrir();
  }
}