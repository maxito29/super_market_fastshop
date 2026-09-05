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
  numeroDocumento: string | null;
  nombreRazonSocial: string;
  email: string | null;
}

export interface ClientePerfilResponse {
  tipoDocumento: TipoDocumentoCliente | null;
  numeroDocumento: string | null;
  nombreRazonSocial: string;
  telefono: string | null;
  email: string | null;
  perfilCompleto: boolean;
}

export interface ClientePerfilRequest {
  tipoDocumento: TipoDocumentoCliente | null;
  numeroDocumento: string | null;
  nombreRazonSocial: string;
  telefono: string | null;
  email: string | null;
}
