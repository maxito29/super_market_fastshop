export interface DireccionCliente {
  id: number;
  direccion: string;
  distrito: string;
  referencia: string | null;
  predeterminada: boolean;
}

export interface DireccionRequest {
  direccion: string;
  distrito: string;
  referencia?: string;
  predeterminada?: boolean;
}