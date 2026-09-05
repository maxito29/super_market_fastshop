import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';

import { CatalogoService } from '../../core/services/catalogo.service';
import { CarritoService } from '../../core/services/carrito.service';
import { PedidoService } from '../../core/services/pedido.service';
import { DocumentoService } from '../../core/services/documento.service';
import { PagoService } from '../../core/services/pago.service';
import { MetodoPago } from '../../core/models/catalogo.models';
import { CrearPedidoInvitadoRequest, ModalidadEntrega, TipoComprobante } from '../../core/models/pedido.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {

  metodosPago: MetodoPago[] = [];
  enviando = false;

  buscandoDni = false;
  dniEncontrado = false;

  buscandoRuc = false;
  rucEncontrado = false;
  rucError = false;
  rucErrorMensaje = '';
  rucAdvertencia = '';

  form = {
    nombre: '',
    telefono: '',
    email: '',
    modalidadEntrega: 'RECOJO_TIENDA' as ModalidadEntrega,
    direccion: '',
    distrito: '',
    referencia: '',
    metodoPagoId: null as number | null,
    montoPagoEfectivo: null as number | null,
    tipoComprobante: 'BOLETA' as TipoComprobante,
    dni: '',
    ruc: '',
    razonSocial: ''
  };

  constructor(
    private catalogoService: CatalogoService,
    public carrito: CarritoService,
    private pedidoService: PedidoService,
    private documentoService: DocumentoService,
    private pagoService: PagoService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.carrito.items().length === 0) {
      this.router.navigateByUrl('/carrito');
      return;
    }
    this.catalogoService.listarMetodosPago().subscribe({
      next: metodos => {
        this.metodosPago = metodos;
        if (metodos.length > 0) this.form.metodoPagoId = metodos[0].id;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudieron cargar los métodos de pago',
          detail: 'Intenta recargar la página.',
          life: 4000
        });
      }
    });
  }

  cambiarTipoComprobante(tipo: TipoComprobante): void {
    this.form.tipoComprobante = tipo;
  }

  cambiarModalidadEntrega(modalidad: ModalidadEntrega): void {
    this.form.modalidadEntrega = modalidad;
  }

  buscarPorDni(): void {
    if (this.form.dni.length !== 8) return;

    this.buscandoDni = true;
    this.dniEncontrado = false;

    this.documentoService.consultarDni(this.form.dni).subscribe({
      next: resultado => {
        this.form.nombre = resultado.nombreCompleto;
        this.buscandoDni = false;
        this.dniEncontrado = true;
        setTimeout(() => (this.dniEncontrado = false), 2000);
      },
      error: () => {
        this.buscandoDni = false;
      }
    });
  }

  buscarPorRuc(): void {
    if (this.form.ruc.length !== 11) return;

    this.buscandoRuc = true;
    this.rucEncontrado = false;
    this.rucError = false;
    this.rucAdvertencia = '';

    this.documentoService.consultarRuc(this.form.ruc).subscribe({
      next: resultado => {
        this.form.razonSocial = resultado.razonSocial;
        this.buscandoRuc = false;
        this.rucEncontrado = true;
        setTimeout(() => (this.rucEncontrado = false), 2000);

        const estadoOk = !resultado.estado || resultado.estado === 'ACTIVO';
        const condicionOk = !resultado.condicion || resultado.condicion === 'HABIDO';
        if (!estadoOk || !condicionOk) {
          this.rucAdvertencia = `Este RUC figura como ${resultado.estado ?? '—'} / ${resultado.condicion ?? '—'} en SUNAT. Verifica los datos antes de continuar.`;
        }
      },
      error: err => {
        this.buscandoRuc = false;
        this.rucError = true;
        this.rucErrorMensaje = err?.error?.mensaje ?? 'No pudimos encontrar ese RUC. Ingresa la razón social manualmente.';
      }
    });
  }

  metodoPagoEsEfectivo(): boolean {
    const metodo = this.metodosPago.find(m => m.id === this.form.metodoPagoId);
    return metodo?.codigo === 'EFECTIVO';
  }

  metodoPagoEsMercadoPago(): boolean {
    const metodo = this.metodosPago.find(m => m.id === this.form.metodoPagoId);
    return metodo?.codigo === 'MERCADOPAGO';
  }

  formularioValido(): boolean {
    if (!this.form.nombre || !this.form.telefono || !this.form.metodoPagoId) return false;
    if (this.form.modalidadEntrega === 'DELIVERY' && (!this.form.direccion || !this.form.distrito)) return false;
    if (this.form.tipoComprobante === 'FACTURA' && (this.form.ruc.length !== 11 || !this.form.razonSocial)) return false;
    return true;
  }

  

  confirmarPedido(): void {
    if (!this.formularioValido() || !this.form.metodoPagoId) return;

    this.enviando = true;

    const request: CrearPedidoInvitadoRequest = {
      nombre: this.form.nombre,
      telefono: this.form.telefono,
      email: this.form.email || undefined,
      modalidadEntrega: this.form.modalidadEntrega,
      direccion: this.form.direccion || undefined,
      distrito: this.form.distrito || undefined,
      referencia: this.form.referencia || undefined,
      metodoPagoId: this.form.metodoPagoId,
      montoPagoEfectivo: this.form.montoPagoEfectivo ?? undefined,
      tipoComprobante: this.form.tipoComprobante,
      dni: this.form.dni || undefined,
      ruc: this.form.ruc || undefined,
      razonSocial: this.form.razonSocial || undefined,
      items: this.carrito.items().map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        ofertaProductoId: item.ofertaProductoId
      }))
    };

    this.pedidoService.crearComoInvitado(request).subscribe({
      next: pedido => {
        if (this.metodoPagoEsMercadoPago()) {
          this.pagoService.crearPreferencia(pedido.id).subscribe({
            next: preferencia => {
              this.carrito.vaciar();
              window.location.href = preferencia.initPoint;
            },
            error: err => {
              this.enviando = false;
              this.messageService.add({
                severity: 'error',
                summary: 'No se pudo iniciar el pago',
                detail: err?.error?.mensaje ?? 'Tu pedido quedó guardado como pendiente. Intenta nuevamente.',
                life: 5000
              });
            }
          });
          return;
        }

        this.carrito.vaciar();
        this.router.navigate(['/pedido-confirmado', pedido.numeroPedido]);
      },
      error: err => {
        this.enviando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo crear el pedido',
          detail: err?.error?.mensaje ?? 'Intenta nuevamente en unos segundos.',
          life: 4000
        });
      }
    });
  }
}