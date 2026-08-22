import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { PedidoTrabajador } from '../models/pedido-trabajador.model';

@Injectable({ providedIn: 'root' })
export class PickerService {
  private readonly baseUrl = `${API_URL}/picker`;

  constructor(private http: HttpClient) {}

  disponibles(): Observable<PedidoTrabajador[]> {
    return this.http.get<PedidoTrabajador[]>(`${this.baseUrl}/disponibles`);
  }

  tomar(id: number): Observable<PedidoTrabajador> {
    return this.http.patch<PedidoTrabajador>(`${this.baseUrl}/${id}/tomar`, {});
  }

  misPreparaciones(): Observable<PedidoTrabajador[]> {
    return this.http.get<PedidoTrabajador[]>(`${this.baseUrl}/mis-preparaciones`);
  }

  marcarListo(id: number): Observable<PedidoTrabajador> {
    return this.http.patch<PedidoTrabajador>(`${this.baseUrl}/${id}/listo`, {});
  }

  listosParaRecojo(): Observable<PedidoTrabajador[]> {
    return this.http.get<PedidoTrabajador[]>(`${this.baseUrl}/listos-recojo`);
  }

  confirmarRecojo(id: number): Observable<PedidoTrabajador> {
    return this.http.patch<PedidoTrabajador>(`${this.baseUrl}/${id}/confirmar-recojo`, {});
  }
}