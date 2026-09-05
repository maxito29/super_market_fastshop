import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { ClienteLoginRequest, ClienteLoginResponse, ClienteRegistroRequest } from '../models/auth.models';

const STORAGE_KEY = 'tienda_cliente';

@Injectable({ providedIn: 'root' })
export class ClienteAuthService {

  private clienteSignal = signal<ClienteLoginResponse | null>(this.cargarDeStorage());

  readonly cliente = this.clienteSignal.asReadonly();

  constructor(private http: HttpClient) {}

  login(request: ClienteLoginRequest): Observable<ClienteLoginResponse> {
    return this.http.post<ClienteLoginResponse>(`${API_URL}/cliente/login`, request).pipe(
      tap(respuesta => this.guardarSesion(respuesta))
    );
  }

  registrar(request: ClienteRegistroRequest): Observable<ClienteLoginResponse> {
    return this.http.post<ClienteLoginResponse>(`${API_URL}/cliente/registro`, request).pipe(
      tap(respuesta => this.guardarSesion(respuesta))
    );
  }

  cerrarSesion(): void {
    this.clienteSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private guardarSesion(respuesta: ClienteLoginResponse): void {
    this.clienteSignal.set(respuesta);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(respuesta));
  }

  private cargarDeStorage(): ClienteLoginResponse | null {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  }

  loginConGoogle(idToken: string): Observable<ClienteLoginResponse> {
  return this.http.post<ClienteLoginResponse>(`${API_URL}/cliente/login-google`, { idToken }).pipe(
    tap(respuesta => this.guardarSesion(respuesta))
  );
}

actualizarNombreLocal(nombreRazonSocial: string, numeroDocumento: string | null): void {
  const actual = this.clienteSignal();
  if (!actual) return;
  const actualizado = { ...actual, nombreRazonSocial, numeroDocumento: numeroDocumento ?? actual.numeroDocumento };
  this.clienteSignal.set(actualizado);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizado));
}
}
