export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  categoriaId: number;
  categoriaNombre: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  activo: boolean;
}

export interface OfertaProducto {
  ofertaId: number;
  proveedorId: number;
  proveedorNombre: string;
  precio: number;
  stock: number;
}

export interface MetodoPago {
  id: number;
  codigo: string;
  nombre: string;
}
