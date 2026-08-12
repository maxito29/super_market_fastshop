import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Rol } from '../models/rol.model';

@Injectable({ providedIn: 'root' })
export class RolService {

  private readonly baseUrl = `${API_URL}/roles`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.baseUrl);
  }
}