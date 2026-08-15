import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-restablecer-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './restablecer-password.component.html',
  styleUrl: './restablecer-password.component.scss'
})
export class RestablecerPasswordComponent {

  cargando = signal(false);
  errorMensaje = signal('');
  exito = signal(false);
  passwordVisible = signal(false);

  formulario = this.fb.group({
    token: ['', Validators.required],
    nuevaPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  togglePassword(): void {
    this.passwordVisible.update(v => !v);
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set('');

    const v = this.formulario.value;
    this.authService.restablecerPassword(v.token!, v.nuevaPassword!).subscribe({
      next: () => {
        this.cargando.set(false);
        this.exito.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMensaje.set(err.error?.mensaje ?? 'El código no es válido o expiró');
      }
    });
  }
}