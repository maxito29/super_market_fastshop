export type ModalidadEntrega = 'DELIVERY' | 'RECOJO_TIENDA';
export type TipoComprobante = 'BOLETA' | 'FACTURA';

export interface ItemPedidoRequest {
  productoId: number;
  cantidad: number;
  ofertaProductoId?: number | null;
}

export interface CrearPedidoInvitadoRequest {
  nombre: string;
  telefono: string;
  email?: string;
  modalidadEntrega: ModalidadEntrega;
  direccion?: string;
  distrito?: string;
  referencia?: string;
  metodoPagoId: number;
  montoPagoEfectivo?: number | null;
  items: ItemPedidoRequest[];
  tipoComprobante: TipoComprobante;
  dni?: string;
  ruc?: string;
  razonSocial?: string;
}

export interface PedidoResponse {
  id: number;
  numeroPedido: string;
  estado: string;
  modalidadEntrega: string;
  total: number;
  fechaPedido: string;
}
