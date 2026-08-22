import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { CrearPedidoInvitadoRequest, PedidoResponse } from '../models/pedido.models';

export interface PedidoPagina {
  content: PedidoResponse[];
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {

  constructor(private http: HttpClient) {}

  crearComoInvitado(request: CrearPedidoInvitadoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${API_URL}/pedidos/invitado`, request);
  }

  buscar(valor: string): Observable<PedidoPagina> {
    return this.http.get<PedidoPagina>(`${API_URL}/pedidos/buscar`, {
      params: { valor, page: 0, size: 20 }
    });
  }
}
