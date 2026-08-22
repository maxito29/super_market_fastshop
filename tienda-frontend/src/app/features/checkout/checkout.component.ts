import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';

import { CatalogoService } from '../../core/services/catalogo.service';
import { CarritoService } from '../../core/services/carrito.service';
import { PedidoService } from '../../core/services/pedido.service';
import { DocumentoService } from '../../core/services/documento.service';
import { MetodoPago } from '../../core/models/catalogo.models';
import { CrearPedidoInvitadoRequest, ModalidadEntrega, TipoComprobante } from '../../core/models/pedido.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    RadioButtonModule,
    DropdownModule,
    InputNumberModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {

  metodosPago: MetodoPago[] = [];
  enviando = false;
  buscandoDni = false;

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
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.carrito.items().length === 0) {
      this.router.navigateByUrl('/carrito');
      return;
    }
    this.catalogoService.listarMetodosPago().subscribe(metodos => {
      this.metodosPago = metodos;
      if (metodos.length > 0) this.form.metodoPagoId = metodos[0].id;
    });
  }

  buscarPorDni(): void {
    if (this.form.dni.length !== 8) return;

    this.buscandoDni = true;
    this.documentoService.consultarDni(this.form.dni).subscribe({
      next: resultado => {
        this.form.nombre = resultado.nombreCompleto;
        this.buscandoDni = false;
      },
      error: () => {
        this.buscandoDni = false;
      }
    });
  }

  metodoPagoEsEfectivo(): boolean {
    const metodo = this.metodosPago.find(m => m.id === this.form.metodoPagoId);
    return metodo?.codigo === 'EFECTIVO';
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
