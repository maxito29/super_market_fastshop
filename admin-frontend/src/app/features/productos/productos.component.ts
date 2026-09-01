import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    CommonModule, ReactiveFormsModule, FormsModule,
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
  guardando = signal(false);
  dialogoVisible = signal(false);
  modoEdicion = signal(false);
  productoSeleccionado: Producto | null = null;
  formulario!: FormGroup;

  categoriasParaDropdown = computed(() => {
    const lista = this.categorias();
    const edicion = this.modoEdicion();
    const productoActual = this.productoSeleccionado;

    if (edicion && productoActual) {
      return lista.filter(c => c.activo || c.id === productoActual.categoriaId);
    }
    return lista.filter(c => c.activo);
  });

  filtroEstado = signal<'todos' | 'activos' | 'inactivos'>('todos');

  opcionesEstado = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activos', value: 'activos' },
    { label: 'Inactivos', value: 'inactivos' }
  ];
  productosFiltrados = computed(() => {
    const estado = this.filtroEstado();
    const lista = this.productos();
    if (estado === 'activos') return lista.filter(p => p.activo);
    if (estado === 'inactivos') return lista.filter(p => !p.activo);
    return lista;
  });

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private notificacionService: NotificacionService
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private inicializarFormulario(): void {
    this.formulario = this.fb.group({
      categoriaId: [null, Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      descripcion: [''],
      imagenUrl: ['']
    });
  }

  private cargarDatos(): void {
    this.cargando.set(true);
    this.productoService.listarTodos().subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) => a.stock - b.stock);
        this.productos.set(ordenados);
        this.cargando.set(false);
      },
      error: () => {
        this.notificacionService.error('No se pudo cargar la lista de productos');
        this.cargando.set(false);
      }
    });

    this.categoriaService.listarTodas().subscribe({
      next: (data) => this.categorias.set(data)
    });
  }

  claseStock(stock: number): 'danger' | 'warning' | 'success' {
    if (stock === 0) return 'danger';
    if (stock < 20) return 'warning';
    return 'success';
  }

  abrirNuevo(): void {
    this.modoEdicion.set(false);
    this.productoSeleccionado = null;
    this.formulario.reset({ precio: 0, stock: 0 });
    this.dialogoVisible.set(true);
  }

  abrirEdicion(producto: Producto): void {
    this.modoEdicion.set(true);
    this.productoSeleccionado = producto;
    this.formulario.patchValue(producto);
    this.dialogoVisible.set(true);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.notificacionService.error('Por favor, completa los campos requeridos marcados con (*)');
      return;
    }

    this.guardando.set(true);
    const datos = this.formulario.value;

    if (this.modoEdicion()) {
      this.productoService.actualizar(this.productoSeleccionado!.id, datos).subscribe({
        next: () => {
          this.notificacionService.exito('Producto actualizado correctamente');
          this.cargarDatos();
          this.dialogoVisible.set(false);
          this.guardando.set(false);
        },
        error: () => this.guardando.set(false)
      });
    } else {
      this.productoService.crear(datos).subscribe({
        next: () => {
          this.notificacionService.exito('Producto registrado con éxito');
          this.cargarDatos();
          this.dialogoVisible.set(false);
          this.guardando.set(false);
        },
        error: () => this.guardando.set(false)
      });
    }
  }

async eliminar(producto: Producto): Promise<void> {
  const confirmado = await this.notificacionService.confirmarEliminacion(producto.nombre);
  if (!confirmado) return;
  this.productoService.eliminar(producto.id).subscribe({
    next: () => {
      this.notificacionService.notificarEliminacion('Producto desactivado del catálogo');
      this.cargarDatos(); 
    }
  });
}

  async reactivar(producto: Producto): Promise<void> {
    const confirmado = await this.notificacionService.confirmarReactivacion(producto.nombre);
    if (!confirmado) return;
    this.productoService.reactivar(producto.id).subscribe({
      next: () => {
        this.notificacionService.notificarReactivacion('Producto reactivado con éxito');
        this.cargarDatos(); 
      }
    });
  }

  toggleDestacado(producto: Producto): void {
    const nuevoValor = !producto.destacado;
    this.productoService.marcarDestacado(producto.id, nuevoValor).subscribe({
      next: () => {
        this.notificacionService.exito(
          nuevoValor ? 'Producto agregado a "Lo mejor de la semana"' : 'Producto quitado de "Lo mejor de la semana"'
        );
        this.productos.update(lista =>
          lista.map(p => (p.id === producto.id ? { ...p, destacado: nuevoValor } : p))
        );
      },
      error: () => this.notificacionService.error('No se pudo actualizar el destacado')
    });
  }

  exportarExcel(): void {
    this.productoService.exportarExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-productos-${new Date().toISOString().slice(0,10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notificacionService.error('Error al generar el archivo Excel')
    });
  }
}