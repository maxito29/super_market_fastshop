import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { PedidoTrabajador } from '../models/pedido-trabajador.model';

@Injectable({ providedIn: 'root' })
export class RepartidorService {
  private readonly baseUrl = `${API_URL}/repartidor`;

  constructor(private http: HttpClient) {}

  disponibles(): Observable<PedidoTrabajador[]> {
    return this.http.get<PedidoTrabajador[]>(`${this.baseUrl}/disponibles`);
  }

  tomar(id: number): Observable<PedidoTrabajador> {
    return this.http.patch<PedidoTrabajador>(`${this.baseUrl}/${id}/tomar`, {});
  }

  misEntregas(): Observable<PedidoTrabajador[]> {
    return this.http.get<PedidoTrabajador[]>(`${this.baseUrl}/mis-entregas`);
  }

  marcarEntregado(id: number): Observable<PedidoTrabajador> {
    return this.http.patch<PedidoTrabajador>(`${this.baseUrl}/${id}/entregado`, {});
  }
}