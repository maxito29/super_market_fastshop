export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion: string | null;
}