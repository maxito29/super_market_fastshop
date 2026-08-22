export type TipoDocumentoCliente = 'DNI' | 'RUC' | 'CE';

export interface ClienteLoginRequest {
  tipoDocumento: TipoDocumentoCliente;
  numeroDocumento: string;
  password: string;
}

export interface ClienteRegistroRequest {
  tipoDocumento: TipoDocumentoCliente;
  numeroDocumento: string;
  nombreRazonSocial: string;
  direccion?: string;
  telefono: string;
  email?: string;
  password: string;
}

export interface ClienteLoginResponse {
  token: string;
  numeroDocumento: string;
  nombreRazonSocial: string;
  email: string | null;
}
