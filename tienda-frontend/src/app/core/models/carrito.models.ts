export interface ItemCarrito {
  productoId: number;
  nombre: string;
  imagenUrl: string | null;
  cantidad: number;
  precioUnitario: number;
  ofertaProductoId: number | null;
  proveedorNombre: string | null;
  stockDisponible: number;
}
