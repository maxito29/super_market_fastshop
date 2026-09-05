import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { ClientePerfilResponse, ClientePerfilRequest } from '../models/auth.models';
import { DireccionCliente, DireccionRequest } from '../models/direccion.models';
import { ClienteAuthService } from './cliente-auth.service';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  constructor(private http: HttpClient, private clienteAuthService: ClienteAuthService) {}

  obtenerPerfil(): Observable<ClientePerfilResponse> {
    return this.http.get<ClientePerfilResponse>(`${API_URL}/cliente/perfil`);
  }

  actualizarPerfil(request: ClientePerfilRequest): Observable<ClientePerfilResponse> {
    return this.http.put<ClientePerfilResponse>(`${API_URL}/cliente/perfil`, request).pipe(
      tap(perfil => this.clienteAuthService.actualizarNombreLocal(perfil.nombreRazonSocial, perfil.numeroDocumento))
    );
  }

  listarDirecciones(): Observable<DireccionCliente[]> {
    return this.http.get<DireccionCliente[]>(`${API_URL}/cliente/direcciones`);
  }

  crearDireccion(request: DireccionRequest): Observable<DireccionCliente> {
    return this.http.post<DireccionCliente>(`${API_URL}/cliente/direcciones`, request);
  }

  actualizarDireccion(id: number, request: DireccionRequest): Observable<DireccionCliente> {
    return this.http.put<DireccionCliente>(`${API_URL}/cliente/direcciones/${id}`, request);
  }

  eliminarDireccion(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/cliente/direcciones/${id}`);
  }
}