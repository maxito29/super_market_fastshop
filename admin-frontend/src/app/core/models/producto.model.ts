export interface Producto {
  id: number;
  categoriaId: number;
  categoriaNombre: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface ProductoRequest {
  categoriaId: number;
  codigo?: string | null;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  imagenUrl: string | null;
}