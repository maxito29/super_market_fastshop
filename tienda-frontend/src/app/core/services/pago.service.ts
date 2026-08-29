import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

export interface PreferenciaPagoResponse {
  initPoint: string;
  preferenceId: string;
}

@Injectable({ providedIn: 'root' })
export class PagoService {

  constructor(private http: HttpClient) {}

  crearPreferencia(pedidoId: number): Observable<PreferenciaPagoResponse> {
    return this.http.post<PreferenciaPagoResponse>(`${API_URL}/pagos/preferencia/${pedidoId}`, {});
  }
}