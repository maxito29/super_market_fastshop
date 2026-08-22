import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { CatalogoService } from '../../core/services/catalogo.service';
import { CarritoService } from '../../core/services/carrito.service';
import { Categoria, OfertaProducto, Producto } from '../../core/models/catalogo.models';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputNumberModule,
    RadioButtonModule,
    TagModule
  ],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent implements OnInit {

  categorias: Categoria[] = [];
  productos: Producto[] = [];
  categoriaSeleccionada: number | null = null;

  dialogoVisible = false;
  productoEnDialogo: Producto | null = null;
  ofertasEnDialogo: OfertaProducto[] = [];
  cargandoOfertas = false;
  ofertaElegida: OfertaProducto | 'base' = 'base';
  cantidadElegida = 1;

  constructor(
    private catalogoService: CatalogoService,
    private carritoService: CarritoService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.catalogoService.listarCategorias().subscribe(categorias => (this.categorias = categorias));
    this.cargarProductos();
  }

  cargarProductos(): void {
    const fuente = this.categoriaSeleccionada
      ? this.catalogoService.listarProductosPorCategoria(this.categoriaSeleccionada)
      : this.catalogoService.listarProductos();

    fuente.subscribe(productos => (this.productos = productos));
  }

  seleccionarCategoria(categoriaId: number | null): void {
    this.categoriaSeleccionada = categoriaId;
    this.cargarProductos();
  }

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
    this.messageService.add({
      severity: 'success',
      summary: 'Agregado al carrito',
      detail: `${this.cantidadElegida} x ${this.productoEnDialogo.nombre}`,
      life: 2500
    });
  }
}
