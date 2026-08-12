import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { LoginRequest, LoginResponse } from '../models/usuario.model';

const TOKEN_KEY = 'admin_token';
const USUARIO_KEY = 'admin_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {

  usuarioActual = signal<LoginResponse | null>(this.cargarUsuarioGuardado());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, credenciales).pipe(
      tap(respuesta => this.guardarSesion(respuesta))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  private guardarSesion(respuesta: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, respuesta.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(respuesta));
    this.usuarioActual.set(respuesta);
  }

  private cargarUsuarioGuardado(): LoginResponse | null {
    const guardado = localStorage.getItem(USUARIO_KEY);
    return guardado ? JSON.parse(guardado) : null;
  }
}