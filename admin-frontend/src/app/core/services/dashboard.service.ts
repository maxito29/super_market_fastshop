import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { DashboardResumen } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private readonly baseUrl = `${API_URL}/dashboard`;

  constructor(private http: HttpClient) {}

  obtenerResumen(): Observable<DashboardResumen> {
    return this.http.get<DashboardResumen>(`${this.baseUrl}/resumen`);
  }

  enviarAlertaStock(): Observable<any> {
  return this.http.post(`${this.baseUrl}/alertas/stock`, {});
}

exportarPdf(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/exportar/pdf`, { responseType: 'blob' });
  }
}