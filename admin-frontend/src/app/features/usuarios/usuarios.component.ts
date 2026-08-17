import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';
import { Rol } from '../../core/models/rol.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    PasswordModule, DropdownModule, TagModule, TooltipModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {

  usuarios = signal<Usuario[]>([]);
  roles = signal<Rol[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  dialogoVisible = signal(false);
  modoEdicion = signal(false);
  usuarioEditandoId: number | null = null;
  formulario!: FormGroup;

  filtroEstado = signal<'todos' | 'activos' | 'inactivos'>('todos');

  opcionesEstado = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activos', value: 'activos' },
    { label: 'Inactivos', value: 'inactivos' }
  ];

  usuariosFiltrados = computed(() => {
    const estado = this.filtroEstado();
    const lista = this.usuarios();
    if (estado === 'activos') return lista.filter(u => u.activo);
    if (estado === 'inactivos') return lista.filter(u => !u.activo);
    return lista;
  });

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private notificacionService: NotificacionService,
    public authService: AuthService
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private crearFormulario(): void {
    this.formulario = this.fb.group({
      rolId: [null as number | null, Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      password: ['', [Validators.minLength(6)]]
    });
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.notificacionService.error('No se pudo cargar el listado de personal');
        this.cargando.set(false);
      }
    });

    this.rolService.listar().subscribe({
      next: (data) => this.roles.set(data)
    });
  }


  abrirNuevo(): void {
    this.modoEdicion.set(false);
    this.usuarioEditandoId = null;
    
    this.formulario.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.formulario.get('password')?.updateValueAndValidity();
    
    this.formulario.reset({ rolId: null, nombre: '', username: '', email: '', password: '' });
    this.dialogoVisible.set(true);
  }

  abrirEdicion(usuario: any): void { 
    this.modoEdicion.set(true);
    this.usuarioEditandoId = usuario.id;
    
    this.formulario.get('password')?.setValidators([Validators.minLength(6)]);
    this.formulario.get('password')?.updateValueAndValidity();

    const idDelRol = usuario.rolId ?? usuario.rol?.id ?? null;

    this.formulario.setValue({
      rolId: idDelRol,
      nombre: usuario.nombre,
      username: usuario.username,
      email: usuario.email ?? '',
      password: '' 
    });
    this.dialogoVisible.set(true);
  }


  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.notificacionService.error('Por favor, completa los campos marcados con (*)');
      return;
    }

    this.guardando.set(true);
    const datos = { ...this.formulario.value };
    
    if (this.modoEdicion() && !datos.password) {
      delete datos.password;
    }

    const editando = this.modoEdicion();
    const peticion = editando
      ? this.usuarioService.actualizar(this.usuarioEditandoId!, datos)
      : this.usuarioService.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogoVisible.set(false);
        this.cargarDatos();
        if (editando) {
          this.notificacionService.notificarEdicion('Datos del trabajador actualizados');
        } else {
          this.notificacionService.notificarCreacion('Nuevo trabajador registrado con éxito');
        }
      },
      error: () => this.guardando.set(false)
    });
  }

  limpiarFormularioAlCerrar(): void {
    this.formulario.reset({ rolId: null, nombre: '', username: '', email: '', password: '' });
    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
    this.usuarioEditandoId = null;
  }

  async desactivar(usuario: Usuario): Promise<void> {
    const confirmado = await this.notificacionService.confirmarEliminacion(usuario.nombre);
    if (!confirmado) return;

    this.usuarioService.desactivar(usuario.id).subscribe({
      next: () => {
        this.notificacionService.notificarEliminacion('Cuenta de usuario suspendida');
        this.cargarDatos();
      }
    });
  }

  async reactivar(usuario: Usuario): Promise<void> {
    const confirmado = await this.notificacionService.confirmarReactivacion(usuario.nombre);
    if (!confirmado) return;

    this.usuarioService.reactivar(usuario.id).subscribe({
      next: () => {
        this.notificacionService.notificarReactivacion('Cuenta de usuario restablecida');
        this.cargarDatos();
      }
    });
  }

  exportarExcel(): void {
    this.usuarioService.exportarExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-personal-${new Date().toISOString().slice(0,10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notificacionService.error('Error al exportar la lista de personal')
    });
  }
}
