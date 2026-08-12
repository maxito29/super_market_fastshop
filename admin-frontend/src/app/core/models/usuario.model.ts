export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  nombre: string;
  rol: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface UsuarioRequest {
  rolId: number;
  nombre: string;
  username: string;
  password?: string | null;
}