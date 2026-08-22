import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

import { ClienteAuthService } from '../../core/services/cliente-auth.service';
import { TipoDocumentoCliente } from '../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, DropdownModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  modo: 'login' | 'registro' = 'login';
  enviando = false;

  tiposDocumento: { label: string; value: TipoDocumentoCliente }[] = [
    { label: 'DNI', value: 'DNI' },
    { label: 'RUC', value: 'RUC' },
    { label: 'Carnet de Extranjería', value: 'CE' }
  ];

  form = {
    tipoDocumento: 'DNI' as TipoDocumentoCliente,
    numeroDocumento: '',
    password: '',
    nombreRazonSocial: '',
    telefono: '',
    email: ''
  };

  constructor(
    private clienteAuthService: ClienteAuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  cambiarModo(modo: 'login' | 'registro'): void {
    this.modo = modo;
  }

  enviar(): void {
    this.enviando = true;

    const accion = this.modo === 'login'
      ? this.clienteAuthService.login({
          tipoDocumento: this.form.tipoDocumento,
          numeroDocumento: this.form.numeroDocumento,
          password: this.form.password
        })
      : this.clienteAuthService.registrar({
          tipoDocumento: this.form.tipoDocumento,
          numeroDocumento: this.form.numeroDocumento,
          nombreRazonSocial: this.form.nombreRazonSocial,
          telefono: this.form.telefono,
          email: this.form.email || undefined,
          password: this.form.password
        });

    accion.subscribe({
      next: () => {
        this.enviando = false;
        this.router.navigateByUrl('/');
      },
      error: err => {
        this.enviando = false;
        this.messageService.add({
          severity: 'error',
          summary: this.modo === 'login' ? 'No se pudo iniciar sesión' : 'No se pudo crear la cuenta',
          detail: err?.error?.mensaje ?? 'Revisa tus datos e intenta de nuevo.',
          life: 4000
        });
      }
    });
  }
}
