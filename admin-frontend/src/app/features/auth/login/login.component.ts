import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  cargando = signal(false);
  errorMensaje = signal('');
  passwordVisible = signal(false);

  formulario = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService
  ) {}

  togglePassword(): void {
    this.passwordVisible.update(visible => !visible);
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set('');

    this.authService.login(this.formulario.value as { username: string; password: string }).subscribe({
      next: (respuesta) => {
        this.notificacionService.bienvenida(respuesta.nombre);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMensaje.set(err.status === 401
          ? 'Usuario o contraseña incorrectos'
          : 'No se pudo conectar con el servidor');
      }
    });
  }
}