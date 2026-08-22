export interface PedidoItem {
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoTrabajador {
  id: number;
  numeroPedido: string;
  estado: string;
  modalidadEntrega: string;
  clienteNombre: string;
  clienteTelefono: string;
  direccion: string | null;
  total: number;
  fechaPedido: string;
  items: PedidoItem[];
}