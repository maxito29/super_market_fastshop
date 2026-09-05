import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';

import { ClienteService } from '../../core/services/cliente.service';
import { TipoDocumentoCliente } from '../../core/models/auth.models';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mi-cuenta.component.html',
  styleUrl: './mi-cuenta.component.scss'
})
export class MiCuentaComponent implements OnInit {

  cargando = true;
  guardando = false;
  perfilCompleto = true;

  tiposDocumento: { label: string; value: TipoDocumentoCliente }[] = [
    { label: 'DNI', value: 'DNI' },
    { label: 'RUC', value: 'RUC' },
    { label: 'Carnet de Extranjería', value: 'CE' }
  ];

  form = {
    tipoDocumento: 'DNI' as TipoDocumentoCliente,
    numeroDocumento: '',
    nombreRazonSocial: '',
    telefono: '',
    email: ''
  };

  constructor(
    private clienteService: ClienteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.clienteService.obtenerPerfil().subscribe({
      next: perfil => {
        this.cargando = false;
        this.perfilCompleto = perfil.perfilCompleto;
        this.form = {
          tipoDocumento: perfil.tipoDocumento ?? 'DNI',
          numeroDocumento: perfil.numeroDocumento ?? '',
          nombreRazonSocial: perfil.nombreRazonSocial,
          telefono: perfil.telefono ?? '',
          email: perfil.email ?? ''
        };
      },
      error: () => {
        this.cargando = false;
        this.messageService.add({ severity: 'error', summary: 'No se pudo cargar tu perfil', life: 4000 });
      }
    });
  }

  guardar(): void {
    this.guardando = true;
    this.clienteService.actualizarPerfil(this.form).subscribe({
      next: perfil => {
        this.guardando = false;
        this.perfilCompleto = perfil.perfilCompleto;
        this.messageService.add({ severity: 'success', summary: 'Perfil actualizado', life: 3000 });
      },
      error: err => {
        this.guardando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo actualizar tu perfil',
          detail: err?.error?.mensaje ?? 'Intenta nuevamente.',
          life: 4000
        });
      }
    });
  }
}