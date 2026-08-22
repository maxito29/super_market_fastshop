import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { PedidoTrabajador } from '../models/pedido-trabajador.model';

@Injectable({ providedIn: 'root' })
export class PedidoAdminService {
  private readonly baseUrl = `${API_URL}/pedidos`;

  constructor(private http: HttpClient) {}

  pendientes(): Observable<PedidoTrabajador[]> {
    return this.http.get<PedidoTrabajador[]>(`${this.baseUrl}/pendientes`);
  }

  marcarPagado(id: number): Observable<PedidoTrabajador> {
    return this.http.patch<PedidoTrabajador>(`${this.baseUrl}/${id}/marcar-pagado`, {});
  }
}