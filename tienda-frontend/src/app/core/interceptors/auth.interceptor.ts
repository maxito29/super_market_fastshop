import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from '../config/api.config';
import { ClienteAuthService } from '../services/cliente-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const clienteAuth = inject(ClienteAuthService);
  const token = clienteAuth.cliente()?.token;

  if (token && req.url.startsWith(API_URL)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};