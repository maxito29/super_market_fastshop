import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { GOOGLE_CLIENT_ID } from '../../core/config/api.config';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';

import { ClienteAuthService } from '../../core/services/cliente-auth.service';
import { TipoDocumentoCliente } from '../../core/models/auth.models';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {

  modo: 'login' | 'registro' = 'login';
  enviando = false;
  mostrarPassword = false;

  readonly beneficios = [
    { icono: 'pi pi-truck', texto: 'Envío gratis desde S/ 50' },
    { icono: 'pi pi-percentage', texto: 'Compara precios entre proveedores' },
    { icono: 'pi pi-map-marker', texto: 'Recojo en tienda el mismo día' },
    { icono: 'pi pi-star-fill', texto: 'Selección fresca todos los días' }
  ];

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

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
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

  ngAfterViewInit(): void {
    if (typeof google === 'undefined') return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (respuesta: { credential: string }) => this.manejarCredencialGoogle(respuesta.credential)
    });

    google.accounts.id.renderButton(
      document.getElementById('boton-google'),
      { theme: 'outline', size: 'large', width: 360, text: 'continue_with', locale: 'es' }
    );
  }

  private manejarCredencialGoogle(idToken: string): void {
    this.enviando = true;
    this.clienteAuthService.loginConGoogle(idToken).subscribe({
      next: () => {
        this.enviando = false;
        this.router.navigateByUrl('/');
      },
      error: err => {
        this.enviando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo iniciar sesión con Google',
          detail: err?.error?.mensaje ?? 'Intenta nuevamente.',
          life: 4000
        });
      }
    });
  }
}