import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-olvide-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './olvide-password.component.html',
  styleUrl: './olvide-password.component.scss'
})
export class OlvidePasswordComponent {

  enviado = signal(false);
  cargando = signal(false);
  errorMensaje = signal('');

  formulario = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);

    this.authService.olvidePassword(this.formulario.value.email!).subscribe({
      next: () => {
        this.cargando.set(false);
        this.enviado.set(true);
      },
      error: () => {
        this.cargando.set(false);
        this.enviado.set(true); // igual mostramos exito, por seguridad (no revelar si el correo existe)
      }
    });
  }
}