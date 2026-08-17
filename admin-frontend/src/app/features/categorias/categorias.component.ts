import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { CategoriaService } from '../../core/services/categoria.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Categoria } from '../../core/models/categoria.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule, TagModule,
    IconFieldModule, InputIconModule, TooltipModule, DropdownModule
  ],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit {

  categorias = signal<Categoria[]>([]);
  cargando = signal(true);
  filtroEstado = signal<'todos' | 'activos' | 'inactivos'>('todos');

  opcionesEstado = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activos', value: 'activos' },
    { label: 'Inactivos', value: 'inactivos' }
  ];

  categoriasFiltradas = computed(() => {
    const estado = this.filtroEstado();
    const lista = this.categorias();
    if (estado === 'activos') return lista.filter(c => c.activo);
    if (estado === 'inactivos') return lista.filter(c => !c.activo);
    return lista;
  });

  dialogoVisible = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  categoriaEditandoId: number | null = null;
  formulario!: FormGroup; 

  constructor(
    private categoriaService: CategoriaService,
    private notificacionService: NotificacionService,
    private fb: FormBuilder
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  private crearFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['']
    });
  }

  cargarCategorias(): void {
    this.cargando.set(true);
    this.categoriaService.listarTodas().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.notificacionService.error('No se pudieron cargar las categorías');
      }
    });
  }

  abrirNueva(): void {
    this.modoEdicion.set(false);
    this.categoriaEditandoId = null;
    
    this.formulario.reset({ nombre: '', descripcion: '' });
    this.dialogoVisible.set(true);
  }

  abrirEdicion(categoria: Categoria): void {
    this.modoEdicion.set(true);
    this.categoriaEditandoId = categoria.id;
    this.formulario.setValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? ''
    });
    this.dialogoVisible.set(true);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.notificacionService.error('Por favor, ingresa el nombre de la categoría.');
      return;
    }

    this.guardando.set(true);
    const datos = {
      nombre: this.formulario.value.nombre!.trim(),
      descripcion: this.formulario.value.descripcion || null
    };

    const editando = this.modoEdicion();
    const peticion = editando
      ? this.categoriaService.actualizar(this.categoriaEditandoId!, datos)
      : this.categoriaService.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogoVisible.set(false);
        this.cargarCategorias();
        if (editando) {
          this.notificacionService.notificarEdicion('Categoría actualizada con éxito');
        } else {
          this.notificacionService.notificarCreacion('Categoría creada correctamente');
        }
      },
      error: () => this.guardando.set(false)
    });
  }

  limpiarFormularioAlCerrar(): void {
    this.formulario.reset({ nombre: '', descripcion: '' });
    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
    this.categoriaEditandoId = null;
  }

  async eliminar(categoria: Categoria): Promise<void> {
    const confirmado = await this.notificacionService.confirmarEliminacion(categoria.nombre);
    if (!confirmado) return;

    this.categoriaService.eliminar(categoria.id).subscribe({
      next: () => {
        this.notificacionService.notificarEliminacion('Categoría desactivada del catálogo');
        this.cargarCategorias();
      }
    });
  }

  async reactivar(categoria: Categoria): Promise<void> {
    const confirmado = await this.notificacionService.confirmarReactivacion(categoria.nombre);
    if (!confirmado) return;

    this.categoriaService.reactivar(categoria.id).subscribe({
      next: () => {
        this.notificacionService.notificarReactivacion('Categoría reactivada con éxito');
        this.cargarCategorias();
      }
    });
  }
}
