import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
    CommonModule, ReactiveFormsModule,
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

  dialogoVisible = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  usuarioEditandoId: number | null = null;

 formulario = this.fb.group({
    rolId: [null as number | null, Validators.required],
    nombre: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', Validators.email],
    password: ['']
  });

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarUsuarios();
  }

  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: (data) => this.roles.set(data),
      error: () => this.notificacionService.error('No se pudieron cargar los roles')
    });
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.notificacionService.error('No se pudieron cargar los trabajadores');
      }
    });
  }

  esUsuarioActual(usuario: Usuario): boolean {
    return usuario.username === this.authService.usuarioActual()?.username;
  }

  abrirNuevo(): void {
    this.modoEdicion.set(false);
    this.usuarioEditandoId = null;
    this.formulario.reset();
    this.formulario.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.formulario.get('password')?.updateValueAndValidity();
    this.dialogoVisible.set(true);
  }

  abrirEdicion(usuario: Usuario): void {
    this.modoEdicion.set(true);
    this.usuarioEditandoId = usuario.id;

    const rol = this.roles().find(r => r.nombre === usuario.rol);

    this.formulario.setValue({
      rolId: rol?.id ?? null,
      nombre: usuario.nombre,
      username: usuario.username,
      email: usuario.email ?? '',
      password: ''
    });

    this.formulario.get('password')?.clearValidators();
    this.formulario.get('password')?.updateValueAndValidity();
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
      rolId: v.rolId!,
      nombre: v.nombre!,
      username: v.username!,
      email: v.email || null,
      password: v.password || null
    };

    const editando = this.modoEdicion();
    const peticion = editando
      ? this.usuarioService.actualizar(this.usuarioEditandoId!, datos)
      : this.usuarioService.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogoVisible.set(false);
        if (editando) {
          this.notificacionService.notificarEdicion('Trabajador actualizado');
        } else {
          this.notificacionService.notificarCreacion('Trabajador creado');
        }
        this.cargarUsuarios();
      },
      error: (err) => {
        this.guardando.set(false);
        this.notificacionService.error(err.error?.mensaje ?? 'Ocurrió un error al guardar');
      }
    });
  }

  async desactivar(usuario: Usuario): Promise<void> {
    if (this.esUsuarioActual(usuario)) {
      this.notificacionService.error('No puedes desactivar tu propio usuario');
      return;
    }

    const confirmado = await this.notificacionService.confirmarEliminacion(usuario.nombre);
    if (!confirmado) return;

    this.usuarioService.desactivar(usuario.id).subscribe({
      next: () => {
        this.notificacionService.notificarEliminacion('Trabajador desactivado');
        this.cargarUsuarios();
      },
      error: () => this.notificacionService.error('No se pudo desactivar al trabajador')
    });
  }

  reactivar(usuario: Usuario): void {
    this.usuarioService.reactivar(usuario.id).subscribe({
      next: () => {
        this.notificacionService.notificarReactivacion('Trabajador reactivado');
        this.cargarUsuarios();
      },
      error: () => this.notificacionService.error('No se pudo reactivar al trabajador')
    });
  }
}