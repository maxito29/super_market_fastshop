import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

export interface DniConsultaResponse {
  nombreCompleto: string;
}

export interface RucConsultaResponse {
  razonSocial: string;
  estado?: string;
  condicion?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentoService {

  constructor(private http: HttpClient) {}

  consultarDni(numero: string): Observable<DniConsultaResponse> {
    return this.http.get<DniConsultaResponse>(`${API_URL}/documentos/dni/${numero}`);
  }

  consultarRuc(numero: string): Observable<RucConsultaResponse> {
    return this.http.get<RucConsultaResponse>(`${API_URL}/documentos/ruc/${numero}`);
  }
}