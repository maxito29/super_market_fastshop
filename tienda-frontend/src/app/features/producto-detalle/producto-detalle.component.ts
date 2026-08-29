import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
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

  cantidad = 1;
  ofertas: OfertaProducto[] = [];
  ofertaElegida: OfertaProducto | 'base' = 'base';
  cargandoOfertas = true;

  // Se re-ejecuta si cambia el :id en la URL (navegar de un producto a otro
  // relacionado sin recargar la página) — clave para no quedar "pegado".
  producto = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        this.cantidad = 1;
        this.ofertaElegida = 'base';
        this.cargandoOfertas = true;
        const id = Number(params.get('id'));
        this.cargarOfertas(id);
        return this.catalogoService.obtenerProducto(id);
      })
    )
  );

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