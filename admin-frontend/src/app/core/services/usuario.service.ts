import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Usuario, UsuarioRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private readonly baseUrl = `${API_URL}/usuarios`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  crear(request: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, request);
  }

  actualizar(id: number, request: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/desactivar`, {});
  }

  reactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/reactivar`, {});
  }

  exportarExcel(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/exportar/excel`, { responseType: 'blob' });
  }
}