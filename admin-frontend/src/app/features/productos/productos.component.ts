import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Producto } from '../../core/models/producto.model';
import { Categoria } from '../../core/models/categoria.model';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    InputNumberModule, DropdownModule, TagModule, TooltipModule
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent implements OnInit {

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  cargando = signal(true);

  dialogoVisible = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  productoEditandoId: number | null = null;

  formulario = this.fb.group({
    categoriaId: [null as number | null, Validators.required],
    codigo: [''],
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [null as number | null, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    imagenUrl: ['']
  });

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private notificacionService: NotificacionService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias(): void {
    this.categoriaService.listarTodas().subscribe({
      next: (data) => this.categorias.set(data),
      error: () => this.notificacionService.error('No se pudieron cargar las categorías')
    });
  }

  cargarProductos(): void {
    this.cargando.set(true);
    this.productoService.listarTodos().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.notificacionService.error('No se pudieron cargar los productos');
      }
    });
  }

claseStock(stock: number): 'danger' | 'warning' | 'success' {
    if (stock === 0) return 'danger';
    if (stock < 20) return 'warning';
    return 'success';
  }

  abrirNuevo(): void {
    this.modoEdicion.set(false);
    this.productoEditandoId = null;
    this.formulario.reset({ stock: 0 });
    this.dialogoVisible.set(true);
  }

  abrirEdicion(producto: Producto): void {
    this.modoEdicion.set(true);
    this.productoEditandoId = producto.id;
    this.formulario.setValue({
      categoriaId: producto.categoriaId,
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precio: producto.precio,
      stock: producto.stock,
      imagenUrl: producto.imagenUrl ?? ''
    });
    this.dialogoVisible.set(true);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const v = this.formulario.value;
    const datos = {
      categoriaId: v.categoriaId!,
      codigo: v.codigo || null,
      nombre: v.nombre!,
      descripcion: v.descripcion || null,
      precio: v.precio!,
      stock: v.stock!,
      imagenUrl: v.imagenUrl || null
    };

    const editando = this.modoEdicion();
    const peticion = editando
      ? this.productoService.actualizar(this.productoEditandoId!, datos)
      : this.productoService.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogoVisible.set(false);
        if (editando) {
          this.notificacionService.notificarEdicion('Producto actualizado');
        } else {
          this.notificacionService.notificarCreacion('Producto creado');
        }
        this.cargarProductos();
      },
      error: (err) => {
        this.guardando.set(false);
        this.notificacionService.error(err.error?.mensaje ?? 'Ocurrió un error al guardar');
      }
    });
  }

  async eliminar(producto: Producto): Promise<void> {
    const confirmado = await this.notificacionService.confirmarEliminacion(producto.nombre);
    if (!confirmado) return;

    this.productoService.eliminar(producto.id).subscribe({
      next: () => {
        this.notificacionService.notificarEliminacion('Producto desactivado');
        this.cargarProductos();
      },
      error: () => this.notificacionService.error('No se pudo desactivar el producto')
    });
  }

  reactivar(producto: Producto): void {
    this.productoService.reactivar(producto.id).subscribe({
      next: () => {
        this.notificacionService.notificarReactivacion('Producto reactivado');
        this.cargarProductos();
      },
      error: () => this.notificacionService.error('No se pudo reactivar el producto')
    });
  }
}