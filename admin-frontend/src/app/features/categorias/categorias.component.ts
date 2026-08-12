import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';

import { CategoriaService } from '../../core/services/categoria.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Categoria } from '../../core/models/categoria.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
imports: [
  CommonModule, ReactiveFormsModule,
  TableModule, ButtonModule, DialogModule, InputTextModule, TagModule,
  IconFieldModule, InputIconModule, TooltipModule
],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit {

  categorias = signal<Categoria[]>([]);
  cargando = signal(true);

  dialogoVisible = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  categoriaEditandoId: number | null = null;

  formulario = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  constructor(
    private categoriaService: CategoriaService,
    private notificacionService: NotificacionService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
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
    this.formulario.reset();
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
      return;
    }

    this.guardando.set(true);
    const datos = {
      nombre: this.formulario.value.nombre!,
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
        if (editando) {
          this.notificacionService.notificarEdicion('Categoría actualizada');
        } else {
          this.notificacionService.notificarCreacion('Categoría creada');
        }
        this.cargarCategorias();
      },
      error: (err) => {
        this.guardando.set(false);
        this.notificacionService.error(err.error?.mensaje ?? 'Ocurrió un error al guardar');
      }
    });
  }

 async eliminar(categoria: Categoria): Promise<void> {
    const confirmado = await this.notificacionService.confirmarEliminacion(categoria.nombre);
    if (!confirmado) return;

    this.categoriaService.eliminar(categoria.id).subscribe({
      next: () => {
        this.notificacionService.notificarEliminacion('Categoría desactivada');
        this.cargarCategorias();
      },
      error: () => this.notificacionService.error('No se pudo desactivar la categoría')
    });
  }

  reactivar(categoria: Categoria): void {
    this.categoriaService.reactivar(categoria.id).subscribe({
      next: () => {
        this.notificacionService.notificarReactivacion('Categoría reactivada');
        this.cargarCategorias();
      },
      error: () => this.notificacionService.error('No se pudo reactivar la categoría')
    });
  }
}